/**
 * dsh-service-console — Client 入口（原生包 v2）
 *
 * 架构对齐 dsh-workspace-explorer:
 * - 通过 locale.register + locale.bind 实现国际化（词典键编译期校验）
 * - 通过 webServer JSON 路由调用 Host（fetch 直连，不走 host.call / LLM）
 * - 注册 DSH 设置壳的 settings.section 页
 * - 注册 shell.overlay 抽屉面板 + header 入口按钮
 *
 * 类型化（P0-5）：ctx 来自 @deepseek-ai/cordis，ctx.slots / ctx.locale /
 * SlotMap 键均由平台类型包增广；平台包仅 type-only 导入，构建时擦除。
 */
import type { Context } from '@deepseek-ai/cordis';
import { type ConsoleKey } from './dictionaries';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'dsh-service-console': ConsoleKey;
    }
}
/** cordis-plugin-timer 未随本包安装类型；客户端只用 timeout 一种能力，结构化声明 */
interface TimerLike {
    timeout(callback: () => void, delay: number): () => void;
}
type ClientContext = Context & {
    timer: TimerLike;
};
declare const _default: {
    inject: string[];
    apply(ctx: ClientContext): void;
};
export default _default;
