// 0.7.2 回归：i18n 不得退回原始键（entry.label 等）。两个真实事故口：
//   1) 桌面客户端 locale 服务晚到：dsh-client-locale 的 apply 要先
//      await __DSH_LOCALE__.read()（Electron IPC）才 ctx.provide('locale')，
//      0.7.1 的一次性 ctx.get('locale') 取到 undefined 即整体跳过 i18n。
//   2) dshmarket 热更新双装载：旧实例后卸载时不得撤走词典（新实例注册被
//      already has locale 跳过，词典一撤就回显原始键）。
// 用真实 @deepseek-ai/cordis fiber/inject/provide 机制驱动；locale 桩严格
// 镜像桌面 dsh-client-locale@0.2.1-rc.4 的 register/bind 语义。
// 运行：npm run build && node --test test/locale-race.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'

const { attachLocale } = await import('../lib/client/i18n.js')
const { ZH_DICT, EN_DICT } = await import('../lib/client/dictionaries.js')
const { Context } = await import('@deepseek-ai/cordis')

const NS = 'dsh-service-console'
const DICTS = [['zh', ZH_DICT], ['en', EN_DICT]]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** 镜像桌面 dsh-client-locale@0.2.1-rc.4 LocaleRuntime 词典语义 */
class LocaleStub {
  constructor() {
    this.dicts = new Map()
    this.bound = new Map()
    this.listeners = new Set()
    this.active = 'zh'
  }
  register(ns, localeOrDicts, dict) {
    const pairs = typeof localeOrDicts === 'string' ? [[localeOrDicts, dict]] : Object.entries(localeOrDicts)
    let locales = this.dicts.get(ns)
    if (!locales) {
      locales = new Map()
      this.dicts.set(ns, locales)
    }
    for (const [locale] of pairs) {
      if (locales.has(locale.toLowerCase())) {
        throw new Error('locale namespace "' + ns + '" already has locale "' + locale + '"')
      }
    }
    for (const [locale, entries] of pairs) locales.set(locale.toLowerCase(), entries)
    return () => {
      for (const [locale, entries] of pairs) {
        if (locales.get(locale.toLowerCase()) === entries) locales.delete(locale.toLowerCase())
      }
    }
  }
  bind(ns) {
    let t = this.bound.get(ns)
    if (!t) {
      t = (key) => {
        const locales = this.dicts.get(ns)
        for (const code of [this.active, 'en']) {
          const dict = locales ? locales.get(code) : undefined
          if (dict && dict[key] !== undefined) return dict[key]
        }
        return key // 缺词典回显 key（真实 translate 同语义）
      }
      this.bound.set(ns, t)
    }
    return t
  }
  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
}

/** 消费者：等价于 src/client/index.tsx 的 i18n 挂载路径（attachLocale） */
function makeConsumer(ref) {
  const apply = (ctx) => {
    attachLocale(ctx, NS, DICTS, (bound) => {
      ref.count = (ref.count ?? 0) + 1
      ref.t = bound.t
    })
  }
  apply.inject = []
  return apply
}

function makeProvider(stub) {
  const apply = (ctx) => {
    ctx.provide('locale', stub)
  }
  apply.inject = []
  return apply
}

test('attachLocale：桌面 locale 晚到（IPC 之后才 provide）仍完成注册与绑定', async () => {
  const root = new Context()
  const stub = new LocaleStub()
  const ref = {}
  // provider 镜像桌面 dsh-client-locale：await bridge.read() 之后才 provide
  const provider = (ctx) => {
    setTimeout(() => {
      ctx.provide('locale', stub)
    }, 20)
  }
  provider.inject = []
  root.plugin(provider)
  root.plugin(makeConsumer(ref)) // 与 provider 同帧挂载，locale 尚未 provide
  await sleep(120)
  assert.ok(ref.t, 'locale 就绪后必须完成绑定（0.7.1 一次性 get 会永久跳过）')
  assert.equal(ref.t('entry.label'), '服务', '不得回显原始键 entry.label')
  assert.equal(ref.t('panel.title'), 'Service Console')
  assert.equal(ref.t('status.done', { n: 3 }), '3 项服务', '变量插值走词典模板')
})

test('attachLocale：双装载后先装实例卸载不得撤走词典（热更新 dispose 顺序）', async () => {
  const root = new Context()
  const stub = new LocaleStub()
  root.provide('locale', stub)
  const refA = {}
  const refB = {}
  const fiberA = root.plugin(makeConsumer(refA))
  root.plugin(makeConsumer(refB)) // dshmarket 热更新：同一 locale 实例上装载两次
  await sleep(50)
  assert.equal(refA.t('entry.label'), '服务')
  assert.equal(refB.t('entry.label'), '服务')
  await fiberA.dispose() // 旧实例随后卸载——词典不得被 disposer 撤走
  await sleep(20)
  assert.equal(refB.t('entry.label'), '服务', '旧实例卸载后新实例仍需词典')
  assert.equal(stub.bind(NS)('entry.label'), '服务', '词典必须仍在 locale 注册表中')
})

test('attachLocale：locale 服务重启（新实例）后自动重注册', async () => {
  const root = new Context()
  const stub1 = new LocaleStub()
  const fiberP1 = root.plugin(makeProvider(stub1))
  const ref = {}
  root.plugin(makeConsumer(ref))
  await sleep(50)
  assert.equal(ref.t('entry.label'), '服务')
  await fiberP1.dispose() // 旧 locale 服务随热更新卸载
  const stub2 = new LocaleStub() // 新 LocaleRuntime 实例：注册表为空
  root.plugin(makeProvider(stub2))
  await sleep(50)
  assert.ok((ref.count ?? 0) >= 2, 'provider 重启后应重新进入绑定')
  assert.equal(ref.t('entry.label'), '服务', '新实例上必须重新注册词典')
  assert.equal(stub2.bind(NS)('entry.label'), '服务')
})

test('attachLocale：locale 服务始终缺失时静默降级（不炸、不绑）', async () => {
  const root = new Context()
  const ref = {}
  root.plugin(makeConsumer(ref))
  await sleep(50)
  assert.equal(ref.t, undefined, '无 locale 时不绑定（其余功能不受影响）')
})
