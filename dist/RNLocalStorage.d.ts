import type { UseSessionOptions, SetValueCallback, UpdateValueCallback } from "./types.js";
export interface RNLocalStorageInstance<T, S = T> {
    get: () => T;
    set: (newValue: T | SetValueCallback<T>) => void;
    remove: () => void;
    update: (partial: Partial<T> | UpdateValueCallback<T>) => void;
    subscribe: (callback: (value: T) => void) => () => void;
    subscribeWithSelector: (selector: (state: T) => S, callback: (value: S) => void) => () => void;
}
export declare function RNLocalStorage<T = any, S = T>(key: string, options: UseSessionOptions<T, S>): RNLocalStorageInstance<T, S>;
//# sourceMappingURL=RNLocalStorage.d.ts.map