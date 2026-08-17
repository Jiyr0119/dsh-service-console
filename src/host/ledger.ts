// T1-3 Session Launch Ledger：会话启动台账（tools/result 观察）
import type { LedgerEntry } from './types'
import { redact } from './redaction'

// 常驻开发服务命令特征（命中才记录）
export const DEV_COMMAND_RE =
  /(npm (run|start|dev)|pnpm (run|dev|start)|yarn (dev|start)|next dev|vite|uvicorn|gunicorn|flask run|django runserver|cargo run|node (server|app|index)|python3? -m (http.server|uvicorn)|serve|http-server|nodemon|tsx watch|deno run)/

export interface ToolExecLike {
  name?: string
  args?: Record<string, unknown>
  agent?: { id?: string; sessionId?: string } | null
}

export class SessionLedger {
  private entries: LedgerEntry[] = []

  get list(): LedgerEntry[] {
    return this.entries
  }

  observe(exec: ToolExecLike | null): void {
    try {
      if (!exec || exec.name !== 'bash') return
      const args = exec.args || {}
      const command = String(args.command || '')
      if (!DEV_COMMAND_RE.test(command)) return
      let sessionKey: string | null = null
      try {
        sessionKey = (exec.agent && (exec.agent.id || exec.agent.sessionId)) || null
      } catch {
        sessionKey = null
      }
      this.entries.push({
        at: Date.now(),
        command,
        cwd: typeof args.workdir === 'string' ? args.workdir : null,
        sessionKey,
        redacted: redact(command) ?? command,
      })
      if (this.entries.length > 200) this.entries.shift()
    } catch (err) {
      // 观察失败不影响工具执行
    }
  }
}
