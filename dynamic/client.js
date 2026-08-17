// dsh-service-console · M1 动态原型 Client（v3 = pkg-18 增强版：范围/搜索/配置/i18n）
// 覆盖任务：T1-9 入口 · T1-10 Overlay+轮询 · T1-11 列表/详情 · T1-12 范围/搜索/筛选
//           T1-13 停止 UI · T1-14 重启 UI · T1-15 URL 打开 · T1-16 配置面板 · T1-17 i18n
// 说明：纯 JavaScript + React.createElement（无 JSX）。定时器必须用 timer 服务（inject: ['timer'] + ctx.timeout/ctx.interval）。

return {
  inject: ['timer'],
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return

    const store = { open: false, listeners: new Set() }
    function subscribe(fn) { store.listeners.add(fn); return () => store.listeners.delete(fn) }
    function setOpen(v) { store.open = v; store.listeners.forEach((l) => l(v)) }

    const TEXTS = {
      zh: {
        title: 'Service Console', scopeConv: '本次对话', scopeWs: '工作区', scopeMachine: '本机',
        search: '搜索服务/端口/路径…', auto: '5s', config: '配置', close: '关闭',
        noSvc: '未发现服务', stop: '停止', restart: '重启', detail: '详情',
        confirmStop: '确认停止?', confirmRestart: '确认重启?', confirmTxt: '确认对 {name} (pid {pid}) 执行{action}?',
        ok: '确认', cancel: '取消', stopped: '已停止', restarted: '已重启',
        evidence: '归属证据', refreshInterval: '自动刷新间隔(ms)', gracefulTimeout: '优雅超时(ms)', forceKill: '允许强制终止',
      },
      en: {
        title: 'Service Console', scopeConv: 'This chat', scopeWs: 'Workspace', scopeMachine: 'This Mac',
        search: 'Search services/ports/paths…', auto: '5s', config: 'Config', close: 'Close',
        noSvc: 'no services found', stop: 'Stop', restart: 'Restart', detail: 'Detail',
        confirmStop: 'Confirm stop?', confirmRestart: 'Confirm restart?', confirmTxt: 'Run {action} on {name} (pid {pid})?',
        ok: 'OK', cancel: 'Cancel', stopped: 'Stopped', restarted: 'Restarted',
        evidence: 'Ownership evidence', refreshInterval: 'Refresh interval (ms)', gracefulTimeout: 'Graceful timeout (ms)', forceKill: 'Allow force kill',
      },
    }
    const OWNERSHIP = {
      'conversation-confirmed': { zh: '本次对话', en: 'This chat', color: 'var(--dsw-alias-state-success-primary, #4ade80)' },
      'workspace-inferred': { zh: '工作区推断', en: 'Workspace', color: 'var(--dsw-alias-state-warn-primary, #fbbf24)' },
      'other-local': { zh: '本机其他', en: 'Other local', color: 'var(--dsw-alias-label-secondary, #94a3b8)' },
      'unknown': { zh: '未知', en: 'Unknown', color: 'var(--dsw-alias-state-error-primary, #f87171)' },
      'protected': { zh: '受保护', en: 'Protected', color: 'var(--dsw-alias-state-error-primary, #f87171)' },
    }
    const ERROR_LABEL = {
      PERMISSION_DENIED: ['没有权限读取或控制该服务', 'No permission'], TARGET_GONE: ['该服务已结束', 'Service gone'],
      PID_REUSED: ['进程身份已变化，已取消操作', 'PID reused'], UNKNOWN_OWNERSHIP: ['无法确认来源，不允许控制', 'Unknown ownership'],
      PROTECTED_PROCESS: ['受保护进程，不能操作', 'Protected process'], GRACEFUL_TIMEOUT: ['未在等待时间内退出', 'Graceful timeout'],
      RESTART_UNSAFE: ['缺少安全启动信息，不能重启', 'Cannot restart safely'], PORT_CONFLICT: ['端口仍被占用', 'Port conflict'],
      START_TIMEOUT: ['未在预期时间开始监听', 'Start timeout'],
    }
    const STYLE = {
      panel: { position: 'fixed', top: 72, right: 20, zIndex: 9999, width: 540, maxHeight: 'min(640px, calc(100dvh - 110px))', overflow: 'auto', background: 'var(--dsw-alias-bg-overlay, #262626)', color: 'var(--dsw-alias-label-primary, #eee)', border: '1px solid var(--dsw-alias-border-l1, #444)', borderRadius: 10, padding: 12, boxShadow: '0 8px 32px rgba(0,0,0,.35)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, pointerEvents: 'auto' },
      row: { padding: '8px 0', borderBottom: '1px solid var(--dsw-alias-border-l1, #333)' },
      muted: { color: 'var(--dsw-alias-label-secondary, #999)' }, ok: { color: 'var(--dsw-alias-state-success-primary, #4ade80)' },
      err: { color: 'var(--dsw-alias-state-error-primary, #f87171)' }, warn: { color: 'var(--dsw-alias-state-warn-primary, #fbbf24)' },
      btn: { cursor: 'pointer', fontSize: 11, marginLeft: 6, padding: '1px 6px', borderRadius: 4, border: '1px solid var(--dsw-alias-border-l1, #555)', background: 'var(--dsw-alias-bg-layer-1, #333)', color: 'var(--dsw-alias-label-primary, #eee)' },
      badge: { borderRadius: 4, padding: '0 5px', fontSize: 10, border: '1px solid currentColor' },
      input: { background: 'var(--dsw-alias-bg-layer-1, #333)', color: 'var(--dsw-alias-label-primary, #eee)', border: '1px solid var(--dsw-alias-border-l1, #555)', borderRadius: 4, padding: '2px 6px', fontSize: 11 },
    }

    function Entry() {
      const [open, setLocal] = React.useState(store.open)
      React.useEffect(() => subscribe(setLocal), [])
      return React.createElement('button', { onClick: () => setOpen(!store.open), title: 'Service Console', style: { background: 'var(--dsw-alias-bg-layer-1, #333)', color: 'var(--dsw-alias-label-primary, #eee)', border: '1px solid var(--dsw-alias-border-l1, #555)', borderRadius: 6, padding: '2px 8px', fontSize: 12, cursor: 'pointer' } }, open ? '✕' : '🖥 SC')
    }

    function Panel() {
      const [open, setLocal] = React.useState(store.open)
      const [lang, setLang] = React.useState('zh')
      const [scope, setScope] = React.useState('workspace')
      const [query, setQuery] = React.useState('')
      const [showConfig, setShowConfig] = React.useState(false)
      const [configData, setConfigData] = React.useState(null)
      const [view, setView] = React.useState({ phase: 'idle', at: null, data: null, err: null })
      const [confirming, setConfirming] = React.useState(null)
      const [opResult, setOpResult] = React.useState(null)
      const [expanded, setExpanded] = React.useState(null)
      const [autoRefresh, setAutoRefresh] = React.useState(true)
      const timeoutRef = React.useRef(null)
      const intervalRef = React.useRef(null)
      React.useEffect(() => subscribe(setLocal), [])
      React.useEffect(() => () => { if (timeoutRef.current) timeoutRef.current(); if (intervalRef.current) intervalRef.current() }, [])

      const T = TEXTS[lang]
      const scan = () => {
        const at = new Date().toLocaleTimeString()
        setView((v) => ({ phase: 'scanning', at, data: v.data, err: null }))
        if (timeoutRef.current) timeoutRef.current()
        timeoutRef.current = ctx.timeout(() => { setView((v) => (v.phase === 'scanning' ? { phase: 'timeout', at, data: v.data, err: 'timeout' } : v)) }, 8000)
        host.call('scan', {}).then((res) => { if (timeoutRef.current) { timeoutRef.current(); timeoutRef.current = null } setView({ phase: 'done', at, data: res && res.data ? res.data : res, err: null }) })
          .catch((e) => { if (timeoutRef.current) { timeoutRef.current(); timeoutRef.current = null } setView({ phase: 'error', at, data: null, err: String((e && e.message) || e) }) })
      }
      const loadConfig = () => {
        host.call('config', {}).then((res) => setConfigData(res && res.data ? res.data.config : null)).catch(() => {})
      }
      React.useEffect(() => {
        if (open && view.phase === 'idle') scan()
        if (open && autoRefresh) { intervalRef.current = ctx.interval(() => scan(), 5000); return () => { if (intervalRef.current) intervalRef.current(); intervalRef.current = null } }
      }, [open, autoRefresh])
      if (!open) return null

      const runAction = (svc, action) => { setConfirming({ id: svc.id, action }); setOpResult(null) }
      const confirmAction = (svc, action) => {
        setConfirming(null)
        host.call(action, { serviceId: svc.id })
          .then((res) => {
            if (res && res.ok) setOpResult({ id: svc.id, ok: true, text: action === 'stop' ? T.stopped : T.restarted })
            else setOpResult({ id: svc.id, ok: false, text: (res && res.error && (ERROR_LABEL[res.error.code] ? ERROR_LABEL[res.error.code][lang === 'zh' ? 0 : 1] : res.error.message)) || 'ERR' })
            scan()
          })
          .catch((e) => setOpResult({ id: svc.id, ok: false, text: 'RPC error' }))
      }
      const setConfig = (patch) => {
        host.call('config', { action: 'update', patch }).then((res) => { if (res && res.data) setConfigData(res.data.config) })
      }

      let rows = (view.data && view.data.services) || []
      if (scope === 'conversation') rows = rows.filter((s) => s.ownership === 'conversation-confirmed')
      else if (scope === 'workspace') rows = rows.filter((s) => s.ownership === 'conversation-confirmed' || s.ownership === 'workspace-inferred')
      if (query) {
        const q = String(query).toLowerCase()
        rows = rows.filter((s) => String(s.name).toLowerCase().indexOf(q) >= 0 || String(s.pid).indexOf(q) >= 0 || (s.commandSummary || '').toLowerCase().indexOf(q) >= 0 || (s.cwd || '').toLowerCase().indexOf(q) >= 0 || (s.listeners || []).some((l) => String(l.port).indexOf(q) >= 0))
      }
      const status =
        view.phase === 'scanning' ? React.createElement('div', { style: STYLE.warn }, '⏳ ' + view.at)
          : view.phase === 'done' ? React.createElement('div', { style: STYLE.ok }, '✅ ' + view.at + ' · ' + String(view.data.count) + ' · ledger=' + String(view.data.ledgerCount))
          : view.phase === 'error' || view.phase === 'timeout' ? React.createElement('div', { style: STYLE.err }, '⛔ ' + view.err)
          : null

      return React.createElement('div', { style: STYLE.panel },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' } },
          React.createElement('strong', null, T.title),
          React.createElement('select', { value: scope, onChange: (e) => setScope(e.target.value), style: STYLE.input },
            React.createElement('option', { value: 'conversation' }, T.scopeConv),
            React.createElement('option', { value: 'workspace' }, T.scopeWs),
            React.createElement('option', { value: 'machine' }, T.scopeMachine)
          ),
          React.createElement('button', { onClick: () => setLang(lang === 'zh' ? 'en' : 'zh'), style: STYLE.btn }, lang === 'zh' ? 'EN' : '中'),
          React.createElement('button', { onClick: () => { setShowConfig(!showConfig); if (!showConfig) loadConfig() }, style: STYLE.btn }, T.config),
          React.createElement('span', { style: { flex: 1 } }),
          React.createElement('label', { style: STYLE.muted }, React.createElement('input', { type: 'checkbox', checked: autoRefresh, onChange: (e) => setAutoRefresh(e.target.checked) }), T.auto),
          React.createElement('button', { onClick: scan, style: STYLE.btn }, '↻'),
          React.createElement('button', { onClick: () => setOpen(false), style: STYLE.btn }, T.close)
        ),
        React.createElement('input', { placeholder: T.search, value: query, onChange: (e) => setQuery(e.target.value), style: Object.assign({}, STYLE.input, { width: '100%', marginBottom: 6 }) }),
        showConfig && configData
          ? React.createElement('div', { style: { background: 'var(--dsw-alias-bg-layer-1, #333)', borderRadius: 6, padding: 8, marginBottom: 8 } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                React.createElement('span', { style: STYLE.muted }, T.refreshInterval),
                React.createElement('input', { type: 'number', defaultValue: configData.refreshInterval, onBlur: (e) => setConfig({ refreshInterval: parseInt(e.target.value, 10) }), style: Object.assign({}, STYLE.input, { width: 80 }) })
              ),
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 } },
                React.createElement('span', { style: STYLE.muted }, T.gracefulTimeout),
                React.createElement('input', { type: 'number', defaultValue: configData.gracefulTimeout, onBlur: (e) => setConfig({ gracefulTimeout: parseInt(e.target.value, 10) }), style: Object.assign({}, STYLE.input, { width: 80 }) })
              ),
              React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 } },
                React.createElement('input', { type: 'checkbox', checked: !!configData.forceKill, onChange: (e) => setConfig({ forceKill: e.target.checked }) }), T.forceKill
              )
            )
          : null,
        status,
        rows.length === 0 && view.phase === 'done' ? React.createElement('div', { style: STYLE.muted }, T.noSvc)
          : rows.map((svc) => {
              const badge = OWNERSHIP[svc.ownership] || OWNERSHIP.unknown
              const ports = (svc.listeners || []).map((l) => String(l.port)).join(', ')
              const url = (svc.listeners || []).map((l) => l.url).filter(Boolean)[0]
              const canControl = svc.ownership === 'conversation-confirmed' || svc.ownership === 'workspace-inferred' || svc.ownership === 'other-local'
              const isConfirming = confirming && confirming.id === svc.id
              const result = opResult && opResult.id === svc.id ? opResult : null
              return React.createElement('div', { key: svc.id, style: STYLE.row },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                  React.createElement('span', { style: STYLE.ok }, '●'),
                  React.createElement('span', { style: { fontWeight: 600 } }, String(svc.name)),
                  React.createElement('span', { style: STYLE.muted }, ':' + ports + ' · pid ' + String(svc.pid)),
                  React.createElement('span', { style: Object.assign({}, STYLE.badge, { color: badge.color }) }, badge[lang] || badge.zh),
                  svc.restartable ? React.createElement('span', { style: Object.assign({}, STYLE.badge, { color: STYLE.ok.color }) }, '↻') : null,
                  url ? React.createElement('a', { href: url, target: '_blank', rel: 'noreferrer', style: Object.assign({}, STYLE.btn, { textDecoration: 'none' }) }, '🔗') : null,
                  React.createElement('span', { style: { flex: 1 } }),
                  canControl ? React.createElement('button', { style: STYLE.btn, onClick: () => runAction(svc, 'stop') }, isConfirming && confirming.action === 'stop' ? T.confirmStop : T.stop) : null,
                  svc.restartable ? React.createElement('button', { style: STYLE.btn, onClick: () => runAction(svc, 'restart') }, isConfirming && confirming.action === 'restart' ? T.confirmRestart : T.restart) : null,
                  React.createElement('button', { style: STYLE.btn, onClick: () => setExpanded(expanded === svc.id ? null : svc.id) }, expanded === svc.id ? '▾' : T.detail)
                ),
                React.createElement('div', { style: STYLE.muted }, (svc.commandSummary ? String(svc.commandSummary).slice(0, 100) : '(?)') + (svc.commandSummary && svc.commandSummary.length > 100 ? '…' : '')),
                svc.cwd ? React.createElement('div', { style: STYLE.muted }, svc.cwd) : null,
                result ? React.createElement('div', { style: result.ok ? STYLE.ok : STYLE.err }, (result.ok ? '✅ ' : '⛔ ') + result.text) : null,
                isConfirming ? React.createElement('div', { style: { marginTop: 4 } },
                  React.createElement('span', { style: STYLE.muted }, T.confirmTxt.replace('{name}', svc.name).replace('{pid}', String(svc.pid)).replace('{action}', confirming.action === 'stop' ? T.stop : T.restart) + ' '),
                  React.createElement('button', { style: Object.assign({}, STYLE.btn, { color: STYLE.err.color }), onClick: () => confirmAction(svc, confirming.action) }, T.ok),
                  React.createElement('button', { style: STYLE.btn, onClick: () => setConfirming(null) }, T.cancel)
                ) : null,
                expanded === svc.id ? React.createElement('div', { style: { marginTop: 4, background: 'var(--dsw-alias-bg-layer-1, #333)', padding: 6, borderRadius: 6 } },
                  React.createElement('div', { style: STYLE.muted }, 'id: ' + svc.id),
                  React.createElement('div', { style: STYLE.muted }, 'pgid: ' + String(svc.processGroupId) + ' · ppid: ' + String(svc.parentPid) + ' · startedAt: ' + String(svc.startedAt)),
                  React.createElement('div', { style: STYLE.muted }, T.evidence + ':'),
                  (svc.ownershipEvidence || []).map((ev, i) => React.createElement('div', { key: i, style: STYLE.muted }, '  · ' + ev))
                ) : null
              )
            })
      )
    }

    slots.inject('conversation.session.header.utilities', () => slots.register({ name: 'conversation.session.header.utilities', id: 'sc-dev-entry' }, () => React.createElement(Entry)))
    slots.inject('shell.overlay', () => slots.register({ name: 'shell.overlay', id: 'sc-dev-panel' }, () => React.createElement(Panel)))
  },
}
