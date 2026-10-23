/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
/** biome-ignore-all lint/complexity/noBannedTypes: <explanation> */
/** biome-ignore-all lint/suspicious/noShadowRestrictedNames: <explanation> */
import { assignRecursive, isDefined, type Key } from '@upradata/util';
import { ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import type { Node } from '../node';
import { type Extra, Proxy, type ProxyOpts } from './proxy';

interface PropValue<T = any> {
    prop: Key;
    value: T;
}

// type Target<T, Extra> = TargetAugmented</* Partial<T> */T, Extra>;

// type Target<T, Extra> = {
//     // [Key in keyof T]: (Target<T[Key], Extra> & Extra /* Partial<Extra> */);
//     [ Key in keyof T ]: Target<T[ Key ], Extra> & Partial<ProxyObserver<T[ Key ], Extra>> & Extra /* Partial<Extra> */;
// };

// export type ProxyTypeObserver<T, E = {}> = Partial<ProxyObserver<T, E>> & Target<T, E> & E/* Partial<E> */;

/* type Target<T, Extra> = {
    // [Key in keyof T]: (Target<T[Key], Extra> & Extra // Partial<Extra>);
    [ Key in keyof T ]: Target<T[ Key ], Extra> & Partial<ProxyObserver<T[ Key ], Extra>> & Extra // Partial<Extra>;
};

export type ProxyTypeObserver<T, E = {}> = Partial<ProxyObserver<T, E>> & Target<T, E> & E; // Partial<E>; */
type _Proxy<T, E> = {
    [Key in keyof T]: _Proxy<T[Key], E> & Partial<ProxyObserver<T[Key], E>> & _ProxyExtra<E>;
};

type _ProxyExtra<E> = {
    [Key in keyof E]: _ProxyExtra<Extra<E[Key]>> & Partial<ProxyObserver<Extra<E[Key]>, {}>>;
};

export type ProxyTypeObserver<T, E = {}> = Partial<ProxyObserver<T, E>> & _Proxy<T, E> & _ProxyExtra<E>;

export class ProxyObserver<T, E = {}> extends Proxy<T, E> {
    changed$ = new ReplaySubject<PropValue<T>>(1);

    constructor(node: Node<T, E>) {
        super(node);
    }

    static create<T, E = {}>(target?: T, options?: ProxyOpts<T, E>): ProxyTypeObserver<T, E> {
        const observerOptions = {
            handler: {
                set: function (prop: Key, value) {
                    (this as any)[prop] = value;
                    const success = Proxy.node((this as any)[prop]).state.$!.targetUpdated;

                    if (success)
                        (this as any)[prop as Key].changed$.next({ prop, value: (this as any)[prop as Key].$$ });

                    return success;
                },
            },
            // eslint-disable-next-line object-shorthand
            propChanged: function (prop: Key, value: any) {
                (this as any)[prop].changed$.next({ prop, value });
            },
        } as ProxyOpts<T, E>;

        const allOptions = assignRecursive(observerOptions, options) as any;

        return Proxy.create(target, allOptions, ProxyObserver) as ProxyTypeObserver<T, E>;
    }

    $map<U>(mapping: Mapping<T, U>): ProxyTypeObserver<U, E> {
        // we could have a nicer code putting the fromSource/Target tag in the node parameters withh a symbol
        // we create then just this.changed$ and if toFrom is defined, we call toProxy.map$
        // for now it's ok :)

        const toProxy = ProxyObserver.create<U, E>() as ProxyTypeObserver<U, E>;

        let fromSource = false;
        let fromTarget = false;

        const parentProxy = Proxy.node(this).parentProxy as Proxy<any, E>;
        // const selected = Proxy.node(parentProxy).selected;
        const fromProp = Proxy.node(this).prop;

        /* this */ ((parentProxy as any)[/* selected */ fromProp]! as ProxyObserver<T, E>).changed$
            .pipe(filter(() => !fromTarget)) // to prevent looping
            .subscribe(({ /* prop, */ value }) => {
                fromSource = true;
                toProxy.$!(mapping.fromTo(value));
                fromSource = false;
            });

        if (isDefined(mapping.toFrom)) {
            toProxy
                .changed$!.pipe(
                    filter(() => !fromSource), // to prevent looping
                )
                .subscribe(({ /* prop, */ value }) => {
                    fromTarget = true;
                    (parentProxy as any)[/* selected */ fromProp].$!(mapping.toFrom?.(value));
                    fromTarget = false;
                });
        }

        return toProxy;
    }
}

interface Mapping<T, U> {
    fromTo: (value: T) => U;
    toFrom?: (value: U) => T;
}
