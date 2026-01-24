import { isAnimationFrame } from './guards';
import { Rgb } from 'sparkengineweb';

describe('isAnimationFrame', () => {
    it('Should return true for valid object with only duration', () => {
        const obj = { duration: 100 };

        expect(isAnimationFrame(obj)).toBe(true);
    });

    it('Should return false for object without duration property', () => {
        const obj = { material: {} };

        expect(isAnimationFrame(obj)).toBe(false);
    });

    it('Should return false for object with non-number duration', () => {
        const obj = { duration: 'not a number' };

        expect(isAnimationFrame(obj)).toBe(false);
    });

    it('Should return true for valid object with duration and material', () => {
        const obj = {
            duration: 100,
            material: { diffuseColor: new Rgb(255, 0, 0) }
        };

        expect(isAnimationFrame(obj)).toBe(true);
    });

    it('Should return false for null', () => {
        expect(isAnimationFrame(null)).toBe(false);
    });

    it('Should return false for undefined', () => {
        expect(isAnimationFrame(undefined)).toBe(false);
    });

    it('Should return false for non-object value', () => {
        expect(isAnimationFrame('not an object')).toBe(false);
        expect(isAnimationFrame(123)).toBe(false);
        expect(isAnimationFrame([])).toBe(false);
    });
});
