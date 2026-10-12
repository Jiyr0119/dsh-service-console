// P0-1 单元测试：受保护进程判定（纯函数 + buildSnapshot 集成 + 生命周期门禁）
// 运行：npm run build && node --test test/protection.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'

const { classifyProtection } = await import('../lib/host/protection.js')
const { buildSnapshot } = await import('../lib/host/service-registry.js')
const { restartService, stopService } = await import('../lib/host/lifecycle.js')

// ---------- classifyProtection 纯规则 ----------
test('DSH Web 控制台端口 → 受保护（IPv4/IPv6 双监听证据去重）', () => {
  const r = classifyProtection(
    { pid: 4242, name: 'node', command: 'node dsh-web', cwd: '/ws/dsh', listeners: [
      { port: 3090, user: 'jonathan' },
      { port: 3090, user: 'jonathan' },
    ] },
    { protectedPorts: [3090] },
  )
  assert.equal(r.protected, true)
  assert.equal(r.evidence.length, 1, '同端口重复证据只保留一条')
  assert.match(r.evidence[0], /:3090/)
})

test('宿主进程 PID → 受保护', () => {
  const r = classifyProtection(
    { pid: 777, name: 'node', command: 'node host.js', cwd: null, listeners: [{ port: 18080, user: 'jonathan' }] },
    { protectedPids: [777] },
  )
  assert.equal(r.protected, true)
  assert.match(r.evidence[0], /pid 777/)
})

test('pid ≤ 1 / root 用户 / 系统关键进程 / 系统目录 cwd → 受保护', () => {
  assert.equal(classifyProtection({ pid: 1, listeners: [] }).protected, true)
  assert.equal(
    classifyProtection({ pid: 3333, name: 'redis-server', command: 'redis-server *:6379', listeners: [{ port: 6379, user: 'root' }] }).protected,
    true,
  )
  assert.equal(
    classifyProtection({ pid: 55, name: 'sshd', command: '/usr/sbin/sshd -D', listeners: [{ port: 22, user: 'root' }] }).evidence.some((e) => e.includes('sshd')),
    true,
    'basename 匹配：/usr/sbin/sshd 也命中',
  )
  assert.equal(classifyProtection({ pid: 9, cwd: '/System/Library/LaunchDaemons', listeners: [] }).protected, true)
  assert.equal(
    classifyProtection({
      pid: 70,
      command: '/System/Library/CoreServices/ControlCenter.app/Contents/MacOS/ControlCenter',
      listeners: [],
    }).protected,
    true,
    '系统二进制路径（cwd 非系统目录时）',
  )
})

test('普通 dev 服务与临时目录 cwd 不受保护', () => {
  assert.deepEqual(
    classifyProtection({ pid: 1111, name: 'node', command: 'node server.js', cwd: '/ws/app', listeners: [{ port: 5173, user: 'jonathan' }] }),
    { protected: false, evidence: [] },
  )
  assert.equal(classifyProtection({ pid: 12, cwd: '/private/tmp/demo', listeners: [] }).protected, false, '/private/tmp 是开发临时目录')
  assert.equal(classifyProtection({ pid: 13, cwd: '/private/var/folders/xy/tmp', listeners: [] }).protected, false)
  assert.equal(classifyProtection({ pid: 14, cwd: null, listeners: [{ port: 8080, user: 'jonathan' }] }).protected, false, 'user 未知时不误判')
  assert.equal(
    classifyProtection({ pid: 21, command: '/usr/local/bin/npm run dev', cwd: '/ws/app', listeners: [] }).protected,
    false,
    '/usr/local 用户软件不误伤',
  )
  assert.equal(
    classifyProtection({ pid: 22, command: '/opt/homebrew/bin/node server.js', cwd: '/ws/app', listeners: [] }).protected,
    false,
    '/opt/homebrew 工具链不误伤',
  )
})

// ---------- buildSnapshot 集成 ----------
const LSOF = [
  'COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME',
  'node 1111 jonathan 12u IPv4 0x1 0t0 TCP 127.0.0.1:9001 (LISTEN)',
  'dsh-web 4242 jonathan 13u IPv4 0x2 0t0 TCP 127.0.0.1:3090 (LISTEN)',
  'redis-server 3333 root 14u IPv4 0x3 0t0 TCP *:6379 (LISTEN)',
].join('\n')
const PS_DETAIL = [
  '1111 999 Mon Aug 17 10:00:00 2026 node server.js',
  '4242 999 Mon Aug 17 10:00:00 2026 node dsh-web',
  '3333 999 Mon Aug 17 10:00:00 2026 redis-server *:6379',
].join('\n')
const PS_PGID = '1111 999\n4242 999\n3333 999\n'
const CWD = [
  'COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME',
  'node 1111 jonathan cwd DIR 1,7 160 1 /ws/app',
  'dsh-web 4242 jonathan cwd DIR 1,7 160 1 /ws/dsh',
  'redis-server 3333 root cwd DIR 1,7 160 1 /usr/local/var',
].join('\n')

function fakeRunner() {
  return (command) => {
    const out = command.startsWith('lsof -nP -iTCP -sTCP:LISTEN') ? LSOF
      : command.startsWith('ps -o pid=,ppid=') ? PS_DETAIL
        : command.startsWith('ps -o pid=,pgid=') ? PS_PGID
          : command.startsWith('lsof -a -p') ? CWD : ''
    return { stdout: out, stderr: '', code: 0 }
  }
}

test('buildSnapshot：DSH 端口与 root 进程标记为 protected/受保护，普通服务不受影响', async () => {
  const snap = await buildSnapshot([], [], fakeRunner(), { protectedPorts: [3090] })
  assert.equal(snap.services.length, 3)

  const dsh = snap.services.find((x) => x.pid === 4242)
  assert.equal(dsh.protected, true)
  assert.equal(dsh.ownership, 'protected', '受保护是五级归属之一')
  assert.ok(dsh.ownershipEvidence.some((e) => e.includes('DSH Web console')))
  assert.ok(dsh.ownershipEvidence.some((e) => e.includes('/ws/dsh')), '原归属证据仍保留')

  const redis = snap.services.find((x) => x.pid === 3333)
  assert.equal(redis.protected, true, 'root 用户进程受保护')
  assert.ok(redis.ownershipEvidence.some((e) => e.includes('root')))

  const app = snap.services.find((x) => x.pid === 1111)
  assert.equal(app.protected, false)
  assert.equal(app.ownership, 'other-local', '非受保护服务归属不受影响')
})

test('buildSnapshot：不传 guard 时行为不变（向后兼容）', async () => {
  const snap = await buildSnapshot([], [], fakeRunner())
  const dsh = snap.services.find((x) => x.pid === 4242)
  assert.equal(dsh.protected, false, '无 guard 时 DSH 端口服务不被标记')
  assert.notEqual(dsh.ownership, 'protected')
  assert.equal(snap.services.find((x) => x.pid === 1111).protected, false)
})

// ---------- 生命周期门禁 ----------
test('restartService：受保护服务直接拒绝（先于 restartable 判定）', async () => {
  const deps = {
    timer: { timeout: async () => undefined },
    config: { refreshInterval: 5000, defaultScope: 'workspace', gracefulTimeout: 3000, showUnknown: true, forceKill: false, autoCleanup: false },
    buildSnapshot: async () => ({
      services: [{ id: 'svc_p', ownership: 'protected', protected: true, restartable: true, pid: 4242 }],
    }),
    ledgerList: () => [],
    logAction: () => {},
    commandRunner: async () => ({ stdout: '', stderr: '', code: 0 }),
  }
  const res = await restartService(deps, 'svc_p')
  assert.equal(res.ok, false)
  assert.equal(res.error.code, 'PROTECTED_PROCESS')

  const stop = await stopService(deps, 'svc_p', 'graceful')
  assert.equal(stop.ok, false)
  assert.equal(stop.error.code, 'PROTECTED_PROCESS', '停止侧原有门禁仍生效')
})
