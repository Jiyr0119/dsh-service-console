//#region src/host/process-inspector.ts
const MONTHS = {
	Jan: 1,
	Feb: 2,
	Mar: 3,
	Apr: 4,
	May: 5,
	Jun: 6,
	Jul: 7,
	Aug: 8,
	Sep: 9,
	Oct: 10,
	Nov: 11,
	Dec: 12
};
async function runCommand(shell, command, timeoutMs) {
	try {
		const spec = shell.resolve({
			command,
			timeout: timeoutMs || 5e3
		});
		const res = await shell.run(spec);
		return {
			stdout: typeof res.stdout === "string" ? res.stdout : typeof res.output === "string" ? res.output : typeof res.text === "string" ? res.text : "",
			stderr: typeof res.stderr === "string" ? res.stderr : "",
			code: res.code !== void 0 ? res.code : res.exitCode !== void 0 ? res.exitCode : null
		};
	} catch (e) {
		return {
			stdout: "",
			stderr: String(e?.message || e),
			code: null
		};
	}
}
function parseLstart(str) {
	const parts = String(str).trim().split(/\s+/);
	if (parts.length < 5) return null;
	const mon = MONTHS[parts[1]];
	const day = parseInt(parts[2], 10);
	const year = parseInt(parts[4], 10);
	if (!mon || !day || !year || !parts[3]) return null;
	const iso = year + "-" + String(mon).padStart(2, "0") + "-" + String(day).padStart(2, "0") + "T" + parts[3];
	const t = Date.parse(iso);
	return Number.isFinite(t) ? t : null;
}
function parseListenRows(stdout) {
	const rows = [];
	for (const line of String(stdout).split("\n")) {
		const t = line.trim();
		if (!t || t.startsWith("COMMAND")) continue;
		const m = t.match(/^(\S+)\s+(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/);
		if (!m) continue;
		const name = m[9].trim();
		if (!/\(LISTEN\)$/.test(name)) continue;
		rows.push({
			command: m[1],
			pid: parseInt(m[2], 10),
			user: m[3],
			fd: m[4],
			type: m[5],
			address: name.replace(/\s*\(LISTEN\)$/, "")
		});
	}
	return rows;
}
function parsePsRows(stdout) {
	const rows = [];
	for (const line of String(stdout).split("\n")) {
		const t = line.trim();
		if (!t) continue;
		const parts = t.split(/\s+/);
		const pid = parseInt(parts[0], 10);
		const ppid = parseInt(parts[1], 10);
		if (!Number.isFinite(pid) || !Number.isFinite(ppid)) continue;
		const lstart = parts.slice(2, 7).join(" ");
		rows.push({
			pid,
			ppid,
			lstart,
			startedAt: parseLstart(lstart),
			command: parts.slice(7).join(" ")
		});
	}
	return rows;
}
function parseAddress(addr) {
	let host = null;
	let port = null;
	let m = String(addr).match(/^\[([^\]]+)\]:(.+)$/);
	if (m) {
		host = m[1];
		port = parseInt(m[2], 10);
	} else {
		m = String(addr).match(/^(.+):(\d+)$/);
		if (m) {
			host = m[1];
			port = parseInt(m[2], 10);
		}
	}
	return {
		host,
		port
	};
}
function shellQuote(s) {
	return "'" + String(s).replace(/'/g, "'\\''") + "'";
}
async function scanRaw(shell) {
	const partialWarnings = [];
	const tcp = await runCommand(shell, "lsof -nP -iTCP -sTCP:LISTEN", 5e3);
	if (tcp.code !== 0 && tcp.code !== null && tcp.code !== 1) partialWarnings.push("TCP listener scan exit=" + String(tcp.code));
	const rows = parseListenRows(tcp.stdout);
	const pids = [...new Set(rows.map((r) => r.pid))];
	const pidList = pids.join(",");
	const procs = /* @__PURE__ */ new Map();
	if (pids.length > 0) {
		const psRes = await runCommand(shell, "ps -o pid=,ppid=,lstart=,command= -p " + pidList, 5e3);
		const psRows = parsePsRows(psRes.stdout);
		if (psRes.code !== 0 && psRes.code !== null) partialWarnings.push("ps detail partial");
		const pgidRes = await runCommand(shell, "ps -o pid=,pgid= -p " + pidList, 5e3);
		const pgidMap = /* @__PURE__ */ new Map();
		for (const line of String(pgidRes.stdout).split("\n")) {
			const parts = line.trim().split(/\s+/);
			if (parts.length >= 2) {
				const p = parseInt(parts[0], 10);
				const g = parseInt(parts[1], 10);
				if (Number.isFinite(p) && Number.isFinite(g)) pgidMap.set(p, g);
			}
		}
		let cwdByPid = /* @__PURE__ */ new Map();
		const cwdRes = await runCommand(shell, "lsof -a -p " + pidList + " -d cwd", 5e3);
		for (const line of String(cwdRes.stdout).split("\n")) {
			const t = line.trim();
			if (!t || t.startsWith("COMMAND")) continue;
			const m = t.match(/^(\S+)\s+(\d+)\s+(\S+)\s+cwd\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/);
			if (m) cwdByPid.set(parseInt(m[2], 10), m[8].trim());
		}
		if (cwdRes.code !== 0 && cwdRes.code !== null) partialWarnings.push("cwd scan partial");
		const nameOf = (r) => {
			return String(r.command).split(/\s+/)[0] || null;
		};
		for (const r of psRows) procs.set(r.pid, {
			pid: r.pid,
			ppid: r.ppid,
			startedAt: r.startedAt,
			command: r.command || null,
			name: nameOf(r),
			pgid: pgidMap.get(r.pid) ?? null,
			cwd: cwdByPid.get(r.pid) ?? null
		});
	}
	const listeners = [];
	for (const r of rows) {
		const { host, port } = parseAddress(r.address);
		if (host === null || port === null) continue;
		listeners.push({
			pid: r.pid,
			host,
			port,
			protocol: r.type === "IPv6" ? "tcp6" : "tcp"
		});
	}
	return {
		listeners,
		procs,
		partialWarnings
	};
}
//#endregion
export { parseAddress, parseListenRows, parseLstart, parsePsRows, runCommand, scanRaw, shellQuote };
