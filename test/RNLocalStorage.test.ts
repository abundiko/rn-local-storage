import { beforeEach, describe, expect, it } from "bun:test";
import { RNLocalStorage } from "../src/RNLocalStorage.js";
import { storage, useStorageStore } from "../src/store/storage.js";

describe("RNLocalStorage", () => {
  beforeEach(() => {
    storage.clearAll();
    useStorageStore.setState({ data: {}, hydratedKeys: new Set() });
  });

  it("returns default value when key is not present in storage", () => {
    const ls = RNLocalStorage("theme", { defaultValue: "light" });
    expect(ls.get()).toBe("light");
  });

  it("hydrates from storage on initialization if key exists", () => {
    storage.set("persistedKey", JSON.stringify({ count: 42 }));

    const ls = RNLocalStorage("persistedKey", {
      defaultValue: { count: 0 },
    });

    expect(ls.get()).toEqual({ count: 42 });
  });

  it("sets new value with direct value", () => {
    const ls = RNLocalStorage("theme", { defaultValue: "light" });
    ls.set("dark");
    expect(ls.get()).toBe("dark");
    expect(storage.getString("theme")).toBe('"dark"');
  });

  it("sets new value with function callback", () => {
    const counter = RNLocalStorage<number>("counter", { defaultValue: 10 });
    counter.set((prev) => prev + 5);
    expect(counter.get()).toBe(15);
    expect(storage.getString("counter")).toBe("15");
  });

  it("removes the value and resets get() to default value", () => {
    const ls = RNLocalStorage("user", { defaultValue: "guest" });
    ls.set("admin");
    expect(ls.get()).toBe("admin");

    const removed = ls.remove();
    expect(removed).toBe(true);
    expect(ls.get()).toBe("guest");
    expect(storage.contains("user")).toBe(false);
  });

  it("updates partial object value with direct partial", () => {
    type Profile = { name: string; age: number; city?: string };
    const ls = RNLocalStorage<Profile>("profile", {
      defaultValue: { name: "John", age: 30 },
    });

    ls.update({ age: 31, city: "New York" });
    expect(ls.get()).toEqual({ name: "John", age: 31, city: "New York" });
  });

  it("updates partial object value with update callback", () => {
    type Profile = { name: string; age: number };
    const ls = RNLocalStorage<Profile>("profile", {
      defaultValue: { name: "John", age: 30 },
    });

    ls.update((curr) => ({ age: curr.age + 1 }));
    expect(ls.get()).toEqual({ name: "John", age: 31 });
  });

  it("stores raw primitives when jsonSerialize is false", () => {
    const ls = RNLocalStorage<string>("raw_key", {
      defaultValue: "raw_init",
      jsonSerialize: false,
    });

    ls.set("raw_updated");
    expect(ls.get()).toBe("raw_updated");
    expect(storage.getString("raw_key")).toBe("raw_updated");
  });

  it("subscribes to changes and notifies listener", () => {
    const ls = RNLocalStorage<string>("status", { defaultValue: "idle" });
    const calls: string[] = [];

    const unsubscribe = ls.subscribe((val) => {
      calls.push(val);
    });

    ls.set("loading");
    ls.set("success");
    ls.set("success"); // Duplicate, should not trigger listener

    expect(calls).toEqual(["loading", "success"]);

    unsubscribe();
    ls.set("done");
    expect(calls).toEqual(["loading", "success"]);
  });

  it("subscribeWithSelector only triggers when selected value changes", () => {
    type ComplexState = { user: { name: string }; count: number };
    const ls = RNLocalStorage<ComplexState, string>("complex", {
      defaultValue: { user: { name: "Bob" }, count: 0 },
    });

    const selectedValues: string[] = [];
    const unsubscribe = ls.subscribeWithSelector(
      (s) => s.user.name,
      (name) => {
        selectedValues.push(name);
      },
    );

    // Updating count should not trigger selector listener
    ls.update({ count: 1 });
    expect(selectedValues).toEqual([]);

    // Updating name should trigger selector listener
    ls.update({ user: { name: "Alice" } });
    expect(selectedValues).toEqual(["Alice"]);

    unsubscribe();
  });
});
