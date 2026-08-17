import type { LedgerEntry, Ownership, WorkspaceLike } from './types';
export interface OwnershipResult {
    ownership: Ownership;
    confidence: 'confirmed' | 'inferred' | 'unknown';
    evidence: string[];
    ledgerEntry: LedgerEntry | null;
}
export declare function classifyOwnership(proc: {
    cwd: string | null;
    command: string | null;
    startedAt: number | null;
}, ledgers: LedgerEntry[], workspaces: WorkspaceLike[]): OwnershipResult;
