import path from 'node:path';
import fs from 'fs-extra';
import { Cache } from '../cache';
import type { Stringable } from '../store';

const now = Date.now();

const cache = new Cache({
    path: './cache-dir/cache2.json',
    criteria: file => fs.statSync(file).blocks,
    isSameComparator: (file: string, criteria: Stringable) => {
        return `${fs.statSync(file).blocks}` === criteria && Date.now() - now < 5; // 5ms
    },
});

const cacheName = 'collection1';
cache.createCollectionIfNotExist(cacheName);

const root = path.join(__dirname, '..');

const allFiles = { files: '**/*', options: { cwd: root } };

console.log(cache.changedFiles(cacheName));

cache.addOrUpdateFile(cacheName, allFiles);
cache.save();
