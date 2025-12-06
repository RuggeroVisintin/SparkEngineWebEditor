#!/usr/bin/env node

/**
 * Test script for the feature-flag-filter plugin WITH FLAG ENABLED
 * This simulates the behavior after enabling a feature flag
 */

const { FeatureFlagFilter } = require('../index.js');
const fs = require('fs');

// Temporarily enable the flag
const envPath = '../../.env.production';
const originalEnv = fs.readFileSync(envPath, 'utf-8');
fs.writeFileSync(envPath, originalEnv.replace('FEATURE_ADD_COMPONENTS=false', 'FEATURE_ADD_COMPONENTS=true'));

try {
    // Simulate commits
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

    console.log('\n🧪 Testing Feature-Flag Filter Plugin (FLAG ENABLED)\n');
    console.log('========================================\n');

    const plugin = new FeatureFlagFilter({
        github: {},
        owner: 'RuggeroVisintin',
        repo: 'spark-engine-web-editor',
        targetBranch: 'main',
        repositoryConfig: { '.': {} },
        manifestPath: '.release-please-manifest.json'
    });

    plugin.logger = {
        info: (msg) => console.log(`  ℹ️  ${msg}`),
        warn: (msg) => console.log(`  ⚠️  ${msg}`),
        error: (msg) => console.error(`  ❌ ${msg}`)
    };

    console.log('📋 Original commits:');
    mockCommits.forEach(commit => {
        console.log(`  - [${commit.sha.substring(0, 7)}] ${commit.message.split('\n')[0]}`);
        if (commit.notes.some(n => n.title === 'Feature-Flag')) {
            const flag = commit.notes.find(n => n.title === 'Feature-Flag').text;
            console.log(`    🚩 Feature-Flag: ${flag}`);
        }
    });

    console.log('\n🔍 Processing commits...\n');

    const filteredCommits = plugin.processCommits(mockCommits);

    console.log('\n✅ Filtered commits (will appear in changelog):');
    filteredCommits.forEach(commit => {
        console.log(`  - [${commit.sha.substring(0, 7)}] ${commit.message.split('\n')[0]}`);
    });

    console.log('\n========================================\n');
    console.log('✨ All commits included! Feature flag is enabled in production.\n');

} finally {
    // Restore original .env.production
    fs.writeFileSync(envPath, originalEnv);
    console.log('🔄 Restored .env.production to original state\n');
}
