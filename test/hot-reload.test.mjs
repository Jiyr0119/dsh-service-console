// 0.7.1 热挂载/双装载幂等：locale.register / webServer.register / tools.register
// 在桌面 dshmarket 热更新时会被装载两次，第二次注册抛重复错误。
// 插件必须：跳过重复注册、仍完成 i18n 绑定、整体 apply 不炸。
// 运行：npm run build && node --test test/hot-reload.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'

const { registerDictionaries, bindTranslator } = await import('../lib/client/i18n.js')
const host = await import('../lib/index.js')

// ---------- client i18n ----------
test('registerDictionaries 正常路径：逐语种注册，disposer 可清理', () => {
  const calls = []
  const offs = []
  const locale = {
    register(ns, code, dict) {
      calls.push({ ns, code, keys: Object.keys(dict).length })
      const off = () => offs.push(code)
      return off
    },
    bind: () => (key) => key,
    subscribe: () => () => {},
  }
  const dispose = registerDictionaries(locale, 'dsh-service-console', [['zh', { a: '甲' }], ['en', { a: 'A' }]])
  assert.deepEqual(calls.map((c) => c.code), ['zh', 'en'])
  dispose()
  assert.deepEqual(offs, ['zh', 'en'])
})

test('registerDictionaries 幂等：already has locale 被跳过，其余语种仍注册', () => {
  const codes = []
  const locale = {
    register(ns, code, dict) {
      if (code === 'zh') throw new Error('locale namespace "ns" already has locale "zh"')
      codes.push(code)
      return () => {}
    },
    bind: () => (key) => key,
    subscribe: () => () => {},
  }
  const dispose = registerDictionaries(locale, 'ns', [['zh', {}], ['en', {}]])
  assert.deepEqual(codes, ['en'], 'zh 抛错不影响 en')
  assert.equal(typeof dispose, 'function', 'disposer 仍可安全调用')
  dispose()
})

test('bindTranslator：注册抛错后仍绑定出可用翻译（事故根因回归）', () => {
  // 模拟第二次热挂载：register 全部抛 already has locale，但词典已由第一次装载在库
  const dict = { 'entry.label': '服务', 'settings.refreshN': '{n} 秒' }
  const locale = {
    register() {
      throw new Error('already has locale')
    },
    bind: () => (key) => dict[key] ?? key,
    subscribe: () => () => {},
  }
  registerDictionaries(locale, 'ns', [['zh', dict], ['en', dict]]) // 不应抛
  const { t } = bindTranslator(locale, 'ns')
  assert.equal(t('entry.label'), '服务', '不能退回原始键')
  assert.equal(t('settings.refreshN', { n: 5 }), '5 秒', '变量插值兜底')
  assert.equal(t('missing.key'), 'missing.key', '缺键回退')
})

test('bindTranslator：语言切换后 subscribe 重绑取新词典', () => {
  let lang = 'zh'
  const dicts = { zh: { k: '甲' }, en: { k: 'A' } }
  let notify = null
  const locale = {
    register: () => () => {},
    bind: () => (key) => dicts[lang][key] ?? key,
    subscribe: (fn) => {
      notify = fn
      return () => {}
    },
  }
  const { t, subscribe } = bindTranslator(locale, 'ns')
  let ticks = 0
  subscribe(() => { ticks += 1 })
  assert.equal(t('k'), '甲')
  lang = 'en'
  notify()
  assert.equal(ticks, 1)
  assert.equal(t('k'), 'A', '切换后取新语种')
})

// ---------- host 双装载 ----------
function makeCtx(state) {
  const ctx = {
    timer: { timeout: async () => {}, timeout2: () => () => {} },
    on() {},
    get(name) {
      if (name === 'tools') return state.tools
      return undefined
    },
    effect(fn) {
      const off = fn()
      state.effects.push(off)
      return off
    },
    webServer: {
      port: 6555,
      register(route) {
        if (state.routes.has(route.path)) {
          throw new Error('webserver: duplicate exact route "' + route.path + '"')
        }
        state.routes.set(route.path, route)
        return () => { state.routes.delete(route.path) }
      },
    },
  }
  return ctx
}

test('host 双装载幂等：第二次 apply 跳过重复路由，不炸且不重复注册', () => {
  const state = { routes: new Map(), effects: [], tools: undefined }
  const apply = host.default.apply
  apply(makeCtx(state))
  const firstCount = state.routes.size
  assert.ok(firstCount >= 6, '首次应注册全部路由，got ' + firstCount)
  // 第二次装载（dshmarket 热更新场景）：所有路由都重复——不得抛错
  apply(makeCtx(state))
  assert.equal(state.routes.size, firstCount, '重复注册被跳过')
  // 首次的 effect disposer 清理后路由消失（热卸载正常）
  for (const off of state.effects.slice(0, firstCount)) off()
  assert.equal(state.routes.size, 0, 'disposer 注销路由')
})

test('host 双装载 + tools：service_list 重复注册被跳过', () => {
  const state = { routes: new Map(), effects: [], tools: undefined }
  const registered = []
  state.tools = {
    register(tool) {
      if (registered.includes(tool.name)) throw new Error('tool "' + tool.name + '" already registered')
      registered.push(tool.name)
      return () => { registered.splice(registered.indexOf(tool.name), 1) }
    },
    get(name) {
      return registered.includes(name) ? {} : undefined
    },
  }
  const apply = host.default.apply
  apply(makeCtx(state))
  apply(makeCtx(state))
  assert.deepEqual(registered, ['service_list'], '工具只注册一次')
})
