import type { ShellLike } from './types';
export interface CommandResult {
    stdout: string;
    stderr: string;
    code: number | null;
}
export declare function runCommand(shell: ShellLike, command: string, timeoutMs?: number): Promise<CommandResult>;
export declare function parseLstart(str: string): number | null;
export interface ListenRow {
    command: string;
    pid: number;
    user: string;
    fd: string;
    type: string;
    address: string;
}
export declare function parseListenRows(stdout: string): ListenRow[];
export interface PsRow {
    pid: number;
    ppid: number;
    lstart: string;
    startedAt: number | null;
    command: string;
}
export declare function parsePsRows(stdout: string): PsRow[];
export declare function parseAddress(addr: string): {
    host: string | null;
    port: number | null;
};
export declare function shellQuote(s: string): string;
export interface RawProcess {
    pid: number;
    ppid: number | null;
    startedAt: number | null;
    command: string | null;
    name: string | null;
    pgid: number | null;
    cwd: string | null;
}
export interface RawListener {
    pid: number;
    host: string;
    port: number;
    protocol: string;
}
export interface RawScan {
    listeners: RawListener[];
    procs: Map<number, RawProcess>;
    partialWarnings: string[];
}
export declare function scanRaw(shell: ShellLike): Promise<RawScan>;
