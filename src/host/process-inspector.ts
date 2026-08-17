// T1-1 ProcessInspector：平台命令执行与解析（macOS/Linux，纯函数可单测）
import type { ShellLike } from './types'

const MONTHS: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }

export interface CommandResult {
  stdout: string
  stderr: string
  code: number | null
}

// 单条命令失败不中断整体（FR-01）
export async function runCommand(shell: ShellLike, command: string, timeoutMs?: number): Promise<CommandResult> {
  try {
    const spec = shell.resolve({ command, timeout: timeoutMs || 5000 })
    const res = await shell.run(spec)
    const stdout =
      typeof res.stdout === 'string' ? res.stdout
        : typeof res.output === 'string' ? res.output
          : typeof res.text === 'string' ? res.text : ''
    const stderr = typeof res.stderr === 'string' ? res.stderr : ''
    const code = res.code !== undefined ? (res.code as number) : res.exitCode !== undefined ? (res.exitCode as number) : null
    return { stdout, stderr, code }
  } catch (e) {
    return { stdout: '', stderr: String((e as Error)?.message || e), code: null }
  }
}

// ps lstart: "Mon Aug 17 19:32:16 2026" → epoch ms（5 个 token：星期 月 日 时间 年）
export function parseLstart(str: string): number | null {
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

export interface ListenRow {
  command: string
  pid: number
  user: string
  fd: string
  type: string // IPv4 | IPv6
  address: string
}

// lsof -nP -iTCP -sTCP:LISTEN 行解析
export function parseListenRows(stdout: string): ListenRow[] {
  const rows: ListenRow[] = []
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

export interface PsRow {
  pid: number
  ppid: number
  lstart: string
  startedAt: number | null
  command: string
}

// ps -o pid=,ppid=,lstart=,command= 行解析
export function parsePsRows(stdout: string): PsRow[] {
  const rows: PsRow[] = []
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

// "127.0.0.1:8931" | "*:8080" | "[::1]:8080" → { host, port }
export function parseAddress(addr: string): { host: string | null; port: number | null } {
  let host: string | null = null
  let port: number | null = null
  let m = String(addr).match(/^\[([^\]]+)\]:(.+)$/)
  if (m) { host = m[1]; port = parseInt(m[2], 10) }
  else {
    m = String(addr).match(/^(.+):(\d+)$/)
    if (m) { host = m[1]; port = parseInt(m[2], 10) }
  }
  return { host, port }
}

export function shellQuote(s: string): string {
  return "'" + String(s).replace(/'/g, "'\\''") + "'"
}

export interface RawProcess {
  pid: number
  ppid: number | null
  startedAt: number | null
  command: string | null
  name: string | null
  pgid: number | null
  cwd: string | null
}

export interface RawListener {
  pid: number
  host: string
  port: number
  protocol: string
}

export interface RawScan {
  listeners: RawListener[]
  procs: Map<number, RawProcess>
  partialWarnings: string[]
}

// 端口 + 进程信息 + cwd + pgid 的原始扫描（按 PID 聚合前）
export async function scanRaw(shell: ShellLike): Promise<RawScan> {
  const partialWarnings: string[] = []
  const tcp = await runCommand(shell, 'lsof -nP -iTCP -sTCP:LISTEN', 5000)
  if (tcp.code !== 0 && tcp.code !== null && tcp.code !== 1) partialWarnings.push('TCP listener scan exit=' + String(tcp.code))
  const rows = parseListenRows(tcp.stdout)
  const pids = [...new Set(rows.map((r) => r.pid))]
  const pidList = pids.join(',')

  const procs = new Map<number, RawProcess>()
  if (pids.length > 0) {
    const psRes = await runCommand(shell, 'ps -o pid=,ppid=,lstart=,command= -p ' + pidList, 5000)
    const psRows = parsePsRows(psRes.stdout)
    if (psRes.code !== 0 && psRes.code !== null) partialWarnings.push('ps detail partial')

    const pgidRes = await runCommand(shell, 'ps -o pid=,pgid= -p ' + pidList, 5000)
    const pgidMap = new Map<number, number>()
    for (const line of String(pgidRes.stdout).split('\n')) {
      const parts = line.trim().split(/\s+/)
      if (parts.length >= 2) {
        const p = parseInt(parts[0], 10)
        const g = parseInt(parts[1], 10)
        if (Number.isFinite(p) && Number.isFinite(g)) pgidMap.set(p, g)
      }
    }

    let cwdByPid = new Map<number, string>()
    const cwdRes = await runCommand(shell, 'lsof -a -p ' + pidList + ' -d cwd', 5000)
    for (const line of String(cwdRes.stdout).split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('COMMAND')) continue
      const m = t.match(/^(\S+)\s+(\d+)\s+(\S+)\s+cwd\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/)
      if (m) cwdByPid.set(parseInt(m[2], 10), m[8].trim())
    }
    if (cwdRes.code !== 0 && cwdRes.code !== null) partialWarnings.push('cwd scan partial')

    const nameOf = (r: PsRow): string | null => {
      const first = String(r.command).split(/\s+/)[0]
      return first || null
    }
    for (const r of psRows) {
      procs.set(r.pid, {
        pid: r.pid,
        ppid: r.ppid,
        startedAt: r.startedAt,
        command: r.command || null,
        name: nameOf(r),
        pgid: pgidMap.get(r.pid) ?? null,
        cwd: cwdByPid.get(r.pid) ?? null,
      })
    }
  }

  const listeners: RawListener[] = []
  for (const r of rows) {
    const { host, port } = parseAddress(r.address)
    if (host === null || port === null) continue
    listeners.push({ pid: r.pid, host, port, protocol: r.type === 'IPv6' ? 'tcp6' : 'tcp' })
  }
  return { listeners, procs, partialWarnings }
}
