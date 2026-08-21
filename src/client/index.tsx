/**
 * dsh-service-console — Client 入口（原生包 v2）
 *
 * 架构对齐 dsh-workspace-explorer:
 * - 通过 locale.register + locale.bind 实现国际化（而非硬编码 TEXTS）
 * - 通过 webServer JSON 路由调用 Host（fetch 直连，不走 host.call / LLM）
 * - 注册 DSH 设置壳的 settings.section 页
 * - 注册 shell.overlay 抽屉面板 + header 入口按钮
 */
import * as React from 'react'
import { ServiceConsoleEntry, ServiceConsolePanel, ServiceConsoleSettings, bindTimer, bindLocale } from './ServiceConsole'
import { ZH_DICT, EN_DICT } from './dictionaries'

const NS = 'dsh-service-console'

interface LocaleLike {
  register(ns: string, locale: string, dict: Record<string, string>): () => void
  bind(ns: string): (key: string, vars?: Record<string, string | number>) => string
  getLocale(): { id?: string }
  subscribe(fn: () => void): () => void
}

interface SlotsLike {
  inject(name: string, fn: () => unknown): void
  register(
    options: { name: string; id: string; order?: number; label?: string | (() => string) },
    component: (props: never) => React.ReactNode,
  ): unknown
}

interface CtxLike {
  get(name: string): unknown
  effect(fn: () => () => void): void
  timer: { timeout(cb: () => void, ms: number): () => void }
}

export default {
  inject: ['slots', 'timer'],
  apply(ctx: CtxLike) {
    bindTimer(ctx.timer)
    const slots = ctx.get('slots') as SlotsLike | undefined
    if (slots === undefined) return

    // ---------- i18n: locale.register + locale.bind（对齐 workspace-explorer） ----------
    const locale = ctx.get('locale') as LocaleLike | undefined
    if (locale !== undefined) {
      try {
        // 先注册词典到 DSH locale 系统
        ctx.effect(() => {
          const d1 = locale.register(NS, 'zh', ZH_DICT)
          const d2 = locale.register(NS, 'en', EN_DICT)
          return () => { d1(); d2() }
        })
        // 再绑定翻译函数到 ServiceConsole 模块
        bindLocale(locale)
      } catch (err) {
        console.warn('[dsh-sc] locale init failed, fallback zh', String(err))
      }
    }

    // ---------- Header 入口按钮 ----------
    slots.inject('conversation.session.header.utilities', () =>
      slots.register(
        { name: 'conversation.session.header.utilities', id: 'dsh-service-console', order: 25, label: () => 'Service Console' },
        () => React.createElement(ServiceConsoleEntry),
      ),
    )

    // ---------- Shell overlay 抽屉面板 ----------
    slots.inject('shell.overlay', () =>
      slots.register(
        { name: 'shell.overlay', id: 'dsh-service-console-panel' },
        () => React.createElement(ServiceConsolePanel),
      ),
    )

    // ---------- 设置页 ----------
    slots.inject('settings.section', () =>
      slots.register(
        { name: 'settings.section', id: 'dsh-service-console', order: 35, label: () => 'Service Console' },
        () => React.createElement(ServiceConsoleSettings),
      ),
    )
  },
}
