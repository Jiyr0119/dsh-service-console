// T1-5 Redaction：命令/日志脱敏（纯函数，可单测）

interface RedactRule {
  re: RegExp
  replace: (match: string, p1?: string, p2?: string, p3?: string) => string
}

const REDACT_RULES: RedactRule[] = [
  {
    // --token=abc123 / --token abc123 / --token:abc123 → 保留 --token 与分隔符，值脱敏
    re: /(--(?:token|password|passwd|secret|key|api[-_]?key|client[-_]?secret|cookie|session))\s*[=:]\s*(\S+)/gi,
    replace: (m) => m.replace(/(?:[=:]\s*|\s+)\S+$/, '=***'),
  },
  {
    // KEY=value / KEY='value' → 保留 KEY=，值脱敏
    re: /((?:token|password|passwd|secret|api[-_]?key|client[-_]?secret|authorization|set-cookie|connection[-_]?string))\s*=\s*(['"]?)([^\s&'"]+)\2/gi,
    replace: (_m, p1, p2) => (p1 || '') + '=' + (p2 || '') + '***',
  },
  {
    // scheme://user:pass@ → 保留 scheme://，凭据脱敏
    re: /(postgres(?:ql)?|mysql|redis|mongodb)(\+s?)?:\/\/[^\s@]+@/gi,
    replace: (_m, p1) => (p1 || '') + '://***@',
  },
  {
    // JWT
    re: /\b(eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})\b/g,
    replace: () => '***',
  },
]

export function redact(command: unknown): string | null {
  if (typeof command !== 'string' || !command) return typeof command === 'string' ? command : null
  let out = command
  for (const rule of REDACT_RULES) {
    out = out.replace(rule.re, (match: string, p1?: string, p2?: string, p3?: string) =>
      rule.replace(match, p1, p2, p3),
    )
  }
  return out
}
