import type { Context } from 'cordis';
import type { WebServer } from '@deepseek-ai/dsh-host-webserver';
declare module 'cordis' {
    interface Context {
        timer: {
            timeout(callback: () => void, delay: number): () => void;
            timeout(delay: number): Promise<void>;
            interval(callback: () => void, delay: number): () => void;
        };
        webServer: WebServer;
    }
}
declare const _default: {
    inject: string[];
    apply(ctx: Context): void;
};
export default _default;
