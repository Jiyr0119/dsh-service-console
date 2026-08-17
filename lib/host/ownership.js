//#region src/host/ownership.ts
const SYSTEM_CWD_RE = /^(\/usr\/|\/System\/|\/Library\/|\/bin\/|\/sbin\/|\/private\/)/;
const LEDGER_WINDOW_MS = 6e5;
function classifyOwnership(proc, ledgers, workspaces) {
	const cwd = proc.cwd;
	proc.command;
	const evidence = [];
	let ownership = "unknown";
	let confidence = "unknown";
	let ledgerEntry = null;
	if (cwd && ledgers.length > 0) ledgerEntry = ledgers.find((l) => l.cwd && cwd.indexOf(l.cwd) === 0 && proc.startedAt !== null && Math.abs(proc.startedAt - l.at) < LEDGER_WINDOW_MS) ?? null;
	if (ledgerEntry) {
		ownership = "conversation-confirmed";
		confidence = "confirmed";
		evidence.push("matched session launch ledger: " + (ledgerEntry.redacted || ledgerEntry.command).slice(0, 60));
	} else if (cwd && workspaces.length > 0) {
		const ws = workspaces.find((w) => w && w.path && cwd.indexOf(w.path) === 0);
		if (ws) {
			ownership = "workspace-inferred";
			confidence = "inferred";
			evidence.push("cwd under workspace: " + ws.path);
		}
	} else if (cwd && !SYSTEM_CWD_RE.test(cwd)) {
		ownership = "other-local";
		confidence = "inferred";
		evidence.push("local cwd not in workspace: " + cwd);
	} else evidence.push("cannot confirm origin (cwd or command unavailable)");
	return {
		ownership,
		confidence,
		evidence,
		ledgerEntry
	};
}
//#endregion
export { classifyOwnership };
