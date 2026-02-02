// Load environment variables: .env.development first, then .env (overrides)
require('dotenv').config({ path: '.env.development' });
require('dotenv').config({ path: '.env', override: true });

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: '.',
    roots: [
        '<rootDir>/src',
    ],
    testMatch: [
        '**/__tests__/**/*.ts?(x)',
        '**/?(*.)+(spec|test).ts?(x)',
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    moduleNameMapper: {
        '^@sparkengine(.*)$': '<rootDir>/node_modules/sparkengineweb$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: 'tsconfig.test.json',
            diagnostics: {
                ignoreCodes: [1343]  // Ignore import.meta error
            },
            astTransformers: {
                before: [
                    {
                        path: 'ts-jest-mock-import-meta',
                        options: {
                            metaObjectReplacement: {
                                url: 'https://mock.url',
                                env: process.env
                            }
                        }
                    }
                ],
            },
        }],
        '^.+\\.jsx?$': 'esbuild-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!.*(uuid|sparkengineweb)/)',
    ],
    globals: {
        'import.meta': {
            url: 'file:///mock-path/',
        },
    },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/index.tsx',
        '!src/**/*.test.{ts,tsx}',
    ],
};
