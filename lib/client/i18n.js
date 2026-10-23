//#region src/client/i18n.ts
/**
* 幂等注册词典：逐语种注册；单条失败（如 already has locale）跳过，
* 不影响其余语种与后续绑定。返回 disposer（整体可安全清理）。
*/
function registerDictionaries(locale, ns, dicts) {
	const offs = [];
	for (const pair of dicts) {
		const code = pair[0];
		const dict = pair[1];
		try {
			const off = locale.register(ns, code, dict);
			if (typeof off === "function") offs.push(off);
		} catch {}
	}
	return () => {
		for (const off of offs) try {
			off();
		} catch {}
	};
}
/**
* 绑定翻译函数：稳定外层 + 每次取最新 bound（旧版 bind 可能缓存语种）。
* 变量插值手工兜底（旧版 bound 可能不支持 params）。
*/
function bindTranslator(locale, ns) {
	const make = () => {
		let bound;
		try {
			bound = locale.bind(ns);
		} catch {
			bound = (key) => key;
		}
		return (key, params) => {
			let s;
			try {
				s = bound(key);
			} catch {
				s = key;
			}
			if (typeof s !== "string" || s === "") s = key;
			if (params) for (const k of Object.keys(params)) s = s.split("{" + k + "}").join(String(params[k]));
			return s;
		};
	};
	let t = make();
	return {
		t: (key, params) => t(key, params),
		subscribe: (fn) => {
			const off = locale.subscribe(() => {
				t = make();
				fn();
			});
			return typeof off === "function" ? off : () => {};
		}
	};
}
//#endregion
export { bindTranslator, registerDictionaries };
