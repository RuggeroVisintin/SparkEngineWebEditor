import type { describeClass as describeClassType } from "./describeClass";

declare global {
    let describeClass: typeof describeClassType;
}

export { };