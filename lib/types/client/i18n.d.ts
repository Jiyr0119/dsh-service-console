/**
 * i18n 注册/绑定（热挂载与双装载幂等，0.7.1；locale 晚到反应式挂载，0.7.2）
 *
 * 桌面 dshmarket 热更新会把插件装载两次：第二次 locale.register 抛
 * "already has locale"，webServer.register 抛 "duplicate exact route"。
 * 0.5–0.7.0 的初始化在异常后直接放弃绑定，导致 UI 退回原始键。
 * 这里把注册做成幂等（已注册即跳过），并保证无论注册是否抛错都完成绑定。
 */
import type { ConsoleKey } from './dictionaries';
/** 平台 locale 服务的最小兼容面（3 参式注册，各版本通用；对象式为 0.2.0+ 专属） */
export interface LocaleCompat {
    register(ns: string, locale: string, dict: Record<string, string>): (() => void) | unknown;
    bind(ns: string): (key: string, params?: Record<string, unknown>) => string;
    subscribe(fn: () => void): (() => void) | void;
}
export type Translate = (key: ConsoleKey, params?: Record<string, unknown>) => string;
export interface BoundLocale {
    t: Translate;
    subscribe: (fn: () => void) => () => void;
}
/**
 * 幂等注册词典：逐语种注册；单条失败（如 already has locale）跳过，
 * 不影响其余语种与后续绑定。返回 disposer（整体可安全清理）。
 */
export declare function registerDictionaries(locale: LocaleCompat, ns: string, dicts: ReadonlyArray<readonly [string, Record<string, string>]>): () => void;
/**
 * 绑定翻译函数：稳定外层 + 每次取最新 bound（旧版 bind 可能缓存语种）。
 * 变量插值手工兜底（旧版 bound 可能不支持 params）。
 */
export declare function bindTranslator(locale: LocaleCompat, ns: string): BoundLocale;
/** 宿主上下文最小面：本模块只用到 get / inject（真实 ctx 来自 @deepseek-ai/cordis） */
export interface PluginContextCompat {
    get(name: string, strict?: boolean): unknown;
    inject(deps: string[], callback: (ctx: PluginContextCompat) => void): unknown;
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
export declare function attachLocale(ctx: PluginContextCompat, ns: string, dicts: ReadonlyArray<readonly [string, Record<string, string>]>, onBound: (bound: BoundLocale) => void): void;
