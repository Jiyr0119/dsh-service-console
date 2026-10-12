import type { LedgerEntry, Snapshot, WorkspaceLike } from './types';
import { type CommandRunner } from './process-inspector';
import { type ProtectionGuard } from './protection';
export declare function buildSnapshot(ledgers: LedgerEntry[], workspaces: WorkspaceLike[], commandRunner?: CommandRunner, guard?: ProtectionGuard): Promise<Snapshot>;
