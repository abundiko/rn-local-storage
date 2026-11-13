# @abundiko/rn-local-storage

A lightweight, typed, and reactive local storage hook and utility for React Native, built on top of `react-native-mmkv` and `zustand`.

> **Compatibility Notice:**
> - Use version **`2.x.x`** for `react-native-mmkv` **`>= 4.0.0`** (Nitro Modules architecture).
> - Use version **`1.x.x`** for `react-native-mmkv` **`3.x.x`**.

---

## Prerequisites & Installation

`react-native-mmkv` v4 is built using [Nitro Modules](https://nitro.margelo.com). As a result, you must install `react-native-nitro-modules` alongside `react-native-mmkv` and `zustand`.

> **Requirements:** React Native **>= 0.75.0** (Supports both Old Architecture and New Architecture).

```bash
npm install @abundiko/rn-local-storage react-native-mmkv react-native-nitro-modules zustand
# or
bun add @abundiko/rn-local-storage react-native-mmkv react-native-nitro-modules zustand
# or
yarn add @abundiko/rn-local-storage react-native-mmkv react-native-nitro-modules zustand
```

### Expo Users
If you are using Expo, you must use a **development build** (`npx expo run:ios` or `npx expo run:android` / EAS Build) because `react-native-mmkv` and Nitro Modules contain native code and are not supported inside the standard Expo Go app.

---

## Breaking Changes in 2.0 (Migration from 1.x)

1. **`react-native-nitro-modules` is required:**
   Install `react-native-nitro-modules` in your application.

2. **`remove()` replaces `delete()`:**
   To align with `react-native-mmkv` v4 (where `.delete()` was replaced by `.remove()` to avoid C++ keyword collision), `storage.remove(key)` is used. Hook's `removeItem()` and instance's `remove()` now return a `boolean` indicating if the key was deleted.

3. **Storage Factory Function:**
   `storage` instance is created via `createMMKV()` factory from `react-native-mmkv` instead of `new MMKV()`. Both `createMMKV` and types (`MMKV`, `Configuration`, `Mode`, `RecoveryStrategy`) are exported for convenience.

4. **ArrayBuffer Storage Support:**
   When `jsonSerialize: false`, primitive types (`string`, `number`, `boolean`) and `ArrayBuffer` can be stored directly.

---

## Best Practices

### Create Custom Domain Hooks

**Avoid scattering `useLocalStorage` directly across multiple components.**

Using raw string keys directly in components can lead to:
- Scattered magic strings.
- Inconsistent types across the application.
- Difficulty when refactoring storage schemas.

Instead, create focused domain hooks for each storage item.

#### Example: `useLSTheme`

```tsx
// hooks/useLSTheme.ts
import { useLocalStorage } from "@abundiko/rn-local-storage";

type Theme = "light" | "dark";

export const useLSTheme = () => {
  const { item, setItem } = useLocalStorage<Theme>("app-theme", {
    defaultValue: "light",
  });

  return {
    theme: item,
    setTheme: setItem,
  };
};
```

#### Usage in Component

```tsx
// App.tsx
import { View, Text, Button } from "react-native";
import { useLSTheme } from "./hooks/useLSTheme";

export default function App() {
  const { theme, setTheme } = useLSTheme();

  return (
    <View style={{ backgroundColor: theme === "light" ? "#fff" : "#000", flex: 1, padding: 20 }}>
      <Text style={{ color: theme === "light" ? "#000" : "#fff" }}>Current Theme: {theme}</Text>
      <Button
        title="Toggle Theme"
        onPress={() => setTheme((curr) => (curr === "light" ? "dark" : "light"))}
      />
    </View>
  );
}
```

---

## Usage Reference

### Basic Usage

```tsx
import { useLocalStorage } from "@abundiko/rn-local-storage";

const { item, setItem, removeItem, updateItem } = useLocalStorage("my-key", {
  defaultValue: "default value",
});
```

### Functional Updates

Both `setItem` and `updateItem` support callback functions that receive the current state:

```tsx
const { item, setItem } = useLocalStorage<number>("counter", {
  defaultValue: 0,
});

// Update based on previous state
setItem((prev) => prev + 1);
```

### Typed Storage

```tsx
type User = {
  id: string;
  name: string;
  age: number;
};

const { item: user, setItem: setUser } = useLocalStorage<User>("user-profile", {
  defaultValue: { id: "1", name: "John", age: 30 },
});
```

### Using Selectors

Use selectors to subscribe only to specific parts of the state to optimize performance:

```tsx
const { item: userName } = useLocalStorage<User, string>("user-profile", {
  defaultValue: { id: "1", name: "John", age: 30 },
  selector: (user) => user.name,
});
```

### Custom Serialization / Raw Primitives

Disable JSON serialization when you want to store primitives (`string`, `number`, `boolean`) or `ArrayBuffer` directly into MMKV:

```tsx
const { item, setItem } = useLocalStorage("theme", {
  defaultValue: "light",
  jsonSerialize: false, // Store directly as primitive
});
```

### Updating Partial State (Deep Merge)

`updateItem` deeply merges nested objects instead of overwriting the whole state:

```tsx
type Settings = {
  theme: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
};

const { item, updateItem } = useLocalStorage<Settings>("settings", {
  defaultValue: {
    theme: "light",
    notifications: { email: true, push: false },
  },
});

// Deeply merges notifications.push without affecting notifications.email
updateItem({
  notifications: { push: true } as any,
});

// Or using an update function:
updateItem((curr) => ({
  notifications: { ...curr.notifications, push: true },
}));
```

### Direct Storage Access

Access the underlying `react-native-mmkv` instance directly:

```tsx
import { storage } from "@abundiko/rn-local-storage";

const value = storage.getString("some-key");
storage.set("some-key", "some-value");
const removed = storage.remove("some-key");
```

---

## Non-Hook Usage (Outside React Components)

Use `RNLocalStorage` when you need access to local storage outside React component lifecycles (e.g. background tasks, utility functions, state managers, services):

```ts
import { RNLocalStorage } from "@abundiko/rn-local-storage";

// Create instance
const themeStorage = RNLocalStorage<"light" | "dark">("app-theme", {
  defaultValue: "light",
});

// Get current value synchronously
const currentTheme = themeStorage.get();

// Update value (supports direct value or callback)
themeStorage.set("dark");
themeStorage.set((prev) => (prev === "dark" ? "light" : "dark"));

// Partial update
themeStorage.update((prev) => ({ ... }));

// Remove value (returns boolean)
const wasRemoved = themeStorage.remove();

// Subscribe to changes
const unsubscribe = themeStorage.subscribe((newTheme) => {
  console.log("Theme changed to:", newTheme);
});

// Subscribe with selector
const unsubscribeSelector = themeStorage.subscribeWithSelector(
  (state) => state,
  (val) => console.log("Selected:", val),
);

// Unsubscribe
unsubscribe();
unsubscribeSelector();
```

### Example: Theme Service

```ts
// services/ThemeService.ts
import { RNLocalStorage } from "@abundiko/rn-local-storage";

type Theme = "light" | "dark";

class ThemeService {
  private themeLS = RNLocalStorage<Theme>("app-theme", {
    defaultValue: "light",
  });

  getTheme(): Theme {
    return this.themeLS.get();
  }

  setTheme(theme: Theme): void {
    this.themeLS.set(theme);
  }

  toggleTheme(): void {
    this.themeLS.set((current) => (current === "light" ? "dark" : "light"));
  }

  onThemeChange(callback: (theme: Theme) => void): () => void {
    return this.themeLS.subscribe(callback);
  }
}

export const themeService = new ThemeService();
```

---

## API Reference

### `useLocalStorage<T, S>(key, options)`

Hook for managing local storage state in React components.

- **`key`**: `string` - The storage key.
- **`options`**: `UseSessionOptions<T, S>`
  - `defaultValue`: `T` - Fallback value if no value exists in storage.
  - `jsonSerialize?`: `boolean` (default: `true`) - Serialize with JSON.
  - `selector?`: `(state: T) => S` - Optional selector function.

**Returns:**
- `item`: `S` - The current value (or selected value).
- `setItem`: `(newValue: T | ((prev: T) => T)) => void` - Update value.
- `removeItem`: `() => boolean` - Remove value. Returns `true` if removed.
- `updateItem`: `(partial: Partial<T> | ((prev: T) => Partial<T>)) => void` - Deep merge partial update.

### `RNLocalStorage<T, S>(key, options)`

Non-hook class/function instance for storage outside React components.

**Returns an object with:**
- `get()`: `() => T`
- `set(newValue: T | ((prev: T) => T))`: `void`
- `remove()`: `() => boolean`
- `update(partial: Partial<T> | ((prev: T) => Partial<T>))`: `void`
- `subscribe(callback: (value: T) => void)`: `() => void`
- `subscribeWithSelector(selector: (state: T) => S, callback: (value: S) => void)`: `() => void`

### Exports

The library exports:
- `useLocalStorage`
- `RNLocalStorage`
- `storage` (Default `MMKV` instance)
- `useStorageStore` (Underlying Zustand store)
- `safeParse`
- `deepMerge`
- `serializeValue`
- `createMMKV` (from `react-native-mmkv`)
- Types: `RNLocalStorageInstance`, `StorageState`, `UseSessionOptions`, `SetValueCallback`, `UpdateValueCallback`, `StorageItemType`, `MMKV`, `Configuration`, `Mode`, `RecoveryStrategy`

---

## License

MIT © [Abundance Ken-Dickson](https://github.com/abundiko)
