import { SerializableCallback } from "sparkengineweb";
import { parseJsonString, toJsonString } from "./json";

describe('core/common/utiles/json', () => {
    describe('toJsonString', () => {
        it('Should stringify functions and add the "function::" prefix to their keys', () => {
            const fn = SerializableCallback.fromFunction(function () { return 'test'; })
            const obj = {
                fn
            }

            const result = toJsonString(obj);

            expect(result).toEqual(`{"function::fn":"function () { return 'test'; }"}`);
        });

        it('Should not modify non-function values', () => {
            const value = { key: 'value' };

            const result = toJsonString(value);

            expect(result).toEqual(JSON.stringify(value));
        });
    });

    describe('parseJsonString', () => {
        it('Should parse a JSON string with function keys', () => {
            const jsonString = `{"function::myFunction":"function test() { return 1; }"}`;
            const result = parseJsonString(jsonString);

            expect(result.myFunction).toBeInstanceOf(SerializableCallback);
            expect(result.myFunction.call()).toBe(1);
        });
    });
})