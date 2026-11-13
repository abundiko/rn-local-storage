---
"@abundiko/rn-local-storage": major
---

Upgrade to 2.0.0 and support react-native-mmkv v4 (Nitro Modules architecture):
- Upgrade peer dependencies to `react-native-mmkv >= 4.0.0` and require `react-native-nitro-modules >= 0.30.0`.
- Update storage instantiation from `new MMKV()` to `createMMKV()`.
- Update deletion calls from `storage.delete(key)` to `storage.remove(key)`.
- `removeItem()` in `useLocalStorage` and `remove()` in `RNLocalStorage` now return `boolean`.
- Add `ArrayBuffer` support in `serializeValue()` when `jsonSerialize` is `false`.
- Export `createMMKV` and MMKV v4 configuration types (`MMKV`, `Configuration`, `Mode`, `RecoveryStrategy`).
- Re-export `useStorageStore` and `safeParse` for direct store integration.
- Fix initial state diffing in `subscribe()` and `subscribeWithSelector()`.
