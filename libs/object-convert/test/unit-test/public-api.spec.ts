import { describe, expect, it } from 'vite-plus/test';

import * as objectConvert from '../../src';

describe('object-convert public API', () => {
    it('exports its array, object, literal, concatenator, and element converters', () => {
        for (const name of [
            'convert',
            'Concatenator',
            'LiteralConcatenator',
            'ElementFactory',
            'Element',
            'ArrayElement',
            'ObjectElement',
            'LiteralElement',
        ]) {
            expect(objectConvert).toHaveProperty(name);
        }
    });
});
