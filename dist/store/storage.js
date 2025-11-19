import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
export const storage = new MMKV({
    id: 'local-storage',
});
function getMMKVData() {
    const allKeys = storage.getAllKeys();
    const initialData = {};
    for (const key of allKeys) {
        const raw = storage.getString(key);
        try {
            // Try to parse as JSON, if it fails or is "null", keep raw or null
            initialData[key] = JSON.parse(raw !== null && raw !== void 0 ? raw : 'null');
        }
        catch (_a) {
            initialData[key] = raw;
        }
    }
    return initialData;
}
export const useStorageStore = create((set) => ({
    data: getMMKVData(),
    setItem: (key, value) => set((state) => ({
        data: Object.assign(Object.assign({}, state.data), { [key]: value }),
    })),
    removeItem: (key) => set((state) => {
        const newData = Object.assign({}, state.data);
        delete newData[key];
        return { data: newData };
    }),
}));
//# sourceMappingURL=storage.js.map