import { mock } from "bun:test";

// Mock react-native
mock.module("react-native", () => ({
  Platform: { OS: "ios", select: (obj: any) => obj.ios },
}));

// In-memory MMKV mock store
export class MockMMKV {
  public id: string;
  private map = new Map<string, string | number | boolean | ArrayBuffer>();
  private listeners = new Set<(key: string) => void>();

  constructor(config?: { id?: string }) {
    this.id = config?.id ?? "mmkv.default";
  }

  getString(key: string): string | undefined {
    const val = this.map.get(key);
    return typeof val === "string" ? val : undefined;
  }

  getBoolean(key: string): boolean | undefined {
    const val = this.map.get(key);
    return typeof val === "boolean" ? val : undefined;
  }

  getNumber(key: string): number | undefined {
    const val = this.map.get(key);
    return typeof val === "number" ? val : undefined;
  }

  getBuffer(key: string): ArrayBuffer | undefined {
    const val = this.map.get(key);
    return val instanceof ArrayBuffer ? val : undefined;
  }

  set(key: string, value: string | number | boolean | ArrayBuffer): void {
    if (!key) {
      throw new Error("Key cannot be empty");
    }
    this.map.set(key, value);
    for (const listener of this.listeners) {
      listener(key);
    }
  }

  remove(key: string): boolean {
    const deleted = this.map.delete(key);
    if (deleted) {
      for (const listener of this.listeners) {
        listener(key);
      }
    }
    return deleted;
  }

  contains(key: string): boolean {
    return this.map.has(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.map.keys());
  }

  clearAll(): void {
    this.map.clear();
  }

  addOnValueChangedListener(listener: (key: string) => void) {
    this.listeners.add(listener);
    return {
      remove: () => {
        this.listeners.delete(listener);
      },
    };
  }

  get size(): number {
    return this.map.size;
  }

  get byteSize(): number {
    return this.map.size;
  }

  get length(): number {
    return this.map.size;
  }
}

const defaultInstance = new MockMMKV({ id: "local-storage" });

mock.module("react-native-mmkv", () => ({
  createMMKV: (config?: { id?: string }) => {
    if (!config || config.id === "local-storage") {
      return defaultInstance;
    }
    return new MockMMKV(config);
  },
}));
