import * as browserUtil from '../../src';
import { dispatchCustomEvent } from '../../src/custom-events';
import { loadServices } from '../../src/services';
import { guid } from '../../src/useful';

describe('browser-util public API', () => {
    it('exports the browser utility modules', () => {
        expect(browserUtil).toHaveProperty('EventWrapperInRaf');
        expect(browserUtil).toHaveProperty('dispatchCustomEvent', dispatchCustomEvent);
        expect(browserUtil).toHaveProperty('loadServices', loadServices);
        expect(browserUtil).toHaveProperty('guid', guid);
    });

    it('dispatches a custom event with its detail', () => {
        const target = new EventTarget();
        const listener = vi.fn();
        target.addEventListener('ready', listener);
        dispatchCustomEvent('ready', { element: target, detail: { loaded: true } });
        expect(listener).toHaveBeenCalledOnce();
        expect(listener.mock.calls[0][0]).toMatchObject({ detail: { loaded: true } });
    });

    it('creates UUID shaped identifiers', () => {
        expect(guid()).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
    });
});
import { describe, expect, it, vi } from 'vite-plus/test';
