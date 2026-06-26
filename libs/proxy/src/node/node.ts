import { assignRecursive, isDefined, Key } from '@upradata/util';
import { Proxy, ProxyType } from '../proxy';
import { InnerGet } from './description-factory';
import { NodeProperty, PropertyState } from './node-property';
import { AllNodeOpts, NodeOptions, NodePrivateOptions, SetOptions, NodeOpts, NodeState, NodeType } from './node.options';
import { ImmutableValue } from './util';



export abstract class Node<T, E> {
    public target: T;
    protected _proxy: Proxy<T, E>;
    public parentProxy: Proxy<any, E>;  // set the parent proxy ancestor
    public properties = new Set<Key>(); // for debugging
    public prop: Key = undefined;
    public type: ImmutableValue<NodeType>;
    public state: ImmutableValue<NodeState>;
    public options: NodeOptions<T, E>;


    constructor(target: T, options: AllNodeOpts<T, E> = {}, state?: Partial<NodeState>) {
        const { private: privateOptions, public: publicOptions } = options;

        const setOptions = new SetOptions(publicOptions?.trap?.set);

        this.options = new NodeOptions<T, E>(assignRecursive({}, publicOptions, { trap: { set: setOptions } }));

        this.target = target;
        Object.assign(this, new NodePrivateOptions(privateOptions));

        this.type = new ImmutableValue(new NodeType());
        this.type.update(privateOptions.type);

        this.state = new ImmutableValue(new NodeState());
        this.state.update(state);
    }


    get proxy(): Proxy<T, E> {
        return this._proxy;
    }

    set proxy(proxy: Proxy<T, E> | ProxyType<T, E>) {
        this._proxy = proxy as Proxy<T, E>;
        /* const { extra } = this.options;

        // if we are at the top of the tree, prop === undefined and we do not add
        // any "extra" props. We start at prop === 'root'
        if (isDefined(Proxy.node(proxy).prop)) {
            for (const [ prop, value ] of Object.entries(extra)) {

                if (typeof value === 'function')
                    this.proxy[ prop ] = value();
                else
                    this.proxy[ prop ] = value;
            }
        } */
    }

    public getNodeFromProp(prop: Key): Node<T, E> {
        return Proxy.node(this.getProxyFromProp(prop));
    }


    public getProxyFromProp(prop: Key): Proxy<T, E> {
        const descr = Object.getOwnPropertyDescriptor(this.proxy, prop);
        if (descr === undefined)
            return undefined;

        const get = descr.get as InnerGet<T, E>;
        return get({ plainProxy: true });
    }


    public createProxyIfNecessary(prop: Key, value: any): PropertyState {
        return new NodeProperty(this, prop, value).createProxyIfNecessary();
    }


    protected updateTarget(prop: Key, value: any) {
        if (this.type.$.isPrimitive) {

            const parentNode = Proxy.node(this.parentProxy);
            this.target = value;
            parentNode.target[ prop ] = this.target;

        } else {
            this.target[ prop ] = value;
        }
    }

    public propChangedUp(): void {
        // call user defined changeUp function if a prop has been changed
        // if for instance we have proxy.a.b={c:{d:1}} ==> propChanged will be called for "b" and then "a"
        // (not for c and d even if there were defined)

        // if we are at the starting entry node in the tree and we finished updating all properties
        if (isDefined(this.parentProxy) && !this.state.$.beingVisited) {

            let { prop, parentProxy: proxy } = this;

            while (isDefined(proxy)) {
                const node = Proxy.node(proxy);

                // we propagate upward the tree
                node.options.propChanged?.call(
                    proxy,
                    prop,
                    Proxy.node(node.proxy[ prop ]).target
                );

                prop = node.prop;
                proxy = node.parentProxy;
            }
        }
    }


    set(value: any, options?: NodeOpts<T, E>): Node<T, E> {
        // const opts = assignRecursive({}, this.options.trap.set, this.state.$.options?.trap.set, setOptions);
        const opts = assignRecursive({}, this.options, this.state.$.options, options);

        /*  if (isUndefined(this.state.$.options))
             this.state.update({ options: new NodeOptions() }); // just to create the options object if it is not already

         this.state.$.options.trap.set = options; */
        this.state.update({ options: opts });

        this.doSet(value);

        // this.state.$.options.trap.set = this.options.trap.set;
        this.state.update({ options: this.options });
        // this.state.update({ options: undefined });

        return this;
    }


    abstract sameType(value: any): boolean;
    abstract doSet(param: any): void;
}


export type NodeConstructor<T, E> = new (target: T, node: AllNodeOpts<T, E>, initState?: Partial<NodeState>) => Node<T, E>;
