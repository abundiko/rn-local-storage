import type { } from "./types.js";

export function serializeValue(
  value: unknown,
  jsonSerialize: boolean,
): string | number | boolean {
  if (jsonSerialize) {
    return JSON.stringify(value);
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  throw new Error(
    `MMKV can only store primitive types (string, number, boolean) when jsonSerialize is false. ` +
      `Received type: ${typeof value}. Either set jsonSerialize to true or pass a primitive value.`,
  );
}

export function deepMerge<T extends Record<string, unknown>>(
  current: T,
  partial: Partial<T>,
): T {
  const result: Record<string, unknown> = { ...current };

  for (const key in partial) {
    const currentValue = current[key];
    const partialValue = partial[key];

    if (
      partialValue !== null &&
      partialValue !== undefined &&
      typeof partialValue === "object" &&
      !Array.isArray(partialValue) &&
      typeof currentValue === "object" &&
      currentValue !== null &&
      !Array.isArray(currentValue)
    ) {
      result[key] = deepMerge(
        currentValue as Record<string, unknown>,
        partialValue as Record<string, unknown>,
      );
    } else if (partialValue !== undefined) {
      result[key] = partialValue;
    }
  }

  return result as T;
}