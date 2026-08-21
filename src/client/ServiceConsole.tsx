/**
 * dsh-service-console — 面板组件（原生包 v2）
 *
 * 架构对齐 dsh-workspace-explorer:
 * - i18n: 通过 locale.bind(NS) 获取翻译函数（而非硬编码 TEXTS）
 * - API: 通过 fetch 直连 webServer JSON 路由（不走 host.call / LLM）
 * - UI: 抽屉式面板 + Tab 栏（服务 / 设置），对标 workspace-explorer 视觉风格
 */
import * as React from 'react'
import styles from './service-console.module.css'

// ---------- DSH 服务注入 ----------
interface TimerLike {
  timeout(callback: () => void, delay: number): () => void
}
interface LocaleLike {
  getLocale(): { id?: string }
  subscribe(fn: () => void): () => void
  bind(ns: string): (key: string, vars?: Record<string, string | number>) => string
}

let timerCtx: TimerLike | null = null
let localeCtx: LocaleLike | null = null
let tr: (key: string, vars?: Record<string, string | number>) => string = (k) => k

export function bindTimer(t: TimerLike): void { timerCtx = t }
export function bindLocale(locale: LocaleLike): void {
  localeCtx = locale
  try {
    const bound = locale.bind('dsh-service-console')
    tr = (key: string, vars?: Record<string, string | number>): string => {
      let s = bound(key)
      if (typeof s !== 'string' || s === key) s = key
      if (vars) for (const vk in vars) s = s.split(`{${vk}}`).join(String(vars[vk]))
      return s
    }
  } catch { /* fallback: tr returns key */ }
}

// ---------- Host API（fetch 直连，不经过 LLM） ----------
async function api<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const res = await fetch('/dsh-sc/api/' + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const text = await res.text().catch(() => '')
  try { return JSON.parse(text || '{}') as T } catch { throw new Error('bad JSON HTTP ' + res.status) }
}
interface Envelope<T> { ok: boolean; data?: T; error?: { code?: string; message?: string } }

// ---------- 共享状态（面板开关） ----------
const store = { open: false, listeners: new Set<(v: boolean) => void>() }
function subscribeOpen(fn: (v: boolean) => void): () => void { store.listeners.add(fn); return () => { store.listeners.delete(fn) } }
function setOpen(v: boolean): void { store.open = v; store.listeners.forEach((l) => l(v)) }
function toggleOpen(): void { setOpen(!store.open) }
function closePanel(): void { setOpen(false) }

// ---------- 归属 badge 色彩 ----------
const OWNERSHIP_COLOR: Record<string, string> = {
  'conversation-confirmed': 'var(--dsw-alias-state-success-primary, #4ade80)',
  'workspace-inferred': 'var(--dsw-alias-state-warn-primary, #fbbf24)',
  'other-local': 'var(--dsw-alias-label-secondary, #94a3b8)',
  unknown: 'var(--dsw-alias-state-error-primary, #f87171)',
  protected: 'var(--dsw-alias-state-error-primary, #f87171)',
}
const OWNERSHIP_KEY: Record<string, string> = {
  'conversation-confirmed': 'own.conversation',
  'workspace-inferred': 'own.workspace',
  'other-local': 'own.other',
  unknown: 'own.unknown',
  protected: 'own.protected',
}

// ---------- 数据类型 ----------
interface Listener { host: string; port: number; protocol: string; url?: string | null }
interface Service {
  id: string; name: string; pid: number; ownership: string; restartable: boolean
  commandSummary?: string | null; cwd?: string | null; listeners: Listener[]
  processGroupId?: number | null; parentPid?: number | null; startedAt?: number | null
  ownershipEvidence: string[]
}
interface ScanData { scannedAt: number; count: number; services: Service[]; partialWarnings: string[]; ledgerCount: number }
interface ConfigData { refreshInterval: number; gracefulTimeout: number; forceKill: boolean }

// ---------- 测量弹窗位置（header 底部 → composer 顶部） ----------
function measurePopup(): { top: number; height: number } {
  const vh = window.innerHeight
  const header = document.querySelector('[data-slot="conversation.session.header"]')
  const composer = document.querySelector('[data-composer-card]')
  const top = header ? Math.round(header.getBoundingClientRect().bottom) + 8 : 48
  const bottomLimit = composer ? Math.round(composer.getBoundingClientRect().top) - 8 : vh - 48
  return { top, height: Math.max(280, bottomLimit - top) }
}

// =====================================================================
//  Header 入口按钮
// =====================================================================
export function ServiceConsoleEntry(): React.ReactElement {
  const [on, setOn] = React.useState(store.open)
  React.useEffect(() => subscribeOpen(setOn), [])
  return (
    <button type="button" className={styles.headerBtn + (on ? ' ' + styles.headerBtnOn : '')}
      onClick={toggleOpen} title={tr('entry.tip')} aria-label={tr('entry.tip')}>
      <span>{tr('entry.label')}</span>
      <svg viewBox="0 0 16 16" width={13} height={13} aria-hidden="true">
        <rect x={2} y={3} width={12} height={10} rx={1.5} fill="none" stroke="currentColor" strokeWidth={1.3} />
        <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
      </svg>
    </button>
  )
}

// =====================================================================
//  设置页（注册到 DSH settings.section）
// =====================================================================
export function ServiceConsoleSettings(): React.ReactElement {
  const [config, setConfig] = React.useState<ConfigData | null>(null)
  React.useEffect(() => {
    api<Envelope<{ config: ConfigData }>>('config', {})
      .then((res) => setConfig(res?.data?.config ?? null))
      .catch(() => {})
  }, [])
  const updateConfig = (patch: Record<string, unknown>): void => {
    api<Envelope<{ config: ConfigData }>>('config', { action: 'update', patch })
      .then((res) => { if (res?.data) setConfig(res.data.config) })
      .catch(() => {})
  }
  if (!config) return <div className={styles.setPage}><div className={styles.note}>Loading…</div></div>
  return (
    <div className={styles.setPage}>
      <div className={styles.setSection}>{tr('settings.general')}</div>
      <div className={styles.setRow}>
        <div className={styles.setInfo}>
          <div className={styles.setLabel}>{tr('settings.gracefulTimeout')}</div>
        </div>
        <input className={styles.setInput} type="number" defaultValue={config.gracefulTimeout}
          onBlur={(e) => updateConfig({ gracefulTimeout: parseInt(e.target.value, 10) })} />
      </div>
      <div className={styles.setRow}>
        <div className={styles.setInfo}>
          <div className={styles.setLabel}>{tr('settings.forceKill')}</div>
          <div className={styles.setCap}>{tr('settings.forceKill.desc')}</div>
        </div>
        <button type="button" role="switch" aria-checked={config.forceKill}
          className={styles.switch}
          onClick={() => updateConfig({ forceKill: !config.forceKill })} />
      </div>
      <div className={styles.setFooter}>
        <button type="button" className={styles.prevBtn}
          onClick={() => updateConfig({ gracefulTimeout: 3000, forceKill: false })}>
          {tr('settings.restore')}
        </button>
      </div>
      <div className={styles.setNote}>{tr('settings.note')}</div>
    </div>
  )
}

// =====================================================================
//  主面板（抽屉式，对标 workspace-explorer）
// =====================================================================
export function ServiceConsolePanel(): React.ReactElement | null {
  const [on, setOn] = React.useState(store.open)
  const [shown, setShown] = React.useState(false)
  const [closing, setClosing] = React.useState(false)
  const [rect, setRect] = React.useState({ top: 48, height: 480 })
  const [tab, setTab] = React.useState<'services' | 'settings'>('services')
  const [query, setQuery] = React.useState('')
  const [view, setView] = React.useState<{ phase: string; at: string | null; data: ScanData | null; err: string | null }>({
    phase: 'idle', at: null, data: null, err: null,
  })
  const [confirming, setConfirming] = React.useState<{ id: string; action: string } | null>(null)
  const [opResult, setOpResult] = React.useState<{ id: string; ok: boolean; text: string } | null>(null)
  const [expanded, setExpanded] = React.useState<string | null>(null)
  const [config, setConfig] = React.useState<ConfigData | null>(null)
  const [, setLangTick] = React.useState(0) // 语言切换触发重渲染
  const timeoutRef = React.useRef<(() => void) | null>(null)

  React.useEffect(() => subscribeOpen(setOn), [])
  // 订阅语言变化，触发重渲染
  React.useEffect(() => localeCtx?.subscribe(() => setLangTick((n) => n + 1)), [])

  // 打开/收起动画
  React.useEffect(() => {
    if (on) {
      setClosing(false)
      setShown(false)
      const raf = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(raf)
    }
    setShown(false)
    setClosing(true)
    const t = setTimeout(() => setClosing(false), 200)
    return () => clearTimeout(t)
  }, [on])

  // Esc 关闭
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape') closePanel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // 动态测量弹窗位置
  React.useEffect(() => {
    const update = (): void => setRect(measurePopup())
    update()
    const ro = new ResizeObserver(update)
    const header = document.querySelector('[data-slot="conversation.session.header"]')
    const composer = document.querySelector('[data-composer-card]')
    if (header) ro.observe(header)
    if (composer) ro.observe(composer)
    window.addEventListener('resize', update)
    return () => { ro.disconnect(); window.removeEventListener('resize', update) }
  }, [])

  // 定时器清理
  React.useEffect(() => () => { timeoutRef.current?.() }, [])

  // 加载配置
  React.useEffect(() => {
    api<Envelope<{ config: ConfigData }>>('config', {})
      .then((res) => setConfig(res?.data?.config ?? null))
      .catch(() => {})
  }, [])

  // ---------- 扫描 ----------
  const scan = React.useCallback(() => {
    const at = new Date().toLocaleTimeString()
    setView((v) => ({ phase: 'scanning', at, data: v.data, err: null }))
    timeoutRef.current?.()
    timeoutRef.current = timerCtx?.timeout(() => {
      setView((v) => (v.phase === 'scanning' ? { phase: 'timeout', at, data: v.data, err: 'timeout' } : v))
    }, 8000) ?? null
    api<Envelope<ScanData>>('services/scan', {})
      .then((res) => { timeoutRef.current?.(); timeoutRef.current = null; setView({ phase: 'done', at, data: res?.data ?? null, err: null }) })
      .catch((e: Error) => { timeoutRef.current?.(); timeoutRef.current = null; setView({ phase: 'error', at, data: null, err: String(e?.message || e) }) })
  }, [])

  React.useEffect(() => { if (on && view.phase === 'idle') scan() }, [on, scan, view.phase])

  if (!on && !closing) return null

  // ---------- 操作 ----------
  const runAction = (svc: Service, action: string): void => { setConfirming({ id: svc.id, action }); setOpResult(null) }
  const confirmAction = (svc: Service, action: string): void => {
    setConfirming(null)
    api<Envelope<{ result?: string }>>('services/' + action, { serviceId: svc.id })
      .then((res) => {
        if (res?.ok) setOpResult({ id: svc.id, ok: true, text: action === 'stop' ? tr('result.stopped') : tr('result.restarted') })
        else {
          const code = res?.error?.code ?? ''
          setOpResult({ id: svc.id, ok: false, text: tr('err.' + code) || res?.error?.message || tr('result.error') })
        }
        scan()
      })
      .catch(() => setOpResult({ id: svc.id, ok: false, text: 'RPC error' }))
  }

  // ---------- 过滤 ----------
  let rows = view.data?.services ?? []
  if (query) {
    const q = query.toLowerCase()
    rows = rows.filter((s) =>
      s.name.toLowerCase().includes(q) || String(s.pid).includes(q) ||
      (s.commandSummary ?? '').toLowerCase().includes(q) ||
      (s.cwd ?? '').toLowerCase().includes(q) ||
      s.listeners.some((l) => String(l.port).includes(q)),
    )
  }

  // ---------- 服务列表 body ----------
  const servicesBody = (
    <>
      <div className={styles.filterRow}>
        <input className={styles.filter} type="text" value={query}
          placeholder={tr('search.ph')} onChange={(e) => setQuery(e.target.value)} />
        {query !== '' ? (
          <button type="button" className={styles.filterClear} onClick={() => setQuery('')}
            title={tr('action.cancel')} aria-label={tr('action.cancel')}>
            <svg viewBox="0 0 16 16" width={12} height={12}><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
          </button>
        ) : null}
      </div>
      <div className={styles.hintLine}>
        <span className={styles.liveDot} />
        <span>{tr('panel.subtitle')}</span>
      </div>
      {view.phase === 'scanning' ? (
        <div className={styles.note}><span className={styles.spin} />{tr('status.scanning')}</div>
      ) : view.phase === 'error' || view.phase === 'timeout' ? (
        <div className={styles.noteErr}>{tr('status.error')}: {view.err}</div>
      ) : null}
      {(view.data?.partialWarnings ?? []).map((w, i) => (
        <div key={`w${i}`} className={styles.noteWarn}>⚠ {w}</div>
      ))}
      {rows.length === 0 && view.phase === 'done' ? (
        <div className={styles.empty}>{tr('svc.noSvc')}</div>
      ) : (
        rows.map((svc) => {
          const badgeColor = OWNERSHIP_COLOR[svc.ownership] ?? OWNERSHIP_COLOR.unknown
          const badgeKey = OWNERSHIP_KEY[svc.ownership] ?? 'own.unknown'
          const ports = svc.listeners.map((l) => String(l.port)).join(', ')
          const url = svc.listeners.map((l) => l.url).filter(Boolean)[0] ?? null
          const canControl = svc.ownership === 'conversation-confirmed' || svc.ownership === 'workspace-inferred' || svc.ownership === 'other-local'
          const isConfirming = confirming?.id === svc.id
          const result = opResult?.id === svc.id ? opResult : null
          return (
            <div key={svc.id} className={styles.row}>
              <div className={styles.rowMain}>
                <span className={styles.rowDot} style={{ color: badgeColor }}>●</span>
                <span className={styles.rowName}>{svc.name}</span>
                <span className={styles.rowMeta}>:{ports} · pid {svc.pid}</span>
                <span className={styles.badge} style={{ color: badgeColor }}>{tr(badgeKey)}</span>
                {svc.restartable ? <span className={styles.badge} style={{ color: 'var(--dsw-alias-state-success-primary, #4ade80)' }}>↻</span> : null}
                {url ? (
                  <a className={styles.rowAct} href={url} target="_blank" rel="noreferrer"
                    title={url} onClick={(e) => e.stopPropagation()}>
                    <svg viewBox="0 0 16 16" width={12} height={12}><path d="M6.5 3.5h-3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3M9 2.5h4.5V7M13.5 2.5L7.5 8.5" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </a>
                ) : null}
                <span className={styles.spacer} />
                {canControl ? (
                  <button type="button" className={styles.rowBtn}
                    onClick={(e) => { e.stopPropagation(); runAction(svc, 'stop') }}>
                    {isConfirming && confirming!.action === 'stop' ? tr('confirm.stop') : tr('action.stop')}
                  </button>
                ) : null}
                {svc.restartable ? (
                  <button type="button" className={styles.rowBtn}
                    onClick={(e) => { e.stopPropagation(); runAction(svc, 'restart') }}>
                    {isConfirming && confirming!.action === 'restart' ? tr('confirm.restart') : tr('action.restart')}
                  </button>
                ) : null}
                <button type="button" className={styles.rowBtn}
                  onClick={(e) => { e.stopPropagation(); setExpanded(expanded === svc.id ? null : svc.id) }}>
                  {expanded === svc.id ? '▾' : tr('action.detail')}
                </button>
              </div>
              <div className={styles.rowSub}>
                {(svc.commandSummary ? svc.commandSummary.slice(0, 100) : '(?)') +
                  (svc.commandSummary && svc.commandSummary.length > 100 ? '…' : '')}
              </div>
              {svc.cwd ? <div className={styles.rowSub}>{svc.cwd}</div> : null}
              {result ? (
                <div className={result.ok ? styles.okText : styles.errText}>
                  {result.ok ? '✅ ' : '⛔ '}{result.text}
                </div>
              ) : null}
              {isConfirming ? (
                <div className={styles.confirmRow}>
                  <span className={styles.confirmTxt}>
                    {tr('confirm.txt', { name: svc.name, pid: String(svc.pid), action: confirming!.action === 'stop' ? tr('action.stop') : tr('action.restart') })}
                  </span>
                  <button type="button" className={styles.confirmOk}
                    onClick={() => confirmAction(svc, confirming!.action)}>{tr('action.confirm')}</button>
                  <button type="button" className={styles.confirmCancel}
                    onClick={() => setConfirming(null)}>{tr('action.cancel')}</button>
                </div>
              ) : null}
              {expanded === svc.id ? (
                <div className={styles.detailBox} role="region" aria-label={tr('detail.title')}>
                  <div className={styles.detailHead}>
                    <span>{tr('detail.title')}</span>
                    <span className={styles.detailAccent}>{tr('detail.serviceRecord')}</span>
                  </div>
                  <div className={styles.detailGrid}>
                    <div><span className={styles.detailLabel}>{tr('detail.serviceId')}</span><code>{svc.id}</code></div>
                    <div><span className={styles.detailLabel}>{tr('detail.process')}</span><code>PID {svc.pid} · PGID {String(svc.processGroupId ?? '-')}</code></div>
                    <div><span className={styles.detailLabel}>{tr('detail.parent')}</span><code>PPID {String(svc.parentPid ?? '-')}</code></div>
                    <div><span className={styles.detailLabel}>{tr('detail.started')}</span><code>{String(svc.startedAt ?? '-')}</code></div>
                  </div>
                  <div className={styles.evidenceBlock}>
                    <span className={styles.detailLabel}>{tr('detail.evidence')}</span>
                    {svc.ownershipEvidence.length
                      ? svc.ownershipEvidence.map((ev, i) => <div key={i} className={styles.evidenceItem}><span className={styles.evidenceArrow}>↳</span>{ev}</div>)
                      : <div className={styles.rowSub}>—</div>}
                  </div>
                </div>
              ) : null}
            </div>
          )
        })
      )}
    </>
  )

  // ---------- 设置 body ----------
  const settingsBody = <ServiceConsoleSettings />

  return (
    <div className={styles.layer}>
      <div className={styles.popup + (shown ? ' ' + styles.popupOn : '')}
        style={{ top: rect.top, height: rect.height }}>
        {/* Head */}
        <div className={styles.head}>
          <span className={styles.headIco}>
            <svg viewBox="0 0 16 16" width={17} height={17} aria-hidden="true">
              <rect x={2} y={3} width={12} height={10} rx={1.5} fill="none" stroke="currentColor" strokeWidth={1.3} />
              <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
            </svg>
          </span>
          <div className={styles.headTitle}>{tr('panel.title')}</div>
          <button type="button" className={styles.icoBtn} onClick={scan} title={tr('status.lastScan')} aria-label={tr('status.lastScan')}>
            <svg viewBox="0 0 16 16" width={14} height={14}><path d="M13.5 8a5.5 5.5 0 1 1-1.61-3.89M13.5 1.5v3h-3" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
          </button>
          <button type="button" className={styles.icoBtn} onClick={closePanel} title={tr('action.cancel')} aria-label={tr('action.cancel')}>
            <svg viewBox="0 0 16 16" width={14} height={14}><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" /></svg>
          </button>
        </div>
        {/* Tab 栏 */}
        <div className={styles.tabs} role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'services'}
            className={styles.tab + (tab === 'services' ? ' ' + styles.tabOn : '')}
            onClick={() => setTab('services')}>
            <svg viewBox="0 0 16 16" width={13} height={13} aria-hidden="true">
              <rect x={2} y={3} width={12} height={10} rx={1.5} fill="none" stroke="currentColor" strokeWidth={1.3} />
              <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
            </svg>
            <span>{tr('tab.services')}</span>
            <span className={styles.tabInd} />
          </button>
          <button type="button" role="tab" aria-selected={tab === 'settings'}
            className={styles.tab + (tab === 'settings' ? ' ' + styles.tabOn : '')}
            onClick={() => setTab('settings')}>
            <svg viewBox="0 0 16 16" width={13} height={13} aria-hidden="true">
              <circle cx={8} cy={8} r={2.5} fill="none" stroke="currentColor" strokeWidth={1.3} />
              <path d="M8 4.3V2.9M8 13.1v-1.4M4.3 8H2.9M13.1 8h-1.4M5.2 5.2L4.1 4.1M11.9 11.9l-1.1-1.1M5.2 10.8L4.1 11.9M11.9 4.1l-1.1 1.1" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
            </svg>
            <span>{tr('tab.settings')}</span>
            <span className={styles.tabInd} />
          </button>
        </div>
        {/* Body */}
        <div className={styles.tabBody}>
          {tab === 'services' ? servicesBody : settingsBody}
        </div>
      </div>
    </div>
  )
}
