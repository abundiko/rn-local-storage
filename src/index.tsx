/**
 * @packageDocumentation
 * @module RnLocalStorage
 * @description Local storage for react native
 * @author Abundance Ken-Dickson
 * @copyright 2025 Abundance Ken-Dickson
 * @license MIT
 * @see https://github.com/abundiko/rn-local-storage
 */

export { useLocalStorage } from './hooks/useLocalStorage.js';
export { storage, useStorageStore, safeParse } from './store/storage.js';
export { RNLocalStorage } from './RNLocalStorage.js';
export { deepMerge, serializeValue } from './utils.js';
export { createMMKV } from 'react-native-mmkv';
export type { MMKV, Configuration, Mode, RecoveryStrategy } from 'react-native-mmkv';
export type { RNLocalStorageInstance } from './RNLocalStorage.js';
export type { StorageState } from './store/storage.js';
export type {
  UseSessionOptions,
  SetValueCallback,
  UpdateValueCallback,
  StorageItemType,
} from './types.js';
