import type { UseSessionOptions } from '../types.js';
export declare function useLocalStorage<T = any, S = T>(key: string, options: UseSessionOptions<T, S>): {
    item: S;
    setItem: (newValue: T) => void;
    removeItem: () => void;
    updateItem: (partial: Partial<T>) => void;
};
//# sourceMappingURL=useLocalStorage.d.ts.map