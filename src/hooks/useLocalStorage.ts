import { useCallback } from "react";
import { storage, useStorageStore } from "../store/storage.js";
import type { UseSessionOptions, SetValueCallback, UpdateValueCallback } from "../types.js";
import { serializeValue, deepMerge } from "../utils.js";

export function useLocalStorage<T = any, S = T>(
  key: string,
  options: UseSessionOptions<T, S>,
) {
  const { defaultValue, jsonSerialize = true, selector } = options;
  const setStoreItem = useStorageStore((s) => s.setItem);
  const removeStoreItem = useStorageStore((s) => s.removeItem);
  const hydrateKey = useStorageStore((s) => s.hydrateKey);

  hydrateKey(key);

  const item = useStorageStore((state) => {
    const rawOrParsed = state.data[key];
    const value = (rawOrParsed !== undefined ? rawOrParsed : defaultValue) as T;
    return selector ? selector(value) : (value as unknown as S);
  });

  const setItem = useCallback(
    (newValue: T | SetValueCallback<T>) => {
      const current = (useStorageStore.getState().data[key] as T) ?? defaultValue;
      const resolvedValue = typeof newValue === "function"
        ? (newValue as SetValueCallback<T>)(current)
        : newValue;

      const valueToStore = serializeValue(resolvedValue, jsonSerialize);
      storage.set(key, valueToStore);
      setStoreItem(key, resolvedValue);
    },
    [key, jsonSerialize, defaultValue, setStoreItem],
  );

  const removeItem = useCallback(() => {
    storage.delete(key);
    removeStoreItem(key);
  }, [key, removeStoreItem]);

  const updateItem = useCallback(
    (partial: Partial<T> | UpdateValueCallback<T>) => {
      const current = (useStorageStore.getState().data[key] as T) ?? defaultValue;
      const resolvedPartial = typeof partial === "function"
        ? (partial as UpdateValueCallback<T>)(current)
        : partial;
      const newItem = deepMerge(current as Record<string, unknown>, resolvedPartial as Partial<Record<string, unknown>>) as T;
      setItem(newItem);
    },
    [key, defaultValue, setItem],
  );

  return { item, setItem, removeItem, updateItem };
}