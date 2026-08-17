import type { LedgerEntry, Snapshot, WorkspaceLike } from './types';
import { type CommandRunner } from './process-inspector';
export declare function buildSnapshot(ledgers: LedgerEntry[], workspaces: WorkspaceLike[], commandRunner?: CommandRunner): Promise<Snapshot>;
