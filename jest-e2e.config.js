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
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: 'e2e/tsconfig.json'
        }],
        '^.+\\.jsx?$': 'esbuild-jest'
    },
    transformIgnorePatterns: [
        'node_modules/(?!(sparkengineweb|uuid)/)'
    ],
    reporters: [
        'default',
        ['<rootDir>/../jest-todo-reporter.js', { maxTodos: 0 }]
    ]
};