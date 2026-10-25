import type { Key } from '@upradata/util';

import { Proxy } from '../proxy';

import type { Node } from './node';

export type InnerGet<T, E> = (option?: { plainProxy: boolean }) => Proxy<T, E>;

export class DescriptionFactory<T, E> {
    private parentNode: Node<any, E>;

    // proxy is the new proxy created for the prop
    constructor(
        public prop: Key,
        private node: Node<T, E>,
    ) {
        this.parentNode = Proxy.node(this.node.parentProxy!);
    }

    private userSetter(value: any) {
        const { set } = this.node.options.handler;

        if (!set) return;

        // inside the customized user set 'trap' function, the user does "this[prop]=any" and we come back here
        // but this time with set.called=true. So we use now the internal set to go down the tree
        if (set.called) {
            this.node.set(value); // we go down the tree.
        } else {
            this.node.state.update({ beingVisited: true }); // we start visiting the node
            set.called = true;
            // user trap (user defined set handler)
            this.node.state.update({ targetUpdated: Boolean(set.call(this.parentNode.proxy, this.prop, value)) });
            set.called = false;
            this.node.state.update({ beingVisited: false }); // we ended visiting the node

            // here we will use beingVisited
            // beingVisited allows us to know where is the entry point in the tree when a node is set
            // only the starting node has beingVisited=false at this point
            if (this.node.state.$?.targetUpdated as boolean) this.parentNode.propChangedUp();
        }
    }

    private builtinSetter(value: any) {
        this.node.state.update({ beingVisited: true });
        this.node.set(value); // we go down the tree.
        this.node.state.update({ beingVisited: false });

        if (this.node.state.$?.targetUpdated) this.parentNode.propChangedUp();
    }

    private setter(): (value: any) => any {
        const wrapper = (f: (value: any) => any) => {
            return (value: any) => {
                this.parentNode.state.update({ selected: this.prop });
                f(value);
                // this.parentNode.selected = undefined;
            };
        };

        if (this.node.state.$?.bypassUsersTrap) return wrapper((value: any) => this.node.set(value));

        if (this.node.options.handler.set) return wrapper((value: any) => this.userSetter.call(this, value));

        return wrapper((value: any) => this.builtinSetter.call(this, value));
    }

    private getter(): InnerGet<T, E> {
        return (options: { plainProxy?: boolean } = {}) => {
            const { plainProxy = false } = options;

            if (!plainProxy) {
                this.parentNode.state.update({ selected: this.prop });
                // return this.node.get();
            }

            return this.node.proxy;
        };
    }

    public description() {
        return {
            set: this.setter(),
            get: this.getter(),
            enumerable: true,
            configurable: true,
        };
    }
}
