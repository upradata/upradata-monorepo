import { Component, Prop, Host, Watch, h, VNode, Element } from '@stencil/core';
import { createStore } from '@stencil/store';
import { vnodeToComponent } from '#util';
import { StoreState, Store, MtStoreChildRenderer, MtStoreChildComponent } from './types';


@Component({
    tag: 'mt-store',
    styleUrl: 'mt-store.scss',
    shadow: false,
    scoped: false
})
export class MtStore {
    @Element() el: HTMLElement & MtStore;
    @Prop() state: StoreState = {};
    @Prop({ mutable: true }) store: Store<StoreState>;
    @Prop() childRenderer: MtStoreChildRenderer<StoreState> | MtStoreChildComponent<StoreState>;
    @Prop() childs: VNode[];


    @Watch('state') watchState(newState: StoreState) {
        this.store = createStore(newState);
    }

    componentWillLoad() {
        this.watchState(this.state);
    }


    render() {
        // const Child = this.childComponent(this.store, this.childs);
        const vnodeOrComp = this.childRenderer?.(this.store, this.childs);
        const Child = typeof vnodeOrComp === 'function' ? vnodeOrComp : vnodeToComponent(vnodeOrComp);

        return (
            <Host>
                <Child><slot></slot></Child>
            </Host>);
    }

}
