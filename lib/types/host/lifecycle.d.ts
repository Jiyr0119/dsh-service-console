import type { ApiResult, Config, LedgerEntry, Snapshot, TimerLike } from './types';
import { type CommandRunner } from './process-inspector';
export interface LifecycleDeps {
    timer: TimerLike;
    config: Config;
    buildSnapshot: () => Promise<Snapshot>;
    ledgerList: () => LedgerEntry[];
    logAction: (serviceId: string | null, action: string, result: string, code?: string | null) => void;
    commandRunner?: CommandRunner;
}
export declare function stopService(deps: LifecycleDeps, serviceId: string, mode?: string): Promise<ApiResult<{
    result: string;
}>>;
export declare function restartService(deps: LifecycleDeps, serviceId: string): Promise<ApiResult<{
    result: string;
    command?: string;
}>>;
