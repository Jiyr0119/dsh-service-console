import { SessionLedger } from "./host/ledger.js";
import { buildSnapshot } from "./host/service-registry.js";
import { restartService, stopService } from "./host/lifecycle.js";
import { loadConfigFromFile, saveConfigToFile, validateConfigPatch } from "./host/config.js";
//#region src/index.ts
async function readJsonBody(req) {
	try {
		let body = "";
		const iterable = req;
		if (typeof iterable[Symbol.asyncIterator] !== "function") return {};
		for await (const chunk of iterable) body += String(chunk);
		return body ? JSON.parse(body) : {};
	} catch {
		return null;
	}
}
function sendJson(res, status, payload) {
	const r = res;
	r.statusCode = status;
	r.writeHead(status, { "content-type": "application/json; charset=utf-8" });
	r.end(JSON.stringify(payload));
}
var src_default = {
	inject: ["timer", "webServer"],
	apply(ctx) {
		const workspaceRegistry = ctx.get("workspaceRegistry");
		const timer = ctx.timer;
		const ledger = new SessionLedger();
		const on = ctx.on;
		on("tools/result", (exec) => ledger.observe(exec));
		let config = loadConfigFromFile();
		const actionLog = [];
		const logAction = (serviceId, action, result, code = null) => {
			actionLog.push({
				at: Date.now(),
				serviceId,
				action,
				result,
				code
			});
			if (actionLog.length > 200) actionLog.shift();
		};
		const deps = {
			timer,
			config,
			buildSnapshot: () => buildSnapshot(ledger.list, workspaces()),
			ledgerList: () => ledger.list,
			logAction
		};
		let workspacesCache = [];
		function loadWorkspaces() {
			try {
				if (workspaceRegistry && typeof workspaceRegistry.list === "function") return workspaceRegistry.list();
			} catch {}
			return [];
		}
		function workspaces() {
			try {
				workspacesCache = loadWorkspaces();
			} catch {}
			return workspacesCache;
		}
		const routes = [
			{
				path: "/dsh-sc/api/services/scan",
				handler: async () => ({
					ok: true,
					data: await buildSnapshot(ledger.list, workspaces())
				})
			},
			{
				path: "/dsh-sc/api/services/detail",
				handler: async (args) => {
					const svc = (await buildSnapshot(ledger.list, workspaces())).services.find((x) => x.id === String(args.serviceId ?? ""));
					if (!svc) return {
						ok: false,
						error: {
							code: "TARGET_GONE",
							message: "服务不存在"
						}
					};
					return {
						ok: true,
						data: {
							...svc,
							recentActions: actionLog.filter((a) => a.serviceId === svc.id).slice(-10)
						}
					};
				}
			},
			{
				path: "/dsh-sc/api/services/stop",
				handler: async (args) => stopService(deps, String(args.serviceId ?? ""), String(args.mode ?? "graceful"))
			},
			{
				path: "/dsh-sc/api/services/restart",
				handler: async (args) => restartService(deps, String(args.serviceId ?? ""))
			},
			{
				path: "/dsh-sc/api/config",
				handler: async (args) => {
					const a = args || {};
					if (a.action === "update" && a.patch && typeof a.patch === "object") {
						const v = validateConfigPatch(a.patch);
						if (!v.ok) return {
							ok: false,
							error: {
								code: "BAD_REQUEST",
								message: v.message
							}
						};
						config = {
							...config,
							...v.next
						};
						saveConfigToFile(config);
						return {
							ok: true,
							data: { config }
						};
					}
					return {
						ok: true,
						data: { config }
					};
				}
			},
			{
				path: "/dsh-sc/api/actions",
				handler: async () => ({
					ok: true,
					data: { actions: actionLog.slice(-50) }
				})
			}
		];
		for (const route of routes) ctx.webServer.register({
			kind: "exact",
			path: route.path,
			handler: async (req, res) => {
				const body = await readJsonBody(req);
				if (body === null) {
					sendJson(res, 400, {
						ok: false,
						error: {
							code: "BAD_REQUEST",
							message: "invalid JSON body"
						}
					});
					return;
				}
				try {
					const result = await route.handler(body);
					sendJson(res, result.ok ? 200 : 400, result);
				} catch (e) {
					sendJson(res, 500, {
						ok: false,
						error: {
							code: "INTERNAL",
							message: String(e?.message || e)
						}
					});
				}
			}
		});
	}
};
//#endregion
export { src_default as default };
