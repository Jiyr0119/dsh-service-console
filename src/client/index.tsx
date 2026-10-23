/**
 * dsh-service-console — Client 入口（原生包 v2）
 *
 * 架构对齐 dsh-workspace-explorer:
 * - 通过 locale.register + locale.bind 实现国际化（词典键编译期校验）
 * - 通过 webServer JSON 路由调用 Host（fetch 直连，不走 host.call / LLM）
 * - 注册 DSH 设置壳的 settings.section 页
 * - 注册 shell.overlay 抽屉面板 + header 入口按钮
 *
 * 类型化（P0-5）：ctx 来自 @deepseek-ai/cordis，ctx.slots / ctx.locale /
 * SlotMap 键均由平台类型包增广；平台包仅 type-only 导入，构建时擦除。
 */
import type { Context } from '@deepseek-ai/cordis'
// 平台类型增广（SlotMap / Context.slots / Context.locale）——type-only，不进 bundle
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import {
  ServiceConsoleEntry,
  ServiceConsolePanel,
  ServiceConsoleSettings,
  bindTimer,
  bindLocale,
} from './ServiceConsole'
import { registerDictionaries, bindTranslator, type LocaleCompat, type Translate } from './i18n'
import { ZH_DICT, EN_DICT, type ConsoleKey } from './dictionaries'

// 把本插件词典并入平台 LocaleNamespaceMap：register(ns, dicts) 与 bind(ns)
// 从此按 ConsoleKey 做键域校验（缺键/多键/拼写错误都是编译错误）。
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'dsh-service-console': ConsoleKey
  }
}

const NS = 'dsh-service-console'

/** cordis-plugin-timer 未随本包安装类型；客户端只用 timeout 一种能力，结构化声明 */
interface TimerLike {
  timeout(callback: () => void, delay: number): () => void
}

type ClientContext = Context & { timer: TimerLike }

let labelT: Translate | null = null
function labelFn(key: ConsoleKey): string {
  return labelT ? labelT(key) : key
}

export default {
  inject: ['slots', 'timer'],
  apply(ctx: ClientContext) {
    bindTimer(ctx.timer)

    // ---------- i18n：幂等注册 + 稳定绑定（热挂载/双装载安全，0.7.1） ----------
    // 桌面 dshmarket 热更新会双装载插件：第二次 register 抛 already has locale。
    // 忽略注册异常但始终完成绑定——否则 tr 退回原始键（0.7.0 之前的事故根因）。
    const locale = ctx.get('locale') as LocaleCompat | undefined
    if (locale !== undefined) {
      ctx.effect(() => registerDictionaries(locale, NS, [['zh', ZH_DICT], ['en', EN_DICT]]))
      const bound = bindTranslator(locale, NS)
      labelT = bound.t
      bindLocale(bound)
    }

    // ---------- Header 入口按钮 ----------
    ctx.effect(() =>
      ctx.slots.inject('conversation.session.header.utilities', () =>
        ctx.slots.register(
          {
            name: 'conversation.session.header.utilities',
            id: 'dsh-service-console',
            order: 25,
            label: () => labelFn('plugin.name'),
          },
          ServiceConsoleEntry,
        ),
      ),
    )

    // ---------- Shell overlay 抽屉面板 ----------
    ctx.effect(() =>
      ctx.slots.inject('shell.overlay', () =>
        ctx.slots.register(
          { name: 'shell.overlay', id: 'dsh-service-console-panel' },
          ServiceConsolePanel,
        ),
      ),
    )

    // ---------- 设置页 ----------
    ctx.effect(() =>
      ctx.slots.inject('settings.section', () =>
        ctx.slots.register(
          {
            name: 'settings.section',
            id: 'dsh-service-console',
            order: 35,
            label: () => labelFn('plugin.name'),
          },
          ServiceConsoleSettings,
        ),
      ),
    )
  },
}
