import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';

export const storage = new MMKV({
  id: 'local-storage',
});

export type StorageState = {
  data: Record<string, any>;
  setItem: (key: string, value: any) => void;
  removeItem: (key: string) => void;
};

function getMMKVData() {
  const allKeys = storage.getAllKeys();
  const initialData: Record<string, any> = {};

  for (const key of allKeys) {
    const raw = storage.getString(key);
    try {
      // Try to parse as JSON, if it fails or is "null", keep raw or null
      initialData[key] = JSON.parse(raw ?? 'null');
    } catch {
      initialData[key] = raw;
    }
  }

  return initialData;
}

export const useStorageStore = create<StorageState>((set) => ({
  data: getMMKVData(),
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
}));
