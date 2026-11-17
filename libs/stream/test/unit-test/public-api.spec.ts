import { describe, expect, it } from 'vite-plus/test';

import * as streamTools from '../../src';
import { emptyStream } from '../../src/empty';
import { filter } from '../../src/filter';
import { passThrough } from '../../src/pass-through';

describe('stream public API', () => {
    it('exports the stream helpers', () => {
        expect(streamTools).toHaveProperty('filter', filter);
        expect(streamTools).toHaveProperty('passThrough', passThrough);
        expect(streamTools).toHaveProperty('emptyStream', emptyStream);
        expect(streamTools).toHaveProperty('concatStreams');
        expect(streamTools).toHaveProperty('ifthen');
        expect(streamTools).toHaveProperty('ternary');
        expect(streamTools).toHaveProperty('waitFlush');
    });

    it('constructs a transform for the pass-through helper', () => {
        expect(passThrough()).toHaveProperty('write');
    });

    it('creates a readable stream that ends without chunks', async () => {
        const chunks: unknown[] = [];
        for await (const value of emptyStream()) chunks.push(value);
        expect(chunks).toEqual([]);
    });
});
