// 平台输出解析与命令脱敏的单元测试（node:test + 构建产物 lib）
// 运行：npm run build && node --test test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'

const { parseLstart, parseListenRows, parsePsRows, parseAddress, runCommand } = await import('../lib/host/process-inspector.js')
const { redact } = await import('../lib/host/redaction.js')
const { classifyOwnership } = await import('../lib/host/ownership.js')

test('parseLstart 解析 ps 启动时间', () => {
  const t = parseLstart('Mon Aug 17 19:32:16 2026')
  assert.ok(typeof t === 'number' && t > 0)
  assert.equal(parseLstart('garbage'), null)
})

test('parseListenRows 解析 lsof LISTEN 行', () => {
  const out = [
    'COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME',
    'node 1234 jonathan 12u IPv4 0x1 0t0 TCP 127.0.0.1:8931 (LISTEN)',
    'python3 5678 jonathan 3u IPv4 0x2 0t0 TCP *:8080 (LISTEN)',
    'ignore this line',
  ].join('\n')
  const rows = parseListenRows(out)
  assert.equal(rows.length, 2)
  assert.equal(rows[0].pid, 1234)
  assert.equal(rows[0].address, '127.0.0.1:8931')
  assert.equal(rows[1].address, '*:8080')
})

test('parsePsRows 解析 pid/ppid/lstart/command', () => {
  const rows = parsePsRows('78583 78582 Mon Aug 17 19:32:16 2026 node server.js --port 3000')
  assert.equal(rows.length, 1)
  assert.equal(rows[0].pid, 78583)
  assert.equal(rows[0].ppid, 78582)
  assert.equal(rows[0].command, 'node server.js --port 3000')
  assert.ok(rows[0].startedAt !== null)
})

test('parseAddress 解析 host:port 与 IPv6', () => {
  assert.deepEqual(parseAddress('127.0.0.1:8931'), { host: '127.0.0.1', port: 8931 })
  assert.deepEqual(parseAddress('*:8080'), { host: '*', port: 8080 })
  assert.deepEqual(parseAddress('[::1]:7000'), { host: '::1', port: 7000 })
})

test('redact 脱敏 token/密码/连接串', () => {
  assert.equal(redact('npm run dev --token=abc123'), 'npm run dev --token=***')
  assert.equal(redact('PGPASSWORD=secret123 psql'), 'PGPASSWORD=*** psql')
  assert.equal(redact('postgres://user:pw@localhost/db'), 'postgres://***@localhost/db')
  assert.equal(redact('node server.js'), 'node server.js')
})

test('classifyOwnership 五级归属', () => {
  const ledgers = [{ at: Date.now() - 1000, command: 'npm run dev', cwd: '/ws/app', sessionKey: 's1', redacted: 'npm run dev' }]
  const workspaces = [{ id: 'w1', path: '/ws/app' }]
  const proc = { cwd: '/ws/app', command: 'node server.js', startedAt: Date.now() - 2000 }
  const confirmed = classifyOwnership(proc, ledgers, [])
  assert.equal(confirmed.ownership, 'conversation-confirmed')
  const inferred = classifyOwnership({ ...proc, startedAt: Date.now() - 60 * 60 * 1000 }, [], workspaces)
  assert.equal(inferred.ownership, 'workspace-inferred')
  const other = classifyOwnership({ cwd: '/home/me/proj', command: 'x', startedAt: null }, [], [])
  assert.equal(other.ownership, 'other-local')
  const unknown = classifyOwnership({ cwd: null, command: null, startedAt: null }, [], [])
  assert.equal(unknown.ownership, 'unknown')
})

test('runCommand 单条失败不中断（shell 返回码归一化）', async () => {
  const fakeShell = {
    resolve: (r) => r,
    run: async () => ({ stdout: 'hi', stderr: '', code: 0 }),
  }
  const res = await runCommand(fakeShell, 'echo hi')
  assert.equal(res.stdout, 'hi')
  assert.equal(res.code, 0)
})
