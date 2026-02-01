import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Parse feature flags from environment variables
function getFeatureFlags() {
    const flags: Record<string, boolean> = {};
    Object.keys(process.env).forEach(key => {
        if (key.startsWith('FEATURE_')) {
            const flagName = key.replace('FEATURE_', '');
            flags[flagName] = process.env[key] === 'true';
        }
    });
    return flags;
}

export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [
                    ['@babel/plugin-proposal-decorators', { version: '2023-05' }],
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@sparkengine': path.resolve(__dirname, 'node_modules/sparkengineweb'),
        },
    },
    define: {
        __FEATURE_FLAGS__: JSON.stringify(getFeatureFlags()),
    },    optimizeDeps: {
        // Pre-bundle sparkengineweb to handle its CommonJS exports
        include: ['@sparkengine', 'sparkengineweb'],
        esbuildOptions: {
            // Ensure esbuild processes sparkengineweb's CommonJS properly
            loader: {
                '.js': 'jsx',
            },
        },
    },    server: {
        port: 3000,
        strictPort: false,
    },
    build: {
        outDir: 'build',
        sourcemap: false,
        minify: 'esbuild',
        rollupOptions: {
            external: ['sparkengineweb', '@sparkengine'],
            output: {
                globals: {
                    sparkengineweb: 'sparkengineweb',
                    '@sparkengine': '@sparkengine',
                },
                manualChunks: {
                    'monaco-editor': ['monaco-editor'],
                },
            },
        },
    },
    esbuild: {
        logOverride: {
            'this-is-undefined-in-esm': 'silent',
        },
    },
});
