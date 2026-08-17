import { redact } from "./redaction.js";
//#region src/host/ledger.ts
const DEV_COMMAND_RE = /(npm (run|start|dev)|pnpm (run|dev|start)|yarn (dev|start)|next dev|vite|uvicorn|gunicorn|flask run|django runserver|cargo run|node (server|app|index)|python3? -m (http.server|uvicorn)|serve|http-server|nodemon|tsx watch|deno run)/;
var SessionLedger = class {
	entries = [];
	get list() {
		return this.entries;
	}
	observe(exec) {
		try {
			if (!exec || exec.name !== "bash") return;
			const args = exec.args || {};
			const command = String(args.command || "");
			if (!DEV_COMMAND_RE.test(command)) return;
			let sessionKey = null;
			try {
				sessionKey = exec.agent && (exec.agent.id || exec.agent.sessionId) || null;
			} catch {
				sessionKey = null;
			}
			this.entries.push({
				at: Date.now(),
				command,
				cwd: typeof args.workdir === "string" ? args.workdir : null,
				sessionKey,
				redacted: redact(command) ?? command
			});
			if (this.entries.length > 200) this.entries.shift();
		} catch (err) {}
	}
};
//#endregion
export { DEV_COMMAND_RE, SessionLedger };
