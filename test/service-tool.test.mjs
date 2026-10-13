// P0-2 单元测试：service_list 只读模型工具（defineTool 定义 / 过滤 / 输出 schema / 渲染）
// 运行：npm run build && node --test test/service-tool.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'

const { buildServiceTool } = await import('../lib/host/service-tool.js')
const { validateJsonSchemaValue } = await import('@deepseek-ai/dsh-tools')

function makeSnapshot() {
  return {
    scannedAt: 1791776357975,
    count: 3,
    partialWarnings: [],
    ledgerCount: 0,
    services: [
      {
        id: 'svc_protected',
        status: 'running',
        ownership: 'protected',
        confidence: 'inferred',
        name: '/System/Library/CoreServices/ControlCenter.app/Contents/MacOS/ControlCenter',
        pid: 1594,
        listeners: [{ host: '*', port: 7000, protocol: 'tcp' }],
        restartable: false,
        protected: true,
        ownershipEvidence: ['system binary: /System/Library/CoreServices/ControlCenter.app'],
        fingerprint: 'fp1',
        cwd: '/',
      },
      {
        id: 'svc_vite',
        status: 'running',
        ownership: 'workspace-inferred',
        confidence: 'inferred',
        name: '/opt/homebrew/bin/vite',
        pid: 4242,
        commandSummary: 'vite --port 3000',
        cwd: '/Users/me/project',
        listeners: [{ host: '127.0.0.1', port: 3000, protocol: 'tcp' }],
        restartable: true,
        protected: false,
        ownershipEvidence: ['workspace cwd: /Users/me/project'],
        fingerprint: 'fp2',
      },
      {
        id: 'svc_wechat',
        status: 'running',
        ownership: 'other-local',
        confidence: 'unknown',
        name: '/Applications/WeChat.app/Contents/MacOS/WeChat',
        pid: 1613,
        listeners: [{ host: '*', port: 14013, protocol: 'tcp' }],
        restartable: true,
        protected: false,
        ownershipEvidence: ['local cwd not in workspace: /'],
        fingerprint: 'fp3',
      },
    ],
  }
}

const tool = buildServiceTool({ snapshot: async () => makeSnapshot() })
const baseExec = {}

test('元数据：只读声明 + 并发安全 + 名称', async () => {
  assert.equal(tool.name, 'service_list')
  assert.match(tool.description, /READ-ONLY/)
  assert.equal(tool.isConcurrencySafe({}), true)
  // 参数 schema 合法：合法参数通过、非法 ownership 被拒
  assert.deepEqual(validateJsonSchemaValue(tool.parameters, { query: 'vite', limit: 10 }), [])
  assert.ok(validateJsonSchemaValue(tool.parameters, { ownership: 'root-owned' }).length > 0)
})

test('query 过滤：name / port / pid / cwd（不区分大小写）', async () => {
  const byPort = await tool.execute({ query: '3000' }, baseExec)
  assert.equal(byPort.count, 1)
  assert.equal(byPort.services[0].id, 'svc_vite')

  const byName = await tool.execute({ query: 'wechat' }, baseExec)
  assert.equal(byName.count, 1)
  assert.equal(byName.services[0].id, 'svc_wechat')

  const byPid = await tool.execute({ query: '1594' }, baseExec)
  assert.equal(byPid.count, 1)
  assert.equal(byPid.services[0].id, 'svc_protected')

  const noMatch = await tool.execute({ query: 'nothing-matches-this' }, baseExec)
  assert.equal(noMatch.count, 0)
  assert.equal(noMatch.total, 0)
})

test('ownership 过滤 + limit 截断 + total/count 语义', async () => {
  const prot = await tool.execute({ ownership: 'protected' }, baseExec)
  assert.equal(prot.total, 1)
  assert.equal(prot.count, 1)
  assert.equal(prot.services[0].protected, true)

  const all = await tool.execute({}, baseExec)
  assert.equal(all.total, 3)
  assert.equal(all.count, 3)

  const limited = await tool.execute({ limit: 2 }, baseExec)
  assert.equal(limited.total, 3)
  assert.equal(limited.count, 2)

  const clampedHigh = await tool.execute({ limit: 9999 }, baseExec)
  assert.equal(clampedHigh.count, 3) // MAX_LIMIT=200 不截断本 fixture
  const clampedLow = await tool.execute({ limit: 0 }, baseExec)
  assert.equal(clampedLow.count, 1) // 下限 1
})

test('输出符合声明的 output.schema（含 additionalProperties:false）', async () => {
  const value = await tool.execute({}, baseExec)
  assert.deepEqual(validateJsonSchemaValue(tool.output.schema, value), [])
  // 受保护条目必须带 evidence
  const prot = value.services.find((s) => s.id === 'svc_protected')
  assert.ok(prot.evidence.length > 0)
  // 不允许夹带声明外字段
  assert.ok(validateJsonSchemaValue(tool.output.schema, { ...value, smuggled: true }).length > 0)
})

test('render：文本行含受保护标记 / 端口 / pid / 证据', async () => {
  const value = await tool.execute({}, baseExec)
  const blocks = tool.output.render({}, value)
  assert.equal(blocks.length, 1)
  assert.equal(blocks[0].type, 'text')
  assert.match(blocks[0].text, /\[protected\].*ControlCenter.*pid 1594.*system binary/)
  assert.match(blocks[0].text, /:3000 · pid 4242/)
  assert.match(blocks[0].text, /^services 3\/3 \(scanned /)
})
