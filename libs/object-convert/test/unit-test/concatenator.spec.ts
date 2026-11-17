import { describe, expect, it } from 'vite-plus/test';

import { Concatenator, LiteralConcatenator } from '../../src/concatenator';

describe('object-convert concatenators', () => {
    it('exposes the concatenator constructors', () => {
        expect(Concatenator).toBeTypeOf('function');
        expect(LiteralConcatenator).toBeTypeOf('function');
    });
});
