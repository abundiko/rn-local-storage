import { storage, useStorageStore } from "./store/storage.js";
export function RNLocalStorage(key, options) {
    const { defaultValue, jsonSerialize = true } = options;
    const get = () => {
        const state = useStorageStore.getState();
        const rawOrParsed = state.data[key];
        return (rawOrParsed !== undefined ? rawOrParsed : defaultValue);
    };
    const set = (newValue) => {
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
        useStorageStore.getState().setItem(key, newValue);
    };
    const remove = () => {
        storage.delete(key);
        useStorageStore.getState().removeItem(key);
    };
    const update = (partial) => {
        const current = get();
        const newItem = Object.assign(Object.assign({}, current), partial);
        set(newItem);
    };
    const subscribe = (callback) => {
        return useStorageStore.subscribe((state) => {
            const rawOrParsed = state.data[key];
            const value = (rawOrParsed !== undefined ? rawOrParsed : defaultValue);
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
//# sourceMappingURL=RNLocalStorage.js.map