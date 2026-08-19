import * as React from 'react';
interface TimerLike {
    timeout(callback: () => void, delay: number): () => void;
}
export declare function bindTimer(t: TimerLike): void;
export declare function bindLocale(locale: {
    getLocale: () => {
        id?: string;
    };
    subscribe: (fn: () => void) => () => void;
}): void;
export declare function ServiceConsoleEntry(): React.ReactElement;
export declare function ServiceConsolePanel(): React.ReactElement | null;
export {};
