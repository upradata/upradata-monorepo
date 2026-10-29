import { describe, expect, it } from 'vite-plus/test';

import { LocalDependency } from '../../src/local-dependency';

describe('npx-local installation references', () => {
    it('parses and serializes a local package installation reference', () => {
        const dependency = new LocalDependency(
            { path: '/tmp/dependency@2.3.4', installDir: 'node_modules' },
            { mode: 'copy' },
        );
        expect(dependency.sourcePath).toBe('/tmp/dependency');
        expect(dependency.version).toBe('2.3.4');
        expect(dependency.unparse()).toBe('copy:/tmp/dependency@2.3.4');
    });
});
