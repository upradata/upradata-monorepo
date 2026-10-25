import { isDefined, isPlainObject, type Key } from '@upradata/util';

import { type Handler, type Node, NodeObject, type NodeOpts, type PropChanged, type ProxyHandler } from '../node';

export type ProxyOpts<T, E = {}> = Omit<NodeOpts<T, E>, 'handler' | 'propChanged'> & {
    // instead of ProxyType<T,E> I put T & E because KeysRecursive won't be able to give the correct
    // union of properties name type. As it appears that the level of recursion is high and the maximum
    // level I set in @upradata/util (KeysRecursive) being 20, this value is exceeded and as a default value,
    // I put string | number | symbol (not good enough)
    // I lose the proxy methods but it is a tradeoff
    handler?: Handler<T & E> | ProxyHandler<T & E>;
    propChanged?: PropChanged<T & E>;
};

// Recursive type :)
// type Target<T, Extra> = TargetAugmented</* Partial<T> */T, Extra>;

// type Target<T, Extra> = {
//     // [Key in keyof T]: (Target<T[Key], Extra> & Extra /* Partial<Extra> */);
//     [ Key in keyof T ]: Target<T[ Key ], Extra> & Partial<Proxy<T[ Key ], Extra>> & Extra /* Partial<Extra> */;
// };

/* type Target<T, Extra> = {
    // [Key in keyof T]: (Target<T[Key], Extra> & Extra // Partial<Extra> );
    [ Key in keyof T ]: Target<T[ Key ], Extra> & Partial<Proxy<T[ Key ], Extra> & Extra> // Partial<Extra>;
}; */

type _Proxy<T, E> = {
    [Key in keyof T]: _Proxy<T[Key], E> & Partial<Proxy<T[Key], E>> & _ProxyExtra<E>;
};

export type Extra<E> = E extends (...args: any) => any ? ReturnType<E> : E;

type _ProxyExtra<E> = {
    [Key in keyof E]: _ProxyExtra<Extra<E[Key]>> & Partial<Proxy<Extra<E[Key]>, {}>>;
};

export type ProxyType<T, E = {}> = Partial<Proxy<T, E>> & _Proxy<T, E> & _ProxyExtra<E>;

// E is for the root element. I.e proxy.changed$
// export type ProxyType<T, E = {}> = Partial<Proxy<T, E>> & Target<T, E> & E/* Partial<E> */;
//  Partial<Proxy<T, E>> & Target<T, E> & E/* Partial<E> */;

export type ProxyCtor<T, E = {}> = new (node: Node<T, E>) => Proxy<T, E>;

const createShallowProxy = <T, E>(proxy: Proxy<T, E>): Proxy<T, E> => {
    const handler = {
        set: (p: Proxy<T, E>, prop: Key, value: any) => {
            if (prop in p) (p as any)[prop] = value;
            else p.$({ [prop]: value });

            return true;
        },
    };

    return new globalThis.Proxy(proxy, handler);
};

export interface CreateProxyOptions<T, E> {
    node: Node<T, E>;
    prop: Key;
    parentProxy: Proxy<any, E>;
    Ctor?: ProxyCtor<T, E>;
}

export const createProxy = <T, E>(node: Node<T, E>, Ctor: ProxyCtor<T, E> = Proxy): Proxy<T, E> => {
    const proxy = createShallowProxy(new Ctor(node));
    node.proxy = proxy;

    return proxy;
};

const nodeSymbol: unique symbol = Symbol('node');

export class Proxy<T, E = {}> {
    static nodeSymbol = nodeSymbol;
    protected [nodeSymbol]!: Node<T, E>;

    constructor(node: Node<T, E>) {
        // node.proxy = this;
        (this as any)[Proxy.nodeSymbol] = node;
    }

    static node<T, E>(proxy: Partial<Proxy<T, E>>): Node<T, E> {
        return (proxy as any)[Proxy.nodeSymbol];
    }

    static target<T, E>(proxy: Partial<Proxy<T, E>>): T {
        return Proxy.node(proxy).target;
    }

    get $$(): T {
        return Proxy.node(this).target;
    }

    $(value: any, options?: NodeOpts<T, E>): this {
        const node = Proxy.node<T, E>(this);
        const { parentProxy } = node;
        const parentNode = Proxy.node(parentProxy!);

        parentNode.set({ [node.prop]: value }, options);

        return this;
    }

    private static createRoot<T, E = {}>(
        target?: T,
        options: ProxyOpts<T, E> = {},
        proxyCtor?: ProxyCtor<any>,
    ): ProxyType<Root<T | undefined>, E> {
        const nodeOptions = options as unknown as NodeOpts<Root<T | undefined>, E>;

        const ProxyCtor: ProxyCtor<Root<T | undefined>, E> = proxyCtor || (Proxy as any);

        // to be able to have a proxy with a literal like Proxy.create(2), we add a { root: ... } object
        const rootTarget = { root: target };

        const node = new NodeObject<Root<T | undefined>, E>(rootTarget, { public: nodeOptions }, { selected: 'root' });

        const rootProxy = createProxy(node, ProxyCtor) as unknown as ProxyType<Root<T | undefined>, E>;

        node.set(rootTarget, { trap: { set: { extendable: true, mutableType: false } } });

        const notifyRootPropsChanged = () => {
            if (isPlainObject(target) && isDefined(node.options.propChanged)) {
                const { root } = rootProxy;

                for (const prop of Object.keys(target))
                    node.options.propChanged.call(
                        root as ProxyType<Root<T | undefined>, E>,
                        prop as any,
                        Proxy.node((root as any)[prop]).target,
                    );
            }
        };

        // at creation, we notify the props have changed, as they are new
        // later, it is on mutation that it will be modified
        notifyRootPropsChanged();

        return rootProxy;
    }

    static create<T, E = {}>(target?: T, options?: ProxyOpts<T, E>, proxyCtor?: ProxyCtor<any>): ProxyType<T, E> {
        const rootProxy = Proxy.createRoot<T, E>(target, options, proxyCtor);
        return rootProxy.root as ProxyType<T, E>;
    }

    static createPartialExtra<T, E = {}>(
        target: T,
        options?: ProxyOpts<T, E>,
        proxyCtor?: ProxyCtor<any>,
    ): ProxyType<T, Partial<E>> {
        return Proxy.create<T, E>(target, options, proxyCtor) as any;
    }
}

interface Root<T> {
    root: T;
}
