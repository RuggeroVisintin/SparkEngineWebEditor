import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Parse feature flags from environment variables
function getFeatureFlags(env: Record<string, string>) {
    const flags: Record<string, boolean> = {};
    Object.keys(env).forEach(key => {
        if (key.startsWith('FEATURE_')) {
            const flagName = key.replace('FEATURE_', '');
            flags[flagName] = env[key] === 'true';
        }
    });
    return flags;
}

export default defineConfig(({ mode }) => {
    // Load env files based on mode (.env, .env.development, .env.production)
    // The third param '' means load ALL env vars, not just VITE_ prefixed ones
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            react({
                babel: {
                    plugins: [
                        ['@babel/plugin-proposal-decorators', { version: '2023-05' }],
                    ],
                },
            }),
        ],
        publicDir: 'public',
        resolve: {
            alias: {
                '@sparkengine': path.resolve(__dirname, 'node_modules/sparkengineweb'),
            },
        },
        define: {
            __FEATURE_FLAGS__: JSON.stringify(getFeatureFlags(env))
        },
        optimizeDeps: {
            // Pre-bundle sparkengineweb to handle its CommonJS exports
            include: ['@sparkengine', 'sparkengineweb'],
            esbuildOptions: {
                // Ensure esbuild processes sparkengineweb's CommonJS properly
                loader: {
                    '.js': 'jsx',
                },
            },
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
    };
});
