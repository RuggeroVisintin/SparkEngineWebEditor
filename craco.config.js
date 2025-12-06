const path = require("path");
const CracoAlias = require("craco-alias");
const webpack = require("webpack");

const SPARK_ENGINE_PATH = path.resolve(__dirname, "node_modules/sparkengineweb");

// Parse feature flags from environment variables
function getFeatureFlags() {
    const flags = {};
    Object.keys(process.env).forEach(key => {
        if (key.startsWith('FEATURE_')) {
            const flagName = key.replace('FEATURE_', '');
            flags[flagName] = process.env[key] === 'true';
        }
    });
    return flags;
}

module.exports = {
    plugins: [{
        plugin: CracoAlias,
        options: {
            unsafeAllowModulesOutsideOfSrc: true,
            aliases: {
                '@sparkengine': SPARK_ENGINE_PATH
            }
        }
    }],
    eslint: {
        // Use our eslint config instead
        enable: false,
    },
    webpack: {
        configure: (webpackConfig) => {
            // Ignore source map warnings for Monaco editor
            webpackConfig.ignoreWarnings = [
                /Failed to parse source map/,
            ];

            // Add DefinePlugin for feature flags
            // This replaces __FEATURE_FLAGS__ at compile time, enabling dead code elimination
            webpackConfig.plugins.push(
                new webpack.DefinePlugin({
                    '__FEATURE_FLAGS__': JSON.stringify(getFeatureFlags())
                })
            );

            return webpackConfig;
        },
    },
}