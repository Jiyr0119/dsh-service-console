// dsh-service-console · Host 入口：webServer JSON 路由（逐条注册）+ tools/result 台账监听
import type { Context } from 'cordis'
import type { WebServer } from '@deepseek-ai/dsh-host-webserver'
import { SessionLedger } from './host/ledger'
import { buildSnapshot } from './host/service-registry'
import { stopService, restartService } from './host/lifecycle'
import { DEFAULT_CONFIG, CONFIG_LIMITS, validateConfigPatch, loadConfigFromFile, saveConfigToFile } from './host/config'
import type { ActionRecord, ApiResult, Config } from './host/types'

declare module 'cordis' {
  interface Context {
    timer: {
      timeout(callback: () => void, delay: number): () => void
      timeout(delay: number): Promise<void>
      interval(callback: () => void, delay: number): () => void
    }
    webServer: WebServer
  }
}

async function readJsonBody(req: unknown): Promise<Record<string, unknown> | null> {
  try {
    let body = ''
    const iterable = req as { [Symbol.asyncIterator](): AsyncIterator<Buffer | string> }
    if (typeof iterable[Symbol.asyncIterator] !== 'function') return {}
    for await (const chunk of iterable) body += String(chunk)
    return body ? (JSON.parse(body) as Record<string, unknown>) : {}
  } catch {
    return null
  }
}

function sendJson(res: unknown, status: number, payload: unknown): void {
  const r = res as { statusCode: number; writeHead(s: number, h?: Record<string, string>): void; end(b?: string): void }
  r.statusCode = status
  r.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  r.end(JSON.stringify(payload))
}

export default {
  inject: ['timer', 'webServer'],
  apply(ctx: Context) {
    const shell = ctx.get('shell')
    const workspaceRegistry = ctx.get('workspaceRegistry')
    const timer = ctx.timer

    const ledger = new SessionLedger()
    // tools/result 为 emit 观察事件（按 exec.agent 作用域分发）；cordis 类型未声明该事件，显式转换
    const on = ctx.on as unknown as (name: string, listener: (exec: unknown) => void) => void
    on('tools/result', (exec) => ledger.observe(exec as Parameters<SessionLedger['observe']>[0]))

    let config: Config = loadConfigFromFile() // T2-4：重启保留（~/.dsh/plugins/dsh-service-console/config.json）
    const actionLog: ActionRecord[] = []
    const logAction = (serviceId: string | null, action: string, result: string, code: string | null = null): void => {
      actionLog.push({ at: Date.now(), serviceId, action, result, code })
      if (actionLog.length > 200) actionLog.shift()
    }

    const deps = {
      shell: shell!,
      timer,
      config,
      buildSnapshot: () => buildSnapshot(shell!, ledger.list, workspaces()),
      ledgerList: () => ledger.list,
      logAction,
    }

    let workspacesCache: ReturnType<typeof loadWorkspaces> = []
    function loadWorkspaces() {
      try {
        if (workspaceRegistry && typeof workspaceRegistry.list === 'function') return workspaceRegistry.list() as { id?: string; path?: string; title?: string }[]
      } catch {
        /* ignore */
      }
      return []
    }
    function workspaces() {
      try {
        workspacesCache = loadWorkspaces()
      } catch {
        /* ignore */
      }
      return workspacesCache
    }

    // 路由处理（统一信封 { ok, data | error }）
    const routes: { path: string; handler: (args: Record<string, unknown>) => Promise<ApiResult> }[] = [
      {
        path: '/dsh-sc/api/services/scan',
        handler: async () => ({ ok: true, data: await buildSnapshot(shell!, ledger.list, workspaces()) }),
      },
      {
        path: '/dsh-sc/api/services/detail',
        handler: async (args) => {
          const s = await buildSnapshot(shell!, ledger.list, workspaces())
          const svc = s.services.find((x) => x.id === String(args.serviceId ?? ''))
          if (!svc) return { ok: false, error: { code: 'TARGET_GONE', message: '服务不存在' } }
          return { ok: true, data: { ...svc, recentActions: actionLog.filter((a) => a.serviceId === svc.id).slice(-10) } }
        },
      },
      {
        path: '/dsh-sc/api/services/stop',
        handler: async (args) => stopService(deps, String(args.serviceId ?? ''), String(args.mode ?? 'graceful')),
      },
      {
        path: '/dsh-sc/api/services/restart',
        handler: async (args) => restartService(deps, String(args.serviceId ?? '')),
      },
      {
        path: '/dsh-sc/api/config',
        handler: async (args) => {
          const a = args || {}
          if (a.action === 'update' && a.patch && typeof a.patch === 'object') {
            const v = validateConfigPatch(a.patch as Record<string, unknown>)
            if (!v.ok) return { ok: false, error: { code: 'BAD_REQUEST', message: v.message } }
            config = { ...config, ...v.next }
            saveConfigToFile(config)
            return { ok: true, data: { config } }
          }
          return { ok: true, data: { config } }
        },
      },
      {
        path: '/dsh-sc/api/actions',
        handler: async () => ({ ok: true, data: { actions: actionLog.slice(-50) } }),
      },
    ]

    // 逐条注册（绝不一次传入数组 —— 数组会让路由静默失效）
    for (const route of routes) {
      ctx.webServer.register({
        kind: 'exact',
        path: route.path,
        handler: async (req, res) => {
          const body = await readJsonBody(req)
          if (body === null) {
            sendJson(res, 400, { ok: false, error: { code: 'BAD_REQUEST', message: 'invalid JSON body' } })
            return
          }
          try {
            const result = await route.handler(body)
            sendJson(res, result.ok ? 200 : 400, result)
          } catch (e) {
            sendJson(res, 500, { ok: false, error: { code: 'INTERNAL', message: String((e as Error)?.message || e) } })
          }
        },
      })
    }
  },
}
