import { redact } from "./redaction.js";
import { runCommand, shellQuote } from "./process-inspector.js";
//#region src/host/lifecycle.ts
function ok(data) {
	return {
		ok: true,
		data
	};
}
function err(code, message) {
	return {
		ok: false,
		error: {
			code,
			message
		}
	};
}
async function stopService(deps, serviceId, mode) {
	const svc = (await deps.buildSnapshot()).services.find((x) => x.id === serviceId);
	if (!svc) return err("TARGET_GONE", "该服务已结束，列表已刷新");
	if (svc.protected) return err("PROTECTED_PROCESS", "该进程受保护，不能通过 Service Console 操作");
	const target = svc.processGroupId ? "-" + svc.processGroupId : String(svc.pid);
	await (deps.commandRunner || runCommand)("kill -TERM " + target, 3e3);
	const deadline = Date.now() + (deps.config.gracefulTimeout || 3e3);
	while (Date.now() < deadline) {
		await deps.timer.timeout(400);
		if (!(await deps.buildSnapshot()).services.some((x) => x.id === serviceId)) {
			deps.logAction(serviceId, "stop", "stopped");
			return ok({ result: "stopped" });
		}
	}
	if (deps.config.forceKill) {
		await (deps.commandRunner || runCommand)("kill -KILL " + target, 3e3);
		deps.logAction(serviceId, "stop", "force-killed");
		return ok({ result: "force-killed" });
	}
	deps.logAction(serviceId, "stop", "timeout", "GRACEFUL_TIMEOUT");
	return err("GRACEFUL_TIMEOUT", "服务未在等待时间内退出，可重试或在设置允许时强制终止");
}
async function restartService(deps, serviceId) {
	const svc = (await deps.buildSnapshot()).services.find((x) => x.id === serviceId);
	if (!svc) return err("TARGET_GONE", "该服务已结束，列表已刷新");
	if (!svc.restartable) return err("RESTART_UNSAFE", "缺少安全复现启动所需的信息，不能重启");
	const entry = deps.ledgerList().find((l) => svc.cwd && l.cwd && svc.cwd.indexOf(l.cwd) === 0);
	if (!entry) return err("RESTART_UNSAFE", "缺少启动命令记录，不能重启");
	const stopped = await stopService(deps, serviceId, "graceful");
	if (!stopped.ok && stopped.error?.code !== "TARGET_GONE") return stopped;
	const cmd = "cd " + shellQuote(entry.cwd || ".") + " && " + entry.command;
	await (deps.commandRunner || runCommand)(cmd + " >/dev/null 2>&1 &", 3e3);
	deps.logAction(serviceId, "restart", "started");
	return ok({
		result: "started",
		command: redact(entry.command) ?? entry.command
	});
}
//#endregion
export { restartService, stopService };
