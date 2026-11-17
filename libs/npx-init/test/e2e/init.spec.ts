import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const prompt = vi.hoisted(() => vi.fn());
vi.mock('prompts', () => ({ default: prompt }));

import { init } from '../../src/init';

describe('npx-init end-to-end', () => {
    it('writes generated package metadata from a local config template', async () => {
        const directory = await mkdtemp(path.join(os.tmpdir(), 'npx-init-vitest-'));
        const originalCwd = process.cwd();
        const cwd = vi.spyOn(process, 'cwd').mockReturnValue(directory);

        try {
            await writeFile(path.join(directory, 'package.json'), JSON.stringify({ name: 'fixture' }));
            await writeFile(
                path.join(directory, 'npx-init.json'),
                JSON.stringify({ basic: { title: 'Basic', file: './template.mjs' } }),
            );
            await writeFile(
                path.join(directory, 'template.mjs'),
                "export default { name: 'fixture-generated', version: '1.0.0', license: 'MIT' };\n",
            );

            prompt.mockReset().mockResolvedValueOnce({ yes: true }).mockResolvedValueOnce({ key: 'basic' });
            await init();

            const generated = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));
            expect(generated).toMatchObject({ name: 'fixture-generated', version: '1.0.0', license: 'MIT' });
            expect(prompt).toHaveBeenCalledTimes(2);
        } finally {
            cwd.mockRestore();
            expect(process.cwd()).toBe(originalCwd);
            await rm(directory, { recursive: true, force: true });
        }
    });
});
import { describe, expect, it, vi } from 'vite-plus/test';
