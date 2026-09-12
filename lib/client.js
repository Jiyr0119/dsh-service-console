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
		const css = ".citwcW_layer{z-index:100;pointer-events:none;position:fixed;inset:0}.citwcW_popup{background:var(--dsw-alias-bg-layer-2,#262626);border:1px solid var(--dsw-alias-border-inverted,#80808047);width:420px;box-shadow:var(--dsw-shadow-lv3,0 12px 32px #00000059);color:var(--dsw-alias-label-primary,#e8e8e8);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2,#80808066);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2,#80808099);pointer-events:auto;opacity:0;transform-origin:100% 0;border-radius:16px;flex-direction:column;font:13px/1.45 -apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Microsoft YaHei,sans-serif;transition:opacity .18s,transform .18s;display:flex;position:fixed;right:16px;overflow:hidden;transform:translateY(-8px)scale(.98)}.citwcW_popupOn{opacity:1;transform:translateY(0)scale(1)}@media (prefers-reduced-motion:reduce){.citwcW_popup{transition:none}}.citwcW_head{border-bottom:1px solid var(--dsw-alias-border-l3,#80808033);flex:none;align-items:center;gap:8px;padding:14px 16px 12px 18px;display:flex}.citwcW_headIco{color:var(--dsw-alias-state-business-primary,#4176e6);flex:none;display:inline-flex}.citwcW_headTitle{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;font-size:15px;font-weight:600;overflow:hidden}.citwcW_icoBtn{color:var(--dsw-alias-label-secondary,#9a9a9a);cursor:pointer;background:0 0;border:0;border-radius:8px;flex:none;justify-content:center;align-items:center;width:28px;height:28px;display:inline-flex}.citwcW_icoBtn:hover{background:var(--dsw-alias-interactive-bg-hover,#80808024);color:var(--dsw-alias-label-primary,#e8e8e8)}.citwcW_tabs{border-bottom:1px solid var(--dsw-alias-border-l3,#80808033);flex:none;gap:2px;padding:0 14px;display:flex}.citwcW_tab{height:36px;color:var(--dsw-alias-label-secondary,#9a9a9a);font:inherit;cursor:pointer;background:0 0;border:0;border-radius:10px 10px 0 0;flex:1;justify-content:center;align-items:center;gap:6px;font-size:12.5px;font-weight:500;display:inline-flex;position:relative}.citwcW_tab:hover{color:var(--dsw-alias-label-primary,#e8e8e8);background:var(--dsw-alias-interactive-bg-hover,#80808014)}.citwcW_tabOn{color:var(--dsw-alias-label-primary,#e8e8e8)}.citwcW_tabInd{background:var(--dsw-alias-state-business-primary,#4176e6);opacity:0;border-radius:999px;height:2px;transition:opacity .16s,transform .16s;position:absolute;bottom:-1px;left:24%;right:24%;transform:scaleX(.4)}.citwcW_tabOn .citwcW_tabInd{opacity:1;transform:scaleX(1)}.citwcW_tab:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4176e6);outline-offset:-2px}@media (prefers-reduced-motion:reduce){.citwcW_tabInd{transition:none}}.citwcW_tabBody{flex-direction:column;flex:1;min-height:0;display:flex;overflow:hidden auto}.citwcW_tabBody::-webkit-scrollbar{width:6px}.citwcW_tabBody::-webkit-scrollbar-thumb{background:var(--dsh-scrollbar-thumb);border-radius:3px}.citwcW_tabBody::-webkit-scrollbar-thumb:hover{background:var(--dsh-scrollbar-thumb-hover)}.citwcW_tabBody::-webkit-scrollbar-track{background:0 0}.citwcW_filterRow{align-items:center;gap:6px;padding:12px 16px 6px;display:flex}.citwcW_filter{min-width:0;height:30px;color:var(--dsw-alias-label-primary,#e8e8e8);border:1px solid var(--dsw-alias-border-l2,#80808059);font:inherit;background:0 0;border-radius:8px;outline:none;flex:1;padding:0 8px;font-size:12.5px}.citwcW_filter:focus-visible{border-color:var(--dsw-alias-state-business-primary,#4176e6)}.citwcW_filter::placeholder{color:var(--dsw-alias-label-caption,#8a8a8a)}.citwcW_filterClear{color:var(--dsw-alias-label-secondary,#9a9a9a);cursor:pointer;background:0 0;border:0;border-radius:6px;flex:none;justify-content:center;align-items:center;width:26px;height:26px;display:inline-flex}.citwcW_filterClear:hover{color:var(--dsw-alias-label-primary,#e8e8e8);background:var(--dsw-alias-interactive-bg-hover,#8080801f)}.citwcW_hintLine{color:var(--dsw-alias-label-caption,#8a8a8a);align-items:center;gap:6px;padding:4px 18px 8px;font-size:11px;display:flex}.citwcW_liveDot{background:var(--dsw-alias-state-success-primary,#55d187);width:7px;height:7px;box-shadow:0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-success-primary,#55d187) 18%, transparent);border-radius:50%;flex:none}.citwcW_row{border:1px solid var(--dsw-alias-border-l3,#80808026);background:var(--dsw-alias-bg-layer-1,#ffffff08);border-radius:12px;margin:0 12px 8px;padding:12px 16px;transition:background .12s,border-color .12s}.citwcW_row:hover{background:var(--dsw-alias-interactive-bg-hover,#80808014);border-color:var(--dsw-alias-border-l2,#80808040)}.citwcW_rowMain{flex-wrap:wrap;align-items:center;gap:8px;min-width:0;display:flex}.citwcW_rowDot{flex-shrink:0;font-size:8px;line-height:1}.citwcW_rowName{letter-spacing:-.01em;word-break:break-word;font-size:13px;font-weight:600}.citwcW_rowMeta{color:var(--dsw-alias-label-secondary,#9a9a9a);font-variant-numeric:tabular-nums;word-break:break-all;font-size:11.5px}.citwcW_rowSub{color:var(--dsw-alias-label-secondary,#9a9a9a);word-break:break-all;margin-top:4px;font-size:11.5px;line-height:1.4}.citwcW_spacer{flex:1}.citwcW_badge{white-space:nowrap;border:1px solid;border-radius:999px;padding:1px 6px;font-size:10px;font-weight:500}.citwcW_rowBtn{border:1px solid var(--dsw-alias-border-l2,#8080804d);height:24px;color:var(--dsw-alias-label-secondary,#9a9a9a);font:inherit;cursor:pointer;background:0 0;border-radius:6px;flex:none;justify-content:center;align-items:center;padding:0 7px;font-size:11px;transition:color .1s,background .1s;display:inline-flex}.citwcW_rowBtn:hover{color:var(--dsw-alias-label-primary,#e8e8e8);background:var(--dsw-alias-interactive-bg-hover,#8080801f)}.citwcW_rowAct{color:var(--dsw-alias-label-secondary,#9a9a9a);border-radius:5px;flex:none;justify-content:center;align-items:center;width:22px;height:22px;text-decoration:none;transition:color .1s,background .1s;display:inline-flex}.citwcW_rowAct:hover{color:var(--dsw-alias-state-business-primary,#4176e6);background:var(--dsw-alias-interactive-bg-hover,#8080801f)}.citwcW_confirmRow{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary,#e7b85d) 8%, transparent);border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary,#e7b85d) 15%, transparent);border-radius:10px;flex-wrap:wrap;align-items:center;gap:6px;margin-top:10px;padding:10px 12px;display:flex}.citwcW_confirmTxt{min-width:0;color:var(--dsw-alias-label-secondary,#b0b3ba);flex:1;font-size:12px}.citwcW_confirmOk{background:var(--dsw-alias-state-error-primary,#e5484d);color:#fff;height:26px;font:inherit;cursor:pointer;border:none;border-radius:7px;flex:none;padding:0 10px;font-size:11px;font-weight:500;transition:opacity .1s}.citwcW_confirmOk:hover{opacity:.85}.citwcW_confirmCancel{border:1px solid var(--dsw-alias-border-l2,#80808059);height:26px;color:var(--dsw-alias-label-secondary,#9a9a9a);font:inherit;cursor:pointer;background:0 0;border-radius:7px;flex:none;padding:0 10px;font-size:11px;transition:color .1s,background .1s}.citwcW_confirmCancel:hover{color:var(--dsw-alias-label-primary,#e8e8e8);background:var(--dsw-alias-interactive-bg-hover,#8080801f)}.citwcW_detailBox{border:1px solid var(--dsw-alias-border-l2,#8080804d);background:var(--dsw-alias-bg-layer-1,#00000026);box-shadow:inset 3px 0 0 var(--dsw-alias-state-business-primary,#4176e6);border-radius:10px;margin-top:10px;padding:14px}.citwcW_detailHead{justify-content:space-between;align-items:center;margin-bottom:12px;font-size:12px;font-weight:600;display:flex}.citwcW_detailAccent{color:var(--dsw-alias-state-business-primary,#4176e6);letter-spacing:.12em;text-transform:uppercase;font-size:9px;font-weight:650}.citwcW_detailGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;display:grid}.citwcW_detailGrid>div{flex-direction:column;gap:3px;min-width:0;display:flex}.citwcW_detailLabel{color:var(--dsw-alias-label-caption,#7a7d85);letter-spacing:.06em;text-transform:uppercase;font-size:10px;font-weight:600}.citwcW_detailGrid code{overflow-wrap:anywhere;word-break:break-all;color:var(--dsw-alias-label-primary,#d8d9dc);font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.citwcW_evidenceBlock{border-top:1px solid var(--dsw-alias-border-l3,#80808026);margin-top:14px;padding-top:12px;overflow:hidden}.citwcW_evidenceItem{color:var(--dsw-alias-label-secondary,#8a8d95);gap:6px;margin-top:5px;font-size:11px;line-height:1.4;display:flex}.citwcW_evidenceArrow{color:var(--dsw-alias-state-business-primary,#4176e6);flex:none;font-size:10px}.citwcW_note{color:var(--dsw-alias-label-caption,#8a8a8a);align-items:center;gap:8px;padding:6px 16px;font-size:12px;display:flex}.citwcW_noteErr{color:var(--dsw-alias-state-error-primary,#e5484d);padding:6px 16px;font-size:12px}.citwcW_noteWarn{color:var(--dsw-alias-state-warn-primary,#e7b85d);padding:6px 16px;font-size:12px}.citwcW_okText{color:var(--dsw-alias-state-success-primary,#55d187);margin-top:4px;font-size:12px}.citwcW_errText{color:var(--dsw-alias-state-error-primary,#e5484d);margin-top:4px;font-size:12px}.citwcW_empty{color:var(--dsw-alias-label-secondary,#9a9a9a);padding:24px 18px;font-size:12.5px}.citwcW_spin{border:2px solid var(--dsw-alias-border-l2,#80808066);border-top-color:var(--dsw-alias-state-business-primary,#4176e6);border-radius:50%;flex:none;width:13px;height:13px;animation:.7s linear infinite citwcW_sc-spin}@keyframes citwcW_sc-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.citwcW_spin{animation-duration:1.6s}}.citwcW_headerBtn{border:1px solid var(--dsw-alias-border-l2,#80808059);height:32px;color:var(--dsw-alias-label-primary,#e8e8e8);cursor:pointer;background:0 0;border-radius:18px;flex:none;justify-content:center;align-items:center;gap:4px;padding:6px 12px;font-size:13px;font-weight:400;line-height:20px;display:inline-flex}.citwcW_headerBtn span,.citwcW_headerBtn svg{flex:none}.citwcW_headerBtn span{white-space:nowrap}.citwcW_headerBtn:hover{background:var(--dsw-alias-interactive-bg-hover,#8080801f)}.citwcW_headerBtnOn{color:var(--dsw-alias-state-business-primary,#4176e6);border-color:#4176e680}.citwcW_setPage{padding:8px 16px 28px}.citwcW_setSection{letter-spacing:.05em;text-transform:uppercase;color:var(--dsw-alias-label-caption,#8a8a8a);padding:10px 4px 6px;font-size:11px;font-weight:600}.citwcW_setRow{border-radius:12px;align-items:center;gap:12px;padding:9px 10px;display:flex}.citwcW_setRow:hover{background:var(--dsw-alias-interactive-bg-hover,#8080800f)}.citwcW_setInfo{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.citwcW_setLabel{color:var(--dsw-alias-label-primary,#e8e8e8);font-size:12.5px}.citwcW_setCap{color:var(--dsw-alias-label-caption,#8a8a8a);font-size:11px}.citwcW_setInput{width:80px;min-width:80px;height:28px;color:var(--dsw-alias-label-primary,#e8e8e8);border:1px solid var(--dsw-alias-border-l2,#80808059);font:inherit;background:0 0;border-radius:8px;outline:none;flex:none;padding:0 8px;font-size:12px}.citwcW_setInput:focus-visible{border-color:var(--dsw-alias-state-business-primary,#4176e6)}.citwcW_switch{border:1px solid var(--dsw-alias-border-l2,#80808066);background:var(--dsw-alias-interactive-bg-hover,#8080802e);cursor:pointer;border-radius:999px;flex:none;width:34px;height:20px;padding:0;transition:background .15s,border-color .15s;position:relative}.citwcW_switch:after{content:\"\";background:var(--dsw-alias-label-secondary,#9a9a9a);border-radius:50%;width:14px;height:14px;transition:transform .15s;position:absolute;top:2px;left:2px}.citwcW_switch[aria-checked=true]{background:var(--dsw-alias-state-business-primary,#4176e6);border-color:#0000}.citwcW_switch[aria-checked=true]:after{background:#fff;transform:translate(14px)}@media (prefers-reduced-motion:reduce){.citwcW_switch,.citwcW_switch:after{transition:none}}.citwcW_prevBtn{border:1px solid var(--dsw-alias-border-l2,#80808059);height:28px;color:var(--dsw-alias-label-secondary,#9a9a9a);font:inherit;cursor:pointer;background:0 0;border-radius:8px;flex:none;justify-content:center;align-items:center;padding:0 10px;font-size:12px;display:inline-flex}.citwcW_prevBtn:hover{color:var(--dsw-alias-label-primary,#e8e8e8);background:var(--dsw-alias-interactive-bg-hover,#8080801f)}.citwcW_setFooter{justify-content:flex-end;padding:8px 4px 2px;display:flex}.citwcW_setNote{color:var(--dsw-alias-label-dimmed,#777);padding:2px 10px 8px;font-size:11px}.citwcW_starSection{border:1px solid var(--dsw-alias-border-l3,#80808026);background:var(--dsw-alias-bg-layer-1,#ffffff08);border-radius:12px;margin-top:12px;padding:12px 10px}.citwcW_starRow{align-items:center;gap:12px;display:flex}.citwcW_starInfo{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.citwcW_starLabel{color:var(--dsw-alias-label-primary,#e8e8e8);font-size:12.5px}.citwcW_starLink{color:var(--dsw-alias-state-business-primary,#4176e6);text-underline-offset:2px;white-space:nowrap;flex:none;font-size:12px;line-height:1.6;text-decoration:underline}.citwcW_starLink:hover{opacity:.85}.citwcW_rowBtn:focus-visible,.citwcW_headerBtn:focus-visible,.citwcW_icoBtn:focus-visible,.citwcW_prevBtn:focus-visible,.citwcW_filter:focus-visible,.citwcW_tab:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4176e6);outline-offset:-2px}@media (width<=480px){.citwcW_popup{width:calc(100vw - 16px);right:8px}.citwcW_detailGrid{grid-template-columns:1fr}}";
		const tagId = "@jiyr0119/dsh-service-console/service-console.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@jiyr0119/dsh-service-console";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var service_console_module_css_default = {
			"detailHead": "citwcW_detailHead",
			"filter": "citwcW_filter",
			"rowAct": "citwcW_rowAct",
			"detailAccent": "citwcW_detailAccent",
			"liveDot": "citwcW_liveDot",
			"empty": "citwcW_empty",
			"starLabel": "citwcW_starLabel",
			"starLink": "citwcW_starLink",
			"sc-spin": "citwcW_sc-spin",
			"headIco": "citwcW_headIco",
			"tabOn": "citwcW_tabOn",
			"badge": "citwcW_badge",
			"tab": "citwcW_tab",
			"icoBtn": "citwcW_icoBtn",
			"note": "citwcW_note",
			"setSection": "citwcW_setSection",
			"hintLine": "citwcW_hintLine",
			"detailLabel": "citwcW_detailLabel",
			"setInput": "citwcW_setInput",
			"filterClear": "citwcW_filterClear",
			"popup": "citwcW_popup",
			"setPage": "citwcW_setPage",
			"headerBtnOn": "citwcW_headerBtnOn",
			"setLabel": "citwcW_setLabel",
			"row": "citwcW_row",
			"starSection": "citwcW_starSection",
			"spin": "citwcW_spin",
			"switch": "citwcW_switch",
			"rowMain": "citwcW_rowMain",
			"confirmOk": "citwcW_confirmOk",
			"evidenceBlock": "citwcW_evidenceBlock",
			"setCap": "citwcW_setCap",
			"filterRow": "citwcW_filterRow",
			"confirmTxt": "citwcW_confirmTxt",
			"tabs": "citwcW_tabs",
			"tabInd": "citwcW_tabInd",
			"rowSub": "citwcW_rowSub",
			"errText": "citwcW_errText",
			"confirmCancel": "citwcW_confirmCancel",
			"confirmRow": "citwcW_confirmRow",
			"detailBox": "citwcW_detailBox",
			"setFooter": "citwcW_setFooter",
			"setInfo": "citwcW_setInfo",
			"popupOn": "citwcW_popupOn",
			"headTitle": "citwcW_headTitle",
			"noteErr": "citwcW_noteErr",
			"evidenceItem": "citwcW_evidenceItem",
			"rowDot": "citwcW_rowDot",
			"evidenceArrow": "citwcW_evidenceArrow",
			"rowBtn": "citwcW_rowBtn",
			"detailGrid": "citwcW_detailGrid",
			"setRow": "citwcW_setRow",
			"head": "citwcW_head",
			"okText": "citwcW_okText",
			"rowName": "citwcW_rowName",
			"starRow": "citwcW_starRow",
			"layer": "citwcW_layer",
			"noteWarn": "citwcW_noteWarn",
			"headerBtn": "citwcW_headerBtn",
			"prevBtn": "citwcW_prevBtn",
			"tabBody": "citwcW_tabBody",
			"setNote": "citwcW_setNote",
			"starInfo": "citwcW_starInfo",
			"spacer": "citwcW_spacer",
			"rowMeta": "citwcW_rowMeta"
		};
		//#endregion
		//#region src/client/ServiceConsole.tsx
		/**
		* dsh-service-console — 面板组件（原生包 v2）
		*
		* 架构对齐 dsh-workspace-explorer:
		* - i18n: 通过 locale.bind(NS) 获取翻译函数（而非硬编码 TEXTS）
		* - API: 通过 fetch 直连 webServer JSON 路由（不走 host.call / LLM）
		* - UI: 抽屉式面板 + Tab 栏（服务 / 设置），对标 workspace-explorer 视觉风格
		*/
		let timerCtx = null;
		let localeCtx = null;
		let tr = (k) => k;
		function bindTimer(t) {
			timerCtx = t;
		}
		function bindLocale(locale) {
			localeCtx = locale;
			try {
				const bound = locale.bind("dsh-service-console");
				tr = (key, vars) => {
					let s = bound(key);
					if (typeof s !== "string" || s === key) s = key;
					if (vars) for (const vk in vars) s = s.split(`{${vk}}`).join(String(vars[vk]));
					return s;
				};
			} catch {}
		}
		async function api(path, payload) {
			const res = await fetch("/dsh-sc/api/" + path, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload)
			});
			const text = await res.text().catch(() => "");
			try {
				return JSON.parse(text || "{}");
			} catch {
				throw new Error("bad JSON HTTP " + res.status);
			}
		}
		const store = {
			open: false,
			listeners: /* @__PURE__ */ new Set()
		};
		function subscribeOpen(fn) {
			store.listeners.add(fn);
			return () => {
				store.listeners.delete(fn);
			};
		}
		function setOpen(v) {
			store.open = v;
			store.listeners.forEach((l) => l(v));
		}
		function toggleOpen() {
			setOpen(!store.open);
		}
		function closePanel() {
			setOpen(false);
		}
		const OWNERSHIP_COLOR = {
			"conversation-confirmed": "var(--dsw-alias-state-success-primary, #4ade80)",
			"workspace-inferred": "var(--dsw-alias-state-warn-primary, #fbbf24)",
			"other-local": "var(--dsw-alias-label-secondary, #94a3b8)",
			unknown: "var(--dsw-alias-state-error-primary, #f87171)",
			protected: "var(--dsw-alias-state-error-primary, #f87171)"
		};
		const OWNERSHIP_KEY = {
			"conversation-confirmed": "own.conversation",
			"workspace-inferred": "own.workspace",
			"other-local": "own.other",
			unknown: "own.unknown",
			protected: "own.protected"
		};
		function measurePopup() {
			const vh = window.innerHeight;
			const header = document.querySelector("[data-slot=\"conversation.session.header\"]");
			const composer = document.querySelector("[data-composer-card]");
			const top = header ? Math.round(header.getBoundingClientRect().bottom) + 8 : 48;
			const bottomLimit = composer ? Math.round(composer.getBoundingClientRect().top) - 8 : vh - 48;
			return {
				top,
				height: Math.max(280, bottomLimit - top)
			};
		}
		function ServiceConsoleEntry() {
			const [on, setOn] = react.useState(store.open);
			react.useEffect(() => subscribeOpen(setOn), []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: service_console_module_css_default.headerBtn + (on ? " " + service_console_module_css_default.headerBtnOn : ""),
				onClick: toggleOpen,
				title: tr("entry.tip"),
				"aria-label": tr("entry.tip"),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("entry.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 16 16",
					width: 13,
					height: 13,
					"aria-hidden": "true",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: 2,
						y: 3,
						width: 12,
						height: 10,
						rx: 1.5,
						fill: "none",
						stroke: "currentColor",
						strokeWidth: 1.3
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M5 7h6M5 10h4",
						stroke: "currentColor",
						strokeWidth: 1.2,
						strokeLinecap: "round"
					})]
				})]
			});
		}
		function ServiceConsoleSettings() {
			const [config, setConfig] = react.useState(null);
			react.useEffect(() => {
				api("config", {}).then((res) => setConfig(res?.data?.config ?? null)).catch(() => {});
			}, []);
			const updateConfig = (patch) => {
				api("config", {
					action: "update",
					patch
				}).then((res) => {
					if (res?.data) setConfig(res.data.config);
				}).catch(() => {});
			};
			if (!config) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: service_console_module_css_default.setPage,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: service_console_module_css_default.note,
					children: "Loading…"
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: service_console_module_css_default.setPage,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: service_console_module_css_default.setSection,
						children: tr("settings.general")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: service_console_module_css_default.setRow,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: service_console_module_css_default.setInfo,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: service_console_module_css_default.setLabel,
								children: tr("settings.gracefulTimeout")
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: service_console_module_css_default.setInput,
							type: "number",
							defaultValue: config.gracefulTimeout,
							onBlur: (e) => updateConfig({ gracefulTimeout: parseInt(e.target.value, 10) })
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: service_console_module_css_default.setRow,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: service_console_module_css_default.setInfo,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: service_console_module_css_default.setLabel,
								children: tr("settings.forceKill")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: service_console_module_css_default.setCap,
								children: tr("settings.forceKill.desc")
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							role: "switch",
							"aria-checked": config.forceKill,
							className: service_console_module_css_default.switch,
							onClick: () => updateConfig({ forceKill: !config.forceKill })
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: service_console_module_css_default.setFooter,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: service_console_module_css_default.prevBtn,
							onClick: () => updateConfig({
								gracefulTimeout: 3e3,
								forceKill: false
							}),
							children: tr("settings.restore")
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: service_console_module_css_default.setNote,
						children: tr("settings.note")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: service_console_module_css_default.starSection,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: service_console_module_css_default.starRow,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: service_console_module_css_default.starInfo,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: service_console_module_css_default.starLabel,
									children: tr("star.ask")
								})
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								className: service_console_module_css_default.starLink,
								href: "https://github.com/Jiyr0119/dsh-service-console",
								target: "_blank",
								rel: "noreferrer",
								children: tr("star.cta")
							})]
						})
					})
				]
			});
		}
		function ServiceConsolePanel() {
			const [on, setOn] = react.useState(store.open);
			const [shown, setShown] = react.useState(false);
			const [closing, setClosing] = react.useState(false);
			const [rect, setRect] = react.useState({
				top: 48,
				height: 480
			});
			const [tab, setTab] = react.useState("services");
			const [query, setQuery] = react.useState("");
			const [view, setView] = react.useState({
				phase: "idle",
				at: null,
				data: null,
				err: null
			});
			const [confirming, setConfirming] = react.useState(null);
			const [opResult, setOpResult] = react.useState(null);
			const [expanded, setExpanded] = react.useState(null);
			const [config, setConfig] = react.useState(null);
			const [, setLangTick] = react.useState(0);
			const timeoutRef = react.useRef(null);
			react.useEffect(() => subscribeOpen(setOn), []);
			react.useEffect(() => localeCtx?.subscribe(() => setLangTick((n) => n + 1)), []);
			react.useEffect(() => {
				if (on) {
					setClosing(false);
					setShown(false);
					const raf = requestAnimationFrame(() => setShown(true));
					return () => cancelAnimationFrame(raf);
				}
				setShown(false);
				setClosing(true);
				const t = setTimeout(() => setClosing(false), 200);
				return () => clearTimeout(t);
			}, [on]);
			react.useEffect(() => {
				const onKey = (e) => {
					if (e.key === "Escape") closePanel();
				};
				document.addEventListener("keydown", onKey);
				return () => document.removeEventListener("keydown", onKey);
			}, []);
			react.useEffect(() => {
				const update = () => setRect(measurePopup());
				update();
				const ro = new ResizeObserver(update);
				const header = document.querySelector("[data-slot=\"conversation.session.header\"]");
				const composer = document.querySelector("[data-composer-card]");
				if (header) ro.observe(header);
				if (composer) ro.observe(composer);
				window.addEventListener("resize", update);
				return () => {
					ro.disconnect();
					window.removeEventListener("resize", update);
				};
			}, []);
			react.useEffect(() => () => {
				timeoutRef.current?.();
			}, []);
			react.useEffect(() => {
				api("config", {}).then((res) => setConfig(res?.data?.config ?? null)).catch(() => {});
			}, []);
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
			react.useEffect(() => {
				if (on && view.phase === "idle") scan();
			}, [
				on,
				scan,
				view.phase
			]);
			if (!on && !closing) return null;
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
						text: action === "stop" ? tr("result.stopped") : tr("result.restarted")
					});
					else {
						const code = res?.error?.code ?? "";
						setOpResult({
							id: svc.id,
							ok: false,
							text: tr("err." + code) || res?.error?.message || tr("result.error")
						});
					}
					scan();
				}).catch(() => setOpResult({
					id: svc.id,
					ok: false,
					text: "RPC error"
				}));
			};
			let rows = view.data?.services ?? [];
			if (query) {
				const q = query.toLowerCase();
				rows = rows.filter((s) => s.name.toLowerCase().includes(q) || String(s.pid).includes(q) || (s.commandSummary ?? "").toLowerCase().includes(q) || (s.cwd ?? "").toLowerCase().includes(q) || s.listeners.some((l) => String(l.port).includes(q)));
			}
			const servicesBody = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: service_console_module_css_default.filterRow,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: service_console_module_css_default.filter,
						type: "text",
						value: query,
						placeholder: tr("search.ph"),
						onChange: (e) => setQuery(e.target.value)
					}), query !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: service_console_module_css_default.filterClear,
						onClick: () => setQuery(""),
						title: tr("action.cancel"),
						"aria-label": tr("action.cancel"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
							viewBox: "0 0 16 16",
							width: 12,
							height: 12,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
								d: "M4 4l8 8M12 4l-8 8",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: 1.5,
								strokeLinecap: "round"
							})
						})
					}) : null]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: service_console_module_css_default.hintLine,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: service_console_module_css_default.liveDot }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("panel.subtitle") })]
				}),
				view.phase === "scanning" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: service_console_module_css_default.note,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: service_console_module_css_default.spin }), tr("status.scanning")]
				}) : view.phase === "error" || view.phase === "timeout" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: service_console_module_css_default.noteErr,
					children: [
						tr("status.error"),
						": ",
						view.err
					]
				}) : null,
				(view.data?.partialWarnings ?? []).map((w, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: service_console_module_css_default.noteWarn,
					children: ["⚠ ", w]
				}, `w${i}`)),
				rows.length === 0 && view.phase === "done" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: service_console_module_css_default.empty,
					children: tr("svc.noSvc")
				}) : rows.map((svc) => {
					const badgeColor = OWNERSHIP_COLOR[svc.ownership] ?? OWNERSHIP_COLOR.unknown;
					const badgeKey = OWNERSHIP_KEY[svc.ownership] ?? "own.unknown";
					const ports = svc.listeners.map((l) => String(l.port)).join(", ");
					const url = svc.listeners.map((l) => l.url).filter(Boolean)[0] ?? null;
					const canControl = !svc.protected;
					const isConfirming = confirming?.id === svc.id;
					const result = opResult?.id === svc.id ? opResult : null;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: service_console_module_css_default.row,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: service_console_module_css_default.rowMain,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: service_console_module_css_default.rowDot,
										style: { color: badgeColor },
										children: "●"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: service_console_module_css_default.rowName,
										children: svc.name
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: service_console_module_css_default.rowMeta,
										children: [
											":",
											ports,
											" · pid ",
											svc.pid
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: service_console_module_css_default.badge,
										style: { color: badgeColor },
										children: tr(badgeKey)
									}),
									svc.restartable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: service_console_module_css_default.badge,
										style: { color: "var(--dsw-alias-state-success-primary, #4ade80)" },
										children: "↻"
									}) : null,
									url ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
										className: service_console_module_css_default.rowAct,
										href: url,
										target: "_blank",
										rel: "noreferrer",
										title: url,
										onClick: (e) => e.stopPropagation(),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
											viewBox: "0 0 16 16",
											width: 12,
											height: 12,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
												d: "M6.5 3.5h-3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3M9 2.5h4.5V7M13.5 2.5L7.5 8.5",
												fill: "none",
												stroke: "currentColor",
												strokeWidth: 1.3,
												strokeLinecap: "round",
												strokeLinejoin: "round"
											})
										})
									}) : null,
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: service_console_module_css_default.spacer }),
									canControl ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: service_console_module_css_default.rowBtn,
										onClick: (e) => {
											e.stopPropagation();
											runAction(svc, "stop");
										},
										children: isConfirming && confirming.action === "stop" ? tr("confirm.stop") : tr("action.stop")
									}) : null,
									svc.restartable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: service_console_module_css_default.rowBtn,
										onClick: (e) => {
											e.stopPropagation();
											runAction(svc, "restart");
										},
										children: isConfirming && confirming.action === "restart" ? tr("confirm.restart") : tr("action.restart")
									}) : null,
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: service_console_module_css_default.rowBtn,
										onClick: (e) => {
											e.stopPropagation();
											setExpanded(expanded === svc.id ? null : svc.id);
										},
										children: expanded === svc.id ? "▾" : tr("action.detail")
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: service_console_module_css_default.rowSub,
								children: (svc.commandSummary ? svc.commandSummary.slice(0, 100) : "(?)") + (svc.commandSummary && svc.commandSummary.length > 100 ? "…" : "")
							}),
							svc.cwd ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: service_console_module_css_default.rowSub,
								children: svc.cwd
							}) : null,
							result ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: result.ok ? service_console_module_css_default.okText : service_console_module_css_default.errText,
								children: [result.ok ? "✅ " : "⛔ ", result.text]
							}) : null,
							isConfirming ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: service_console_module_css_default.confirmRow,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: service_console_module_css_default.confirmTxt,
										children: tr("confirm.txt", {
											name: svc.name,
											pid: String(svc.pid),
											action: confirming.action === "stop" ? tr("action.stop") : tr("action.restart")
										})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: service_console_module_css_default.confirmOk,
										onClick: () => confirmAction(svc, confirming.action),
										children: tr("action.confirm")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: service_console_module_css_default.confirmCancel,
										onClick: () => setConfirming(null),
										children: tr("action.cancel")
									})
								]
							}) : null,
							expanded === svc.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: service_console_module_css_default.detailBox,
								role: "region",
								"aria-label": tr("detail.title"),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: service_console_module_css_default.detailHead,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("detail.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: service_console_module_css_default.detailAccent,
											children: tr("detail.serviceRecord")
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: service_console_module_css_default.detailGrid,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: service_console_module_css_default.detailLabel,
												children: tr("detail.serviceId")
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: svc.id })] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: service_console_module_css_default.detailLabel,
												children: tr("detail.process")
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("code", { children: [
												"PID ",
												svc.pid,
												" · PGID ",
												String(svc.processGroupId ?? "-")
											] })] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: service_console_module_css_default.detailLabel,
												children: tr("detail.parent")
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("code", { children: ["PPID ", String(svc.parentPid ?? "-")] })] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: service_console_module_css_default.detailLabel,
												children: tr("detail.started")
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: String(svc.startedAt ?? "-") })] })
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: service_console_module_css_default.evidenceBlock,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: service_console_module_css_default.detailLabel,
											children: tr("detail.evidence")
										}), svc.ownershipEvidence.length ? svc.ownershipEvidence.map((ev, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: service_console_module_css_default.evidenceItem,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: service_console_module_css_default.evidenceArrow,
												children: "↳"
											}), ev]
										}, i)) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: service_console_module_css_default.rowSub,
											children: "—"
										})]
									})
								]
							}) : null
						]
					}, svc.id);
				})
			] });
			const settingsBody = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ServiceConsoleSettings, {});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: service_console_module_css_default.layer,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: service_console_module_css_default.popup + (shown ? " " + service_console_module_css_default.popupOn : ""),
					style: {
						top: rect.top,
						height: rect.height
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: service_console_module_css_default.head,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: service_console_module_css_default.headIco,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
										viewBox: "0 0 16 16",
										width: 17,
										height: 17,
										"aria-hidden": "true",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											x: 2,
											y: 3,
											width: 12,
											height: 10,
											rx: 1.5,
											fill: "none",
											stroke: "currentColor",
											strokeWidth: 1.3
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											d: "M5 7h6M5 10h4",
											stroke: "currentColor",
											strokeWidth: 1.2,
											strokeLinecap: "round"
										})]
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: service_console_module_css_default.headTitle,
									children: tr("panel.title")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: service_console_module_css_default.icoBtn,
									onClick: scan,
									title: tr("status.lastScan"),
									"aria-label": tr("status.lastScan"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
										viewBox: "0 0 16 16",
										width: 14,
										height: 14,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											d: "M13.5 8a5.5 5.5 0 1 1-1.61-3.89M13.5 1.5v3h-3",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: 1.5,
											strokeLinecap: "round"
										})
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: service_console_module_css_default.icoBtn,
									onClick: closePanel,
									title: tr("action.cancel"),
									"aria-label": tr("action.cancel"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
										viewBox: "0 0 16 16",
										width: 14,
										height: 14,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											d: "M4 4l8 8M12 4l-8 8",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: 1.5,
											strokeLinecap: "round"
										})
									})
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: service_console_module_css_default.tabs,
							role: "tablist",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "tab",
								"aria-selected": tab === "services",
								className: service_console_module_css_default.tab + (tab === "services" ? " " + service_console_module_css_default.tabOn : ""),
								onClick: () => setTab("services"),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
										viewBox: "0 0 16 16",
										width: 13,
										height: 13,
										"aria-hidden": "true",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											x: 2,
											y: 3,
											width: 12,
											height: 10,
											rx: 1.5,
											fill: "none",
											stroke: "currentColor",
											strokeWidth: 1.3
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											d: "M5 7h6M5 10h4",
											stroke: "currentColor",
											strokeWidth: 1.2,
											strokeLinecap: "round"
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("tab.services") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: service_console_module_css_default.tabInd })
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "tab",
								"aria-selected": tab === "settings",
								className: service_console_module_css_default.tab + (tab === "settings" ? " " + service_console_module_css_default.tabOn : ""),
								onClick: () => setTab("settings"),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
										viewBox: "0 0 16 16",
										width: 13,
										height: 13,
										"aria-hidden": "true",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
											cx: 8,
											cy: 8,
											r: 2.5,
											fill: "none",
											stroke: "currentColor",
											strokeWidth: 1.3
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											d: "M8 4.3V2.9M8 13.1v-1.4M4.3 8H2.9M13.1 8h-1.4M5.2 5.2L4.1 4.1M11.9 11.9l-1.1-1.1M5.2 10.8L4.1 11.9M11.9 4.1l-1.1 1.1",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: 1.2,
											strokeLinecap: "round"
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("tab.settings") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: service_console_module_css_default.tabInd })
								]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: service_console_module_css_default.tabBody,
							children: tab === "services" ? servicesBody : settingsBody
						})
					]
				})
			});
		}
		//#endregion
		//#region src/client/dictionaries.ts
		/**
		* dsh-service-console — i18n 词典（对齐 DSH locale.register 机制）
		* 与 dsh-workspace-explorer 共享设计语言：flat key → template string with {vars}
		*/
		const ZH_DICT = {
			"plugin.name": "服务控制台",
			"panel.title": "Service Console",
			"panel.subtitle": "本机监听服务",
			"entry.label": "服务",
			"entry.tip": "服务控制台",
			"search.ph": "搜索服务、端口或路径…",
			"status.scanning": "正在扫描…",
			"status.done": "{n} 项服务",
			"status.lastScan": "最近扫描",
			"status.error": "扫描失败",
			"svc.noSvc": "未发现服务",
			"svc.ports": "端口",
			"svc.pid": "pid",
			"svc.command": "命令",
			"svc.cwd": "工作目录",
			"action.stop": "停止",
			"action.restart": "重启",
			"action.detail": "详情",
			"action.confirm": "确认",
			"action.cancel": "取消",
			"confirm.stop": "确认停止?",
			"confirm.restart": "确认重启?",
			"confirm.txt": "确认对 {name} (pid {pid}) 执行 {action}?",
			"result.stopped": "已停止",
			"result.restarted": "已重启",
			"result.error": "操作失败",
			"own.conversation": "本次对话",
			"own.workspace": "工作区推断",
			"own.other": "本机其他",
			"own.unknown": "未知",
			"own.protected": "受保护",
			"detail.title": "详情",
			"detail.serviceRecord": "SERVICE RECORD",
			"detail.serviceId": "SERVICE ID",
			"detail.process": "PROCESS",
			"detail.parent": "PARENT",
			"detail.started": "STARTED",
			"detail.evidence": "归属证据",
			"err.PERMISSION_DENIED": "没有权限读取或控制该服务",
			"err.TARGET_GONE": "该服务已结束",
			"err.PID_REUSED": "进程身份已变化，已取消操作",
			"err.UNKNOWN_OWNERSHIP": "无法确认来源，不允许控制",
			"err.PROTECTED_PROCESS": "受保护进程，不能操作",
			"err.GRACEFUL_TIMEOUT": "未在等待时间内退出",
			"err.RESTART_UNSAFE": "缺少安全启动信息，不能重启",
			"err.PORT_CONFLICT": "端口仍被占用",
			"err.START_TIMEOUT": "未在预期时间开始监听",
			"tab.services": "服务",
			"tab.settings": "设置",
			"settings.title": "面板设置",
			"settings.general": "通用",
			"settings.gracefulTimeout": "优雅超时 (ms)",
			"settings.forceKill": "允许强制终止",
			"settings.forceKill.desc": "优雅超时后发送 SIGKILL",
			"settings.restore": "恢复默认",
			"settings.note": "配置在本次会话内生效，重启插件后恢复默认。",
			"settings.nav": "Service Console",
			"star.developer": "开发者",
			"star.ask": "⭐ 顺手留颗 Star，作者能高兴一整天",
			"star.cta": "行，给你一颗 Star"
		};
		const EN_DICT = {
			"plugin.name": "Service Console",
			"panel.title": "Service Console",
			"panel.subtitle": "Listening services on this machine",
			"entry.label": "Services",
			"entry.tip": "Service Console",
			"search.ph": "Search services, ports, or paths…",
			"status.scanning": "Scanning…",
			"status.done": "{n} services",
			"status.lastScan": "Last scan",
			"status.error": "Scan failed",
			"svc.noSvc": "no services found",
			"svc.ports": "Ports",
			"svc.pid": "pid",
			"svc.command": "Command",
			"svc.cwd": "Working dir",
			"action.stop": "Stop",
			"action.restart": "Restart",
			"action.detail": "Detail",
			"action.confirm": "OK",
			"action.cancel": "Cancel",
			"confirm.stop": "Confirm stop?",
			"confirm.restart": "Confirm restart?",
			"confirm.txt": "Run {action} on {name} (pid {pid})?",
			"result.stopped": "Stopped",
			"result.restarted": "Restarted",
			"result.error": "Action failed",
			"own.conversation": "This chat",
			"own.workspace": "Workspace",
			"own.other": "Other local",
			"own.unknown": "Unknown",
			"own.protected": "Protected",
			"detail.title": "Detail",
			"detail.serviceRecord": "SERVICE RECORD",
			"detail.serviceId": "SERVICE ID",
			"detail.process": "PROCESS",
			"detail.parent": "PARENT",
			"detail.started": "STARTED",
			"detail.evidence": "Ownership evidence",
			"err.PERMISSION_DENIED": "No permission",
			"err.TARGET_GONE": "Service gone",
			"err.PID_REUSED": "PID reused",
			"err.UNKNOWN_OWNERSHIP": "Unknown ownership",
			"err.PROTECTED_PROCESS": "Protected process",
			"err.GRACEFUL_TIMEOUT": "Graceful timeout",
			"err.RESTART_UNSAFE": "Cannot restart safely",
			"err.PORT_CONFLICT": "Port conflict",
			"err.START_TIMEOUT": "Start timeout",
			"tab.services": "Services",
			"tab.settings": "Settings",
			"settings.title": "Panel settings",
			"settings.general": "General",
			"settings.gracefulTimeout": "Graceful timeout (ms)",
			"settings.forceKill": "Allow force kill",
			"settings.forceKill.desc": "Send SIGKILL after graceful timeout",
			"settings.restore": "Reset to defaults",
			"settings.note": "Settings apply for this run; they reset when the plugin restarts.",
			"settings.nav": "Service Console",
			"star.developer": "Developer",
			"star.ask": "⭐ Drop a Star if it helped — it makes the author's day",
			"star.cta": "★ Give a Star"
		};
		//#endregion
		//#region src/client/index.tsx
		/**
		* dsh-service-console — Client 入口（原生包 v2）
		*
		* 架构对齐 dsh-workspace-explorer:
		* - 通过 locale.register + locale.bind 实现国际化（而非硬编码 TEXTS）
		* - 通过 webServer JSON 路由调用 Host（fetch 直连，不走 host.call / LLM）
		* - 注册 DSH 设置壳的 settings.section 页
		* - 注册 shell.overlay 抽屉面板 + header 入口按钮
		*/
		const NS = "dsh-service-console";
		let labelFn = (k) => k;
		//#endregion
		module.exports = {
			inject: ["slots", "timer"],
			apply(ctx) {
				bindTimer(ctx.timer);
				const slots = ctx.get("slots");
				if (slots === void 0) return;
				const locale = ctx.get("locale");
				if (locale !== void 0) try {
					ctx.effect(() => {
						const d1 = locale.register(NS, "zh", ZH_DICT);
						const d2 = locale.register(NS, "en", EN_DICT);
						return () => {
							d1();
							d2();
						};
					});
					bindLocale(locale);
					const bound = locale.bind(NS);
					labelFn = (key) => {
						const s = bound(key);
						return typeof s === "string" && s !== key ? s : key;
					};
					locale.subscribe(() => {
						const b = locale.bind(NS);
						labelFn = (key) => {
							const s = b(key);
							return typeof s === "string" && s !== key ? s : key;
						};
					});
				} catch (err) {
					console.warn("[dsh-sc] locale init failed, fallback zh", String(err));
				}
				slots.inject("conversation.session.header.utilities", () => slots.register({
					name: "conversation.session.header.utilities",
					id: "dsh-service-console",
					order: 25,
					label: () => labelFn("plugin.name")
				}, () => react.createElement(ServiceConsoleEntry)));
				slots.inject("shell.overlay", () => slots.register({
					name: "shell.overlay",
					id: "dsh-service-console-panel"
				}, () => react.createElement(ServiceConsolePanel)));
				slots.inject("settings.section", () => slots.register({
					name: "settings.section",
					id: "dsh-service-console",
					order: 35,
					label: () => labelFn("plugin.name")
				}, () => react.createElement(ServiceConsoleSettings)));
			}
		};
		return module.exports;
	}
});
