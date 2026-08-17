import type { LedgerEntry, ShellLike, Snapshot, WorkspaceLike } from './types';
export declare function buildSnapshot(shell: ShellLike, ledgers: LedgerEntry[], workspaces: WorkspaceLike[]): Promise<Snapshot>;
