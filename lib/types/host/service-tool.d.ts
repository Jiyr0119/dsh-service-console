import type { Snapshot } from './types';
export interface ServiceToolDeps {
    /** 与 API scan 路由同源的快照函数（含受保护判定 guard） */
    snapshot(): Promise<Snapshot>;
}
export declare function buildServiceTool(deps: ServiceToolDeps): import("@deepseek-ai/dsh-tools").ToolDefinition;
