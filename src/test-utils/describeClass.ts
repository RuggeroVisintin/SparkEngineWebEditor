import path from "path";

type ClassType = abstract new (...args: never[]) => object;

type MethodName<TInstance extends object> = Extract<{
    [TKey in keyof TInstance]: TInstance[TKey] extends (...args: never[]) => unknown ? TKey : never;
}[keyof TInstance], string>;

type StaticMethodName<TClass extends ClassType> = Extract<{
    [TKey in Exclude<keyof TClass, 'prototype' | 'length' | 'name'>]: TClass[TKey] extends (...args: never[]) => unknown ? TKey : never;
}[Exclude<keyof TClass, 'prototype' | 'length' | 'name'>], string>;

type DescribeMethod<TInstance extends object> = <TMethodName extends MethodName<TInstance>>(
    methodName: TMethodName,
    callback: jest.EmptyFunction,
) => void;

type DescribeStaticMethod<TClass extends ClassType> = <TMethodName extends StaticMethodName<TClass>>(
    methodName: TMethodName,
    callback: jest.EmptyFunction,
) => void;

export type DescribeClassHelpers<TClass extends ClassType> = {
    describeConstructor: (callback: jest.EmptyFunction) => void;
    describeMethod: DescribeMethod<InstanceType<TClass>>;
    describeStaticMethod: DescribeStaticMethod<TClass>;
};

function getCurrentTestDirectory(): string {
    const testPath = expect.getState().testPath;

    if (!testPath) {
        throw new Error('describeClass can only be used while Jest is evaluating a test file.');
    }

    return path.dirname(testPath);
}

export function describeClass<TClass extends ClassType>(
    target: TClass,
    callback: (helpers: DescribeClassHelpers<TClass>) => void,
): void {
    const describeConstructor = (constructorCallback: jest.EmptyFunction) => {
        describe('constructor', constructorCallback);
    };

    const describeMethod: DescribeMethod<InstanceType<TClass>> = (methodName, methodCallback) => {
        describe(String(methodName), methodCallback);
    };

    const describeStaticMethod: DescribeStaticMethod<TClass> = (methodName, methodCallback) => {
        describe(String(methodName), methodCallback);
    };

    describe(getCurrentTestDirectory(), () => {
        describe(target.name, () => {
            callback({ describeConstructor, describeMethod, describeStaticMethod });
        });
    });
}