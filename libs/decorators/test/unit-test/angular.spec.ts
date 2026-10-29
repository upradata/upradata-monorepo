import { describe, expect, it } from 'vite-plus/test';

import { MultiQuery } from '../../src/angular';

describe('decorators Angular subpath', () => {
    it('exports the multi-query decorator factory', () => {
        expect(typeof MultiQuery).toBe('function');
    });
});
