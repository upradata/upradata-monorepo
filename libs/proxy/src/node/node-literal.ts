/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
/** biome-ignore-all lint/suspicious/noShadowRestrictedNames: <explanation> */
import { AssignOptions, assignRecursive, isNil } from '@upradata/util';
import { Proxy } from '../proxy';
import { Node } from './node';
import type { AllNodeOpts, NodeState } from './node.options';
import { throwMutableTypeError } from './util';

export class NodeLiteral<T, E> extends Node<T, E> {
    constructor(target: T, options?: AllNodeOpts<T, E>, state?: Partial<NodeState>) {
        super(
            target,
            assignRecursive(
                {},
                options,
                { private: { type: { isPrimitive: true } } },
                new AssignOptions({ nonRecursivelyAssignableTypes: [Proxy as any] }),
            ),
            state,
        );
    }

    public sameType(value: any) {
        if (isNil(value)) return true;

        if (typeof value !== typeof this.target) return false;

        return true;
    }

    public doSet(value: any) {
        const { mutableType, emitError } = this.state.$?.options?.trap.set || {};

        if (mutableType || this.sameType(value)) {
            this.updateTarget(this.prop, value);
            this.state.update({ targetUpdated: true }); // success
        } else {
            this.state.update({ targetUpdated: false });

            if (emitError) throwMutableTypeError(this.prop, this.target, value);
        }
    }
}
