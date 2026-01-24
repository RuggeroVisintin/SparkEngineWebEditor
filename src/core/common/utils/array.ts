export function isArrayOf(array: Array<any>, guard: ((value: unknown) => boolean)): boolean {
    for (const item of array) {
        if (!guard(item)) {
            return false;
        }
    }

    return true;
}