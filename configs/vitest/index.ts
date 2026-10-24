import { mergeConfig, defineConfig as vitePlusDefineConfig } from 'vite-plus';

const baseConfig = vitePlusDefineConfig({
    test: {
        globals: true,
        environment: 'node',
        passWithNoTests: true,
        include: ['src/**/*.{test,spec}.{ts,tsx}', 'test/**/*.{test,spec}.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: ['node_modules/', 'dist/', 'lib/', 'lib-esm/', '**/*.test.ts', '**/*.spec.ts'],
        },
    },
});

export const defineConfig = (config = {}) => mergeConfig(baseConfig, config);

export default baseConfig;
