# @abundiko/rn-local-storage

A lightweight, typed, and reactive local storage hook for React Native, built on top of `react-native-mmkv` and `zustand`.

## Installation

```bash
npm install @abundiko/rn-local-storage react-native-mmkv zustand
# or
bun add @abundiko/rn-local-storage react-native-mmkv zustand
```

## NOTE

- if youre using expo, you need to use a development build because `react-native-mmkv` is not supported in the expo go app

## Best Practices

### Create Custom Hooks

**Avoid using `useLocalStorage` directly in your components.**

Using `useLocalStorage` directly can lead to:
- Scattered magic strings (keys).
- Inconsistent types across the app.
- Difficulty in refactoring.

Instead, create domain-specific hooks for each storage key.

#### Example: `useLSTheme`

```tsx
// hooks/useLSTheme.ts
import { useLocalStorage } from '@abundiko/rn-local-storage';

type Theme = 'light' | 'dark';

export const useLSTheme = () => {
  const { item, setItem } = useLocalStorage<Theme>('app-theme', {
    defaultValue: 'light',
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
import { View, Text, Button } from 'react-native';
import { useLSTheme } from './hooks/useLSTheme';

export default function App() {
  const { theme, setTheme } = useLSTheme();

  return (
    <View style={{ backgroundColor: theme === 'light' ? '#fff' : '#000' }}>
      <Text>Current Theme: {theme}</Text>
      <Button
        title="Toggle Theme"
        onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />
    </View>
  );
}
```

## Usage Reference

### Basic Usage

```tsx
import { useLocalStorage } from '@abundiko/rn-local-storage';

const { item, setItem, removeItem } = useLocalStorage('my-key', {
  defaultValue: 'default value',
});
```

### Typed Storage

```tsx
type User = {
  id: string;
  name: string;
  age: number;
};

const { item: user, setItem: setUser } = useLocalStorage<User>('user-profile', {
  defaultValue: { id: '1', name: 'John', age: 30 },
});
```

### Using Selectors

Use selectors to subscribe to specific parts of the state to optimize performance.

```tsx
const { item: userName } = useLocalStorage<User, string>('user-profile', {
  defaultValue: { id: '1', name: 'John', age: 30 },
  selector: (user) => user.name,
});
```

### Custom Serialization

Disable JSON serialization for simple strings.

```tsx
const { item, setItem } = useLocalStorage('theme', {
  defaultValue: 'light',
  jsonSerialize: false, // Store as raw string
});
```

### Accessing the Storage Instance

Direct synchronous access to `react-native-mmkv`.

```tsx
import { storage } from '@abundiko/rn-local-storage';

const value = storage.getString('some-key');
storage.set('some-key', 'some-value');
```

### Updating Partial State

Shallow merge updates.

```tsx
const { updateItem } = useLocalStorage<User>('user-profile', {
  defaultValue: { id: '1', name: 'John', age: 30 },
});

updateItem({ age: 31 });
```

## API

### `useLocalStorage<T, S>(key, options)`

- **key**: `string` - The unique key for the storage item.
- **options**: `UseSessionOptions<T, S>`
  - **defaultValue**: `T` - The value to use if the key does not exist.
  - **jsonSerialize**: `boolean` (default: `true`) - Enable/disable JSON serialization.
  - **selector**: `(state: T) => S` - Optional selector function.

Returns:
- **item**: `S` - The current value.
- **setItem**: `(newValue: T) => void` - Update the value.
- **removeItem**: `() => void` - Remove the item.
- **updateItem**: `(partial: Partial<T>) => void` - Shallow update.