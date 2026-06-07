import path from "path";
import { DescribeClassHelpers, describeClass } from "./describeClass";

class PreviewServiceDouble {
    static fromSource(): PreviewServiceDouble {
        return new PreviewServiceDouble();
    }

    onPreviewStart(): void {
        // noop
    }

    onPreviewStop(): void {
        // noop
    }
}

describe(describeClass.name, () => {
    it('Should create the file, class and method describe blocks in order', () => {
        const originalDescribe = globalThis.describe;
        const testCallback = jest.fn();
        const describeSpy = jest.fn((_: string, callback: () => void) => callback());

        globalThis.describe = describeSpy as unknown as typeof describe;

        try {
            describeClass(PreviewServiceDouble, ({ describeMethod }) => {
                describeMethod('onPreviewStart', testCallback);
            });
        } finally {
            globalThis.describe = originalDescribe;
        }

        expect(describeSpy.mock.calls.map(([title]) => title)).toEqual([
            path.dirname(expect.getState().testPath as string),
            PreviewServiceDouble.name,
            'onPreviewStart'
        ]);
        expect(testCallback).toHaveBeenCalledTimes(1);
    });

    it('Should create constructor and static method describe blocks', () => {
        const originalDescribe = globalThis.describe;
        const constructorCallback = jest.fn();
        const staticMethodCallback = jest.fn();
        const describeSpy = jest.fn((_: string, callback: () => void) => callback());

        globalThis.describe = describeSpy as unknown as typeof describe;

        try {
            describeClass(PreviewServiceDouble, ({ describeConstructor, describeStaticMethod }) => {
                describeConstructor(constructorCallback);
                describeStaticMethod('fromSource', staticMethodCallback);
            });
        } finally {
            globalThis.describe = originalDescribe;
        }

        expect(describeSpy.mock.calls.map(([title]) => title)).toEqual([
            path.dirname(expect.getState().testPath as string),
            PreviewServiceDouble.name,
            'constructor',
            'fromSource'
        ]);
        expect(constructorCallback).toHaveBeenCalledTimes(1);
        expect(staticMethodCallback).toHaveBeenCalledTimes(1);
    });

    it('Should only accept method names from the described class', () => {
        type MethodName = Parameters<DescribeClassHelpers<typeof PreviewServiceDouble>["describeMethod"]>[0];
        type StaticMethodName = Parameters<DescribeClassHelpers<typeof PreviewServiceDouble>["describeStaticMethod"]>[0];

        const validMethodName: MethodName = 'onPreviewStart';
        const validStaticMethodName: StaticMethodName = 'fromSource';

        // @ts-expect-error describeMethod must reject non-method members.
        const invalidMethodName: MethodName = 'missingMethod';

        // @ts-expect-error describeStaticMethod must reject instance members.
        const invalidStaticMethodName: StaticMethodName = 'onPreviewStart';

        expect(validMethodName).toBe('onPreviewStart');
        expect(validStaticMethodName).toBe('fromSource');
        expect(invalidMethodName).toBe('missingMethod');
        expect(invalidStaticMethodName).toBe('onPreviewStart');
    });
});