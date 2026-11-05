import { describe, expect, it } from 'vite-plus/test';

import * as requireOverride from '../../src';
import { getFullPath, getFullPathNormalized } from '../../src/full-path';

describe('require-override public API', () => {
    it('exports require interception and path helpers', () => {
        expect(requireOverride).toHaveProperty('RequireOverride');
        expect(requireOverride).toHaveProperty('getFullPath', getFullPath);
        expect(requireOverride).toHaveProperty('getFullPathNormalized', getFullPathNormalized);
    });

    it('resolves relative paths from the requiring file', () => {
        expect(getFullPath('node:fs', '/workspace/app/entry.js')).toBe('node:fs');
        expect(getFullPathNormalized('/workspace/app/nested\\module.js', '/workspace/app/entry.js')).toBe(
            '/workspace/app/nested/module.js',
        );
    });
});
