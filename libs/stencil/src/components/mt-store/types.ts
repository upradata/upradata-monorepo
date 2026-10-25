import { VNode, FunctionalComponent } from '@stencil/core';
import { ObservableMap } from '@stencil/store';


export type StoreState = {
    [ K: string ]: any;
};

export type Store<S extends StoreState> = ObservableMap<S>;
export type MtStoreChildRenderer<S extends StoreState> = (store: Store<S>, children: VNode[]) => VNode | VNode[];
export type MtStoreChildComponent<S extends StoreState> = (store: Store<S>, children: VNode[]) => FunctionalComponent<{}>;
