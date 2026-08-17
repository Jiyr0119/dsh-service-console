// 补充单元测试：配置校验 / 台账观察 / 生命周期状态机 / 服务聚合与 fingerprint
// 运行：npm run build && node --test test/host-more.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'

const { validateConfigPatch } = await import('../lib/host/config.js')
const { SessionLedger, DEV_COMMAND_RE } = await import('../lib/host/ledger.js')
const { stopService, restartService } = await import('../lib/host/lifecycle.js')
const { buildSnapshot } = await import('../lib/host/service-registry.js')

// ---------- config ----------
test('validateConfigPatch 合法/非法更新', () => {
  assert.equal(validateConfigPatch({ refreshInterval: 10000 }).ok, true)
  assert.equal(validateConfigPatch({ forceKill: true }).ok, true)
  assert.equal(validateConfigPatch({ unknownKey: 1 }).ok, false)
  assert.equal(validateConfigPatch({ refreshInterval: 100 }).ok, false) // 越界
  assert.equal(validateConfigPatch({ forceKill: 'yes' }).ok, false) // 类型错
  assert.equal(validateConfigPatch({ defaultScope: 'machine' }).ok, true)
})

// ---------- ledger ----------
test('SessionLedger 只记录本会话的常驻 dev 命令', () => {
  const ledger = new SessionLedger()
  ledger.observe({ name: 'bash', args: { command: 'npm run dev', workdir: '/ws/app' }, agent: { id: 's1' } })
  ledger.observe({ name: 'bash', args: { command: 'echo hello' }, agent: { id: 's1' } }) // 非常驻
  ledger.observe({ name: 'read', args: { file_path: '/x' }, agent: { id: 's1' } }) // 非 bash
  assert.equal(ledger.list.length, 1)
  assert.equal(ledger.list[0].cwd, '/ws/app')
  assert.equal(ledger.list[0].sessionKey, 's1')
  assert.ok(DEV_COMMAND_RE.test('python3 -m http.server 8000'))
  assert.ok(!DEV_COMMAND_RE.test('ls -la'))
})

// ---------- lifecycle（fake deps） ----------
function makeDeps(overrides = {}) {
  const calls = { killed: [], restarted: [], logged: [] }
  const deps = {
    shell: { resolve: (r) => r, run: async (spec) => { calls.killed.push(spec.command); return { stdout: '', stderr: '', code: 0 } } },
    timer: { timeout: async () => undefined, timeout2: () => () => undefined },
    config: { refreshInterval: 5000, defaultScope: 'workspace', gracefulTimeout: 3000, showUnknown: true, forceKill: false, autoCleanup: false },
    buildSnapshot: async () => ({ services: [] }),
    ledgerList: () => [],
    logAction: (id, action, result, code) => calls.logged.push({ id, action, result, code }),
    ...overrides,
  }
  return { deps, calls }
}

test('stopService TARGET_GONE：目标不存在时不发信号', async () => {
  const { deps, calls } = makeDeps()
  const res = await stopService(deps, 'svc_missing', 'graceful')
  assert.equal(res.ok, false)
  assert.equal(res.error.code, 'TARGET_GONE')
  assert.equal(calls.killed.length, 0)
})

test('stopService UNKNOWN_OWNERSHIP：未知归属拒绝', async () => {
  const { deps, calls } = makeDeps({
    buildSnapshot: async () => ({ services: [{ id: 'svc_x', ownership: 'unknown', protected: false, pid: 1, processGroupId: null }] }),
  })
  const res = await stopService(deps, 'svc_x', 'graceful')
  assert.equal(res.ok, false)
  assert.equal(res.error.code, 'UNKNOWN_OWNERSHIP')
  assert.equal(calls.killed.length, 0)
})

test('stopService 成功：发 SIGTERM 后服务消失返回 stopped', async () => {
  let phase = 0
  const { deps, calls } = makeDeps({
    buildSnapshot: async () => {
      phase += 1
      return { services: phase <= 1 ? [{ id: 'svc_a', ownership: 'conversation-confirmed', protected: false, pid: 1234, processGroupId: 1234 }] : [] }
    },
  })
  const res = await stopService(deps, 'svc_a', 'graceful')
  assert.equal(res.ok, true)
  assert.equal(res.data.result, 'stopped')
  assert.ok(calls.killed[0].includes('-1234'), '应终止进程组: ' + calls.killed[0])
})

test('stopService GRACEFUL_TIMEOUT：超时且 forceKill 关闭', async () => {
  const { deps, calls } = makeDeps({
    timer: { timeout: async () => undefined },
    buildSnapshot: async () => ({ services: [{ id: 'svc_b', ownership: 'workspace-inferred', protected: false, pid: 5, processGroupId: 5 }] }),
  })
  const res = await stopService(deps, 'svc_b', 'graceful')
  assert.equal(res.ok, false)
  assert.equal(res.error.code, 'GRACEFUL_TIMEOUT')
  assert.ok(!calls.killed.some((k) => k.includes('-KILL')), 'forceKill 关闭时不得 SIGKILL')
})

test('restartService RESTART_UNSAFE：无启动描述拒绝', async () => {
  const { deps } = makeDeps({
    buildSnapshot: async () => ({ services: [{ id: 'svc_c', ownership: 'conversation-confirmed', protected: false, pid: 7, restartable: false }] }),
  })
  const res = await restartService(deps, 'svc_c')
  assert.equal(res.ok, false)
  assert.equal(res.error.code, 'RESTART_UNSAFE')
})

// ---------- service-registry（fake shell） ----------
const LSOF = [
  'COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME',
  'node 1111 jonathan 12u IPv4 0x1 0t0 TCP 127.0.0.1:9001 (LISTEN)',
  'node 1111 jonathan 13u IPv6 0x2 0t0 TCP 127.0.0.1:9002 (LISTEN)',
  'python3 2222 jonathan 3u IPv4 0x3 0t0 TCP *:9003 (LISTEN)',
].join('\n')
const PS_DETAIL = '1111 999 Mon Aug 17 10:00:00 2026 node server.js\n2222 999 Mon Aug 17 10:00:00 2026 python3 -m http.server 9003\n'
const PS_PGID = '1111 999\n2222 999\n'
const CWD = [
  'COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME',
  'node 1111 jonathan cwd DIR 1,7 160 1 /ws/app',
  'python3 2222 jonathan cwd DIR 1,7 160 1 /ws/app',
].join('\n')

function fakeShell() {
  return {
    resolve: (r) => r,
    run: async (spec) => {
      const c = spec.command
      const out = c.startsWith('lsof -nP -iTCP -sTCP:LISTEN') ? LSOF
        : c.startsWith('ps -o pid=,ppid=') ? PS_DETAIL
          : c.startsWith('ps -o pid=,pgid=') ? PS_PGID
            : c.startsWith('lsof -a -p') ? CWD : ''
      return { stdout: out, stderr: '', code: 0 }
    },
  }
}

test('buildSnapshot 多端口聚合 + fingerprint 稳定', async () => {
  const s1 = await buildSnapshot(fakeShell(), [], [])
  assert.equal(s1.services.length, 2)
  const nodeSvc = s1.services.find((x) => x.pid === 1111)
  assert.equal(nodeSvc.listeners.length, 2, '同一 PID 多端口合并为一条服务')
  assert.deepEqual(nodeSvc.listeners.map((l) => l.port).sort(), [9001, 9002])
  const pySvc = s1.services.find((x) => x.pid === 2222)
  assert.equal(pySvc.listeners[0].host, '*')
  assert.equal(pySvc.listeners[0].url, null, '通配绑定不生成 URL')
  // fingerprint 稳定（同输入同输出）
  const s2 = await buildSnapshot(fakeShell(), [], [])
  assert.equal(s1.services[0].fingerprint, s2.services[0].fingerprint)
  assert.equal(s1.services[0].id, s2.services[0].id)
  assert.ok(s1.services[0].fingerprint.startsWith('sha256:'))
})
