import { describe, expect, it, vi } from 'vite-plus/test';

import { removableEventListeners } from '../../src/util/event-listener';
import { toBoolean, toNumber, toObject, toString, toggleClassFactory, zoomFromMouseWheel } from '../../src/util/util';

describe('stencil utility public API', () => {
    it('converts common attribute values', () => {
        expect(toBoolean('')).toBe(true);
        expect(toBoolean('false')).toBe(false);
        expect(toNumber('2.5')).toBe(2.5);
        expect(toString(12)).toBe('12');
        expect(toObject<{ ok: boolean }>('{"ok":true}')).toEqual({ ok: true });
    });

    it('selects zoom direction from the wheel delta', () => {
        expect(zoomFromMouseWheel({ deltaY: 1 } as WheelEvent)).toBeCloseTo(1 / 1.1);
        expect(zoomFromMouseWheel({ deltaY: -1 } as WheelEvent)).toBeCloseTo(1.1);
    });

    it('toggles classes and removes registered event listeners', () => {
        const classes = new Set<string>();
        const el = {
            classList: { add: (name: string) => classes.add(name), remove: (name: string) => classes.delete(name) },
        } as any;
        const toggle = toggleClassFactory({ true: 'enabled', false: 'disabled' });
        toggle(el, true);
        expect(classes.has('enabled')).toBe(true);
        toggle(el, false);
        expect(classes.has('enabled')).toBe(false);
        expect(classes.has('disabled')).toBe(true);

        const remove = removableEventListeners();
        const listener = vi.fn();
        const target = new EventTarget();
        remove.on(target, 'click', listener, { id: 'listener' });
        remove.removeListenerById('listener');
        target.dispatchEvent(new Event('click'));
        expect(listener).not.toHaveBeenCalled();
    });
});
