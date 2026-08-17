import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
//#region src/host/config.ts
const DEFAULT_CONFIG = {
	refreshInterval: 5e3,
	defaultScope: "workspace",
	gracefulTimeout: 3e3,
	showUnknown: true,
	forceKill: false,
	autoCleanup: false
};
const CONFIG_LIMITS = {
	refreshInterval: [2e3, 3e4],
	gracefulTimeout: [1e3, 15e3]
};
function configFilePath() {
	return join(homedir(), ".dsh", "plugins", "dsh-service-console", "config.json");
}
function loadConfigFromFile() {
	try {
		const file = configFilePath();
		if (!existsSync(file)) return { ...DEFAULT_CONFIG };
		const parsed = JSON.parse(readFileSync(file, "utf8"));
		return {
			...DEFAULT_CONFIG,
			...parsed
		};
	} catch {
		return { ...DEFAULT_CONFIG };
	}
}
function saveConfigToFile(config) {
	try {
		const file = configFilePath();
		mkdirSync(dirname(file), { recursive: true });
		writeFileSync(file, JSON.stringify(config, null, 2), "utf8");
	} catch {}
}
function validateConfigPatch(patch) {
	const next = {};
	for (const key of Object.keys(patch)) {
		if (!(key in DEFAULT_CONFIG)) return {
			ok: false,
			message: "unknown config key: " + key
		};
		const v = patch[key];
		if (typeof v === "boolean") {
			next[key] = v;
			continue;
		}
		if (typeof v === "number" && CONFIG_LIMITS[key]) {
			if (v < CONFIG_LIMITS[key][0] || v > CONFIG_LIMITS[key][1]) return {
				ok: false,
				message: "config out of range: " + key
			};
			next[key] = v;
			continue;
		}
		if (key === "defaultScope" && (v === "conversation" || v === "workspace" || v === "machine")) {
			next.defaultScope = v;
			continue;
		}
		return {
			ok: false,
			message: "invalid value for: " + key
		};
	}
	return {
		ok: true,
		next
	};
}
//#endregion
export { CONFIG_LIMITS, DEFAULT_CONFIG, loadConfigFromFile, saveConfigToFile, validateConfigPatch };
