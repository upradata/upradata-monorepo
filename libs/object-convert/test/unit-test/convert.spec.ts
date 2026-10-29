import { describe, expect, it } from 'vite-plus/test';

import * as objectConvert from '../../src';

describe('object-convert public modules', () => {
    it('exports converter and element APIs from its package entrypoint', () => {
        expect(objectConvert.convert).toBeTypeOf('function');
        expect(objectConvert.ElementFactory).toBeTypeOf('function');
        expect(objectConvert.LiteralElement).toBeTypeOf('function');
    });
});
