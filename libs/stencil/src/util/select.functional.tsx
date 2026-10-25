import { h, FunctionalComponent, VNode } from '@stencil/core';
import { ensureArray, ifChained, TT } from '@upradata/util';
import { Props } from './jsx.types';
import { vnodeToComponent } from './util.component';

export type MtSelectState<S> = { state: S; renderer: VNode | VNode[] | FunctionalComponent; };
export type MtSelectStateFunction<S> = (state: S) => VNode | VNode[] | FunctionalComponent;
export type Renderers<S> = TT<MtSelectState<S> | MtSelectStateFunction<S>>;

export type MtSelectProps<S> = Props<{ state: S; renderer?: Renderers<S>; }>;


const findRenderer = <S extends any>(state: S, children: Array<MtSelectState<S>>) => children.find(stateSlot => stateSlot.state === state)?.renderer;

export const MtSelect = <S extends any>(props: MtSelectProps<S>, children: Renderers<S>): VNode => {
    const renderers = [ ...ensureArray(props.renderer), ...ensureArray(children) ];

    const childRenderer = ifChained()
        .next({ if: typeof renderers[ 0 ] === 'function', then: () => (renderers[ 0 ] as MtSelectStateFunction<S>)(props.state) })
        .next({ then: findRenderer(props.state, renderers as Array<MtSelectState<S>>) })
        .value;

    const Child = typeof childRenderer === 'function' ? childRenderer : vnodeToComponent(childRenderer);

    return (<Child></Child>);
};
