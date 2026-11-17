import { assignRecursive, type Key, type KeysRecursive } from '@upradata/util';

import type { Proxy, ProxyType } from '../proxy';

import { type Handler, ProxyHandler } from './handler';

export type NodeKind = 'object' | 'literal' | 'none';

export class SetOptions {
    extendable: boolean = true;
    mutableType: boolean = false;
    reset: boolean = false;
    forcedType: NodeKind = 'none';
    emitError: boolean = false;

    // proxyConstructor?: ProxyCtor<T, E>;

    constructor(options: SetOpts = {}) {
        Object.assign(this, options);
    }
}

export type Getoptions = {};

export interface TrapOptions {
    set: SetOptions;
    get: Getoptions;
}

export type TrapOpts = {
    [K in keyof TrapOptions]?: Partial<TrapOptions[K]>;
};

export type SetOpts = TrapOpts['set'];
export type GetOpts = TrapOpts['get'];

export type PropChanged<T> = (this: T, prop: KeysRecursive<T & {}, 5>, value: unknown) => void;

export class NodeState {
    beingVisited: boolean = false;
    selected: Key | undefined = undefined; // debugging
    bypassUsersTrap: boolean = false;
    targetUpdated: boolean = false;
    isExtraBeingCreated: boolean = false;
    options: NodeOptions<any, any> | undefined = undefined;
}

export class NodeType {
    isPrimitive: boolean = false;
    isExtra: boolean = false;
}

export class NodeOptions<T, E> {
    handler!: ProxyHandler<T>;
    extra: E = {} as E; // Extra;
    trap: TrapOptions = {
        set: new SetOptions(),
        get: {},
    };
    propChanged: PropChanged<ProxyType<T, E>> | undefined = undefined;

    constructor(options: NodeOpts<T, E> = {}) {
        assignRecursive(this, options, { handler: new ProxyHandler<ProxyType<T, E>>(options.handler || {}) });
    }
}

export type NodeOpts<T, E> = Partial<
    Omit<NodeOptions<T, E>, 'handler' | 'trap'> & {
        handler: Handler<ProxyType<T, E>> | ProxyHandler<ProxyType<T, E>>;
        trap: TrapOpts;
    }
>;

export class NodePrivateOptions<E> {
    parentProxy: Proxy<any, E> | ProxyType<any, E> | undefined = undefined;
    prop: Key | undefined = undefined;
    type: Partial<NodeType> | undefined = undefined;

    constructor(options?: NodePrivateOpts<E>) {
        Object.assign(this, options);
    }
}

export type NodePrivateOpts<E> = Partial<NodePrivateOptions<E>>;

export type AllNodeOptions<T, E> = {
    public: NodeOptions<T, E>;
    private: NodePrivateOptions<E>;
};

export type AllNodeOpts<T, E> = {
    public?: NodeOpts<T, E>;
    private?: Partial<NodePrivateOptions<E>>;
};
