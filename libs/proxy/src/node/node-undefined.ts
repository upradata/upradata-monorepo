import { AssignOptions, assignRecursive, isNil } from '@upradata/util';

import { Proxy } from '../proxy';

import { Node } from './node';
import type { AllNodeOpts, NodeState } from './node.options';

export class NodeUndefined<T, E> extends Node<T, E> {
    constructor(target: T, options?: AllNodeOpts<T, E>, state?: Partial<NodeState>) {
        super(
            target,
            assignRecursive(
                {},
                options,
                { private: { type: { isPrimitive: true } } },
                new AssignOptions({ nonRecursivelyAssignableTypes: [Proxy as any] }),
            ),
            { ...state, bypassUsersTrap: true },
        );
    }

    public sameType(_value: T) {
        return true; // when we set a value!==undefined|null, InitProperty will not return skip=true and this.set will be call
    }

    public doSet(value: T) {
        const parentNode = Proxy.node(this.parentProxy!);

        if (isNil(value)) {
            // value is undefined or null
            /* this.target = value; // just for easier debugging it can be useful
            parentNode.target[parentNode.selected] = this.target; */

            this.updateTarget(this.prop, value);
        } else {
            // value is something (literal or object)
            // we unset proxy[prop] (so NodeUndefined will be destroyed and a Literal or Object Node will be created instead)
            // ==> lazy creation
            const oldReset = parentNode.state.$!.options!.trap.set.reset;
            parentNode.state.$!.options!.trap.set.reset = true;

            parentNode.createProxyIfNecessary(this.prop, value);

            parentNode.state.$!.options!.trap.set.reset = oldReset;

            (parentNode.proxy as any)[/* parentNode.selected */ this.prop] = value;
        }

        this.state.update({ targetUpdated: true });
    }
}
