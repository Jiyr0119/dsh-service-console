import * as React from 'react';
interface TimerLike {
    timeout(callback: () => void, delay: number): () => void;
    interval(callback: () => void, delay: number): () => void;
}
export declare function bindTimer(t: TimerLike): void;
export declare function ServiceConsoleEntry(): React.ReactElement;
export declare function ServiceConsolePanel(): React.ReactElement | null;
export {};
