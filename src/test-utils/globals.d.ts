import type { describeClass as describeClassType } from "./describeClass";

declare global {
    var describeClass: typeof describeClassType;
}

export {};