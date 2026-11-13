import { describe, expect, it } from "bun:test";
import { deepMerge, serializeValue } from "../src/utils.js";
import { safeParse } from "../src/store/storage.js";

describe("serializeValue", () => {
  it("serializes to JSON when jsonSerialize is true", () => {
    expect(serializeValue("hello", true)).toBe('"hello"');
    expect(serializeValue(123, true)).toBe("123");
    expect(serializeValue(true, true)).toBe("true");
    expect(serializeValue({ a: 1 }, true)).toBe('{"a":1}');
    expect(serializeValue([1, 2, 3], true)).toBe("[1,2,3]");
  });

  it("returns primitive values directly when jsonSerialize is false", () => {
    expect(serializeValue("hello", false)).toBe("hello");
    expect(serializeValue(123, false)).toBe(123);
    expect(serializeValue(false, false)).toBe(false);

    const buffer = new ArrayBuffer(8);
    expect(serializeValue(buffer, false)).toBe(buffer);
  });

  it("throws an error when jsonSerialize is false for non-primitive types", () => {
    expect(() => serializeValue({ a: 1 }, false)).toThrow(
      /MMKV can only store primitive types/,
    );
    expect(() => serializeValue([1, 2], false)).toThrow(
      /MMKV can only store primitive types/,
    );
  });
});

describe("deepMerge", () => {
  it("merges flat objects", () => {
    const current = { name: "Alice", age: 30 };
    const partial = { age: 31 };
    const result = deepMerge(current, partial);
    expect(result).toEqual({ name: "Alice", age: 31 });
  });

  it("deeply merges nested objects", () => {
    const current = {
      user: {
        name: "Alice",
        settings: { theme: "dark", notifications: true },
      },
    };
    const partial = {
      user: {
        settings: { theme: "light" },
      },
    };
    const result = deepMerge(current, partial as any);
    expect(result).toEqual({
      user: {
        name: "Alice",
        settings: { theme: "light", notifications: true },
      },
    });
  });

  it("replaces arrays rather than merging them by index", () => {
    const current = { tags: ["a", "b"] };
    const partial = { tags: ["c"] };
    const result = deepMerge(current, partial);
    expect(result).toEqual({ tags: ["c"] });
  });

  it("handles undefined partial values without crashing", () => {
    const current = { name: "Alice", age: 30 };
    const partial = { age: undefined };
    const result = deepMerge(current, partial as any);
    expect(result).toEqual({ name: "Alice", age: 30 });
  });
});

describe("safeParse", () => {
  it("returns undefined for undefined input", () => {
    expect(safeParse(undefined)).toBeUndefined();
  });

  it("parses valid JSON string", () => {
    expect(safeParse('{"hello":"world"}')).toEqual({ hello: "world" });
    expect(safeParse("123")).toBe(123);
    expect(safeParse("true")).toBe(true);
  });

  it("returns raw string if JSON parsing fails", () => {
    expect(safeParse("raw-plain-string")).toBe("raw-plain-string");
  });
});
