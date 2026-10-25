import { defineConfig } from 'vite-plus';

export default defineConfig({
    // Formatting with Oxfmt
    fmt: {
        printWidth: 120,
        tabWidth: 4,
        trailingComma: 'all',
        singleQuote: true,
        semi: true,
        arrowParens: 'avoid',
        bracketSameLine: true,
        bracketSpacing: true,
        embeddedLanguageFormatting: 'auto',
        experimentalOperatorPosition: 'start',
        insertFinalNewline: true,
        jsdoc: true,
        objectWrap: 'preserve',
        proseWrap: 'preserve',
        quoteProps: 'consistent',
        singleAttributePerLine: false,
        useTabs: false,
        sortTailwindcss: {
            functions: ['clsx', 'cn', 'cva'],
            attributes: [],
            preserveDuplicates: false,
            preserveWhitespace: false,
        },
        sortPackageJson: {
            sortScripts: true,
        },
        sortImports: {
            order: 'asc',
            ignoreCase: true,
            newlinesBetween: true,
            sortSideEffects: false,

            // Aliases for modules internal to each package
            internalPattern: ['@/'],

            // Custom workspace package group
            customGroups: [
                {
                    groupName: 'upradata',
                    elementNamePattern: ['@upradata/**'],
                },
            ],

            // Import groups, from first to last
            groups: [
                'builtin',
                'external',
                'upradata',
                'internal',
                'subpath',
                'parent',
                'sibling',
                'index',
                'style',
                'unknown',
            ],
        },
    },

    // Linting with Oxlint
    lint: {
        ignorePatterns: ['**/dist/**', '**/coverage/**', '**/node_modules/**'],
        options: {
            typeAware: true,
            typeCheck: true,
            reportUnusedDisableDirectives: 'warn',
            respectEslintDisableDirectives: true,
        },
        rules: {
            // Correctness and safety
            'no-debugger': 'error',
            'no-duplicate-imports': 'error',
            'no-unreachable': 'error',
            'no-constant-condition': 'error',

            // Node.js import conventions
            'unicorn/prefer-node-protocol': 'error',

            // Avoid accidental production logging.
            // Keep console.error and console.warn if useful.
            'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
    },

    // Combined formatting, linting and type checking
    check: {
        fmt: true,
        lint: true,
    },

    // Testing with Vite+'s integrated Vitest
    test: {
        globals: true,
        environment: 'node',
        passWithNoTests: true,
        include: ['**/src/**/*.{test,spec}.{ts,tsx}', '**/test/**/*.{test,spec}.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: ['**/node_modules/**', '**/dist/**', '**/*.test.ts', '**/*.spec.ts'],
        },
    },

    staged: {
        // vp lint --fix faster than vp fmt --write
        // but vp fmt --write is more thorough and consistent, so we use it for non-staged files
        '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}': 'vp check --fix',
        '*.{json,jsonc,md,mdx,css,scss}': 'vp fmt --write',
    },
});
