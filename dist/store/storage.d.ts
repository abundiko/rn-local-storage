import { MMKV } from "react-native-mmkv";
export declare const storage: MMKV;
export type StorageState = {
    data: Record<string, any>;
    hydratedKeys: Set<string>;
    setItem: (key: string, value: any) => void;
    removeItem: (key: string) => void;
    hydrateKey: (key: string) => void;
};
export declare const useStorageStore: import("zustand").UseBoundStore<import("zustand").StoreApi<StorageState>>;
//# sourceMappingURL=storage.d.ts.map