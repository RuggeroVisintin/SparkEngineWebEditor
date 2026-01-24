import { isArrayOf } from './array';
import { isAnimationFrame } from './guards';

describe('isArrayOf', () => {
    it('Should return true for empty array', () => {
        const guard = () => false;

        expect(isArrayOf([], guard)).toBe(true);
    });

    it('Should return true when all elements pass guard', () => {
        const guard = (value: unknown) => typeof value === 'number';

        expect(isArrayOf([1, 2, 3], guard)).toBe(true);
    });

    it('Should return false when at least one element fails guard', () => {
        const guard = (value: unknown) => typeof value === 'number';

        expect(isArrayOf([1, 'two', 3], guard)).toBe(false);
        expect(isArrayOf([1, 2, 3, null], guard)).toBe(false);
    });

    it('Should work with isAnimationFrame guard', () => {
        const frames = [
            { duration: 100 },
            { duration: 200 },
        ];

        expect(isArrayOf(frames, isAnimationFrame)).toBe(true);
    });
});
