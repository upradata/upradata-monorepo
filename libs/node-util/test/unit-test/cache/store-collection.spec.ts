import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

import { isFilePrint, StoreCollection } from '../../../src/cache/store-collection';

describe('StoreCollection', () => {
    it('creates nested collections and iterates file prints', () => {
        const store = new StoreCollection('/tmp/cache.json');
        const print = { mtime: 123, criteria: 'hash' };
        store.addFilePrint('file.ts', print, 'src', 'nested');

        expect(store.getCollection('src.nested')?.collection['file.ts']).toEqual(print);
        expect([...store.filePrintIterator()].map(file => [file.filepath, file.collectionName])).toEqual([
            ['file.ts', 'src.nested'],
        ]);
        expect(store.collectionNames).toEqual(['src']);
        expect(isFilePrint(print)).toBe(true);
        expect(isFilePrint({ mtime: '123' })).toBe(false);
    });

    it('saves and reloads its tree from a temporary cache file', async () => {
        const directory = await mkdtemp(path.join(os.tmpdir(), 'node-util-cache-'));
        const filename = path.join(directory, 'cache.json');
        try {
            const store = new StoreCollection(filename);
            store.addFilePrint('index.ts', { mtime: 42 }, 'src');
            store.save();

            const restored = new StoreCollection(filename).load();
            expect(restored.toObject()).toEqual({ src: { 'index.ts': { mtime: 42 } } });
            expect(JSON.parse(await readFile(filename, 'utf8'))).toEqual(restored.toObject());
        } finally {
            await rm(directory, { recursive: true, force: true });
        }
    });
});
