// dsh-service-console · Client 入口：slots 注册（header 入口 + shell.overlay 面板）
import * as React from 'react'
import { ServiceConsoleEntry, ServiceConsolePanel, bindLocale, bindTimer } from './ServiceConsole'

export default {
  inject: ['slots', 'timer'],
  apply(ctx: { get(name: string): unknown; timer: { timeout(cb: () => void, ms: number): () => void }; }) {
    bindTimer(ctx.timer)
    const locale = ctx.get('locale') as { getLocale: () => { id?: string }; subscribe: (fn: () => void) => () => void } | undefined
    if (locale) bindLocale(locale)
    const slots = ctx.get('slots') as
      | {
          inject(name: string, cb: () => unknown): void
          register(spec: { name: string; id: string }, render: () => React.ReactElement | null): unknown
        }
      | undefined
    if (slots === undefined) return
    slots.inject('conversation.session.header.utilities', () =>
      slots.register({ name: 'conversation.session.header.utilities', id: 'sc-entry' }, () => React.createElement(ServiceConsoleEntry)),
    )
    slots.inject('shell.overlay', () =>
      slots.register({ name: 'shell.overlay', id: 'sc-panel' }, () => React.createElement(ServiceConsolePanel)),
    )
  },
}
