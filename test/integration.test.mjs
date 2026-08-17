// T2-6 Host 集成测试：真实系统命令 + 临时服务 harness
// 运行：npm run build && node --test test/integration.test.mjs
// 安全：只对测试自建的临时服务发信号；finally 中清理，绝不触碰真实用户进程。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { execSync } from 'node:child_process'

const { buildSnapshot } = await import('../lib/host/service-registry.js')

function startTempServer(port) {
  const child = spawn(
    process.execPath,
    ['-e', `require('http').createServer((q,s)=>{s.end('ok')}).listen(${port},'127.0.0.1')`],
    { stdio: 'ignore', detached: false },
  )
  return child
}

function waitForPort(port, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const out = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      if (out.includes('(LISTEN)')) return true
    } catch {
      /* not yet */
    }
  }
  return false
}

test('buildSnapshot 发现真实临时 HTTP 服务（端口/PID/命令/cwd）', async () => {
  const port = 8971
  const child = startTempServer(port)
  try {
    assert.ok(waitForPort(port), 'temp server should listen on ' + port)
    const snap = await buildSnapshot([], []) // 默认原生 runCommand（node:child_process）
    const svc = snap.services.find((s) => s.listeners.some((l) => l.port === port))
    assert.ok(svc, 'snapshot should contain the temp service on ' + port)
    assert.equal(svc.listeners[0].host, '127.0.0.1')
    assert.ok(svc.pid > 0)
    assert.ok(typeof svc.commandSummary === 'string' && svc.commandSummary.length > 0)
    assert.ok(svc.id.startsWith('svc_'))
    assert.ok(svc.fingerprint.startsWith('sha256:'))
    assert.ok(svc.ownership === 'other-local' || svc.ownership === 'workspace-inferred', 'ownership should be resolvable: ' + svc.ownership)
  } finally {
    child.kill('SIGTERM')
    child.kill('SIGKILL')
  }
})

test('stop 命令链路：kill 进程组后端口释放', async () => {
  const port = 8972
  const child = startTempServer(port)
  try {
    assert.ok(waitForPort(port))
    const snap = await buildSnapshot([], [])
    const svc = snap.services.find((s) => s.listeners.some((l) => l.port === port))
    assert.ok(svc, 'temp service found')
    // 仅对测试自建的单进程发 SIGTERM（temp server 与测试进程共享 pgid，不能使用 -pgid 以免误杀测试自身）
    execSync('kill -TERM ' + svc.pid, { stdio: 'ignore' })
    // 等待端口释放
    const deadline = Date.now() + 5000
    let released = false
    while (Date.now() < deadline) {
      try {
        execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN`, { stdio: ['ignore', 'pipe', 'ignore'] })
      } catch {
        released = true
        break
      }
    }
    assert.ok(released, 'port ' + port + ' should be released after SIGTERM')
  } finally {
    child.kill('SIGKILL')
  }
})
