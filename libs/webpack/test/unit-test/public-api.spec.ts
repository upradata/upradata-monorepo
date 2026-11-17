import { describe, expect, it } from 'vite-plus/test';

import * as webpackUtils from '../../src';
import { webpackConfig } from '../../src/config';

describe('webpack public API', () => {
    it('exports configuration and compilation helpers', () => {
        expect(webpackUtils.webpackConfig).toBe(webpackConfig);
        expect(webpackUtils.webpackCompile).toBeTypeOf('function');
        expect(webpackUtils.compileDone).toBeTypeOf('function');
    });

    it('applies library defaults while preserving supplied webpack options', () => {
        const config = webpackConfig({ mode: 'production', entry: './src/index.ts', output: { path: '/tmp/fixture' } });
        expect(config.mode).toBe('production');
        expect(config.entry).toBe('./src/index.ts');
        expect(config.output?.filename).toBe('[name].bundle.js');
        expect(config.output?.library).toEqual({ name: 'globalThis', type: 'assign-properties' });
        expect(config.module?.rules).toHaveLength(2);
        expect(config.optimization?.minimize).toBe(true);
    });
});
