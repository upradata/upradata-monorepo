import { Key, isPlainObject, isDefined, isNil } from '@upradata/util';
import { createProxy, Proxy, ProxyCtor } from './proxy';
import { NodeConstructor, Node } from '../node';


export interface CreateParams<T, E> {
    node: Node<any, E>;
    prop: Key;
    value: T;
}

export class ProxyFactory {

    static create<T, E>(params: CreateParams<T, E>): Proxy<T, E> {
        // eslint-disable-next-line prefer-destructuring, global-require
        const NodeObject: NodeConstructor<T, E> = require('../node/node-object').NodeObject;
        // eslint-disable-next-line prefer-destructuring, global-require
        const NodeLiteral: NodeConstructor<T, E> = require('../node/node-literal').NodeLiteral;
        // eslint-disable-next-line prefer-destructuring, global-require
        const NodeUndefined: NodeConstructor<T, E> = require('../node/node-undefined').NodeUndefined;

        // const options = node.getSetOptions();

        const { node, prop, value } = params;
        const { forcedType } = node.state.$.options.trap.set;

        const options = {
            public: node.options /* { trap: node.state.$.options.trap } */,
            private: {
                prop,
                parentProxy: node.proxy
            }
        };

        const initState = { options: node.state.$.options }; // pass the tmp options down

        const createNode = (): Node<T, E> => {

            // option.proxyConstructor = option.proxyConstructor || node.proxy.constructor as ProxyCtor<T, E>;

            if (forcedType === 'object' || isPlainObject(value) && forcedType !== 'literal')
                return new NodeObject(value, options, initState); // pass down the config

            // it's good for lazy creation (in NodeUndefined we create after the real proxy when it's set)
            if (forcedType === 'none' && isNil(value))
                return new NodeUndefined(value, options, initState);

            // as any as NodeOption<T, E> because Handler and ProxyHandler ne sont pas compatibles
            return new NodeLiteral(value, options, initState);
        };


        const newNode = createNode();
        // if parent is an extra prop => the rest it is also
        newNode.type.update({ isExtra: node.type.$.isExtra || node.state.$.isExtraBeingCreated });


        const getProxy = (): Proxy<T, E> => {
            // reuse proxy already created
            const proxy = node.proxy[ prop ] as Proxy<T, E>;

            if (isDefined(proxy)) {
                proxy[ Proxy.nodeSymbol ] = newNode;
                newNode.proxy = proxy;

                return proxy;
            }

            const ProxyCtor = node.proxy.constructor as ProxyCtor<T, E>;
            return createProxy(newNode, ProxyCtor);
        };


        return getProxy();
    }

}
