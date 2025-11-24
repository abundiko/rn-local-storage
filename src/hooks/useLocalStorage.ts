import { useCallback } from "react";
import { storage, useStorageStore } from "../store/storage.js";
import type { UseSessionOptions } from "../types.js";

export function useLocalStorage<T = any, S = T>(
  key: string,
  options: UseSessionOptions<T, S>
) {
  const { defaultValue, jsonSerialize = true, selector } = options;
  const setStoreItem = useStorageStore((s) => s.setItem);
  const removeStoreItem = useStorageStore((s) => s.removeItem);

  const item = useStorageStore((state) => {
    const rawOrParsed = state.data[key];
    const value = (rawOrParsed !== undefined ? rawOrParsed : defaultValue) as T;
    return selector ? selector(value) : (value as unknown as S);
  });

  const setItem = useCallback(
    (newValue: T) => {
      let valueToStore: string | number | boolean;

      if (jsonSerialize) {
        valueToStore = JSON.stringify(newValue);
      } else {
        // When jsonSerialize is false, only allow primitive types
        if (
          typeof newValue === "string" ||
          typeof newValue === "number" ||
          typeof newValue === "boolean"
        ) {
          valueToStore = newValue;
        } else {
          throw new Error(
            `MMKV can only store primitive types (string, number, boolean) when jsonSerialize is false. ` +
              `Received type: ${typeof newValue}. Either set jsonSerialize to true or pass a primitive value.`
          );
        }
      }

      storage.set(key, valueToStore);
      setStoreItem(key, newValue);
    },
    [key, jsonSerialize, setStoreItem]
  );

  const removeItem = useCallback(() => {
    storage.delete(key);
    removeStoreItem(key);
  }, [key, removeStoreItem]);

  const updateItem = useCallback(
    (partial: Partial<T>) => {
      const current =
        (useStorageStore.getState().data[key] as T) ?? defaultValue;
      const newItem = { ...current, ...partial };
      setItem(newItem);
    },
    [key, defaultValue, setItem]
  );

  return { item, setItem, removeItem, updateItem };
}
