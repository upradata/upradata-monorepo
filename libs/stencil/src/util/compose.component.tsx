import { h } from '@stencil/core';
import { filter, map } from '@upradata/util';
import { FComponent, Attributes, AttributesByTag, Tags, ElementByTag, FComponentByTag, InferProps, InferElement, InnerRef, Props } from './jsx.types';


export type FInner<O> = <T extends FComponent | Tags>(InnerComponent: T extends Tags ? FComponentByTag<T, O> : T) =>
    T extends Tags ? FComponent<O & AttributesByTag<T>> : FComponent<T extends FComponent ? InferProps<T> : {} & Attributes<O>>;


export interface ComposeOptions {
    outerProps?: Array<string | number>;
}


export interface ComposeOptionsByTag<Tag extends Tags> {
    outerProps?: Array<keyof ElementByTag<Tag>>;
}

export interface ComposeOptionsByFComponent<Element> {
    outerProps?: Array<keyof Element>;
}


export type InnerFComponent<OuterElement, InnerElement> = FComponent<OuterElement & InnerElement, false> & { innerRef?: InnerRef<InferElement<InnerElement>>; };








export type InnerFComponentByFComponent<OuterElement> = <InnerElement>(inner: FComponent<InnerElement>) => InnerFComponent<OuterElement & InnerElement, InferElement<InnerElement>>;

export function composeByFComponent<Element>(OuterComponent: FComponent<Element>, options: ComposeOptionsByFComponent<Element> = {}): InnerFComponentByFComponent<Element> {
    const outerPropsKeys = ((options.outerProps || []) as string[]).concat('class', 'style').filter(k => k !== 'innerRef');

    return (<InnerElement extends {}>(InnerComponent: FComponent<InnerElement>) => (props: Props<InnerElement>, children) => {
        const { innerRef = _el => { } } = props;

        const O = OuterComponent as FComponent<any>;
        const I = InnerComponent as FComponent<any>;

        const outerProps = map(outerPropsKeys, k => props[ k ]) as Record<string, any>;
        const innerProps = filter(props, k => !outerPropsKeys.some(key => key === k)) as Record<string, any>;

        return (
            <O {...outerProps}>
                <I ref={innerRef} {...innerProps}> {children} </I>
            </O>
        );
    }) as InnerFComponentByFComponent<Element>;
}

export type InnerFComponentByTag<OuterElement> = <Tag extends Tags, InnerElement extends ElementByTag<Tag>>(tag: Tag) => InnerFComponent<OuterElement, InnerElement>;

export function composeByTag<Tag extends Tags, Element extends ElementByTag<Tag>>(outerTag: Tag, options: ComposeOptionsByTag<Tag> = {}): InnerFComponentByTag<Element> {
    const outerPropsKeys = (options.outerProps || []).concat('class', 'style').filter(k => k !== 'innerRef');

    return (<InnerTag extends Tags>(innerTag: InnerTag) => (props, children) => {
        const { innerRef = _el => { } } = props as any as Props<ElementByTag<InnerTag>>;

        const outerProps = map(outerPropsKeys, k => props[ k ]) as Record<string, any>;
        const innerProps = filter(props, k => !outerPropsKeys.some(key => key === k)) as Record<string, any>;

        const innerComponent = h(innerTag, { ref: innerRef, ...innerProps }, children);
        return h(outerTag, { ...outerProps }, innerComponent);

    }) as InnerFComponentByTag<Element>;
}
