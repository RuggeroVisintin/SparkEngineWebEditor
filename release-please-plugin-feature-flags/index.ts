/**
 * Release Please Plugin: Feature Flag Filter
 * 
 * Custom ChangelogNotes implementation that filters commits based on feature flag status.
 * Commits with Feature-Flag footers pointing to disabled flags are excluded from changelog.
 * 
 * Usage:
 *   npm install --save-dev ./release-please-plugin-feature-flags
 *   
 * In release-please-config.json:
 *   {
 *     "packages": {
 *       ".": {
 *         "changelog-notes-type": "release-please-plugin-feature-flag-filter"
 *       }
 *     }
 *   }
 */

import { DefaultChangelogNotes } from 'release-please/build/src/changelog-notes/default';
import { BuildNotesOptions } from 'release-please/build/src/changelog-notes';
import { registerChangelogNotes } from 'release-please/build/src/factories/changelog-notes-factory';
import { ConventionalCommit } from 'release-please/build/src/commit';
import * as fs from 'fs';
import * as path from 'path';

interface ProductionFlags {
    [key: string]: boolean;
}

interface DefaultChangelogNotesOptions {
    commitPartial?: string;
    headerPartial?: string;
    mainTemplate?: string;
}

export class FeatureFlagFilterChangelogNotes extends DefaultChangelogNotes {
    private productionFlags: ProductionFlags;

    constructor(options?: DefaultChangelogNotesOptions) {
        super(options);
        this.productionFlags = this.loadProductionFlags();
    }

    /**
     * Load feature flags from .env.production
     */
    private loadProductionFlags(): ProductionFlags {
        const flags: ProductionFlags = {};
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
                    console.log(`✔ Loaded production flag: ${flagName} = ${value}`);
                }
            });
        } catch (error) {
            console.warn('Could not load .env.production:', error);
        }
        return flags;
    }

    /**
     * Override buildNotes to filter commits based on feature flags
     * This is called when generating changelog content
     */
    async buildNotes(commits: ConventionalCommit[], options: BuildNotesOptions): Promise<string> {
        // Filter commits based on feature flags
        const filteredCommits = commits.filter(commit => {
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
                console.warn(`⚠️  Feature flag ${flagName} not found in .env.production`);
                return false; // Exclude if flag doesn't exist
            }

            if (!isEnabled) {
                console.log(`ℹ️  Excluding commit ${commit.sha?.slice(0, 7)} - feature flag ${flagName} is disabled`);
                return false;
            }

            console.log(`ℹ️  Including commit ${commit.sha?.slice(0, 7)} - feature flag ${flagName} is enabled`);
            return true;
        });

        // Call parent buildNotes with filtered commits
        return super.buildNotes(filteredCommits, options);
    }
}

/**
 * Auto-register the changelog notes implementation when the module is loaded
 */
registerChangelogNotes('release-please-plugin-feature-flag-filter', (options?: DefaultChangelogNotesOptions) =>
    new FeatureFlagFilterChangelogNotes(options)
);
