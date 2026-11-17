import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it, vi } from 'vite-plus/test';

import { webpackCompile } from '../../src/compile';

describe('webpack compilation end-to-end', () => {
    it('bundles a temporary entrypoint into the requested output directory', async () => {
        const directory = await mkdtemp(path.join(os.tmpdir(), 'webpack-vitest-'));
        const entry = path.join(directory, 'entry.js');
        const outputPath = path.join(directory, 'dist');
        const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

        try {
            await writeFile(entry, 'export const answer = 42;\n');
            const result = await webpackCompile({
                mode: 'development',
                context: directory,
                entry: './entry.js',
                output: { path: outputPath, filename: 'bundle.js' },
                cache: false,
            });

            expect(result.files.map(file => file.filename)).toContain('bundle.js');
            expect(await readFile(path.join(outputPath, 'bundle.js'), 'utf8')).toContain('answer');
        } finally {
            log.mockRestore();
            await rm(directory, { recursive: true, force: true });
        }
    }, 30_000);
});
