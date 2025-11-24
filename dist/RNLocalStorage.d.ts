import type { UseSessionOptions } from "./types.js";
export interface RNLocalStorageInstance<T> {
    get: () => T;
    set: (newValue: T) => void;
    remove: () => void;
    update: (partial: Partial<T>) => void;
    subscribe: (callback: (value: T) => void) => () => void;
}
export declare function RNLocalStorage<T = any>(key: string, options: UseSessionOptions<T, T>): RNLocalStorageInstance<T>;
//# sourceMappingURL=RNLocalStorage.d.ts.map