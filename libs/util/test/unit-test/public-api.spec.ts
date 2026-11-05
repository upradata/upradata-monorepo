import { describe, expect, it } from 'vite-plus/test';

import * as util from '../../src';

describe('util public API', () => {
    it('exports the public function, object, promise, string, and type modules', () => {
        for (const name of [
            'assignRecursive',
            'isArray',
            'guidGenerator',
            'ensurePromise',
            'recreateString',
            'Style',
        ]) {
            expect(util).toHaveProperty(name);
        }
    });

    it('formats values and filters helpers through the package entrypoint', () => {
        expect(util.arrayToString([1, 2])).toBe('[ 1, 2 ]');
        expect(util.ensureArray(1)).toEqual([1]);
        expect(util.isInt(4)).toBe(true);
        expect(util.isInt(4.2)).toBe(false);
    });
});
