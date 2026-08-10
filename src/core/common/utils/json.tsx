import { SerializableCallback } from "@sparkengine";

export function toJsonString(value: any): string {
    const functionKeys: string[] = [];

    const stringifiedFunctionJsonReplacer = (key: string, value: any): any => {
        if (value instanceof SerializableCallback) {
            functionKeys.push(key);

            const stringified = value.toString();
            return stringified;
        }

        return value;
    };

    let jsonString = JSON.stringify(value, stringifiedFunctionJsonReplacer);

    functionKeys.forEach((key) => {
        const keyPattern = new RegExp(`"${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
        jsonString = jsonString.replace(keyPattern, `"function::${key}"`);
    });

    return jsonString;
}

export function parseJsonString(jsonString: string): any {
    const functionKeysPattern = /"function::([^"]+)"/g;
    const functionKeys: { [key: string]: boolean } = {};

    jsonString = jsonString.replace(functionKeysPattern, (match, key) => {
        functionKeys[key] = true;
        return `"${key}"`;
    });

    const stringifiedFunctionJsonReplacer = (key: string, value: any): any => {
        if (key in functionKeys) {
            try {
                return SerializableCallback.fromString(value);
            } catch (e) {
                console.warn(`Failed to parse function for key ${key}:`, e);
            }
        }

        return value;
    };

    const result = JSON.parse(jsonString, stringifiedFunctionJsonReplacer);

    return result;
}