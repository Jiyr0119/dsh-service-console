// T1-8 Config：配置模型与默认值（对齐 PRD FR-07）
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import type { Config, ServiceScope } from './types'

export const DEFAULT_CONFIG: Config = {
  refreshInterval: 5000,
  defaultScope: 'workspace',
  gracefulTimeout: 3000,
  showUnknown: true,
  forceKill: false,
  autoCleanup: false,
}

export const CONFIG_LIMITS: Record<string, [number, number]> = {
  refreshInterval: [2000, 30000],
  gracefulTimeout: [1000, 15000],
}

// T2-4 配置持久化：本地文件（~/.dsh/plugins/dsh-service-console/config.json）
function configFilePath(): string {
  return join(homedir(), '.dsh', 'plugins', 'dsh-service-console', 'config.json')
}

export function loadConfigFromFile(): Config {
  try {
    const file = configFilePath()
    if (!existsSync(file)) return { ...DEFAULT_CONFIG }
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as Partial<Config>
    return { ...DEFAULT_CONFIG, ...parsed }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function saveConfigToFile(config: Config): void {
  try {
    const file = configFilePath()
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, JSON.stringify(config, null, 2), 'utf8')
  } catch {
    // 持久化失败不阻断运行
  }
}

export function validateConfigPatch(patch: Record<string, unknown>): { ok: true; next: Partial<Config> } | { ok: false; message: string } {
  const next: Partial<Config> = {}
  for (const key of Object.keys(patch)) {
    if (!(key in DEFAULT_CONFIG)) return { ok: false, message: 'unknown config key: ' + key }
    const v = patch[key]
    if (typeof v === 'boolean') {
      ;(next as Record<string, unknown>)[key] = v
      continue
    }
    if (typeof v === 'number' && CONFIG_LIMITS[key]) {
      if (v < CONFIG_LIMITS[key][0] || v > CONFIG_LIMITS[key][1]) return { ok: false, message: 'config out of range: ' + key }
      ;(next as Record<string, unknown>)[key] = v
      continue
    }
    if (key === 'defaultScope' && (v === 'conversation' || v === 'workspace' || v === 'machine')) {
      next.defaultScope = v as ServiceScope
      continue
    }
    return { ok: false, message: 'invalid value for: ' + key }
  }
  return { ok: true, next }
}
