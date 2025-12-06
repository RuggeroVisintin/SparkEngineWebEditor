/**
 * Release Please Plugin: Feature Flag Filter
 * 
 * This plugin filters commits with Feature-Flag footers based on production configuration.
 * Commits with disabled feature flags are excluded from changelog and version calculations.
 * 
 * Usage:
 *   npm install --save-dev ./release-please-plugin-feature-flags
 *   
 * In release-please-config.json:
 *   {
 *     "plugins": ["feature-flag-filter"]
 *   }
 */

const { ManifestPlugin } = require('release-please/build/src/plugin');
const { registerPlugin } = require('release-please/build/src/factories/plugin-factory');
const fs = require('fs');
const path = require('path');

class FeatureFlagFilter extends ManifestPlugin {
    constructor(github, targetBranch, repositoryConfig) {
        super(github, targetBranch, repositoryConfig);
        this.productionFlags = this.loadProductionFlags();
    }

    /**
     * Load feature flags from .env.production
     */
    loadProductionFlags() {
        const flags = {};
        try {
            // Look for .env.production starting from cwd and going up
            let currentDir = process.cwd();
            let envPath = path.join(currentDir, '.env.production');

            // If running from tests directory, go up to workspace root
            while (!fs.existsSync(envPath) && currentDir !== path.dirname(currentDir)) {
                currentDir = path.dirname(currentDir);
                envPath = path.join(currentDir, '.env.production');
            }

            const envContent = fs.readFileSync(envPath, 'utf-8');

            envContent.split('\n').forEach(line => {
                const trimmed = line.trim();
                // Skip comments and empty lines
                if (trimmed.startsWith('#') || !trimmed) return;

                const [key, value] = trimmed.split('=');
                if (key && key.startsWith('FEATURE_')) {
                    const flagName = key.replace('FEATURE_', '');
                    flags[flagName] = value.trim() === 'true';
                    this.logger.info(`Loaded production flag: ${flagName} = ${value}`);
                }
            });
        } catch (error) {
            this.logger.warn('Could not load .env.production:', error);
        }
        return flags;
    }

    /**
     * Filter commits based on Feature-Flag footer
     * This hook is called BEFORE commits are processed into release notes
     */
    processCommits(commits) {
        return commits.filter(commit => {
            // Check for Feature-Flag footer in commit notes
            const featureFlagNote = commit.notes?.find(note =>
                note.title === 'Feature-Flag' || note.title === 'FEATURE-FLAG'
            );

            if (!featureFlagNote) {
                // No feature flag - include commit
                return true;
            }

            const flagName = featureFlagNote.text.trim();
            const isEnabled = this.productionFlags[flagName];

            if (isEnabled === undefined) {
                this.logger.warn(`Feature flag ${flagName} not found in .env.production`);
                return false; // Exclude if flag doesn't exist
            }

            if (!isEnabled) {
                this.logger.info(`Excluding commit ${commit.sha?.slice(0, 7)} - feature flag ${flagName} is disabled`);
                return false;
            }

            this.logger.info(`Including commit ${commit.sha?.slice(0, 7)} - feature flag ${flagName} is enabled`);
            return true;
        });
    }
}

/**
 * Plugin initialization function
 * This is called by release-please when loading the plugin
 */
function init() {
    registerPlugin('feature-flag-filter', options =>
        new FeatureFlagFilter(
            options.github,
            options.targetBranch,
            options.repositoryConfig
        )
    );
    console.log('✓ Feature Flag Filter plugin registered');
}

module.exports = { init, FeatureFlagFilter };
