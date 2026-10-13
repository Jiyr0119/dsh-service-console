// dsh-service-console · service_list 只读模型工具（P0-2）
// 纯只读：向模型暴露本机监听服务清单。停止/重启刻意不进模型工具面——生命周期
// 操作只走 UI/API（P0-1 受保护门禁在那里），避免模型误杀进程。
// 依赖通过参数注入（snapshot 与 /dsh-sc/api/services/scan 同源），便于单测。
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { Ownership, Snapshot } from './types'

export interface ServiceToolDeps {
  /** 与 API scan 路由同源的快照函数（含受保护判定 guard） */
  snapshot(): Promise<Snapshot>
}

/** 与 host/types.ts 的 Ownership 联合一致（运行时无从推导，双写靠测试对齐） */
const OWNERSHIP_LEVELS = [
  'conversation-confirmed',
  'workspace-inferred',
  'other-local',
  'unknown',
  'protected',
] as const satisfies readonly Ownership[]

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

/** 与客户端搜索框同字段：name / pid / commandSummary / cwd / 端口（不区分大小写） */
function matchesQuery(q: string, s: Snapshot['services'][number]): boolean {
  return (
    s.name.toLowerCase().includes(q) ||
    String(s.pid).includes(q) ||
    (s.commandSummary ?? '').toLowerCase().includes(q) ||
    (s.cwd ?? '').toLowerCase().includes(q) ||
    s.listeners.some((l) => String(l.port).includes(q))
  )
}

export function buildServiceTool(deps: ServiceToolDeps) {
  return defineTool({
    name: 'service_list',
    description:
      'List services currently listening on this machine (process, ports, ownership). ' +
      'READ-ONLY: this tool never stops or restarts anything; lifecycle actions live in the Service Console panel in the UI, ' +
      'where system-protected processes are refused. Use query to filter by name, command, cwd, or port, ' +
      'and ownership to filter by how a service was attributed.',
    parameters: {
      query: {
        type: 'string',
        description: 'Case-insensitive substring matched against service name, pid, command, cwd, and listening ports',
      },
      ownership: {
        type: 'string',
        enum: OWNERSHIP_LEVELS,
        description:
          'Only return services attributed at this level: conversation-confirmed / workspace-inferred / other-local / unknown / protected (refused for lifecycle actions)',
      },
      limit: {
        type: 'integer',
        default: DEFAULT_LIMIT,
        description: `Maximum services to return, clamped to 1..${MAX_LIMIT} (default ${DEFAULT_LIMIT})`,
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          scannedAt: { type: 'integer', required: true, description: 'Epoch milliseconds of the scan' },
          total: { type: 'integer', required: true, description: 'Services matching the filters before the limit is applied' },
          count: { type: 'integer', required: true, description: 'Services actually returned' },
          services: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                id: { type: 'string', required: true, description: 'Stable service id used by Service Console APIs' },
                name: { type: 'string', required: true, description: 'Executable path or command name' },
                pid: { type: 'integer', required: true },
                status: { type: 'string', required: true, description: 'Lifecycle status, e.g. running' },
                ownership: { type: 'string', required: true, description: 'Attribution level (see the ownership parameter)' },
                protected: {
                  type: 'boolean',
                  required: true,
                  description: 'True when lifecycle actions on this service are refused (system/DSH-owning processes)',
                },
                ports: { type: 'string', required: true, description: 'Comma-separated listening ports' },
                cwd: { type: 'string', required: true, description: 'Working directory of the process, empty when unknown' },
                evidence: {
                  type: 'array',
                  required: true,
                  items: { type: 'string' },
                  description: 'Attribution/protection evidence lines, empty when none',
                },
              },
            },
          },
        },
      },
      render: (_args, value) => {
        const lines = value.services.map((s) => {
          const tag = s.protected ? '[protected] ' : ''
          const ev = s.evidence.length > 0 ? ` · ${s.evidence.join(' | ')}` : ''
          return `${tag}${s.name} :${s.ports} · pid ${s.pid} · ${s.ownership}${ev}`
        })
        const head = `services ${value.count}/${value.total} (scanned ${new Date(value.scannedAt).toISOString()})`
        return [{ type: 'text', text: [head, ...lines].join('\n') }]
      },
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const snap = await deps.snapshot()
      let rows = snap.services
      if (args.ownership !== undefined) rows = rows.filter((s) => s.ownership === args.ownership)
      if (args.query) {
        const q = args.query.toLowerCase()
        rows = rows.filter((s) => matchesQuery(q, s))
      }
      const total = rows.length
      const limit = Math.min(Math.max(args.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT)
      const services = rows.slice(0, limit).map((s) => ({
        id: s.id,
        name: s.name,
        pid: s.pid,
        status: s.status,
        ownership: s.ownership,
        protected: s.protected,
        ports: s.listeners.map((l) => String(l.port)).join(', '),
        cwd: s.cwd ?? '',
        evidence: [...s.ownershipEvidence],
      }))
      return { scannedAt: snap.scannedAt, total, count: services.length, services }
    },
  })
}
