import { useCallback } from "react";
import { storage, useStorageStore } from "../store/storage.js";
import { serializeValue, deepMerge } from "../utils.js";
export function useLocalStorage(key, options) {
    const { defaultValue, jsonSerialize = true, selector } = options;
    const setStoreItem = useStorageStore((s) => s.setItem);
    const removeStoreItem = useStorageStore((s) => s.removeItem);
    const hydrateKey = useStorageStore((s) => s.hydrateKey);
    // Hydrate initial key synchronously if not yet loaded into store
    hydrateKey(key);
    const item = useStorageStore((state) => {
        const rawOrParsed = state.data[key];
        const value = (rawOrParsed !== undefined ? rawOrParsed : defaultValue);
        return selector ? selector(value) : value;
    });
    const setItem = useCallback((newValue) => {
        var _a;
        const current = (_a = useStorageStore.getState().data[key]) !== null && _a !== void 0 ? _a : defaultValue;
        const resolvedValue = typeof newValue === "function"
            ? newValue(current)
            : newValue;
        const valueToStore = serializeValue(resolvedValue, jsonSerialize);
        storage.set(key, valueToStore);
        setStoreItem(key, resolvedValue);
    }, [key, jsonSerialize, defaultValue, setStoreItem]);
    const removeItem = useCallback(() => {
        const removed = storage.remove(key);
        removeStoreItem(key);
        return removed;
    }, [key, removeStoreItem]);
    const updateItem = useCallback((partial) => {
        var _a;
        const current = (_a = useStorageStore.getState().data[key]) !== null && _a !== void 0 ? _a : defaultValue;
        const resolvedPartial = typeof partial === "function"
            ? partial(current)
            : partial;
        const newItem = deepMerge(current, resolvedPartial);
        setItem(newItem);
    }, [key, defaultValue, setItem]);
    return { item, setItem, removeItem, updateItem };
}
//# sourceMappingURL=useLocalStorage.js.map