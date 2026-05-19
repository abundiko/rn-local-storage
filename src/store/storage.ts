import { MMKV } from "react-native-mmkv";
import { create } from "zustand";

export const storage = new MMKV({
  id: "local-storage",
});

export type StorageState = {
  data: Record<string, any>;
  hydratedKeys: Set<string>;
  setItem: (key: string, value: any) => void;
  removeItem: (key: string) => void;
  hydrateKey: (key: string) => void;
};

function safeParse(raw: string | undefined): any {
  if (raw === undefined) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return raw;
  }
}

export const useStorageStore = create<StorageState>((set, get) => ({
  data: {},
  hydratedKeys: new Set(),
  setItem: (key, value) =>
    set((state) => ({
      data: { ...state.data, [key]: value },
    })),
  removeItem: (key) =>
    set((state) => {
      const newData = { ...state.data };
      delete newData[key];
      return { data: newData };
    }),
  hydrateKey: (key) => {
    const state = get();
    if (state.hydratedKeys.has(key)) return;

    const raw = storage.getString(key);
    const value = safeParse(raw);

    set((state) => ({
      data: { ...state.data, [key]: value },
      hydratedKeys: new Set(state.hydratedKeys).add(key),
    }));
  },
}));