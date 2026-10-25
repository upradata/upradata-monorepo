import { h } from '@stencil/core';
import { getRenderingRef, RenderNode, VNode } from '@stencil/core/internal';
import { createStore } from '@stencil/store';
import { vnodeToComponent } from '#util';
import { MtStoreChildComponent, MtStoreChildRenderer, Store, StoreState } from './types';


type ChildRenderer<S extends StoreState> = MtStoreChildRenderer<S> | MtStoreChildComponent<S>;

export interface MtStoreProps<S extends StoreState> {
    store?: Store<S>;
    state?: S;
    childRenderer?: ChildRenderer<S>;
    childs?: VNode[];
}


const instanceMap = new WeakMap<RenderNode, Store<StoreState>>();

export const MtStore = <S extends StoreState>(props: MtStoreProps<S>, children: Array<ChildRenderer<S> | VNode>): VNode => {

    const warning = `MtStore must have the "childRenderer" of type "(store: Store)=> VNode | VNode[]" set as the first child or through the attribute "childRenderer"`;

    const { state, childs, childRenderer } = props;

    const child = typeof children[ 0 ] === 'function' ? children[ 0 ] : childRenderer;

    if (typeof child !== 'function') {
        console.error(warning);
        return null;
    }

    const childR: ChildRenderer<S> = child;

    const allChildren = (children.filter(c => typeof c !== 'function') as VNode[]).concat(childs || []);

    const instance = getRenderingRef();
    const instanceStore = instanceMap.get(instance);

    const store = instanceStore || props.store || createStore(state);
    instanceMap.set(instance, store as Store<StoreState>);

    const vnodeOrComp = childR(store as any, allChildren);
    const Child = typeof vnodeOrComp === 'function' ? vnodeOrComp : vnodeToComponent(vnodeOrComp);

    return <Child></Child>;
};
