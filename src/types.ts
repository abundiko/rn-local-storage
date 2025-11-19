export type UseSessionOptions<T, S = T> = {
  defaultValue: T;
  jsonSerialize?: boolean;
  selector?: (state: T) => S;
};

export type StorageItemType = Record<string, unknown>;
