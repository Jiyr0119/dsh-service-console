/**
 * dsh-service-console — 面板组件（原生包 v2）
 *
 * 架构对齐 dsh-workspace-explorer:
 * - i18n: 通过 locale.bind(NS) 获取翻译函数（而非硬编码 TEXTS）
 * - API: 通过 fetch 直连 webServer JSON 路由（不走 host.call / LLM）
 * - UI: 抽屉式面板 + Tab 栏（服务 / 设置），对标 workspace-explorer 视觉风格
 */
import * as React from 'react';
interface TimerLike {
    timeout(callback: () => void, delay: number): () => void;
}
interface LocaleLike {
    getLocale(): {
        id?: string;
    };
    subscribe(fn: () => void): () => void;
    bind(ns: string): (key: string, vars?: Record<string, string | number>) => string;
}
export declare function bindTimer(t: TimerLike): void;
export declare function bindLocale(locale: LocaleLike): void;
export declare function ServiceConsoleEntry(): React.ReactElement;
export declare function ServiceConsoleSettings(): React.ReactElement;
export declare function ServiceConsolePanel(): React.ReactElement | null;
export {};
