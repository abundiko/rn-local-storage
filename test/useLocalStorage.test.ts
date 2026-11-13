import { beforeEach, describe, expect, it } from "bun:test";
import React, { act } from "react";
import ReactTestRenderer from "react-test-renderer";
import { useLocalStorage } from "../src/hooks/useLocalStorage.js";
import { storage, useStorageStore } from "../src/store/storage.js";

function renderCustomHook<T>(hookFn: () => T) {
  const ref = { current: undefined as unknown as T };
  function TestComponent() {
    ref.current = hookFn();
    return null;
  }
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(React.createElement(TestComponent));
  });

  return {
    get current() {
      return ref.current;
    },
    unmount: () => {
      act(() => {
        renderer.unmount();
      });
    },
  };
}

describe("useLocalStorage", () => {
  beforeEach(() => {
    storage.clearAll();
    useStorageStore.setState({ data: {}, hydratedKeys: new Set() });
  });

  it("returns default value when not set in storage", () => {
    const hook = renderCustomHook(() =>
      useLocalStorage("hook-key", { defaultValue: "init" }),
    );
    expect(hook.current.item).toBe("init");
  });

  it("sets and updates item", () => {
    const hook = renderCustomHook(() =>
      useLocalStorage("counter", { defaultValue: 0 }),
    );

    act(() => {
      hook.current.setItem(5);
    });
    expect(hook.current.item).toBe(5);
    expect(storage.getString("counter")).toBe("5");

    act(() => {
      hook.current.setItem((prev) => prev + 10);
    });
    expect(hook.current.item).toBe(15);
  });

  it("removes item", () => {
    const hook = renderCustomHook(() =>
      useLocalStorage("user", { defaultValue: "guest" }),
    );

    act(() => {
      hook.current.setItem("admin");
    });
    expect(hook.current.item).toBe("admin");

    let removed = false;
    act(() => {
      removed = hook.current.removeItem();
    });
    expect(removed).toBe(true);
    expect(hook.current.item).toBe("guest");
    expect(storage.contains("user")).toBe(false);
  });

  it("updates partial object", () => {
    type Profile = { name: string; age: number };
    const hook = renderCustomHook(() =>
      useLocalStorage<Profile>("profile", {
        defaultValue: { name: "John", age: 30 },
      }),
    );

    act(() => {
      hook.current.updateItem({ age: 31 });
    });
    expect(hook.current.item).toEqual({ name: "John", age: 31 });
  });

  it("supports selectors", () => {
    type User = { profile: { displayName: string } };
    const hook = renderCustomHook(() =>
      useLocalStorage<User, string>("user-selector", {
        defaultValue: { profile: { displayName: "Alice" } },
        selector: (u) => u.profile.displayName,
      }),
    );

    expect(hook.current.item).toBe("Alice");
  });
});
