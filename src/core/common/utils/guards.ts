import { AnimationFrame } from "sparkengineweb";

export const isAnimationFrame = (value: unknown): value is AnimationFrame => {
    if (value === null || typeof value !== 'object') return false;

    const frame = value as AnimationFrame;
    return 'duration' in (value as any) && typeof frame.duration === 'number';
};