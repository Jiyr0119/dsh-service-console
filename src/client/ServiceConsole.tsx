// ServiceConsole 面板组件（从 dynamic/client.js 迁移为 TSX）
// 说明：Entry 与 Panel 通过模块级 store 共享打开状态；定时器经 bindTimer 注入（原生 Client 无浏览器定时器全局）。
import * as React from 'react'
import styles from './service-console.module.css'

interface TimerLike {
  timeout(callback: () => void, delay: number): () => void
}

let timerCtx: TimerLike | null = null
let localeCtx: { getLocale: () => { id?: string }; subscribe: (fn: () => void) => () => void } | null = null
export function bindTimer(t: TimerLike): void {
  timerCtx = t
}
export function bindLocale(locale: { getLocale: () => { id?: string }; subscribe: (fn: () => void) => () => void }): void {
  localeCtx = locale
}
function currentLanguage(): 'zh' | 'en' {
  const id = String(localeCtx?.getLocale()?.id || '').toLowerCase()
  return id.startsWith('zh') ? 'zh' : 'en'
}

// 原生 Client 通过 webServer JSON 路由调用 Host（动态版 host.call 的替代）
async function api<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch('/dsh-sc/api/' + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const text = await response.text().catch(() => '')
  try {
    return JSON.parse(text || '{}') as T
  } catch {
    throw new Error('bad JSON response HTTP ' + response.status)
  }
}
interface Envelope<T> {
  ok: boolean
  data?: T
  error?: { code?: string; message?: string }
}

const store = { open: false, listeners: new Set<(v: boolean) => void>() }
function subscribe(fn: (v: boolean) => void): () => void {
  store.listeners.add(fn)
  return () => store.listeners.delete(fn)
}
function setOpen(v: boolean): void {
  store.open = v
  store.listeners.forEach((l) => l(v))
}

interface OwnershipBadge {
  zh: string
  en: string
  color: string
}
const OWNERSHIP: Record<string, OwnershipBadge> = {
  'conversation-confirmed': { zh: '本次对话', en: 'This chat', color: 'var(--dsw-alias-state-success-primary, #4ade80)' },
  'workspace-inferred': { zh: '工作区推断', en: 'Workspace', color: 'var(--dsw-alias-state-warn-primary, #fbbf24)' },
  'other-local': { zh: '本机其他', en: 'Other local', color: 'var(--dsw-alias-label-secondary, #94a3b8)' },
  unknown: { zh: '未知', en: 'Unknown', color: 'var(--dsw-alias-state-error-primary, #f87171)' },
  protected: { zh: '受保护', en: 'Protected', color: 'var(--dsw-alias-state-error-primary, #f87171)' },
}
const ERROR_LABEL: Record<string, [string, string]> = {
  PERMISSION_DENIED: ['没有权限读取或控制该服务', 'No permission'],
  TARGET_GONE: ['该服务已结束', 'Service gone'],
  PID_REUSED: ['进程身份已变化，已取消操作', 'PID reused'],
  UNKNOWN_OWNERSHIP: ['无法确认来源，不允许控制', 'Unknown ownership'],
  PROTECTED_PROCESS: ['受保护进程，不能操作', 'Protected process'],
  GRACEFUL_TIMEOUT: ['未在等待时间内退出', 'Graceful timeout'],
  RESTART_UNSAFE: ['缺少安全启动信息，不能重启', 'Cannot restart safely'],
  PORT_CONFLICT: ['端口仍被占用', 'Port conflict'],
  START_TIMEOUT: ['未在预期时间开始监听', 'Start timeout'],
}
const TEXTS = {
  zh: {
    title: 'Service Console', subtitle: '本机监听服务', search: '搜索服务、端口或路径…',
    config: '配置', close: '关闭', noSvc: '未发现服务', stop: '停止', restart: '重启', detail: '详情',
    confirmStop: '确认停止?', confirmRestart: '确认重启?', confirmTxt: '确认对 {name} (pid {pid}) 执行{action}?',
    ok: '确认', cancel: '取消', stopped: '已停止', restarted: '已重启', evidence: '归属证据',
    refreshInterval: '自动刷新间隔(ms)', gracefulTimeout: '优雅超时(ms)', forceKill: '允许强制终止', allLocal: '全部本机服务', servicesFound: '项服务', lastScan: '最近扫描', closePanel: '关闭面板',
  },
  en: {
    title: 'Service Console', subtitle: 'Listening services on this Mac', search: 'Search services, ports, or paths…',
    config: 'Config', close: 'Close', noSvc: 'no services found', stop: 'Stop', restart: 'Restart', detail: 'Detail',
    confirmStop: 'Confirm stop?', confirmRestart: 'Confirm restart?', confirmTxt: 'Run {action} on {name} (pid {pid})?',
    ok: 'OK', cancel: 'Cancel', stopped: 'Stopped', restarted: 'Restarted', evidence: 'Ownership evidence',
    refreshInterval: 'Refresh interval (ms)', gracefulTimeout: 'Graceful timeout (ms)', forceKill: 'Allow force kill', allLocal: 'All local services', servicesFound: 'services', lastScan: 'Last scan', closePanel: 'Close panel',
  },
}
type Texts = (typeof TEXTS)['zh']

interface Listener {
  host: string
  port: number
  protocol: string
  url?: string | null
}
interface Service {
  id: string
  name: string
  pid: number
  ownership: string
  restartable: boolean
  commandSummary?: string | null
  cwd?: string | null
  listeners: Listener[]
  processGroupId?: number | null
  parentPid?: number | null
  startedAt?: number | null
  ownershipEvidence: string[]
}
interface ScanData {
  scannedAt: number
  count: number
  services: Service[]
  partialWarnings: string[]
  ledgerCount: number
}

export function ServiceConsoleEntry(): React.ReactElement {
  const [open, setLocal] = React.useState(store.open)
  const [lang, setLang] = React.useState<'zh' | 'en'>(currentLanguage())
  React.useEffect(() => subscribe(setLocal), [])
  React.useEffect(() => localeCtx?.subscribe(() => setLang(currentLanguage())), [])
  return (
    <button
      className={styles.entry}
      onClick={() => setOpen(!store.open)}
      title={lang === 'zh' ? '服务控制台' : 'Service Console'}
      aria-label={lang === 'zh' ? '服务控制台' : 'Service Console'}
    >
      {open ? '✕' : null}
      {!open ? <span className={styles.entryLabel}>{lang === 'zh' ? '服务' : 'Services'}</span> : null}
      {!open ? <span className={styles.entryIcon}>🖥</span> : null}
    </button>
  )
}

export function ServiceConsolePanel(): React.ReactElement | null {
  const [open, setLocal] = React.useState(store.open)
  const [lang, setLang] = React.useState<'zh' | 'en'>(currentLanguage())
  const [query, setQuery] = React.useState('')
  const [showConfig, setShowConfig] = React.useState(false)
  const [configData, setConfigData] = React.useState<Record<string, unknown> | null>(null)
  const [view, setView] = React.useState<{ phase: string; at: string | null; data: ScanData | null; err: string | null }>({
    phase: 'idle', at: null, data: null, err: null,
  })
  const [confirming, setConfirming] = React.useState<{ id: string; action: string } | null>(null)
  const [opResult, setOpResult] = React.useState<{ id: string; ok: boolean; text: string } | null>(null)
  const [expanded, setExpanded] = React.useState<string | null>(null)
  const timeoutRef = React.useRef<(() => void) | null>(null)

  React.useEffect(() => subscribe(setLocal), [])
  React.useEffect(() => localeCtx?.subscribe(() => setLang(currentLanguage())), [])
  React.useEffect(() => () => { timeoutRef.current?.() }, [])

  const T: Texts = TEXTS[lang]

  const scan = React.useCallback(() => {
    const at = new Date().toLocaleTimeString()
    setView((v) => ({ phase: 'scanning', at, data: v.data, err: null }))
    timeoutRef.current?.()
    timeoutRef.current = timerCtx?.timeout(() => {
      setView((v) => (v.phase === 'scanning' ? { phase: 'timeout', at, data: v.data, err: 'timeout' } : v))
    }, 8000) ?? null
    api<Envelope<ScanData>>('services/scan', {})
      .then((res) => {
        timeoutRef.current?.()
        timeoutRef.current = null
        setView({ phase: 'done', at, data: res?.data ?? null, err: null })
      })
      .catch((e: Error) => {
        timeoutRef.current?.()
        timeoutRef.current = null
        setView({ phase: 'error', at, data: null, err: String(e?.message || e) })
      })
  }, [])

  const loadConfig = React.useCallback(() => {
    api<Envelope<{ config: Record<string, unknown> }>>('config', {})
      .then((res) => setConfigData(res?.data?.config ?? null))
      .catch(() => setConfigData(null))
  }, [])

  React.useEffect(() => {
    if (open && view.phase === 'idle') scan()
  }, [open, scan, view.phase])

  if (!open) return null

  const runAction = (svc: Service, action: string): void => {
    setConfirming({ id: svc.id, action })
    setOpResult(null)
  }
  const confirmAction = (svc: Service, action: string): void => {
    setConfirming(null)
    api<Envelope<{ result?: string }>>('services/' + action, { serviceId: svc.id })
      .then((res) => {
        if (res?.ok) setOpResult({ id: svc.id, ok: true, text: action === 'stop' ? T.stopped : T.restarted })
        else {
          const code = res?.error?.code ?? ''
          const msg = res?.error?.message ?? ''
          setOpResult({ id: svc.id, ok: false, text: ERROR_LABEL[code] ? ERROR_LABEL[code][lang === 'zh' ? 0 : 1] : msg || 'ERR' })
        }
        scan()
      })
      .catch(() => setOpResult({ id: svc.id, ok: false, text: 'RPC error' }))
  }
  const setConfig = (patch: Record<string, unknown>): void => {
    api<Envelope<{ config: Record<string, unknown> }>>('config', { action: 'update', patch })
      .then((res) => {
        if (res?.data) setConfigData(res.data.config)
      })
      .catch(() => undefined)
  }

  // Always show every listening service on this machine. Ownership remains a badge and safety signal,
  // never a hidden filter; users decide which service to inspect or stop.
  let rows = view.data?.services ?? []
  if (query) {
    const q = String(query).toLowerCase()
    rows = rows.filter(
      (s) =>
        s.name.toLowerCase().indexOf(q) >= 0 ||
        String(s.pid).indexOf(q) >= 0 ||
        (s.commandSummary ?? '').toLowerCase().indexOf(q) >= 0 ||
        (s.cwd ?? '').toLowerCase().indexOf(q) >= 0 ||
        s.listeners.some((l) => String(l.port).indexOf(q) >= 0),
    )
  }

  const status =
    view.phase === 'scanning' ? <div className={styles.status}>⏳ {T.lastScan}: {view.at}</div>
      : view.phase === 'done' ? <div className={styles.status}>● {String(rows.length)} {T.servicesFound} · {T.lastScan}: {view.at}</div>
        : view.phase === 'error' || view.phase === 'timeout' ? <div className={styles.err}>⛔ {view.err}</div>
          : null

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <div className={styles.eyebrow}>DSH / LOCAL RUNTIME</div>
          <strong>{T.title}</strong>
          <span className={styles.subtitle}>{T.subtitle}</span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} onClick={() => { setShowConfig(!showConfig); if (!showConfig) loadConfig() }} aria-label={T.config}>⚙</button>
          <button className={styles.iconBtn} onClick={scan} aria-label="Refresh">↻</button>
          <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label={T.closePanel}>×</button>
        </div>
      </div>
      <div className={styles.scopeLine}>
        <span className={styles.liveDot} />
        <span>{T.allLocal}</span>
        <span className={styles.scopeHint}>· {T.subtitle}</span>
        <span className={styles.spacer} />
      </div>
      <input
        className={`${styles.input} ${styles.search}`}
        placeholder={T.search}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {showConfig && configData ? (
        <div className={styles.configBox}>
          <div className={styles.configRow}>
            <span className={styles.muted}>{T.refreshInterval}</span>
            <input
              className={styles.input}
              type="number"
              defaultValue={configData.refreshInterval as number}
              onBlur={(e) => setConfig({ refreshInterval: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className={styles.configRow}>
            <span className={styles.muted}>{T.gracefulTimeout}</span>
            <input
              className={styles.input}
              type="number"
              defaultValue={configData.gracefulTimeout as number}
              onBlur={(e) => setConfig({ gracefulTimeout: parseInt(e.target.value, 10) })}
            />
          </div>
          <label className={styles.configRow}>
            <input type="checkbox" checked={!!configData.forceKill} onChange={(e) => setConfig({ forceKill: e.target.checked })} /> {T.forceKill}
          </label>
        </div>
      ) : null}
      {status}
      {(view.data?.partialWarnings ?? []).map((w, i) => (
        <div key={`w${i}`} className={styles.warn}>⚠ {w}</div>
      ))}
      {rows.length === 0 && view.phase === 'done' ? (
        <div className={styles.muted}>{T.noSvc}</div>
      ) : (
        rows.map((svc) => {
          const badge = OWNERSHIP[svc.ownership] ?? OWNERSHIP.unknown
          const ports = svc.listeners.map((l) => String(l.port)).join(', ')
          const url = svc.listeners.map((l) => l.url).filter(Boolean)[0] ?? null
          const canControl = svc.ownership === 'conversation-confirmed' || svc.ownership === 'workspace-inferred' || svc.ownership === 'other-local'
          const isConfirming = confirming?.id === svc.id
          const result = opResult?.id === svc.id ? opResult : null
          return (
            <div key={svc.id} className={styles.row}>
              <div className={styles.rowMain}>
                <span className={styles.ok}>●</span>
                <span className={styles.name}>{svc.name}</span>
                <span className={styles.muted}>:{ports} · pid {String(svc.pid)}</span>
                <span className={styles.badge} style={{ color: badge.color }}>{lang === 'zh' ? badge.zh : badge.en}</span>
                {svc.restartable ? <span className={styles.badge} style={{ color: 'var(--dsw-alias-state-success-primary, #4ade80)' }}>↻</span> : null}
                {url ? (
                  <a className={styles.btn} href={url} target="_blank" rel="noreferrer">🔗</a>
                ) : null}
                <span className={styles.spacer} />
                {canControl ? (
                  <button className={styles.btn} onClick={() => runAction(svc, 'stop')}>
                    {isConfirming && confirming!.action === 'stop' ? T.confirmStop : T.stop}
                  </button>
                ) : null}
                {svc.restartable ? (
                  <button className={styles.btn} onClick={() => runAction(svc, 'restart')}>
                    {isConfirming && confirming!.action === 'restart' ? T.confirmRestart : T.restart}
                  </button>
                ) : null}
                <button className={styles.btn} onClick={() => setExpanded(expanded === svc.id ? null : svc.id)}>
                  {expanded === svc.id ? '▾' : T.detail}
                </button>
              </div>
              <div className={styles.muted}>
                {(svc.commandSummary ? svc.commandSummary.slice(0, 100) : '(?)') +
                  (svc.commandSummary && svc.commandSummary.length > 100 ? '…' : '')}
              </div>
              {svc.cwd ? <div className={styles.muted}>{svc.cwd}</div> : null}
              {result ? (
                <div className={result.ok ? styles.ok : styles.err}>
                  {result.ok ? '✅ ' : '⛔ '}
                  {result.text}
                </div>
              ) : null}
              {isConfirming ? (
                <div className={styles.confirmRow}>
                  <span className={styles.muted}>
                    {T.confirmTxt.replace('{name}', svc.name).replace('{pid}', String(svc.pid)).replace('{action}', confirming!.action === 'stop' ? T.stop : T.restart)}{' '}
                  </span>
                  <button className={styles.btn} style={{ color: 'var(--dsw-alias-state-error-primary, #f87171)' }} onClick={() => confirmAction(svc, confirming!.action)}>
                    {T.ok}
                  </button>
                  <button className={styles.btn} onClick={() => setConfirming(null)}>{T.cancel}</button>
                </div>
              ) : null}
              {expanded === svc.id ? (
                <div className={styles.detailBox} role="region" aria-label={T.detail}>
                  <div className={styles.detailHeader}><span>{T.detail}</span><span className={styles.detailAccent}>SERVICE RECORD</span></div>
                  <div className={styles.detailGrid}>
                    <div><span className={styles.detailLabel}>SERVICE ID</span><code>{svc.id}</code></div>
                    <div><span className={styles.detailLabel}>PROCESS</span><code>PID {svc.pid} · PGID {String(svc.processGroupId ?? '-')}</code></div>
                    <div><span className={styles.detailLabel}>PARENT</span><code>PPID {String(svc.parentPid ?? '-')}</code></div>
                    <div><span className={styles.detailLabel}>STARTED</span><code>{String(svc.startedAt ?? '-')}</code></div>
                  </div>
                  <div className={styles.evidenceBlock}>
                    <span className={styles.detailLabel}>{T.evidence}</span>
                    {svc.ownershipEvidence.length ? svc.ownershipEvidence.map((ev, i) => <div key={i} className={styles.evidenceItem}><span>↳</span>{ev}</div>) : <div className={styles.muted}>—</div>}
                  </div>
                </div>
              ) : null}
            </div>
          )
        })
      )}
    </div>
  )
}
