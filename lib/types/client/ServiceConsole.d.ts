/**
 * dsh-service-console — 面板组件（原生包 v2）
 *
 * 架构对齐 dsh-workspace-explorer:
 * - i18n: 通过 locale.bind(NS) 获取翻译函数（而非硬编码 TEXTS）
 * - API: 通过 fetch 直连 webServer JSON 路由（不走 host.call / LLM）
 * - UI: 抽屉式面板 + Tab 栏（服务 / 设置），对标 workspace-explorer 视觉风格
 */
import * as React from 'react';
import type { ConsoleKey } from './dictionaries';
interface TimerLike {
    timeout(callback: () => void, delay: number): () => void;
}
/** 类型化翻译函数：key 为词典键（拼写错误=编译错误），params 替换 {vars}（locale 运行时完成） */
type Translate = (key: ConsoleKey, params?: Record<string, unknown>) => string;
export declare function bindTimer(t: TimerLike): void;
export declare function bindLocale(locale: {
    t: Translate;
    subscribe(fn: () => void): () => void;
}): void;
type ServiceScope = 'conversation' | 'workspace' | 'machine';
interface ConfigData {
    refreshInterval: number;
    defaultScope: ServiceScope;
    gracefulTimeout: number;
    showUnknown: boolean;
    forceKill: boolean;
}
export declare function ServiceConsoleEntry(): React.ReactElement;
export interface SettingsProps {
    onSaved?: (config: ConfigData) => void;
}
export declare function ServiceConsoleSettings({ onSaved }: SettingsProps): React.ReactElement;
export declare function ServiceConsolePanel(): React.ReactElement | null;
export {};
