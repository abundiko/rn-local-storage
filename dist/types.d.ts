export type UseSessionOptions<T, S = T> = {
    defaultValue: T;
    jsonSerialize?: boolean;
    selector?: (state: T) => S;
};
export type SetValueCallback<T> = (currentValue: T) => T;
export type UpdateValueCallback<T> = (currentValue: T) => Partial<T>;
export type StorageItemType = Record<string, unknown>;
//# sourceMappingURL=types.d.ts.map