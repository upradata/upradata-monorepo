/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
/** biome-ignore-all lint/suspicious/noShadowRestrictedNames: <explanation> */
import { isUndefined, type Key, oneLine } from '@upradata/util';
import { Proxy, ProxyFactory } from '../proxy';
import { DescriptionFactory } from './description-factory';
import type { Node } from './node';
import { throwExtendableError, throwMutableTypeError } from './util';

export type PropertyState = 'new' | 'old' | 'skipped' | 'cycle';

export class NodeProperty<T, E> {
    static forbiddenProperties = new Set<Key>(['$', '$$']);

    constructor(
        private node: Node<T, E>,
        private prop: Key,
        private value: any,
    ) {}

    public createProxyIfNecessary(): PropertyState {
        const { prop, node } = this;

        if (NodeProperty.forbiddenProperties.has(prop)) {
            throw new Error(oneLine`
                ${String(prop)} is a forbidden property. The list of forbidden properties is :
                ${[...NodeProperty.forbiddenProperties].join(', ')}`);
        }

        const { extendable, mutableType, reset, emitError } = this.node.state.$?.options?.trap.set || {}; // node.getSetOptions();

        const addProperty = (): PropertyState => {
            // force to recreate Proxy/Node
            if (reset) return this.createDecription();

            // recreate Proxy/Node if does not exist
            if (isUndefined(node.getProxyFromProp(prop))) {
                // new proxy (proxy[prop] doesn't exist)
                if (extendable) return this.createDecription();

                if (emitError) throwExtendableError(prop);

                return 'skipped';
            }

            // create new Proxy/Node if not same type (proxy[prop] exist)
            if (!node.getNodeFromProp(prop)?.sameType(this.value)) {
                if (mutableType) return this.createDecription();

                if (emitError) throwMutableTypeError(prop, node.getNodeFromProp(prop)?.target, this.value);

                return 'skipped';
            }

            return 'old';
        };

        return addProperty();
    }

    public setDescription(newProxy: Proxy<T, E>) {
        const description = new DescriptionFactory(this.prop, Proxy.node(newProxy)).description();
        Object.defineProperty(this.node.proxy, this.prop, description);
    }

    private createDecription(): PropertyState {
        const cycleProxy = this.getPotentialCycleProxy();

        const newProxy =
            cycleProxy ||
            (ProxyFactory.create({ node: this.node, prop: this.prop, value: this.value }) as Proxy<any, E>);

        this.setDescription(newProxy);

        if (!this.node.properties.has(this.prop)) this.node.properties.add(this.prop);

        return isUndefined(cycleProxy) ? 'new' : 'cycle';
    }

    private getPotentialCycleProxy(): Proxy<any, E> | undefined {
        const { forcedType } = this.node.state.$?.options?.trap.set || {};

        if (forcedType === 'object') return undefined;

        if (typeof this.value !== 'object' || this.value === null) return undefined;

        const mark = Symbol('mark');
        this.value[mark] = true;

        const getCycle = (proxy: Proxy<any, E> | undefined): Proxy<any, E> | undefined => {
            if (isUndefined(proxy)) return undefined;

            const node = Proxy.node(proxy);

            if (node.target[mark] === true) return node.proxy;

            return getCycle(node.parentProxy);
        };

        const cycle = getCycle(this.node.parentProxy);
        delete this.value[mark];

        return cycle;
    }
}
