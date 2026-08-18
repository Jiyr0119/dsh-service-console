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
		const css = ".citwcW_panel{z-index:9999;background:var(--dsw-alias-bg-overlay,#262626);width:540px;max-height:min(640px,100dvh - 110px);color:var(--dsw-alias-label-primary,#eee);border:1px solid var(--dsw-alias-border-l1,#444);pointer-events:auto;border-radius:10px;padding:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;position:fixed;top:72px;right:20px;overflow:auto;box-shadow:0 8px 32px #00000059}.citwcW_header{flex-wrap:wrap;align-items:center;gap:6px;margin-bottom:6px;display:flex}.citwcW_row{border-bottom:1px solid var(--dsw-alias-border-l1,#333);padding:8px 0}.citwcW_rowMain{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.citwcW_name{font-weight:600}.citwcW_muted{color:var(--dsw-alias-label-secondary,#999)}.citwcW_ok{color:var(--dsw-alias-state-success-primary,#4ade80)}.citwcW_err{color:var(--dsw-alias-state-error-primary,#f87171)}.citwcW_warn{color:var(--dsw-alias-state-warn-primary,#fbbf24)}.citwcW_btn{cursor:pointer;border:1px solid var(--dsw-alias-border-l1,#555);background:var(--dsw-alias-bg-layer-1,#333);color:var(--dsw-alias-label-primary,#eee);border-radius:4px;margin-left:6px;padding:1px 6px;font-family:inherit;font-size:11px;text-decoration:none}.citwcW_badge{border:1px solid;border-radius:4px;padding:0 5px;font-size:10px}.citwcW_input{background:var(--dsw-alias-bg-layer-1,#333);color:var(--dsw-alias-label-primary,#eee);border:1px solid var(--dsw-alias-border-l1,#555);border-radius:4px;padding:2px 6px;font-family:inherit;font-size:11px}.citwcW_search{box-sizing:border-box;width:100%;margin-bottom:6px}.citwcW_spacer{flex:1}.citwcW_configBox{background:var(--dsw-alias-bg-layer-1,#333);border-radius:6px;margin-bottom:8px;padding:8px}.citwcW_configRow{align-items:center;gap:6px;margin-top:4px;display:flex}.citwcW_confirmRow{margin-top:4px}.citwcW_detailBox{background:var(--dsw-alias-bg-layer-1,#333);border-radius:6px;margin-top:4px;padding:6px}.citwcW_entry{border:1px solid var(--dsw-alias-border-l2);min-width:111px;height:32px;color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family);cursor:pointer;background:0 0;border-radius:18px;justify-content:center;align-items:center;gap:4px;padding:6px 12px;font-size:13px;font-weight:400;line-height:20px;display:inline-flex}.citwcW_entry:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.citwcW_entryLabel,.citwcW_entryIcon{white-space:nowrap;flex:none}";
		const tagId = "@jiyr0119/dsh-service-console/service-console.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@jiyr0119/dsh-service-console";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var service_console_module_css_default = {
			"entry": "citwcW_entry",
			"muted": "citwcW_muted",
			"header": "citwcW_header",
			"configRow": "citwcW_configRow",
			"detailBox": "citwcW_detailBox",
			"badge": "citwcW_badge",
			"confirmRow": "citwcW_confirmRow",
			"row": "citwcW_row",
			"ok": "citwcW_ok",
			"rowMain": "citwcW_rowMain",
			"btn": "citwcW_btn",
			"name": "citwcW_name",
			"spacer": "citwcW_spacer",
			"panel": "citwcW_panel",
			"err": "citwcW_err",
			"input": "citwcW_input",
			"search": "citwcW_search",
			"entryLabel": "citwcW_entryLabel",
			"entryIcon": "citwcW_entryIcon",
			"warn": "citwcW_warn",
			"configBox": "citwcW_configBox"
		};
		//#endregion
		//#region src/client/ServiceConsole.tsx
		let timerCtx = null;
		function bindTimer(t) {
			timerCtx = t;
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
				search: "搜索服务/端口/路径…",
				scopeConv: "本次对话",
				scopeWs: "工作区",
				scopeMachine: "本机",
				auto: "5s",
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
				forceKill: "允许强制终止"
			},
			en: {
				title: "Service Console",
				search: "Search services/ports/paths…",
				scopeConv: "This chat",
				scopeWs: "Workspace",
				scopeMachine: "This Mac",
				auto: "5s",
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
				forceKill: "Allow force kill"
			}
		};
		function ServiceConsoleEntry() {
			const [open, setLocal] = react.useState(store.open);
			react.useEffect(() => subscribe(setLocal), []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				className: service_console_module_css_default.entry,
				onClick: () => setOpen(!store.open),
				title: "Service Console",
				"aria-label": "Service Console",
				children: [
					open ? "✕" : null,
					!open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: service_console_module_css_default.entryLabel,
						children: "Services"
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
			const [lang, setLang] = react.useState("zh");
			const [scope, setScope] = react.useState("workspace");
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
			const [autoRefresh, setAutoRefresh] = react.useState(true);
			const timeoutRef = react.useRef(null);
			const intervalRef = react.useRef(null);
			react.useEffect(() => subscribe(setLocal), []);
			react.useEffect(() => () => {
				timeoutRef.current?.();
				intervalRef.current?.();
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
				if (open && autoRefresh) {
					intervalRef.current = timerCtx?.interval(() => scan(), 5e3) ?? null;
					return () => {
						intervalRef.current?.();
						intervalRef.current = null;
					};
				}
			}, [
				open,
				autoRefresh,
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
			if (scope === "conversation") rows = rows.filter((s) => s.ownership === "conversation-confirmed");
			else if (scope === "workspace") rows = rows.filter((s) => s.ownership === "conversation-confirmed" || s.ownership === "workspace-inferred");
			if (query) {
				const q = String(query).toLowerCase();
				rows = rows.filter((s) => s.name.toLowerCase().indexOf(q) >= 0 || String(s.pid).indexOf(q) >= 0 || (s.commandSummary ?? "").toLowerCase().indexOf(q) >= 0 || (s.cwd ?? "").toLowerCase().indexOf(q) >= 0 || s.listeners.some((l) => String(l.port).indexOf(q) >= 0));
			}
			const status = view.phase === "scanning" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: service_console_module_css_default.warn,
				children: ["⏳ ", view.at]
			}) : view.phase === "done" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: service_console_module_css_default.ok,
				children: [
					"✅ ",
					view.at,
					" · ",
					String(view.data?.count ?? 0),
					" · ledger=",
					String(view.data?.ledgerCount ?? 0)
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
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: T.title }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
								className: service_console_module_css_default.input,
								value: scope,
								onChange: (e) => setScope(e.target.value),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: "conversation",
										children: T.scopeConv
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: "workspace",
										children: T.scopeWs
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: "machine",
										children: T.scopeMachine
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: service_console_module_css_default.btn,
								onClick: () => setLang(lang === "zh" ? "en" : "zh"),
								children: lang === "zh" ? "EN" : "中"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: service_console_module_css_default.btn,
								onClick: () => {
									setShowConfig(!showConfig);
									if (!showConfig) loadConfig();
								},
								children: T.config
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: service_console_module_css_default.spacer }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: service_console_module_css_default.muted,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: autoRefresh,
										onChange: (e) => setAutoRefresh(e.target.checked)
									}),
									" ",
									T.auto
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: service_console_module_css_default.btn,
								onClick: scan,
								children: "↻"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: service_console_module_css_default.btn,
								onClick: () => setOpen(false),
								children: T.close
							})
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
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: service_console_module_css_default.muted,
											children: ["id: ", svc.id]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: service_console_module_css_default.muted,
											children: [
												"pgid: ",
												String(svc.processGroupId ?? "-"),
												" · ppid: ",
												String(svc.parentPid ?? "-"),
												" · startedAt: ",
												String(svc.startedAt ?? "-")
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: service_console_module_css_default.muted,
											children: [T.evidence, ":"]
										}),
										svc.ownershipEvidence.map((ev, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: service_console_module_css_default.muted,
											children: [" · ", ev]
										}, i))
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
