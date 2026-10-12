export interface ProtectionGuard {
    /** 不可停止的端口（如 ctx.webServer.port —— 停掉它会断开当前 DSH 界面） */
    protectedPorts?: readonly number[];
    /** 不可停止的 PID（如插件所在宿主进程 process.pid） */
    protectedPids?: readonly number[];
}
export interface ProtectionTarget {
    pid: number;
    name?: string | null;
    command?: string | null;
    cwd?: string | null;
    listeners: readonly {
        port: number;
        user?: string | null;
    }[];
}
export interface ProtectionResult {
    protected: boolean;
    evidence: string[];
}
export declare function classifyProtection(proc: ProtectionTarget, guard?: ProtectionGuard): ProtectionResult;
