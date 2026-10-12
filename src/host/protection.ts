// P0-1 Protection：受保护进程判定（纯函数可单测）
// PRD §边界：系统关键、高权限、DSH 自身进程一律只读，不允许通过 Service Console 停止/重启

export interface ProtectionGuard {
  /** 不可停止的端口（如 ctx.webServer.port —— 停掉它会断开当前 DSH 界面） */
  protectedPorts?: readonly number[]
  /** 不可停止的 PID（如插件所在宿主进程 process.pid） */
  protectedPids?: readonly number[]
}

export interface ProtectionTarget {
  pid: number
  name?: string | null
  command?: string | null
  cwd?: string | null
  listeners: readonly { port: number; user?: string | null }[]
}

export interface ProtectionResult {
  protected: boolean
  evidence: string[]
}

// 系统关键进程（basename 匹配，macOS + Linux）
const CRITICAL_NAMES = new Set([
  'launchd',
  'kernel_task',
  'init',
  'kthreadd',
  'systemd',
  'sshd',
  'WindowServer',
  'loginwindow',
])

// 系统目录（/private/tmp 与 /private/var/folders 是开发临时目录，明确排除）
const SYSTEM_CWD_RE = /^(\/System\/|\/usr\/|\/bin\/|\/sbin\/|\/Library\/|\/private\/etc\/|\/private\/var\/(?!folders|tmp))/

// 系统可执行文件路径（不含 /usr/local 与 /opt —— 那是用户/包管理器安装的软件，不能误伤 dev 工具链）
const SYSTEM_BIN_RE = /^(\/System\/|\/bin\/|\/sbin\/|\/usr\/bin\/|\/usr\/sbin\/|\/usr\/libexec\/|\/Library\/|\/private\/etc\/)/

function basename(cmd: string | null | undefined): string {
  const first = String(cmd || '').trim().split(/\s+/)[0] || ''
  const parts = first.split('/')
  return parts[parts.length - 1] || first
}

function executablePath(cmd: string | null | undefined): string {
  const first = String(cmd || '').trim().split(/\s+/)[0] || ''
  return first.startsWith('/') ? first : ''
}

export function classifyProtection(proc: ProtectionTarget, guard: ProtectionGuard = {}): ProtectionResult {
  const evidence: string[] = []

  if (guard.protectedPids && guard.protectedPids.includes(proc.pid)) {
    evidence.push('Service Console / DSH host process (pid ' + String(proc.pid) + ')')
  }

  for (const l of proc.listeners) {
    if (guard.protectedPorts && guard.protectedPorts.includes(l.port)) {
      evidence.push('DSH Web console listens on :' + String(l.port) + ' (stopping it would disconnect this UI)')
    }
  }

  if (proc.pid > 0 && proc.pid <= 1) {
    evidence.push('system init process (pid ' + String(proc.pid) + ')')
  }

  if (proc.listeners.some((l) => l.user === 'root')) {
    evidence.push('high-privilege process (root)')
  }

  const name = basename(proc.command) || proc.name || ''
  if (name && CRITICAL_NAMES.has(name)) {
    evidence.push('system-critical process: ' + name)
  }

  if (proc.cwd && SYSTEM_CWD_RE.test(proc.cwd)) {
    evidence.push('system directory cwd: ' + proc.cwd)
  }

  const bin = executablePath(proc.command)
  if (bin && SYSTEM_BIN_RE.test(bin)) {
    evidence.push('system binary: ' + bin)
  }

  // 同一端口的 IPv4/IPv6 双监听会产生重复证据，去重
  const unique = [...new Set(evidence)]
  return { protected: unique.length > 0, evidence: unique }
}
