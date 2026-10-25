import { defineConfig } from '@upradata/vite-plus';

export default defineConfig(() => ({
    tsdown: 'node-lib',
    pack: {
        entry: [
            'src/index.ts',
            'src/json/json.command.ts',
            'src/json/csv-to-json.command.ts',
            'src/json/json-to-csv.command.ts',
        ],
    },
}));
