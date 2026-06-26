import { AnyFunction, Arr, isDefined, keys, KeysRecursive } from '@upradata/util';

export type FunctionWithThis<T, R = any> = (this: T, ...args: Arr<any>) => R;
export type SetterWithThis<T> = (this: T, prop: KeysRecursive<T>, value: unknown) => boolean | void;
export type GetterWithThis<T, R = any> = (this: T, prop: KeysRecursive<T>) => R;


export class CallableFunc<T> {
    public call: AnyFunction;
    public called: boolean = false;

    constructor(f: FunctionWithThis<T> | CallableFunc<T>) {
        this.call = f instanceof CallableFunc ? f.call : f.call.bind(f);
    }
}


export class Handler<T> {
    set?: SetterWithThis<T> = undefined;
    get?: GetterWithThis<T> = undefined;
}


export class ProxyHandler<T> {
    set: CallableFunc<T> = undefined;
    get: CallableFunc<T> = undefined;

    constructor(handler: Handler<T> | ProxyHandler<T>) {
        const handler_ = handler || {};
        const traps = [ 'set', 'get' ] as const;

        for (const h of keys(handler_)) {
            // maybe one day I'll put other traps
            if (traps.includes(h) && isDefined(handler_[ h ])) {
                this[ h ] = new CallableFunc(handler_[ h ]);
                this[ h ].called = false;
            }
        }
    }
}
