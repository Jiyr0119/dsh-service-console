/**
 * i18n 注册/绑定（热挂载与双装载幂等，0.7.1）
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
