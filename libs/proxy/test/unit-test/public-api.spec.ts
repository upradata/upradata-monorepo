import * as proxyApi from '../../src';

describe('proxy public API', () => {
    it('exports node and proxy entrypoints', () => {
        for (const name of ['Proxy', 'ProxyObserver', 'Node', 'NodeLiteral', 'NodeObject', 'NodeProperty']) {
            expect(proxyApi).toHaveProperty(name);
        }
    });
});
import { describe, expect, it, vi } from 'vite-plus/test';
