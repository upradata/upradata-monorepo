import { AssignOptions, assignRecursive, isDefined, isNil, isUndefined, Key } from '@upradata/util';
import { Proxy } from '../proxy';
import { Node } from './node';
import { AllNodeOpts, NodeState } from './node.options';


export class NodeObject<T, E> extends Node<T, E> {

    constructor(target: T, options?: AllNodeOpts<T, E>, state?: Partial<NodeState>) {
        super(target, assignRecursive(
            {}, options,
            { private: { type: { isPrimitive: false } } },
            new AssignOptions({ nonRecursivelyAssignableTypes: [ Proxy ] })
        ), state);
    }

    public sameType(value: any) {
        if (typeof value === 'object' || value === undefined) // value === null accepted
            return true;

        return false;
    }

    public doSet(value: any) {

        if (isNil(value)) {
            this.updateTarget(this.prop, value);
            this.state.update({ targetUpdated: true });
            return;
        }

        if (!this.sameType(value)) {
            const { prop } = this;

            /* delete this.parentProxy[ prop ];
            this.parentProxy[ prop ] = value; */
            const state = Proxy.node(this.parentProxy).createProxyIfNecessary(prop, value);

            if (state === 'skipped')
                this.state.update({ targetUpdated: false });
            else {
                this.parentProxy[ prop ] = value;
                this.updateTarget(prop, value);
                this.state.update({ targetUpdated: true });
            }

            return;
        }


        const initProperties = (props: Key[]): boolean => {
            const [ prop, ...restProps ] = props;

            if (isUndefined(prop))
                return false;

            // init if necessary
            const state = this.createProxyIfNecessary(prop, value[ prop ]);

            if (state === 'skipped')
                return initProperties(restProps);

            // call the setter defined in Object.defined (description-factory.ts)
            // it will go down the tree if needed
            if (state !== 'cycle')
                this.proxy[ prop ] = value[ prop ];

            this.updateTarget(prop, value[ prop ]);

            initProperties(restProps);
            return true;
        };

        const targetUpdated = initProperties(Object.keys(value));

        this.setExtras();

        this.state.update({ targetUpdated });
    }


    private setExtras() {
        const { extra } = this.options;

        // if we are at the top of the tree, prop === undefined and we do not add
        // any "extra" props. We start at prop === 'root'
        if (isDefined(this.parentProxy) && !this.type.$.isExtra && !this.state.$.isExtraBeingCreated) {
            this.state.update({ isExtraBeingCreated: true });

            for (const [ prop, value ] of Object.entries(extra)) {
                const v = typeof value === 'function' ? value() : value;
                this.set({ [ prop ]: v });
            }

            this.state.update({ isExtraBeingCreated: false });
        }
    }
}
