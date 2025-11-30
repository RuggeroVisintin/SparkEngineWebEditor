module.exports = {
    preset: 'jest-playwright-preset',
    testMatch: [
        '**/*.e2e.test.ts',
        '**/*.e2e.test.js'
    ],
    setupFilesAfterEnv: ['<rootDir>/e2e.setup.js'],
    testTimeout: 30000,
    rootDir: './e2e',
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': require.resolve('react-scripts/config/jest/babelTransform.js')
    },
    transformIgnorePatterns: [
        'node_modules/(?!(sparkengineweb|uuid)/)'
    ]
};