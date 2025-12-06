#!/usr/bin/env node

/**
 * Test script for the feature-flag-filter plugin
 * This simulates how release-please will use the plugin
 */

const { FeatureFlagFilter } = require('../index.js');

// Simulate commits that would be passed to the plugin
// Note: release-please parses commit footers into 'notes' array
const mockCommits = [
    {
        sha: 'abc123',
        message: 'feat: add new component system\n\nFeature-Flag: ADD_COMPONENTS',
        files: ['src/components/NewComponent.tsx'],
        type: 'feat',
        scope: null,
        breaking: false,
        notes: [
            { title: 'Feature-Flag', text: 'ADD_COMPONENTS' }
        ],
        references: []
    },
    {
        sha: 'def456',
        message: 'fix: correct button styling',
        files: ['src/components/Button.tsx'],
        type: 'fix',
        scope: null,
        breaking: false,
        notes: [],
        references: []
    },
    {
        sha: 'ghi789',
        message: 'feat(editor): open components panel\n\nFeature-Flag: ADD_COMPONENTS',
        files: ['src/pages/Editor/ComponentsPanel/index.tsx'],
        type: 'feat',
        scope: 'editor',
        breaking: false,
        notes: [
            { title: 'Feature-Flag', text: 'ADD_COMPONENTS' }
        ],
        references: []
    }
];

console.log('\n🧪 Testing Feature-Flag Filter Plugin\n');
console.log('========================================\n');

// Initialize plugin with mock logger
const plugin = new FeatureFlagFilter({
    github: {},
    owner: 'RuggeroVisintin',
    repo: 'spark-engine-web-editor',
    targetBranch: 'main',
    repositoryConfig: {
        '.': {}
    },
    manifestPath: '.release-please-manifest.json'
});

// Add mock logger
plugin.logger = {
    info: (msg) => console.log(`  ℹ️  ${msg}`),
    warn: (msg) => console.log(`  ⚠️  ${msg}`),
    error: (msg) => console.error(`  ❌ ${msg}`)
};

console.log('📋 Original commits:');
mockCommits.forEach(commit => {
    console.log(`  - [${commit.sha.substring(0, 7)}] ${commit.message.split('\n')[0]}`);
    if (commit.message.includes('Feature-Flag:')) {
        const flag = commit.message.match(/Feature-Flag:\s*(\w+)/)?.[1];
        console.log(`    🚩 Feature-Flag: ${flag}`);
    }
});

console.log('\n🔍 Processing commits...\n');

// Process commits
try {
    const filteredCommits = plugin.processCommits(mockCommits);

    console.log('✅ Filtered commits (will appear in changelog):');
    if (filteredCommits.length === 0) {
        console.log('  (none - all commits were filtered out)');
    } else {
        filteredCommits.forEach(commit => {
            console.log(`  - [${commit.sha.substring(0, 7)}] ${commit.message.split('\n')[0]}`);
        });
    }

    console.log('\n❌ Excluded commits (feature flags disabled):');
    const excluded = mockCommits.filter(c => !filteredCommits.includes(c));
    if (excluded.length === 0) {
        console.log('  (none - all commits passed through)');
    } else {
        excluded.forEach(commit => {
            const flag = commit.message.match(/Feature-Flag:\s*(\w+)/)?.[1];
            console.log(`  - [${commit.sha.substring(0, 7)}] ${commit.message.split('\n')[0]}`);
            console.log(`    🚩 Flag '${flag}' is disabled in .env.production`);
        });
    }

    console.log('\n========================================\n');
    console.log('💡 To enable these commits in the changelog:');
    console.log('   1. Set FEATURE_ADD_COMPONENTS=true in .env.production');
    console.log('   2. Commit and push the change');
    console.log('   3. Next release will include all commits\n');
} catch (err) {
    console.error('❌ Error processing commits:', err);
    process.exit(1);
}
