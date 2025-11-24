import { useCallback } from "react";
import { storage, useStorageStore } from "../store/storage.js";
export function useLocalStorage(key, options) {
    const { defaultValue, jsonSerialize = true, selector } = options;
    const setStoreItem = useStorageStore((s) => s.setItem);
    const removeStoreItem = useStorageStore((s) => s.removeItem);
    const item = useStorageStore((state) => {
        const rawOrParsed = state.data[key];
        const value = (rawOrParsed !== undefined ? rawOrParsed : defaultValue);
        return selector ? selector(value) : value;
    });
    const setItem = useCallback((newValue) => {
        let valueToStore;
        if (jsonSerialize) {
            valueToStore = JSON.stringify(newValue);
        }
        else {
            // When jsonSerialize is false, only allow primitive types
            if (typeof newValue === "string" ||
                typeof newValue === "number" ||
                typeof newValue === "boolean") {
                valueToStore = newValue;
            }
            else {
                throw new Error(`MMKV can only store primitive types (string, number, boolean) when jsonSerialize is false. ` +
                    `Received type: ${typeof newValue}. Either set jsonSerialize to true or pass a primitive value.`);
            }
        }
        storage.set(key, valueToStore);
        setStoreItem(key, newValue);
    }, [key, jsonSerialize, setStoreItem]);
    const removeItem = useCallback(() => {
        storage.delete(key);
        removeStoreItem(key);
    }, [key, removeStoreItem]);
    const updateItem = useCallback((partial) => {
        var _a;
        const current = (_a = useStorageStore.getState().data[key]) !== null && _a !== void 0 ? _a : defaultValue;
        const newItem = Object.assign(Object.assign({}, current), partial);
        setItem(newItem);
    }, [key, defaultValue, setItem]);
    return { item, setItem, removeItem, updateItem };
}
//# sourceMappingURL=useLocalStorage.js.map