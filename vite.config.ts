import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

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

export default defineConfig(({ mode, command }) => {
    // Load env files based on mode (.env, .env.development, .env.production)
    // The third param '' means load ALL env vars, not just VITE_ prefixed ones
    const env = loadEnv(mode, process.cwd(), '');

    // Sanity check: prevent production builds with local SparkEngine symlink
    if (command === 'build') {
        const sparkEngineWebPath = path.resolve(process.cwd(), 'node_modules/sparkengineweb');

        try {
            const stats = fs.lstatSync(sparkEngineWebPath);
            if (stats.isSymbolicLink()) {
                const linkTarget = fs.readlinkSync(sparkEngineWebPath);
                throw new Error(
                    '\n❌ Production build failed: sparkengineweb is a symlink\n\n' +
                    `node_modules/sparkengineweb -> ${linkTarget}\n\n` +
                    'Local development builds cannot be used for production.\n' +
                    'This happens when SPARK_ENGINE_PATH is set in .env during npm install.\n\n' +
                    'To fix:\n' +
                    '1. Comment out SPARK_ENGINE_PATH in .env\n' +
                    '2. Run: npm install (to remove symlink and use npm package)\n' +
                    '3. Run: npm run build\n'
                );
            }
        } catch (err) {
            // Only throw if it's an actual symlink error, not ENOENT (file doesn't exist yet)
            if ((err as NodeJS.ErrnoException).code !== 'ENOENT' && err instanceof Error && err.message.includes('symlink')) {
                throw err;
            }
        }
    }

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
        preview: {
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
    };
});
