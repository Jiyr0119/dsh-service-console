import type { LedgerEntry } from './types';
export declare const DEV_COMMAND_RE: RegExp;
export interface ToolExecLike {
    name?: string;
    args?: Record<string, unknown>;
    agent?: {
        id?: string;
        sessionId?: string;
    } | null;
}
export declare class SessionLedger {
    private entries;
    get list(): LedgerEntry[];
    observe(exec: ToolExecLike | null): void;
}
