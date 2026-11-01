import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
    { ignores: ['dist', 'node_modules', 'sprites', 'siteimages', 'public'] },
    js.configs.recommended,
    {
        files: ['src/**/*.{js,jsx}'],
        plugins: { react, 'react-hooks': reactHooks },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: { ...globals.browser },
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        settings: { react: { version: 'detect' } },
        rules: {
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            'react/prop-types': 'off',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },
    {
        files: ['src/**/*.test.js'],
        languageOptions: { globals: { ...globals.node } },
    },
    {
        files: ['scripts/**/*.js', 'vite.config.js', 'eslint.config.js'],
        languageOptions: { globals: { ...globals.node } },
    },
];
