import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactDoctor from "eslint-plugin-react-doctor";
import globals from "globals";

export default [
    // Global ignore patterns
    {
        ignores: [
            "build/",
            "dist/",
            "node_modules/",
            "coverage/",
            ".eslintrc.json",
            "eslint.config.js",
            "**/*.{d.ts,js}",
            "**/__mocks__/**",
            "**/test-utils/**",
        ]
    },

    // Only core JS recommended rules
    js.configs.recommended,

    // 1. Main Configuration Block (Strict - runs on standard app source files)
    {
        files: ["src/**/*.{ts,tsx}"],
        ignores: ["src/test-utils/**", "src/**/*.test.{ts,tsx}"],
        plugins: {
            "@typescript-eslint": tseslint.plugin,
            react: reactPlugin,
            "react-hooks": reactHooksPlugin,
            "react-doctor": reactDoctor,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: { jsx: true }
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
                es2021: "readonly"
            }
        },
        settings: {
            react: { version: "detect" }
        },
        rules: {
            // --- Disable core rules that conflict with TypeScript ---
            "no-unused-vars": "off",
            "no-undef": "off",          // <--- Prevents false errors on TS types/interfaces
            "no-redeclare": "off",      // <--- Prevents errors on TS function overloads
            "no-shadow": "off",         // <--- Prevents errors on TS generics shadowing

            // --- Your custom rules & formatting ---
            "camelcase": "error",
            "default-case-last": "error",
            "curly": ["error", "multi-line"],
            "default-param-last": "error",
            "eqeqeq": "error",
            "no-eval": "error",
            "no-implied-eval": "error",
            "indent": ["error", 4],
            
            // --- React Hooks rules ---
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            
            // --- TypeScript rules ---
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    "argsIgnorePattern": "^_",
                    "varsIgnorePattern": "^_"
                }
            ],
            "@typescript-eslint/no-unsafe-function-type": "warn",
            "@typescript-eslint/no-unused-expressions": "warn",

            // --- React Doctor rules ---
            ...Object.fromEntries(
                Object.entries(reactDoctor.configs.recommended.rules).map(([key, value]) => [
                    key,
                    Array.isArray(value) 
                        ? ["warn", ...value.slice(1)] 
                        : "warn"
                ])
            )
        }
    },

    // 2. Relaxed Configuration Block (For test-utils and test files)
    {
        files: ["src/test-utils/**/*.{ts,tsx}"],
        plugins: {
            "@typescript-eslint": tseslint.plugin,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: { jsx: true }
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
                describeClass: "readonly", // Fixes 'describeClass is not defined',
                React: "readonly", // Fixes 'React is not defined'
                es2021: "readonly"
            }
        },
        rules: {
            // Turns off strict checks for test helpers and test files
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unsafe-function-type": "off",
            "@typescript-eslint/no-unused-expressions": "off",
            "no-undef": "off"
        }
    }
];