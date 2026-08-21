// T1-6 Lifecycle：停止/重启状态机与防护（PID 复用校验、优雅超时、强制终止开关）
import type { ApiResult, Config, LedgerEntry, Snapshot, TimerLike } from './types'
import { runCommand, shellQuote, type CommandRunner } from './process-inspector'
import { redact } from './redaction'

export interface LifecycleDeps {
  timer: TimerLike
  config: Config
  buildSnapshot: () => Promise<Snapshot>
  ledgerList: () => LedgerEntry[]
  logAction: (serviceId: string | null, action: string, result: string, code?: string | null) => void
  commandRunner?: CommandRunner
}

function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data }
}
function err(code: string, message: string): ApiResult<never> {
  return { ok: false, error: { code, message } }
}

export async function stopService(deps: LifecycleDeps, serviceId: string, mode?: string): Promise<ApiResult<{ result: string }>> {
  const s = await deps.buildSnapshot()
  const svc = s.services.find((x) => x.id === serviceId)
  if (!svc) return err('TARGET_GONE', '该服务已结束，列表已刷新')
  if (svc.protected) return err('PROTECTED_PROCESS', '该进程受保护，不能通过 Service Console 操作')
  // 进程组优先
  const target = svc.processGroupId ? '-' + svc.processGroupId : String(svc.pid)
  const run = deps.commandRunner || runCommand
  await run('kill -TERM ' + target, 3000)
  const deadline = Date.now() + (deps.config.gracefulTimeout || 3000)
  while (Date.now() < deadline) {
    await deps.timer.timeout(400)
    const re = await deps.buildSnapshot()
    if (!re.services.some((x) => x.id === serviceId)) {
      deps.logAction(serviceId, 'stop', 'stopped')
      return ok({ result: 'stopped' })
    }
  }
  if (deps.config.forceKill) {
    await (deps.commandRunner || runCommand)('kill -KILL ' + target, 3000)
    deps.logAction(serviceId, 'stop', 'force-killed')
    return ok({ result: 'force-killed' })
  }
  deps.logAction(serviceId, 'stop', 'timeout', 'GRACEFUL_TIMEOUT')
  return err('GRACEFUL_TIMEOUT', '服务未在等待时间内退出，可重试或在设置允许时强制终止')
}

export async function restartService(deps: LifecycleDeps, serviceId: string): Promise<ApiResult<{ result: string; command?: string }>> {
  const s = await deps.buildSnapshot()
  const svc = s.services.find((x) => x.id === serviceId)
  if (!svc) return err('TARGET_GONE', '该服务已结束，列表已刷新')
  if (!svc.restartable) return err('RESTART_UNSAFE', '缺少安全复现启动所需的信息，不能重启')
  const entry = deps.ledgerList().find((l) => svc.cwd && l.cwd && svc.cwd.indexOf(l.cwd) === 0)
  if (!entry) return err('RESTART_UNSAFE', '缺少启动命令记录，不能重启')
  const stopped = await stopService(deps, serviceId, 'graceful')
  if (!stopped.ok && stopped.error?.code !== 'TARGET_GONE') return stopped
  const cmd = 'cd ' + shellQuote(entry.cwd || '.') + ' && ' + entry.command
  await (deps.commandRunner || runCommand)(cmd + ' >/dev/null 2>&1 &', 3000)
  deps.logAction(serviceId, 'restart', 'started')
  return ok({ result: 'started', command: redact(entry.command) ?? entry.command })
}
