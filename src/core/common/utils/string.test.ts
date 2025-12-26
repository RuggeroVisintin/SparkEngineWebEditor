import { capitalize } from "./string";

describe('core/common/utils/string', () => {
    describe('capitalize', () => {
        it('should capitalize the first letter of a string', () => {
            const result = capitalize('hello world');
            expect(result).toBe('Hello world');
        });
    });
});