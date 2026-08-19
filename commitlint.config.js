module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': [
            2,
            'always',
            [
                // User facing
                'assets',
                'preview',
                'project',
                'scene',
                'scripting',
                'editor',
                // Technical
                'deps',
                'deps-dev',
                'e2e',
                'ci',
                'docs',
                'release',
                'scripts'
            ]
        ]
    }
};
