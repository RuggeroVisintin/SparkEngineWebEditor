module.exports = {
    preset: 'jest-playwright-preset',
    setupFilesAfterEnv: ['<rootDir>/e2e.setup.js'],
    testMatch: ['<rootDir>/e2e/**/*.e2e.test.{js,ts}'],
    testEnvironment: 'node',
    testTimeout: 30000,
    globals: {
        'ts-jest': {
            tsconfig: 'e2e/tsconfig.json'
        }
    }
};