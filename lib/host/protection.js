//#region src/host/protection.ts
const CRITICAL_NAMES = /* @__PURE__ */ new Set([
	"launchd",
	"kernel_task",
	"init",
	"kthreadd",
	"systemd",
	"sshd",
	"WindowServer",
	"loginwindow"
]);
const SYSTEM_CWD_RE = /^(\/System\/|\/usr\/|\/bin\/|\/sbin\/|\/Library\/|\/private\/etc\/|\/private\/var\/(?!folders|tmp))/;
const SYSTEM_BIN_RE = /^(\/System\/|\/bin\/|\/sbin\/|\/usr\/bin\/|\/usr\/sbin\/|\/usr\/libexec\/|\/Library\/|\/private\/etc\/)/;
function basename(cmd) {
	const first = String(cmd || "").trim().split(/\s+/)[0] || "";
	const parts = first.split("/");
	return parts[parts.length - 1] || first;
}
function executablePath(cmd) {
	const first = String(cmd || "").trim().split(/\s+/)[0] || "";
	return first.startsWith("/") ? first : "";
}
function classifyProtection(proc, guard = {}) {
	const evidence = [];
	if (guard.protectedPids && guard.protectedPids.includes(proc.pid)) evidence.push("Service Console / DSH host process (pid " + String(proc.pid) + ")");
	for (const l of proc.listeners) if (guard.protectedPorts && guard.protectedPorts.includes(l.port)) evidence.push("DSH Web console listens on :" + String(l.port) + " (stopping it would disconnect this UI)");
	if (proc.pid > 0 && proc.pid <= 1) evidence.push("system init process (pid " + String(proc.pid) + ")");
	if (proc.listeners.some((l) => l.user === "root")) evidence.push("high-privilege process (root)");
	const name = basename(proc.command) || proc.name || "";
	if (name && CRITICAL_NAMES.has(name)) evidence.push("system-critical process: " + name);
	if (proc.cwd && SYSTEM_CWD_RE.test(proc.cwd)) evidence.push("system directory cwd: " + proc.cwd);
	const bin = executablePath(proc.command);
	if (bin && SYSTEM_BIN_RE.test(bin)) evidence.push("system binary: " + bin);
	const unique = [...new Set(evidence)];
	return {
		protected: unique.length > 0,
		evidence: unique
	};
}
//#endregion
export { classifyProtection };
