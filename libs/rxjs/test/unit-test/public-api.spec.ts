import { from, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vite-plus/test';

import * as rxjsUtils from '../../src';
import { cumulateUnique, lastValue } from '../../src/cumulate';
import { ObservableSubscribeOnce } from '../../src/observable-subscribe-once';

describe('rxjs public API', () => {
    it('exports the cumulators and single-subscription helper', () => {
        expect(rxjsUtils).toHaveProperty('cumulateUnique', cumulateUnique);
        expect(rxjsUtils).toHaveProperty('lastValue', lastValue);
        expect(rxjsUtils).toHaveProperty('ObservableSubscribeOnce', ObservableSubscribeOnce);
    });

    it('collects unique values until the notifier emits', () => {
        const close = new Subject<void>();
        const values: Set<number>[] = [];
        from([1, 1, 2])
            .pipe(cumulateUnique(close, { toArray: false }))
            .subscribe(value => values.push(value as Set<number>));
        close.next();
        expect([...values[0]]).toEqual([1, 2]);
    });

    it('subscribeOnce attaches only one observer until resubscribed', () => {
        const source = new Subject<number>();
        const once = new ObservableSubscribeOnce(source);
        const seen = vi.fn();
        once.subscribeOnce(seen);
        once.subscribeOnce(seen);
        source.next(1);
        expect(seen).toHaveBeenCalledOnce();
        once.resubscribe(seen);
        source.next(2);
        expect(seen).toHaveBeenCalledTimes(2);
    });
});
