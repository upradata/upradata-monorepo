import { type Arr, type FunctionN, isDefined, type KeysRecursive, keys } from '@upradata/util';

export type FunctionWithThis<T, R = any> = (this: T, ...args: Arr<any>) => R;
export type SetterWithThis<T> = (
    this: Record<KeysRecursive<T & {}, 5>, any> /*T*/,
    prop: KeysRecursive<T & {}, 5>,
    value: unknown,
) => boolean | undefined;

export type GetterWithThis<T, R = any> = (this: T, prop: KeysRecursive<T & {}, 5>) => R;

export class CallableFunc<T> {
    public call: FunctionN<unknown[]>;
    public called: boolean = false;

    constructor(f: FunctionWithThis<T> | CallableFunc<T>) {
        this.call = f instanceof CallableFunc ? f.call : f.call.bind(f as any);
    }
}

export class Handler<T> {
    set?: SetterWithThis<T> = undefined;
    get?: GetterWithThis<T> = undefined;
}

export class ProxyHandler<T> {
    set?: CallableFunc<T> = undefined;
    get?: CallableFunc<T> = undefined;

    constructor(handler: Handler<T> | ProxyHandler<T>) {
        const handler_ = handler || {};
        const traps = ['set', 'get'] as const;

        for (const h of keys(handler_)) {
            // maybe one day I'll put other traps
            if (traps.includes(h) && isDefined(handler_[h])) {
                this[h] = new CallableFunc(handler_[h] as any);
                this[h].called = false;
            }
        }
    }
}
