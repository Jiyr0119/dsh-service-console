// dsh-service-console · 核心类型（对齐 PRD §10.5 数据模型）

export type ServiceScope = 'conversation' | 'workspace' | 'machine'
export type Ownership = 'conversation-confirmed' | 'workspace-inferred' | 'other-local' | 'unknown' | 'protected'
export type ServiceStatus = 'running' | 'starting' | 'stopping' | 'exited' | 'unreachable' | 'permission-denied' | 'unknown'

export interface Listener {
  host: string
  port: number
  protocol: string
  url?: string | null
}

export interface Service {
  id: string
  status: ServiceStatus
  ownership: Ownership
  confidence: 'confirmed' | 'inferred' | 'unknown'
  name: string
  pid: number
  processGroupId?: number | null
  parentPid?: number | null
  commandSummary?: string | null
  cwd?: string | null
  startedAt?: number | null
  listeners: Listener[]
  restartable: boolean
  protected: boolean
  ownershipEvidence: string[]
  fingerprint: string
}

export interface Snapshot {
  scannedAt: number
  count: number
  services: Service[]
  partialWarnings: string[]
  ledgerCount: number
}

export interface ApiResult<T = unknown> {
  ok: boolean
  data?: T
  error?: { code: string; message: string }
}

export interface LedgerEntry {
  at: number
  command: string
  cwd: string | null
  sessionKey: string | null
  redacted: string
}

export interface Config {
  refreshInterval: number
  defaultScope: ServiceScope
  gracefulTimeout: number
  showUnknown: boolean
  forceKill: boolean
  autoCleanup: boolean
}

export interface ActionRecord {
  at: number
  serviceId: string | null
  action: string
  result: string
  code: string | null
}

// 与 DSH shell 服务的最小接口（动态/原生共用）
export interface ShellLike {
  resolve(request: { command: string; timeout?: number }): unknown
  run(spec: unknown): Promise<{
    stdout?: unknown
    stderr?: unknown
    output?: unknown
    text?: unknown
    code?: unknown
    exitCode?: unknown
  }>
}

export interface WorkspaceLike {
  id?: string
  path?: string
  title?: string
}

export interface TimerLike {
  timeout(callback: () => void, delay: number): () => void
  timeout(delay: number): Promise<void>
}
