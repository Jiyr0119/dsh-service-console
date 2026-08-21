interface CtxLike {
    get(name: string): unknown;
    effect(fn: () => () => void): void;
    timer: {
        timeout(cb: () => void, ms: number): () => void;
    };
}
declare const _default: {
    inject: string[];
    apply(ctx: CtxLike): void;
};
export default _default;
