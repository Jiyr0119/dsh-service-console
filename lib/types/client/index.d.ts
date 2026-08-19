declare const _default: {
    inject: string[];
    apply(ctx: {
        get(name: string): unknown;
        timer: {
            timeout(cb: () => void, ms: number): () => void;
        };
    }): void;
};
export default _default;
