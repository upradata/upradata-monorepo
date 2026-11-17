import { describe, expect, it } from 'vite-plus/test';

import * as puppeteerUtils from '../../src';
import { createHtmlListIterator } from '../../src/utils';

describe('puppeteer public API', () => {
    it('exports browser, page, and list-iterator helpers', () => {
        expect(puppeteerUtils.createHtmlListIterator).toBe(createHtmlListIterator);
        expect(puppeteerUtils.Browser).toBeTypeOf('function');
    });

    it('yields list items with their original indexes', async () => {
        const handles = [{ id: 0 }, { id: 1 }].map(value => ({ value, evaluate: async () => undefined }));
        const iterate = await createHtmlListIterator.call(
            {} as never,
            {
                list: async () => handles as never,
            } as never,
        );
        const iterator = iterate();

        expect(await iterator.next()).toEqual({ done: false, value: { item: handles[0], i: 0 } });
        expect(await iterator.next()).toEqual({ done: false, value: { item: handles[1], i: 1 } });
    });
});
