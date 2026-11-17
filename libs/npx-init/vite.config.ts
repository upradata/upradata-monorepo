import { defineConfig } from '@upradata/vite-plus';

export default defineConfig(() => ({
    tsdown: 'node-lib',
    pack: {
        entry: ['src/index.ts', 'src/run.ts'],
    },
}));
