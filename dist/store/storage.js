import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
export const storage = new MMKV({
    id: "local-storage",
});
function safeParse(raw) {
    if (raw === undefined)
        return undefined;
    try {
        const parsed = JSON.parse(raw);
        return parsed;
    }
    catch (_a) {
        return raw;
    }
}
export const useStorageStore = create((set, get) => ({
    data: {},
    hydratedKeys: new Set(),
    setItem: (key, value) => set((state) => ({
        data: Object.assign(Object.assign({}, state.data), { [key]: value }),
    })),
    removeItem: (key) => set((state) => {
        const newData = Object.assign({}, state.data);
        delete newData[key];
        return { data: newData };
    }),
    hydrateKey: (key) => {
        const state = get();
        if (state.hydratedKeys.has(key))
            return;
        const raw = storage.getString(key);
        const value = safeParse(raw);
        set((state) => ({
            data: Object.assign(Object.assign({}, state.data), { [key]: value }),
            hydratedKeys: new Set(state.hydratedKeys).add(key),
        }));
    },
}));
//# sourceMappingURL=storage.js.map