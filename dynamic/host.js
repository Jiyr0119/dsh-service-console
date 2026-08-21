// dsh-service-console · M1 动态原型 Host（v12 = pkg-17 对应代码）
// 覆盖任务：T1-1 ProcessInspector · T1-2 ServiceRegistry · T1-3 会话台账
//           T1-4 归属评分 · T1-5 脱敏 · T1-6 生命周期 · T1-7 API · T1-8 配置
// 说明：动态 Cordis 插件 Host 半，纯 JavaScript。通过 ctx.get('shell') 执行平台命令，
//       不依赖 Node child_process（动态 Host 无 process 全局）。
// 注意：
//  - 动态 Host/Client 均无 setTimeout/setInterval 全局，定时器用 timer 服务（inject: ['timer'] + ctx.timeout/ctx.interval）
//  - fingerprint 用 FNV-1a（动态环境无 crypto），M2 原生包迁移为 node:crypto sha256
//  - 动态工具结果传递在当前 DSH 会话中受限，开发期验证以面板 host.call + bash 链路复现为准

return {
  inject: ['timer'],
  apply(ctx) {
    const shell = ctx.get('shell')
    if (shell === undefined) return
    const workspaceRegistry = ctx.get('workspaceRegistry')

    const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }

    // ---------- T1-8 Config ----------
    const config = { refreshInterval: 5000, defaultScope: 'workspace', gracefulTimeout: 3000, showUnknown: true, forceKill: false, autoCleanup: false }
    const CONFIG_LIMITS = { refreshInterval: [2000, 30000], gracefulTimeout: [1000, 15000] }
    const actionLog = []
    function logAction(serviceId, action, result, code) {
      actionLog.push({ at: Date.now(), serviceId, action, result, code: code || null })
      if (actionLog.length > 200) actionLog.shift()
    }

    // ---------- 工具函数 ----------
    function fnv1a(str) {
      let h = 0x811c9dc5
      for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 0x01000193) >>> 0 }
      return h.toString(36)
    }
    function ok(data) { return { ok: true, data } }
    function err(code, message) { return { ok: false, error: { code, message } } }

    async function runCommand(command, timeoutMs) {
      try {
        const spec = shell.resolve({ command, timeout: timeoutMs || 5000 })
        const res = await shell.run(spec)
        const stdout = typeof res.stdout === 'string' ? res.stdout
          : typeof res.output === 'string' ? res.output
          : typeof res.text === 'string' ? res.text : ''
        const stderr = typeof res.stderr === 'string' ? res.stderr : ''
        const code = res.code !== undefined ? res.code : res.exitCode !== undefined ? res.exitCode : null
        return { stdout, stderr, code }
      } catch (e) { return { stdout: '', stderr: String((e && e.message) || e), code: null } }
    }

    // ps lstart: "Mon Aug 17 19:32:16 2026" → epoch ms（5 个 token：星期 月 日 时间 年）
    function parseLstart(str) {
      const parts = String(str).trim().split(/\s+/)
      if (parts.length < 5) return null
      const mon = MONTHS[parts[1]]
      const day = parseInt(parts[2], 10)
      const year = parseInt(parts[4], 10)
      if (!mon || !day || !year || !parts[3]) return null
      const iso = year + '-' + String(mon).padStart(2, '0') + '-' + String(day).padStart(2, '0') + 'T' + parts[3]
      const t = Date.parse(iso)
      return Number.isFinite(t) ? t : null
    }

    function parseListenRows(stdout) {
      const rows = []
      for (const line of String(stdout).split('\n')) {
        const t = line.trim()
        if (!t || t.startsWith('COMMAND')) continue
        const m = t.match(/^(\S+)\s+(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/)
        if (!m) continue
        const name = m[9].trim()
        if (!/\(LISTEN\)$/.test(name)) continue
        rows.push({ command: m[1], pid: parseInt(m[2], 10), user: m[3], fd: m[4], type: m[5], address: name.replace(/\s*\(LISTEN\)$/, '') })
      }
      return rows
    }

    function parsePsRows(stdout) {
      const rows = []
      for (const line of String(stdout).split('\n')) {
        const t = line.trim()
        if (!t) continue
        const parts = t.split(/\s+/)
        const pid = parseInt(parts[0], 10)
        const ppid = parseInt(parts[1], 10)
        if (!Number.isFinite(pid) || !Number.isFinite(ppid)) continue
        const lstart = parts.slice(2, 7).join(' ')
        rows.push({ pid, ppid, lstart, startedAt: parseLstart(lstart), command: parts.slice(7).join(' ') })
      }
      return rows
    }

    function parseAddress(addr) {
      let host = null
      let port = null
      let m = String(addr).match(/^\[([^\]]+)\]:(.+)$/)
      if (m) { host = m[1]; port = parseInt(m[2], 10) }
      else { m = String(addr).match(/^(.+):(\d+)$/); if (m) { host = m[1]; port = parseInt(m[2], 10) } }
      return { host, port }
    }

    function shellQuote(s) { return "'" + String(s).replace(/'/g, "'\\''") + "'" }

    // ---------- T1-5 Redaction ----------
    const REDACT_RULES = [
      {
        // --token=abc123 / --token abc123 / --token:abc123 → 保留 --token 与分隔符，值脱敏
        re: /(--(?:token|password|passwd|secret|key|api[-_]?key|client[-_]?secret|cookie|session))\s*[=:]\s*(\S+)/gi,
        replace: function (m) { return m.replace(/(?:[=:]\s*|\s+)\S+$/, '=***') },
      },
      {
        // KEY=value / KEY='value' → 保留 KEY=，值脱敏
        re: /((?:token|password|passwd|secret|api[-_]?key|client[-_]?secret|authorization|set-cookie|connection[-_]?string))\s*=\s*(['"]?)([^\s&'"]+)\2/gi,
        replace: function (m, p1, p2) { return (p1 || '') + '=' + (p2 || '') + '***' },
      },
      {
        // scheme://user:pass@ → 保留 scheme://，凭据脱敏
        re: /(postgres(?:ql)?|mysql|redis|mongodb)(\+s?)?:\/\/[^\s@]+@/gi,
        replace: function (m, p1) { return (p1 || '') + '://***@' },
      },
      {
        // JWT
        re: /\b(eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})\b/g,
        replace: function () { return '***' },
      },
    ]
    function redact(command) {
      if (typeof command !== 'string' || !command) return command
      let out = command
      for (const rule of REDACT_RULES) {
        out = out.replace(rule.re, function () { return rule.replace.apply(null, arguments) })
      }
      return out
    }

    // ---------- T1-3 Session Launch Ledger ----------
    const ledger = []
    const DEV_COMMAND_RE = /(npm (run|start|dev)|pnpm (run|dev|start)|yarn (dev|start)|next dev|vite|uvicorn|gunicorn|flask run|django runserver|cargo run|node (server|app|index)|python3? -m (http.server|uvicorn)|serve|http-server|nodemon|tsx watch|deno run)/
    ctx.on('tools/result', (exec) => {
      try {
        if (!exec || exec.name !== 'bash') return
        const args = exec.args || {}
        const command = String(args.command || '')
        if (!DEV_COMMAND_RE.test(command)) return
        let sessionKey = null
        try { sessionKey = (exec.agent && (exec.agent.id || exec.agent.sessionId)) || null } catch (e) { sessionKey = null }
        ledger.push({ at: Date.now(), command, cwd: args.workdir || null, sessionKey, redacted: redact(command) })
        if (ledger.length > 200) ledger.shift()
      } catch (err) { console.error('ledger error', String((err && err.message) || err)) }
    })

    // ---------- T1-4 Ownership ----------
    function classifyOwnership(proc, ledgers, workspaces) {
      const cwd = proc.cwd
      const command = proc.command || ''
      const evidence = []
      let ownership = 'unknown'
      let confidence = 'unknown'
      let ledgerEntry = null
      if (cwd && ledgers.length > 0) {
        ledgerEntry = ledgers.find((l) => l.cwd && cwd.indexOf(l.cwd) === 0 && proc.startedAt && Math.abs(proc.startedAt - l.at) < 10 * 60 * 1000)
      }
      if (ledgerEntry) {
        ownership = 'conversation-confirmed'
        confidence = 'confirmed'
        evidence.push('matched session launch ledger: ' + (ledgerEntry.redacted || ledgerEntry.command).slice(0, 60))
      } else if (cwd && workspaces.length > 0) {
        const ws = workspaces.find((w) => w && w.path && cwd.indexOf(w.path) === 0)
        if (ws) { ownership = 'workspace-inferred'; confidence = 'inferred'; evidence.push('cwd under workspace: ' + ws.path) }
      } else if (cwd && !/^(\/usr\/|\/System\/|\/Library\/|\/bin\/|\/sbin\/|\/private\/)/.test(cwd)) {
        ownership = 'other-local'; confidence = 'inferred'; evidence.push('local cwd not in workspace: ' + cwd)
      } else {
        evidence.push('cannot confirm origin (cwd or command unavailable)')
      }
      return { ownership, confidence, evidence, ledgerEntry }
    }

    // ---------- T1-2 ServiceRegistry ----------
    async function buildSnapshot() {
      const partialWarnings = []
      const tcp = await runCommand('lsof -nP -iTCP -sTCP:LISTEN', 5000)
      if (tcp.code !== 0 && tcp.code !== null && tcp.code !== 1) partialWarnings.push('TCP listener scan exit=' + String(tcp.code))
      const rows = parseListenRows(tcp.stdout)
      const pids = [...new Set(rows.map((r) => r.pid))]
      const pidList = pids.join(',')

      let procByPid = new Map()
      let extraByPid = new Map()
      if (pids.length > 0) {
        const psRes = await runCommand('ps -o pid=,ppid=,lstart=,command= -p ' + pidList, 5000)
        procByPid = new Map(parsePsRows(psRes.stdout).map((r) => [r.pid, r]))
        if (psRes.code !== 0 && psRes.code !== null) partialWarnings.push('ps detail partial')
        const pgidRes = await runCommand('ps -o pid=,pgid= -p ' + pidList, 5000)
        const pgidMap = new Map()
        for (const line of String(pgidRes.stdout).split('\n')) {
          const parts = line.trim().split(/\s+/)
          if (parts.length >= 2) {
            const p = parseInt(parts[0], 10); const g = parseInt(parts[1], 10)
            if (Number.isFinite(p) && Number.isFinite(g)) pgidMap.set(p, g)
          }
        }
        let cwdByPid = new Map()
        const cwdRes = await runCommand('lsof -a -p ' + pidList + ' -d cwd', 5000)
        for (const line of String(cwdRes.stdout).split('\n')) {
          const t = line.trim()
          if (!t || t.startsWith('COMMAND')) continue
          const m = t.match(/^(\S+)\s+(\d+)\s+(\S+)\s+cwd\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/)
          if (m) cwdByPid.set(parseInt(m[2], 10), m[8].trim())
        }
        if (cwdRes.code !== 0 && cwdRes.code !== null) partialWarnings.push('cwd scan partial')
        for (const pid of pids) extraByPid.set(pid, { pgid: pgidMap.get(pid) || null, cwd: cwdByPid.get(pid) || null })
      }

      const byPid = new Map()
      for (const r of rows) {
        const { host, port } = parseAddress(r.address)
        if (!byPid.has(r.pid)) byPid.set(r.pid, [])
        byPid.get(r.pid).push({ host, port, protocol: r.type === 'IPv6' ? 'tcp6' : 'tcp' })
      }

      let workspaces = []
      try { if (workspaceRegistry && workspaceRegistry.list) workspaces = workspaceRegistry.list() } catch (e) { /* ignore */ }

      const services = []
      for (const [pid, listeners] of byPid) {
        const proc = procByPid.get(pid)
        const ex = extraByPid.get(pid) || {}
        const command = proc ? proc.command : null
        const cwd = ex.cwd
        const name = proc ? proc.name || (command ? String(command).split(/\s+/)[0] : null) : null
        const startedAt = proc ? proc.startedAt : null
        const fpSource = [pid, startedAt, command || '', cwd || '', listeners.map((l) => l.host + ':' + l.port).sort().join(',')].join('|')
        const serviceId = 'svc_' + fnv1a(fpSource)
        const cls = classifyOwnership({ cwd, command, startedAt, pid }, ledger, workspaces)
        const listenersFinal = listeners.map((l) => {
          const isLocalhost = l.host === '127.0.0.1' || l.host === '::1' || l.host === 'localhost'
          return Object.assign({}, l, { url: isLocalhost ? 'http://localhost:' + l.port : null })
        })
        services.push({
          id: serviceId,
          status: 'running',
          ownership: cls.ownership,
          confidence: cls.confidence,
          name: name || 'unknown',
          pid,
          processGroupId: ex.pgid,
          parentPid: proc ? proc.ppid : null,
          commandSummary: command ? redact(String(command)).slice(0, 200) : null,
          cwd,
          startedAt,
          listeners: listenersFinal,
          restartable: !!cls.ledgerEntry,
          protected: false,
          ownershipEvidence: cls.evidence,
          fingerprint: fpSource,
        })
      }
      services.sort((a, b) => (a.ownership === 'conversation-confirmed' ? -1 : 1) - (b.ownership === 'conversation-confirmed' ? -1 : 1))
      return { scannedAt: Date.now(), count: services.length, services, partialWarnings, ledgerCount: ledger.length }
    }

    // ---------- T1-6 Lifecycle ----------
    async function stopService(serviceId, mode) {
      const s = await buildSnapshot()
      const svc = s.services.find((x) => x.id === serviceId)
      if (!svc) return err('TARGET_GONE', '该服务已结束，列表已刷新')
      if (svc.protected) return err('PROTECTED_PROCESS', '该进程受保护，不能通过 Service Console 操作')
      const target = svc.processGroupId ? '-' + svc.processGroupId : String(svc.pid)
      await runCommand('kill -TERM ' + target, 3000)
      const deadline = Date.now() + (config.gracefulTimeout || 3000)
      while (Date.now() < deadline) {
        await ctx.timeout(400)
        const re = await buildSnapshot()
        if (!re.services.some((x) => x.id === serviceId)) {
          logAction(serviceId, 'stop', 'stopped')
          return ok({ result: 'stopped' })
        }
      }
      if (config.forceKill) {
        await runCommand('kill -KILL ' + target, 3000)
        logAction(serviceId, 'stop', 'force-killed')
        return ok({ result: 'force-killed' })
      }
      logAction(serviceId, 'stop', 'timeout', 'GRACEFUL_TIMEOUT')
      return err('GRACEFUL_TIMEOUT', '服务未在等待时间内退出，可重试或在设置允许时强制终止')
    }

    async function restartService(serviceId) {
      const s = await buildSnapshot()
      const svc = s.services.find((x) => x.id === serviceId)
      if (!svc) return err('TARGET_GONE', '该服务已结束，列表已刷新')
      if (!svc.restartable) return err('RESTART_UNSAFE', '缺少安全复现启动所需的信息，不能重启')
      const entry = ledger.find((l) => svc.cwd && l.cwd && svc.cwd.indexOf(l.cwd) === 0)
      if (!entry) return err('RESTART_UNSAFE', '缺少启动命令记录，不能重启')
      const stopped = await stopService(serviceId, 'graceful')
      if (!stopped.ok && stopped.error.code !== 'TARGET_GONE') return stopped
      const cmd = 'cd ' + shellQuote(entry.cwd || '.') + ' && ' + entry.command
      await runCommand(cmd + ' >/dev/null 2>&1 &', 3000)
      logAction(serviceId, 'restart', 'started')
      return ok({ result: 'started', command: redact(entry.command) })
    }

    // ---------- T1-7 API 层 ----------
    harness.handle('scan', async () => ok(await buildSnapshot()))
    harness.handle('detail', async (args) => {
      const s = await buildSnapshot()
      const svc = s.services.find((x) => x.id === (args && args.serviceId))
      if (!svc) return err('TARGET_GONE', '服务不存在')
      return ok(Object.assign({}, svc, { recentActions: actionLog.filter((a) => a.serviceId === svc.id).slice(-10) }))
    })
    harness.handle('stop', async (args) => stopService(args && args.serviceId, (args && args.mode) || 'graceful'))
    harness.handle('restart', async (args) => restartService(args && args.serviceId))
    harness.handle('config', async (args) => {
      const a = args || {}
      if (a.action === 'update' && a.patch) {
        const patch = a.patch
        for (const key of Object.keys(patch)) {
          if (!(key in config)) return err('BAD_REQUEST', 'unknown config key: ' + key)
          const v = patch[key]
          if (typeof v === 'boolean') { config[key] = v; continue }
          if (typeof v === 'number' && CONFIG_LIMITS[key]) {
            if (v < CONFIG_LIMITS[key][0] || v > CONFIG_LIMITS[key][1]) return err('BAD_REQUEST', 'config out of range: ' + key)
            config[key] = v; continue
          }
          return err('BAD_REQUEST', 'invalid value for: ' + key)
        }
        return ok({ config })
      }
      return ok({ config })
    })
    harness.handle('actions', async () => ok({ actions: actionLog.slice(-50) }))
  },
}
