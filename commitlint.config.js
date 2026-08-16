module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': [
            2,
            'always',
            [
                'components',
                'core',
                'hooks',
                'pages',
                'primitives',
                'providers',
                'templates',
                'config',
                'types',
                'docs',
                'e2e',
                'ci',
                'deps',
                'release',
                'scripts'
            ]
        ]
    }
};
