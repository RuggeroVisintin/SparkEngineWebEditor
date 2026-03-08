module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: 'scripts',
    testMatch: [
        '**/*.test.ts',
        '**/*.spec.ts',
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: 'tsconfig.json',
        }],
    },
};
