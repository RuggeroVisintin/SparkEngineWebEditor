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
    root: 'public',
    plugins: [react()],
    resolve: {
        alias: {
            '@sparkengine': path.resolve(__dirname, 'node_modules/sparkengineweb'),
        },
    },
    define: {
        __FEATURE_FLAGS__: JSON.stringify(getFeatureFlags()),
    },
    server: {
        port: 3000,
        strictPort: false,
    },
    build: {
        outDir: 'build',
        sourcemap: false,
        minify: 'esbuild',
        rollupOptions: {
            output: {
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
