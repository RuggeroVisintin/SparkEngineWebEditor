import type { describeClass as describeClassType } from "./describeClass";

declare global {
    const describeClass: typeof describeClassType;
}

export { };