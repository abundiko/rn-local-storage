import { storage, useStorageStore } from "./store/storage.js";
import type { UseSessionOptions } from "./types.js";

export interface RNLocalStorageInstance<T> {
  get: () => T;
  set: (newValue: T) => void;
  remove: () => void;
  update: (partial: Partial<T>) => void;
  subscribe: (callback: (value: T) => void) => () => void;
}

export function RNLocalStorage<T = any>(
  key: string,
  options: UseSessionOptions<T, T>
): RNLocalStorageInstance<T> {
  const { defaultValue, jsonSerialize = true } = options;

  const get = (): T => {
    const state = useStorageStore.getState();
    const rawOrParsed = state.data[key];
    return (rawOrParsed !== undefined ? rawOrParsed : defaultValue) as T;
  };

  const set = (newValue: T): void => {
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
    useStorageStore.getState().setItem(key, newValue);
  };

  const remove = (): void => {
    storage.delete(key);
    useStorageStore.getState().removeItem(key);
  };

  const update = (partial: Partial<T>): void => {
    const current = get();
    const newItem = { ...current, ...partial };
    set(newItem);
  };

  const subscribe = (callback: (value: T) => void): (() => void) => {
    return useStorageStore.subscribe((state) => {
      const rawOrParsed = state.data[key];
      const value = (
        rawOrParsed !== undefined ? rawOrParsed : defaultValue
      ) as T;
      callback(value);
    });
  };

  return {
    get,
    set,
    remove,
    update,
    subscribe,
  };
}
