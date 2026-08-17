// dsh-service-console · M1 动态原型 Client（v2 = pkg-17 对应代码）
// 覆盖任务：T1-9 入口 · T1-10 Overlay+轮询 · T1-11 服务列表/详情 · T1-13 停止 UI
//           T1-14 重启 UI · T1-15 URL 展示
// 说明：动态 Cordis 插件 Client 半，纯 JavaScript + React.createElement（无 JSX）。
// 注意：
//  - 动态 Client 无 setTimeout/setInterval 全局，定时器用 timer 服务（inject: ['timer'] + ctx.timeout/ctx.interval）
//  - 入口按钮与面板共享模块级 store（同 apply 闭包）
//  - shell.overlay 默认点击穿透，面板容器需 pointerEvents: 'auto'
//  - 错误码由 Host 返回稳定 code，Client 映射本地化文字

return {
  inject: ['timer'],
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return

    const store = { open: false, listeners: new Set() }
    function subscribe(fn) { store.listeners.add(fn); return () => store.listeners.delete(fn) }
    function setOpen(v) { store.open = v; store.listeners.forEach((l) => l(v)) }

    const OWNERSHIP_LABEL = {
      'conversation-confirmed': { text: '本次对话', color: 'var(--dsw-alias-state-success-primary, #4ade80)' },
      'workspace-inferred': { text: '工作区推断', color: 'var(--dsw-alias-state-warn-primary, #fbbf24)' },
      'other-local': { text: '本机其他', color: 'var(--dsw-alias-label-secondary, #94a3b8)' },
      'unknown': { text: '未知', color: 'var(--dsw-alias-state-error-primary, #f87171)' },
      'protected': { text: '受保护', color: 'var(--dsw-alias-state-error-primary, #f87171)' },
    }
    const ERROR_LABEL = {
      PERMISSION_DENIED: '没有权限读取或控制该服务',
      TARGET_GONE: '该服务已结束，列表已刷新',
      PID_REUSED: '进程身份已变化，为避免误操作已取消',
      UNKNOWN_OWNERSHIP: '无法确认服务来源，默认不允许控制',
      PROTECTED_PROCESS: '该进程受保护，不能操作',
      GRACEFUL_TIMEOUT: '服务未在等待时间内退出，可重试或强制终止',
      RESTART_UNSAFE: '缺少安全复现启动所需的信息，不能重启',
      PORT_CONFLICT: '目标端口仍被占用',
      START_TIMEOUT: '服务未在预期时间内开始监听',
    }

    const STYLE = {
      panel: {
        position: 'fixed', top: 72, right: 20, zIndex: 9999, width: 520,
        maxHeight: 'min(640px, calc(100dvh - 110px))', overflow: 'auto',
        background: 'var(--dsw-alias-bg-overlay, #262626)', color: 'var(--dsw-alias-label-primary, #eee)',
        border: '1px solid var(--dsw-alias-border-l1, #444)', borderRadius: 10, padding: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,.35)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12, pointerEvents: 'auto',
      },
      row: { padding: '8px 0', borderBottom: '1px solid var(--dsw-alias-border-l1, #333)' },
      muted: { color: 'var(--dsw-alias-label-secondary, #999)' },
      ok: { color: 'var(--dsw-alias-state-success-primary, #4ade80)' },
      err: { color: 'var(--dsw-alias-state-error-primary, #f87171)' },
      warn: { color: 'var(--dsw-alias-state-warn-primary, #fbbf24)' },
      btn: { cursor: 'pointer', fontSize: 11, marginLeft: 6, padding: '1px 6px', borderRadius: 4, border: '1px solid var(--dsw-alias-border-l1, #555)', background: 'var(--dsw-alias-bg-layer-1, #333)', color: 'var(--dsw-alias-label-primary, #eee)' },
      badge: { borderRadius: 4, padding: '0 5px', fontSize: 10, border: '1px solid currentColor' },
    }

    function Entry() {
      const [open, setLocal] = React.useState(store.open)
      React.useEffect(() => subscribe(setLocal), [])
      return React.createElement('button', {
        onClick: () => setOpen(!store.open),
        title: 'Service Console (M1 dev)',
        style: { background: 'var(--dsw-alias-bg-layer-1, #333)', color: 'var(--dsw-alias-label-primary, #eee)', border: '1px solid var(--dsw-alias-border-l1, #555)', borderRadius: 6, padding: '2px 8px', fontSize: 12, cursor: 'pointer' },
      }, open ? '✕' : '🖥 SC')
    }

    function Panel() {
      const [open, setLocal] = React.useState(store.open)
      const [view, setView] = React.useState({ phase: 'idle', at: null, data: null, err: null })
      const [confirming, setConfirming] = React.useState(null)
      const [opResult, setOpResult] = React.useState(null)
      const [expanded, setExpanded] = React.useState(null)
      const [autoRefresh, setAutoRefresh] = React.useState(true)
      const timeoutRef = React.useRef(null)
      const intervalRef = React.useRef(null)
      React.useEffect(() => subscribe(setLocal), [])
      React.useEffect(() => () => {
        if (timeoutRef.current) timeoutRef.current()
        if (intervalRef.current) intervalRef.current()
      }, [])

      const scan = () => {
        const at = new Date().toLocaleTimeString()
        setView((v) => ({ phase: 'scanning', at, data: v.data, err: null }))
        if (timeoutRef.current) timeoutRef.current()
        timeoutRef.current = ctx.timeout(() => {
          setView((v) => (v.phase === 'scanning' ? { phase: 'timeout', at, data: v.data, err: 'host.call timed out' } : v))
        }, 8000)
        host.call('scan', {})
          .then((res) => {
            if (timeoutRef.current) { timeoutRef.current(); timeoutRef.current = null }
            setView({ phase: 'done', at, data: res && res.data ? res.data : res, err: null })
          })
          .catch((e) => {
            if (timeoutRef.current) { timeoutRef.current(); timeoutRef.current = null }
            setView({ phase: 'error', at, data: null, err: String((e && e.message) || e) })
          })
      }
      React.useEffect(() => {
        if (open && view.phase === 'idle') scan()
        if (open && autoRefresh) {
          intervalRef.current = ctx.interval(() => scan(), 5000)
          return () => { if (intervalRef.current) intervalRef.current(); intervalRef.current = null }
        }
      }, [open, autoRefresh])
      if (!open) return null

      const runAction = (svc, action) => { setConfirming({ id: svc.id, action }); setOpResult(null) }
      const confirmAction = (svc, action) => {
        setConfirming(null)
        host.call(action, { serviceId: svc.id })
          .then((res) => {
            if (res && res.ok) setOpResult({ id: svc.id, ok: true, text: action === 'stop' ? '已停止' : '已重启' })
            else setOpResult({ id: svc.id, ok: false, text: ((res && res.error && (ERROR_LABEL[res.error.code] || res.error.message)) || '操作失败') })
            scan()
          })
          .catch((e) => setOpResult({ id: svc.id, ok: false, text: 'RPC error: ' + String((e && e.message) || e) }))
      }

      const rows = (view.data && view.data.services) || []
      const status =
        view.phase === 'scanning' ? React.createElement('div', { style: STYLE.warn }, '⏳ scanning… (' + view.at + ')')
          : view.phase === 'timeout' ? React.createElement('div', { style: STYLE.err }, '⛔ ' + view.err + ' (' + view.at + ')')
          : view.phase === 'error' ? React.createElement('div', { style: STYLE.err }, '⛔ ' + view.err + ' (' + view.at + ')')
          : view.phase === 'done' ? React.createElement('div', { style: STYLE.ok }, '✅ ' + view.at + ' · ' + String(view.data.count) + ' services · ledger=' + String(view.data.ledgerCount))
          : null

      return React.createElement(
        'div', { style: STYLE.panel },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
          React.createElement('strong', null, 'Service Console (M1 dev)'),
          React.createElement('span', { style: { flex: 1 } }),
          React.createElement('label', { style: STYLE.muted }, React.createElement('input', { type: 'checkbox', checked: autoRefresh, onChange: (e) => setAutoRefresh(e.target.checked) }), ' 5s'),
          React.createElement('button', { onClick: scan, style: STYLE.btn }, '↻'),
          React.createElement('button', { onClick: () => setOpen(false), style: STYLE.btn }, 'Close')
        ),
        status,
        view.data && view.data.partialWarnings && view.data.partialWarnings.length
          ? view.data.partialWarnings.map((w, i) => React.createElement('div', { key: 'w' + i, style: STYLE.warn }, '⚠ ' + w))
          : null,
        rows.length === 0 && view.phase === 'done'
          ? React.createElement('div', { style: STYLE.muted }, 'no services found')
          : rows.map((svc) => {
              const badge = OWNERSHIP_LABEL[svc.ownership] || OWNERSHIP_LABEL.unknown
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
                  React.createElement('span', { style: Object.assign({}, STYLE.badge, { color: badge.color }) }, badge.text),
                  svc.restartable ? React.createElement('span', { style: Object.assign({}, STYLE.badge, { color: STYLE.ok.color }) }, '可重启') : null,
                  React.createElement('span', { style: { flex: 1 } }),
                  canControl
                    ? React.createElement('button', { style: STYLE.btn, onClick: () => runAction(svc, 'stop') }, isConfirming && confirming.action === 'stop' ? '确认停止?' : 'Stop')
                    : null,
                  svc.restartable
                    ? React.createElement('button', { style: STYLE.btn, onClick: () => runAction(svc, 'restart') }, isConfirming && confirming.action === 'restart' ? '确认重启?' : 'Restart')
                    : null,
                  React.createElement('button', { style: STYLE.btn, onClick: () => setExpanded(expanded === svc.id ? null : svc.id) }, expanded === svc.id ? '收起' : 'Detail')
                ),
                React.createElement('div', { style: STYLE.muted },
                  (svc.commandSummary ? String(svc.commandSummary).slice(0, 100) : '(命令不可读)') + (svc.commandSummary && svc.commandSummary.length > 100 ? '…' : '')
                ),
                svc.cwd ? React.createElement('div', { style: STYLE.muted }, svc.cwd) : null,
                url ? React.createElement('div', { style: STYLE.ok }, '🔗 ' + url) : null,
                result ? React.createElement('div', { style: result.ok ? STYLE.ok : STYLE.err }, (result.ok ? '✅ ' : '⛔ ') + result.text) : null,
                isConfirming
                  ? React.createElement('div', { style: { marginTop: 4 } },
                      React.createElement('span', { style: STYLE.muted }, '确认对 ' + svc.name + ' (pid ' + svc.pid + ') 执行' + (confirming.action === 'stop' ? '停止' : '重启') + '? '),
                      React.createElement('button', { style: Object.assign({}, STYLE.btn, { color: STYLE.err.color }), onClick: () => confirmAction(svc, confirming.action) }, '确认'),
                      React.createElement('button', { style: STYLE.btn, onClick: () => setConfirming(null) }, '取消')
                    )
                  : null,
                expanded === svc.id
                  ? React.createElement('div', { style: { marginTop: 4, background: 'var(--dsw-alias-bg-layer-1, #333)', padding: 6, borderRadius: 6 } },
                      React.createElement('div', { style: STYLE.muted }, 'id: ' + svc.id),
                      React.createElement('div', { style: STYLE.muted }, 'pgid: ' + String(svc.processGroupId) + ' · ppid: ' + String(svc.parentPid) + ' · startedAt: ' + String(svc.startedAt)),
                      React.createElement('div', { style: STYLE.muted }, '归属证据:'),
                      (svc.ownershipEvidence || []).map((ev, i) => React.createElement('div', { key: i, style: STYLE.muted }, '  · ' + ev))
                    )
                  : null
              )
            })
      )
    }

    slots.inject('conversation.session.header.utilities', () =>
      slots.register({ name: 'conversation.session.header.utilities', id: 'sc-dev-entry' }, () => React.createElement(Entry))
    )
    slots.inject('shell.overlay', () =>
      slots.register({ name: 'shell.overlay', id: 'sc-dev-panel' }, () => React.createElement(Panel))
    )
  },
}
