import { storage, useStorageStore } from "./store/storage.js";
import type {
  UseSessionOptions,
  SetValueCallback,
  UpdateValueCallback,
} from "./types.js";
import { serializeValue, deepMerge } from "./utils.js";

export interface RNLocalStorageInstance<T, S = T> {
  get: () => T;
  set: (newValue: T | SetValueCallback<T>) => void;
  remove: () => void;
  update: (partial: Partial<T> | UpdateValueCallback<T>) => void;
  subscribe: (callback: (value: T) => void) => () => void;
  subscribeWithSelector: (selector: (state: T) => S, callback: (value: S) => void) => () => void;
}

export function RNLocalStorage<T = any, S = T>(
  key: string,
  options: UseSessionOptions<T, S>,
): RNLocalStorageInstance<T, S> {
  const { defaultValue, jsonSerialize = true } = options;

  useStorageStore.getState().hydrateKey(key);

  const getValue = (): T => {
    const state = useStorageStore.getState();
    const rawOrParsed = state.data[key];
    return (rawOrParsed !== undefined ? rawOrParsed : defaultValue) as T;
  };

  const set = (newValue: T | SetValueCallback<T>): void => {
    const current = getValue();
    const resolvedValue = typeof newValue === "function"
      ? (newValue as SetValueCallback<T>)(current)
      : newValue;

    const valueToStore = serializeValue(resolvedValue, jsonSerialize);
    storage.set(key, valueToStore);
    useStorageStore.getState().setItem(key, resolvedValue);
  };

  const remove = (): void => {
    storage.delete(key);
    useStorageStore.getState().removeItem(key);
  };

  const update = (partial: Partial<T> | UpdateValueCallback<T>): void => {
    const current = getValue();
    const resolvedPartial = typeof partial === "function"
      ? (partial as UpdateValueCallback<T>)(current)
      : partial;
    const newItem = deepMerge(current as Record<string, unknown>, resolvedPartial as Partial<Record<string, unknown>>) as T;
    set(newItem);
  };

  const subscribe = (callback: (value: T) => void): (() => void) => {
    let prevValue: T | undefined = undefined;

    return useStorageStore.subscribe((state) => {
      const rawOrParsed = state.data[key];
      const value = (
        rawOrParsed !== undefined ? rawOrParsed : defaultValue
      ) as T;

      if (prevValue === undefined || JSON.stringify(prevValue) !== JSON.stringify(value)) {
        prevValue = value;
        callback(value);
      }
    });
  };

  const subscribeWithSelector = (
    selector: (state: T) => S,
    callback: (value: S) => void,
  ): (() => void) => {
    let prevSelected: S | undefined = undefined;

    return useStorageStore.subscribe((state) => {
      const rawOrParsed = state.data[key];
      const value = (
        rawOrParsed !== undefined ? rawOrParsed : defaultValue
      ) as T;

      const selected = selector(value);

      if (prevSelected === undefined || JSON.stringify(prevSelected) !== JSON.stringify(selected)) {
        prevSelected = selected;
        callback(selected);
      }
    });
  };

  return {
    get: getValue,
    set,
    remove,
    update,
    subscribe,
    subscribeWithSelector,
  };
}