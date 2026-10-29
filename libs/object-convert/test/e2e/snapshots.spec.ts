import { describe, expect, it } from 'vite-plus/test';

import { LiteralElement } from '../../src/literal';

describe('object-convert element flow', () => {
    it('iterates a literal through the element conversion boundary', () => {
        const literal = new LiteralElement(
            'fixture',
            {
                parent: { key: null, value: null, levelDetails: { level: 0, isLast: true, isLeaf: false } },
            },
            0,
        );

        expect(literal.next()).toEqual({
            done: false,
            value: { key: null, value: 'fixture', isLast: true, isLeaf: true },
        });
        expect(literal.next().done).toBe(true);
    });
});
