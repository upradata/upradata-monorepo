import { defineConfig } from '@upradata/vite-plus';

export default defineConfig(() => ({
    tsdown: 'web-lib',
    pack: {
        entry: ['src/index.ts'],
    },
}));
