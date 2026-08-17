import { redact } from "./redaction.js";
import { runCommand, scanRaw } from "./process-inspector.js";
import { classifyOwnership } from "./ownership.js";
import { createHash } from "node:crypto";
//#region src/host/service-registry.ts
function sha256Hex(input) {
	return createHash("sha256").update(input).digest("hex");
}
function isLocalhost(host) {
	return host === "127.0.0.1" || host === "::1" || host === "localhost";
}
async function buildSnapshot(ledgers, workspaces, commandRunner = runCommand) {
	const raw = await scanRaw(commandRunner);
	const byPid = /* @__PURE__ */ new Map();
	for (const l of raw.listeners) {
		if (!byPid.has(l.pid)) byPid.set(l.pid, []);
		byPid.get(l.pid).push({
			host: l.host,
			port: l.port,
			protocol: l.protocol
		});
	}
	const services = [];
	for (const [pid, listeners] of byPid) {
		const proc = raw.procs.get(pid);
		const command = proc ? proc.command : null;
		const cwd = proc ? proc.cwd : null;
		const startedAt = proc ? proc.startedAt : null;
		const fpSource = [
			pid,
			startedAt,
			command || "",
			cwd || "",
			listeners.map((l) => l.host + ":" + l.port).sort().join(",")
		].join("|");
		const serviceId = "svc_" + sha256Hex(fpSource).slice(0, 12);
		const cls = classifyOwnership({
			cwd,
			command,
			startedAt
		}, ledgers, workspaces);
		const listenersFinal = listeners.map((l) => ({
			...l,
			url: isLocalhost(l.host) ? "http://localhost:" + l.port : null
		}));
		services.push({
			id: serviceId,
			status: "running",
			ownership: cls.ownership,
			confidence: cls.confidence,
			name: proc?.name || "unknown",
			pid,
			processGroupId: proc?.pgid ?? null,
			parentPid: proc?.ppid ?? null,
			commandSummary: command ? redact(command).slice(0, 200) : null,
			cwd,
			startedAt,
			listeners: listenersFinal,
			restartable: !!cls.ledgerEntry,
			protected: false,
			ownershipEvidence: cls.evidence,
			fingerprint: "sha256:" + sha256Hex(fpSource)
		});
	}
	services.sort((a, b) => (a.ownership === "conversation-confirmed" ? -1 : 1) - (b.ownership === "conversation-confirmed" ? -1 : 1));
	return {
		scannedAt: Date.now(),
		count: services.length,
		services,
		partialWarnings: raw.partialWarnings,
		ledgerCount: ledgers.length
	};
}
//#endregion
export { buildSnapshot };
