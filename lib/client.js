window.__ModuleLoader__.load({
	id: "@jiyr0119/dsh-service-console",
	factory: (require) => {
		var module = { exports: {} };
		module.exports;
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:/Users/jonathan/workspaceforme/dsh-service-console/src/client/service-console.module.css.mjs
		const css = ".citwcW_panel{z-index:9999;box-sizing:border-box;width:min(620px,100vw - 32px);max-height:min(760px,100dvh - 88px);color:var(--dsw-alias-label-primary,#f5f5f5);background:var(--dsw-alias-bg-overlay,#202124);border:1px solid var(--dsw-alias-border-l1,#3b3d42);font-family:var(--dsw-font-family,Inter, -apple-system, BlinkMacSystemFont, sans-serif);pointer-events:auto;border-radius:14px;padding:18px;font-size:13px;position:fixed;top:64px;right:20px;overflow:auto;box-shadow:0 18px 55px #0000006b,0 2px 8px #0003}.citwcW_header{border-bottom:1px solid var(--dsw-alias-border-l1,#35373c);justify-content:space-between;align-items:flex-start;gap:16px;padding-bottom:14px;display:flex}.citwcW_titleBlock{flex-direction:column;gap:3px;display:flex}.citwcW_titleBlock strong{letter-spacing:-.02em;font-size:19px}.citwcW_eyebrow,.citwcW_detailAccent,.citwcW_detailLabel{color:var(--dsw-alias-label-tertiary,#858991);letter-spacing:.1em;text-transform:uppercase;font-size:10px;font-weight:650}.citwcW_subtitle,.citwcW_scopeHint{color:var(--dsw-alias-label-secondary,#a8abb2);font-size:12px}.citwcW_headerActions{gap:5px;display:flex}.citwcW_iconBtn,.citwcW_closeBtn{cursor:pointer;border:1px solid var(--dsw-alias-border-l2,#50535a);background:var(--dsw-alias-bg-layer-1,#2a2c30);width:30px;height:30px;color:var(--dsw-alias-label-primary,#eee);border-radius:8px;padding:0;font-family:inherit}.citwcW_iconBtn:hover,.citwcW_closeBtn:hover,.citwcW_btn:hover{background:var(--dsw-alias-interactive-bg-hover,#383b41)}.citwcW_closeBtn{color:var(--dsw-alias-label-secondary,#aaa);font-size:21px;line-height:1}.citwcW_scopeLine{color:var(--dsw-alias-label-primary,#eee);align-items:center;gap:7px;padding:12px 0 10px;font-size:12px;display:flex}.citwcW_liveDot{background:var(--dsw-alias-state-success-primary,#55d187);width:7px;height:7px;box-shadow:0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-success-primary,#55d187) 18%, transparent);border-radius:50%}.citwcW_autoRefresh{color:var(--dsw-alias-label-secondary,#aaa);font-size:11px}.citwcW_autoRefresh input{accent-color:var(--dsw-alias-state-success-primary,#55d187)}.citwcW_row{border-bottom:1px solid var(--dsw-alias-border-l1,#35373c);padding:13px 0}.citwcW_rowMain{flex-wrap:wrap;align-items:center;gap:7px;display:flex}.citwcW_name{font-size:14px;font-weight:650}.citwcW_muted{color:var(--dsw-alias-label-secondary,#999)}.citwcW_ok{color:var(--dsw-alias-state-success-primary,#55d187)}.citwcW_err{color:var(--dsw-alias-state-error-primary,#ff7c83)}.citwcW_warn{color:var(--dsw-alias-state-warn-primary,#e7b85d)}.citwcW_status{color:var(--dsw-alias-label-secondary,#a8abb2);margin:10px 0;font-size:11px}.citwcW_btn{cursor:pointer;border:1px solid var(--dsw-alias-border-l2,#50535a);background:var(--dsw-alias-bg-layer-1,#2a2c30);color:var(--dsw-alias-label-primary,#eee);font:inherit;border-radius:7px;margin-left:5px;padding:5px 9px;font-size:11px;text-decoration:none}.citwcW_badge{border:1px solid;border-radius:999px;padding:2px 7px;font-size:10px}.citwcW_input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#50535a);background:var(--dsw-alias-bg-layer-1,#2a2c30);color:var(--dsw-alias-label-primary,#eee);font:inherit;border-radius:8px;padding:8px 10px;font-size:12px}.citwcW_search{width:100%;margin-bottom:7px}.citwcW_spacer{flex:1}.citwcW_configBox{border:1px solid var(--dsw-alias-border-l1,#35373c);background:var(--dsw-alias-bg-layer-1,#292b30);border-radius:9px;margin:10px 0;padding:11px}.citwcW_configRow{align-items:center;gap:8px;margin-top:7px;display:flex}.citwcW_confirmRow{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary,#e7b85d) 9%, transparent);border-radius:8px;flex-wrap:wrap;align-items:center;gap:5px;margin-top:9px;padding:9px;display:flex}.citwcW_detailBox{border:1px solid var(--dsw-alias-border-l2,#50535a);background:var(--dsw-alias-bg-layer-1,#292b30);box-shadow:inset 3px 0 0 var(--dsw-alias-state-warn-primary,#e7b85d);border-radius:10px;margin-top:11px;padding:13px}.citwcW_detailHeader{justify-content:space-between;align-items:center;margin-bottom:12px;font-size:12px;font-weight:650;display:flex}.citwcW_detailAccent{color:var(--dsw-alias-state-warn-primary,#e7b85d);font-size:9px}.citwcW_detailGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;display:grid}.citwcW_detailGrid>div{flex-direction:column;gap:4px;min-width:0;display:flex}.citwcW_detailGrid code{overflow-wrap:anywhere;color:var(--dsw-alias-label-primary,#e7e8ea);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}.citwcW_evidenceBlock{border-top:1px solid var(--dsw-alias-border-l1,#3b3d42);margin-top:14px;padding-top:11px}.citwcW_evidenceItem{color:var(--dsw-alias-label-secondary,#b4b6bc);gap:7px;margin-top:6px;font-size:11px;display:flex}.citwcW_evidenceItem span{color:var(--dsw-alias-state-warn-primary,#e7b85d)}.citwcW_entry{border:1px solid var(--dsw-alias-border-l2);min-width:111px;height:32px;color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family);cursor:pointer;background:0 0;border-radius:18px;justify-content:center;align-items:center;gap:4px;padding:6px 12px;font-size:13px;font-weight:400;line-height:20px;display:inline-flex}.citwcW_entry:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.citwcW_entryLabel,.citwcW_entryIcon{white-space:nowrap;flex:none}@media (width<=640px){.citwcW_panel{width:calc(100vw - 20px);max-height:calc(100dvh - 20px);top:10px;right:10px}.citwcW_detailGrid{grid-template-columns:1fr}}@media (prefers-reduced-motion:reduce){.citwcW_panel{scroll-behavior:auto}}";
		const tagId = "@jiyr0119/dsh-service-console/service-console.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@jiyr0119/dsh-service-console";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var service_console_module_css_default = {
			"warn": "citwcW_warn",
			"ok": "citwcW_ok",
			"name": "citwcW_name",
			"evidenceItem": "citwcW_evidenceItem",
			"spacer": "citwcW_spacer",
			"configBox": "citwcW_configBox",
			"entry": "citwcW_entry",
			"muted": "citwcW_muted",
			"evidenceBlock": "citwcW_evidenceBlock",
			"eyebrow": "citwcW_eyebrow",
			"scopeHint": "citwcW_scopeHint",
			"detailAccent": "citwcW_detailAccent",
			"closeBtn": "citwcW_closeBtn",
			"badge": "citwcW_badge",
			"iconBtn": "citwcW_iconBtn",
			"autoRefresh": "citwcW_autoRefresh",
			"row": "citwcW_row",
			"rowMain": "citwcW_rowMain",
			"err": "citwcW_err",
			"panel": "citwcW_panel",
			"headerActions": "citwcW_headerActions",
			"scopeLine": "citwcW_scopeLine",
			"header": "citwcW_header",
			"search": "citwcW_search",
			"liveDot": "citwcW_liveDot",
			"status": "citwcW_status",
			"detailLabel": "citwcW_detailLabel",
			"configRow": "citwcW_configRow",
			"detailGrid": "citwcW_detailGrid",
			"entryLabel": "citwcW_entryLabel",
			"subtitle": "citwcW_subtitle",
			"input": "citwcW_input",
			"detailBox": "citwcW_detailBox",
			"titleBlock": "citwcW_titleBlock",
			"entryIcon": "citwcW_entryIcon",
			"btn": "citwcW_btn",
			"confirmRow": "citwcW_confirmRow",
			"detailHeader": "citwcW_detailHeader"
		};
		//#endregion
		//#region src/client/ServiceConsole.tsx
		let timerCtx = null;
		let localeCtx = null;
		function bindTimer(t) {
			timerCtx = t;
		}
		function bindLocale(locale) {
			localeCtx = locale;
		}
		function currentLanguage() {
			return String(localeCtx?.getLocale()?.id || "").toLowerCase().startsWith("zh") ? "zh" : "en";
		}
		async function api(path, payload) {
			const response = await fetch("/dsh-sc/api/" + path, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload)
			});
			const text = await response.text().catch(() => "");
			try {
				return JSON.parse(text || "{}");
			} catch {
				throw new Error("bad JSON response HTTP " + response.status);
			}
		}
		const store = {
			open: false,
			listeners: /* @__PURE__ */ new Set()
		};
		function subscribe(fn) {
			store.listeners.add(fn);
			return () => store.listeners.delete(fn);
		}
		function setOpen(v) {
			store.open = v;
			store.listeners.forEach((l) => l(v));
		}
		const OWNERSHIP = {
			"conversation-confirmed": {
				zh: "本次对话",
				en: "This chat",
				color: "var(--dsw-alias-state-success-primary, #4ade80)"
			},
			"workspace-inferred": {
				zh: "工作区推断",
				en: "Workspace",
				color: "var(--dsw-alias-state-warn-primary, #fbbf24)"
			},
			"other-local": {
				zh: "本机其他",
				en: "Other local",
				color: "var(--dsw-alias-label-secondary, #94a3b8)"
			},
			unknown: {
				zh: "未知",
				en: "Unknown",
				color: "var(--dsw-alias-state-error-primary, #f87171)"
			},
			protected: {
				zh: "受保护",
				en: "Protected",
				color: "var(--dsw-alias-state-error-primary, #f87171)"
			}
		};
		const ERROR_LABEL = {
			PERMISSION_DENIED: ["没有权限读取或控制该服务", "No permission"],
			TARGET_GONE: ["该服务已结束", "Service gone"],
			PID_REUSED: ["进程身份已变化，已取消操作", "PID reused"],
			UNKNOWN_OWNERSHIP: ["无法确认来源，不允许控制", "Unknown ownership"],
			PROTECTED_PROCESS: ["受保护进程，不能操作", "Protected process"],
			GRACEFUL_TIMEOUT: ["未在等待时间内退出", "Graceful timeout"],
			RESTART_UNSAFE: ["缺少安全启动信息，不能重启", "Cannot restart safely"],
			PORT_CONFLICT: ["端口仍被占用", "Port conflict"],
			START_TIMEOUT: ["未在预期时间开始监听", "Start timeout"]
		};
		const TEXTS = {
			zh: {
				title: "Service Console",
				subtitle: "本机监听服务",
				search: "搜索服务、端口或路径…",
				config: "配置",
				close: "关闭",
				noSvc: "未发现服务",
				stop: "停止",
				restart: "重启",
				detail: "详情",
				confirmStop: "确认停止?",
				confirmRestart: "确认重启?",
				confirmTxt: "确认对 {name} (pid {pid}) 执行{action}?",
				ok: "确认",
				cancel: "取消",
				stopped: "已停止",
				restarted: "已重启",
				evidence: "归属证据",
				refreshInterval: "自动刷新间隔(ms)",
				gracefulTimeout: "优雅超时(ms)",
				forceKill: "允许强制终止",
				allLocal: "全部本机服务",
				servicesFound: "项服务",
				lastScan: "最近扫描",
				closePanel: "关闭面板"
			},
			en: {
				title: "Service Console",
				subtitle: "Listening services on this Mac",
				search: "Search services, ports, or paths…",
				config: "Config",
				close: "Close",
				noSvc: "no services found",
				stop: "Stop",
				restart: "Restart",
				detail: "Detail",
				confirmStop: "Confirm stop?",
				confirmRestart: "Confirm restart?",
				confirmTxt: "Run {action} on {name} (pid {pid})?",
				ok: "OK",
				cancel: "Cancel",
				stopped: "Stopped",
				restarted: "Restarted",
				evidence: "Ownership evidence",
				refreshInterval: "Refresh interval (ms)",
				gracefulTimeout: "Graceful timeout (ms)",
				forceKill: "Allow force kill",
				allLocal: "All local services",
				servicesFound: "services",
				lastScan: "Last scan",
				closePanel: "Close panel"
			}
		};
		function ServiceConsoleEntry() {
			const [open, setLocal] = react.useState(store.open);
			const [lang, setLang] = react.useState(currentLanguage());
			react.useEffect(() => subscribe(setLocal), []);
			react.useEffect(() => localeCtx?.subscribe(() => setLang(currentLanguage())), []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				className: service_console_module_css_default.entry,
				onClick: () => setOpen(!store.open),
				title: lang === "zh" ? "服务控制台" : "Service Console",
				"aria-label": lang === "zh" ? "服务控制台" : "Service Console",
				children: [
					open ? "✕" : null,
					!open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: service_console_module_css_default.entryLabel,
						children: lang === "zh" ? "服务" : "Services"
					}) : null,
					!open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: service_console_module_css_default.entryIcon,
						children: "🖥"
					}) : null
				]
			});
		}
		function ServiceConsolePanel() {
			const [open, setLocal] = react.useState(store.open);
			const [lang, setLang] = react.useState(currentLanguage());
			const [query, setQuery] = react.useState("");
			const [showConfig, setShowConfig] = react.useState(false);
			const [configData, setConfigData] = react.useState(null);
			const [view, setView] = react.useState({
				phase: "idle",
				at: null,
				data: null,
				err: null
			});
			const [confirming, setConfirming] = react.useState(null);
			const [opResult, setOpResult] = react.useState(null);
			const [expanded, setExpanded] = react.useState(null);
			const timeoutRef = react.useRef(null);
			react.useEffect(() => subscribe(setLocal), []);
			react.useEffect(() => localeCtx?.subscribe(() => setLang(currentLanguage())), []);
			react.useEffect(() => () => {
				timeoutRef.current?.();
			}, []);
			const T = TEXTS[lang];
			const scan = react.useCallback(() => {
				const at = (/* @__PURE__ */ new Date()).toLocaleTimeString();
				setView((v) => ({
					phase: "scanning",
					at,
					data: v.data,
					err: null
				}));
				timeoutRef.current?.();
				timeoutRef.current = timerCtx?.timeout(() => {
					setView((v) => v.phase === "scanning" ? {
						phase: "timeout",
						at,
						data: v.data,
						err: "timeout"
					} : v);
				}, 8e3) ?? null;
				api("services/scan", {}).then((res) => {
					timeoutRef.current?.();
					timeoutRef.current = null;
					setView({
						phase: "done",
						at,
						data: res?.data ?? null,
						err: null
					});
				}).catch((e) => {
					timeoutRef.current?.();
					timeoutRef.current = null;
					setView({
						phase: "error",
						at,
						data: null,
						err: String(e?.message || e)
					});
				});
			}, []);
			const loadConfig = react.useCallback(() => {
				api("config", {}).then((res) => setConfigData(res?.data?.config ?? null)).catch(() => setConfigData(null));
			}, []);
			react.useEffect(() => {
				if (open && view.phase === "idle") scan();
			}, [
				open,
				scan,
				view.phase
			]);
			if (!open) return null;
			const runAction = (svc, action) => {
				setConfirming({
					id: svc.id,
					action
				});
				setOpResult(null);
			};
			const confirmAction = (svc, action) => {
				setConfirming(null);
				api("services/" + action, { serviceId: svc.id }).then((res) => {
					if (res?.ok) setOpResult({
						id: svc.id,
						ok: true,
						text: action === "stop" ? T.stopped : T.restarted
					});
					else {
						const code = res?.error?.code ?? "";
						const msg = res?.error?.message ?? "";
						setOpResult({
							id: svc.id,
							ok: false,
							text: ERROR_LABEL[code] ? ERROR_LABEL[code][lang === "zh" ? 0 : 1] : msg || "ERR"
						});
					}
					scan();
				}).catch(() => setOpResult({
					id: svc.id,
					ok: false,
					text: "RPC error"
				}));
			};
			const setConfig = (patch) => {
				api("config", {
					action: "update",
					patch
				}).then((res) => {
					if (res?.data) setConfigData(res.data.config);
				}).catch(() => void 0);
			};
			let rows = view.data?.services ?? [];
			if (query) {
				const q = String(query).toLowerCase();
				rows = rows.filter((s) => s.name.toLowerCase().indexOf(q) >= 0 || String(s.pid).indexOf(q) >= 0 || (s.commandSummary ?? "").toLowerCase().indexOf(q) >= 0 || (s.cwd ?? "").toLowerCase().indexOf(q) >= 0 || s.listeners.some((l) => String(l.port).indexOf(q) >= 0));
			}
			const status = view.phase === "scanning" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: service_console_module_css_default.status,
				children: [
					"⏳ ",
					T.lastScan,
					": ",
					view.at
				]
			}) : view.phase === "done" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: service_console_module_css_default.status,
				children: [
					"● ",
					String(rows.length),
					" ",
					T.servicesFound,
					" · ",
					T.lastScan,
					": ",
					view.at
				]
			}) : view.phase === "error" || view.phase === "timeout" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: service_console_module_css_default.err,
				children: ["⛔ ", view.err]
			}) : null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: service_console_module_css_default.panel,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: service_console_module_css_default.header,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: service_console_module_css_default.titleBlock,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: service_console_module_css_default.eyebrow,
									children: "DSH / LOCAL RUNTIME"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: T.title }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: service_console_module_css_default.subtitle,
									children: T.subtitle
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: service_console_module_css_default.headerActions,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: service_console_module_css_default.iconBtn,
									onClick: () => {
										setShowConfig(!showConfig);
										if (!showConfig) loadConfig();
									},
									"aria-label": T.config,
									children: "⚙"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: service_console_module_css_default.iconBtn,
									onClick: scan,
									"aria-label": "Refresh",
									children: "↻"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: service_console_module_css_default.closeBtn,
									onClick: () => setOpen(false),
									"aria-label": T.closePanel,
									children: "×"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: service_console_module_css_default.scopeLine,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: service_console_module_css_default.liveDot }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: T.allLocal }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: service_console_module_css_default.scopeHint,
								children: ["· ", T.subtitle]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: service_console_module_css_default.spacer })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: `${service_console_module_css_default.input} ${service_console_module_css_default.search}`,
						placeholder: T.search,
						value: query,
						onChange: (e) => setQuery(e.target.value)
					}),
					showConfig && configData ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: service_console_module_css_default.configBox,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: service_console_module_css_default.configRow,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: service_console_module_css_default.muted,
									children: T.refreshInterval
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									className: service_console_module_css_default.input,
									type: "number",
									defaultValue: configData.refreshInterval,
									onBlur: (e) => setConfig({ refreshInterval: parseInt(e.target.value, 10) })
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: service_console_module_css_default.configRow,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: service_console_module_css_default.muted,
									children: T.gracefulTimeout
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									className: service_console_module_css_default.input,
									type: "number",
									defaultValue: configData.gracefulTimeout,
									onBlur: (e) => setConfig({ gracefulTimeout: parseInt(e.target.value, 10) })
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: service_console_module_css_default.configRow,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: !!configData.forceKill,
										onChange: (e) => setConfig({ forceKill: e.target.checked })
									}),
									" ",
									T.forceKill
								]
							})
						]
					}) : null,
					status,
					(view.data?.partialWarnings ?? []).map((w, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: service_console_module_css_default.warn,
						children: ["⚠ ", w]
					}, `w${i}`)),
					rows.length === 0 && view.phase === "done" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: service_console_module_css_default.muted,
						children: T.noSvc
					}) : rows.map((svc) => {
						const badge = OWNERSHIP[svc.ownership] ?? OWNERSHIP.unknown;
						const ports = svc.listeners.map((l) => String(l.port)).join(", ");
						const url = svc.listeners.map((l) => l.url).filter(Boolean)[0] ?? null;
						const canControl = svc.ownership === "conversation-confirmed" || svc.ownership === "workspace-inferred" || svc.ownership === "other-local";
						const isConfirming = confirming?.id === svc.id;
						const result = opResult?.id === svc.id ? opResult : null;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: service_console_module_css_default.row,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: service_console_module_css_default.rowMain,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: service_console_module_css_default.ok,
											children: "●"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: service_console_module_css_default.name,
											children: svc.name
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: service_console_module_css_default.muted,
											children: [
												":",
												ports,
												" · pid ",
												String(svc.pid)
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: service_console_module_css_default.badge,
											style: { color: badge.color },
											children: lang === "zh" ? badge.zh : badge.en
										}),
										svc.restartable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: service_console_module_css_default.badge,
											style: { color: "var(--dsw-alias-state-success-primary, #4ade80)" },
											children: "↻"
										}) : null,
										url ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
											className: service_console_module_css_default.btn,
											href: url,
											target: "_blank",
											rel: "noreferrer",
											children: "🔗"
										}) : null,
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: service_console_module_css_default.spacer }),
										canControl ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											className: service_console_module_css_default.btn,
											onClick: () => runAction(svc, "stop"),
											children: isConfirming && confirming.action === "stop" ? T.confirmStop : T.stop
										}) : null,
										svc.restartable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											className: service_console_module_css_default.btn,
											onClick: () => runAction(svc, "restart"),
											children: isConfirming && confirming.action === "restart" ? T.confirmRestart : T.restart
										}) : null,
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											className: service_console_module_css_default.btn,
											onClick: () => setExpanded(expanded === svc.id ? null : svc.id),
											children: expanded === svc.id ? "▾" : T.detail
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: service_console_module_css_default.muted,
									children: (svc.commandSummary ? svc.commandSummary.slice(0, 100) : "(?)") + (svc.commandSummary && svc.commandSummary.length > 100 ? "…" : "")
								}),
								svc.cwd ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: service_console_module_css_default.muted,
									children: svc.cwd
								}) : null,
								result ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: result.ok ? service_console_module_css_default.ok : service_console_module_css_default.err,
									children: [result.ok ? "✅ " : "⛔ ", result.text]
								}) : null,
								isConfirming ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: service_console_module_css_default.confirmRow,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: service_console_module_css_default.muted,
											children: [T.confirmTxt.replace("{name}", svc.name).replace("{pid}", String(svc.pid)).replace("{action}", confirming.action === "stop" ? T.stop : T.restart), " "]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											className: service_console_module_css_default.btn,
											style: { color: "var(--dsw-alias-state-error-primary, #f87171)" },
											onClick: () => confirmAction(svc, confirming.action),
											children: T.ok
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											className: service_console_module_css_default.btn,
											onClick: () => setConfirming(null),
											children: T.cancel
										})
									]
								}) : null,
								expanded === svc.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: service_console_module_css_default.detailBox,
									role: "region",
									"aria-label": T.detail,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: service_console_module_css_default.detailHeader,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: T.detail }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: service_console_module_css_default.detailAccent,
												children: "SERVICE RECORD"
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: service_console_module_css_default.detailGrid,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: service_console_module_css_default.detailLabel,
													children: "SERVICE ID"
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: svc.id })] }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: service_console_module_css_default.detailLabel,
													children: "PROCESS"
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("code", { children: [
													"PID ",
													svc.pid,
													" · PGID ",
													String(svc.processGroupId ?? "-")
												] })] }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: service_console_module_css_default.detailLabel,
													children: "PARENT"
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("code", { children: ["PPID ", String(svc.parentPid ?? "-")] })] }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: service_console_module_css_default.detailLabel,
													children: "STARTED"
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: String(svc.startedAt ?? "-") })] })
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: service_console_module_css_default.evidenceBlock,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: service_console_module_css_default.detailLabel,
												children: T.evidence
											}), svc.ownershipEvidence.length ? svc.ownershipEvidence.map((ev, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												className: service_console_module_css_default.evidenceItem,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "↳" }), ev]
											}, i)) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: service_console_module_css_default.muted,
												children: "—"
											})]
										})
									]
								}) : null
							]
						}, svc.id);
					})
				]
			});
		}
		//#endregion
		module.exports = {
			inject: ["slots", "timer"],
			apply(ctx) {
				bindTimer(ctx.timer);
				const locale = ctx.get("locale");
				if (locale) bindLocale(locale);
				const slots = ctx.get("slots");
				if (slots === void 0) return;
				slots.inject("conversation.session.header.utilities", () => slots.register({
					name: "conversation.session.header.utilities",
					id: "sc-entry"
				}, () => react.createElement(ServiceConsoleEntry)));
				slots.inject("shell.overlay", () => slots.register({
					name: "shell.overlay",
					id: "sc-panel"
				}, () => react.createElement(ServiceConsolePanel)));
			}
		};
		return module.exports;
	}
});
