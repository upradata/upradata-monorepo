import { defineConfig } from '@upradata/vite-plus';

export default defineConfig(() => ({
    tsdown: 'web-lib',
    pack: {
        entry: ['src/index.ts'],
    },

    stencilConfig: './stencil.config.ts',
    test: {
        projects: [
            {
                test: {
                    name: 'stencil:unit',
                    include: ['src/**/*.{spec,unit,test}.{ts,tsx}'],
                    environment: 'stencil',
                },
            },
            {
                test: {
                    name: 'lib:unit',
                    include: ['./test/**/*.{spec,unit,test}.{ts,tsx}'],
                    environment: 'node',
                },
            },
        ],
    },
}));
