import { storage, useStorageStore } from "./store/storage.js";
import { serializeValue, deepMerge } from "./utils.js";
export function RNLocalStorage(key, options) {
    const { defaultValue, jsonSerialize = true } = options;
    useStorageStore.getState().hydrateKey(key);
    const getValue = () => {
        const state = useStorageStore.getState();
        const rawOrParsed = state.data[key];
        return (rawOrParsed !== undefined ? rawOrParsed : defaultValue);
    };
    const set = (newValue) => {
        const current = getValue();
        const resolvedValue = typeof newValue === "function"
            ? newValue(current)
            : newValue;
        const valueToStore = serializeValue(resolvedValue, jsonSerialize);
        storage.set(key, valueToStore);
        useStorageStore.getState().setItem(key, resolvedValue);
    };
    const remove = () => {
        storage.delete(key);
        useStorageStore.getState().removeItem(key);
    };
    const update = (partial) => {
        const current = getValue();
        const resolvedPartial = typeof partial === "function"
            ? partial(current)
            : partial;
        const newItem = deepMerge(current, resolvedPartial);
        set(newItem);
    };
    const subscribe = (callback) => {
        let prevValue = undefined;
        return useStorageStore.subscribe((state) => {
            const rawOrParsed = state.data[key];
            const value = (rawOrParsed !== undefined ? rawOrParsed : defaultValue);
            if (prevValue === undefined || JSON.stringify(prevValue) !== JSON.stringify(value)) {
                prevValue = value;
                callback(value);
            }
        });
    };
    const subscribeWithSelector = (selector, callback) => {
        let prevSelected = undefined;
        return useStorageStore.subscribe((state) => {
            const rawOrParsed = state.data[key];
            const value = (rawOrParsed !== undefined ? rawOrParsed : defaultValue);
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
//# sourceMappingURL=RNLocalStorage.js.map