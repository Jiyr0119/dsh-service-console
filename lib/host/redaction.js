//#region src/host/redaction.ts
const REDACT_RULES = [
	{
		re: /(--(?:token|password|passwd|secret|key|api[-_]?key|client[-_]?secret|cookie|session))\s*[=:]\s*(\S+)/gi,
		replace: (m) => m.replace(/(?:[=:]\s*|\s+)\S+$/, "=***")
	},
	{
		re: /((?:token|password|passwd|secret|api[-_]?key|client[-_]?secret|authorization|set-cookie|connection[-_]?string))\s*=\s*(['"]?)([^\s&'"]+)\2/gi,
		replace: (_m, p1, p2) => (p1 || "") + "=" + (p2 || "") + "***"
	},
	{
		re: /(postgres(?:ql)?|mysql|redis|mongodb)(\+s?)?:\/\/[^\s@]+@/gi,
		replace: (_m, p1) => (p1 || "") + "://***@"
	},
	{
		re: /\b(eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})\b/g,
		replace: () => "***"
	}
];
function redact(command) {
	if (typeof command !== "string" || !command) return typeof command === "string" ? command : null;
	let out = command;
	for (const rule of REDACT_RULES) out = out.replace(rule.re, (match, p1, p2, p3) => rule.replace(match, p1, p2, p3));
	return out;
}
//#endregion
export { redact };
