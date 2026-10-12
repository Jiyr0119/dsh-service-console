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
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
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

let labelT: TranslateNS<'dsh-service-console'> | null = null
function labelFn(key: ConsoleKey): string {
  return labelT ? labelT(key) : key
}

export default {
  inject: ['slots', 'timer', 'locale'],
  apply(ctx: ClientContext) {
    bindTimer(ctx.timer)

    // ---------- i18n: 一次注册双语词典 + 绑定类型化翻译函数 ----------
    const locale = ctx.locale
    ctx.effect(() => locale.register(NS, { zh: ZH_DICT, en: EN_DICT }))
    labelT = locale.bind(NS)
    bindLocale({ t: labelT, subscribe: (fn) => locale.subscribe(fn) })

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
