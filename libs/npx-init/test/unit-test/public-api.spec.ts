import * as npxInit from '../../src';
import { formatPkgName, formatRepoUrl } from '../../src/init-config/upradata.init';

describe('npx-init public API', () => {
    it('exports the initialization entrypoints and configuration helpers', () => {
        expect(npxInit).toHaveProperty('init');
        expect(npxInit).toHaveProperty('getContext');
        expect(npxInit).toHaveProperty('getPkgJson');
        expect(npxInit).toHaveProperty('formatPkgName', formatPkgName);
        expect(npxInit).toHaveProperty('formatRepoUrl', formatRepoUrl);
    });

    it('formats scoped package names and repository URLs', () => {
        expect(formatPkgName('sample')).toBe('@upradata/sample');
        expect(formatPkgName('@upradata/sample')).toBe('@upradata/sample');
        expect(formatRepoUrl('sample')).toBe('https://github.com/upradata/sample');
    });
});
import { describe, expect, it, vi } from 'vite-plus/test';
