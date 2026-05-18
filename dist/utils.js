export function serializeValue(value, jsonSerialize) {
    if (jsonSerialize) {
        return JSON.stringify(value);
    }
    if (typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean") {
        return value;
    }
    throw new Error(`MMKV can only store primitive types (string, number, boolean) when jsonSerialize is false. ` +
        `Received type: ${typeof value}. Either set jsonSerialize to true or pass a primitive value.`);
}
export function deepMerge(current, partial) {
    const result = Object.assign({}, current);
    for (const key in partial) {
        const currentValue = current[key];
        const partialValue = partial[key];
        if (partialValue !== null &&
            partialValue !== undefined &&
            typeof partialValue === "object" &&
            !Array.isArray(partialValue) &&
            typeof currentValue === "object" &&
            currentValue !== null &&
            !Array.isArray(currentValue)) {
            result[key] = deepMerge(currentValue, partialValue);
        }
        else if (partialValue !== undefined) {
            result[key] = partialValue;
        }
    }
    return result;
}
//# sourceMappingURL=utils.js.map