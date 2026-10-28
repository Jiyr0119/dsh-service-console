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
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			if (!/already has locale/.test(message)) console.warn("[dsh-service-console] locale.register(" + ns + ", " + code + ") failed:", message);
		}
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
/**
* 反应式 i18n 挂载（0.7.2）：等 locale 服务真正可用后再注册/绑定。
*
* 0.7.1 在 apply 里一次性 `ctx.get('locale')`，有两个真实事故口，UI 都会
* 退回 `entry.label` 等原始键：
*
* 1. 服务晚到（桌面竞态）：桌面客户端 `globalThis.__DSH_LOCALE__` 存在时，
*    dsh-client-locale 的 apply 要先 `await bridge.read()`（Electron IPC）才
*    `ctx.provide('locale')`；本插件 apply 先跑，get 取到 undefined 即整体
*    跳过 i18n。浏览器开发环境无 bridge、provide 同步完成，所以“本地验证
*    通过、用户下载后失效”。另外 cordis 的 get(strict) 在 provider fiber
*    尚未落定（state != 2）时同样返回 undefined。
* 2. 热更新双装载的 dispose 顺序：dshmarket 更新会把插件装载两次，第二次
*    register 抛 already has locale 被跳过；随后旧实例卸载时若把词典 disposer
*    掉，词典即被撤走，留下没有词典的新实例回显原始键。
*
* 对策：`ctx.inject(['locale'], …)` 按平台注入等待语义在服务真正可用
* （provider fiber 就绪）后才进入；provider 重启/热更新重载都会重新进入
* 回调并重绑；词典注册保持幂等，且有意不在实例卸载时撤销（见上第 2 条），
* 注册本身只增不减，对双装载安全。
*/
function attachLocale(ctx, ns, dicts, onBound) {
	ctx.inject(["locale"], (sub) => {
		const locale = sub.get("locale");
		if (locale === void 0) return;
		registerDictionaries(locale, ns, dicts);
		onBound(bindTranslator(locale, ns));
	});
}
//#endregion
export { attachLocale, bindTranslator, registerDictionaries };
