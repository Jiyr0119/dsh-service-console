import type { Config } from './types';
export declare const DEFAULT_CONFIG: Config;
export declare const CONFIG_LIMITS: Record<string, [number, number]>;
export declare function loadConfigFromFile(): Config;
export declare function saveConfigToFile(config: Config): void;
export declare function validateConfigPatch(patch: Record<string, unknown>): {
    ok: true;
    next: Partial<Config>;
} | {
    ok: false;
    message: string;
};
