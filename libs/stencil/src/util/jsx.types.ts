import { FunctionalComponent, JSX } from '@stencil/core';
import { JSXBase } from '@stencil/core/internal';

/*
in src/components.d.ts after compoilation, we find web component types as follow

interface IntrinsicElements {
    "my-component": LocalJSX.MyComponent & JSXBase.HTMLAttributes<HTMLMyComponentElement>;
    ....
}

node_modules/.pnpm/@stencil+core@2.12.1/node_modules/@stencil/core/internal/stencil-public-runtime.d.ts

JSXBase.HTMLAttributes<T> extends DOMAttributes<T> that extends interface JSXAttributes<T = Element> {
    key?: string | number;
    ref?: (elm?: T) => void;
}
*/

export type InnerRef<T> = Attributes<T>[ 'ref' ];

export type InferProps<FC extends FunctionalComponent> = FC extends FunctionalComponent<infer U> ? U : never;
export type FComponent<Element = HTMLElement, WithInnerRef extends boolean = true> = FunctionalComponent<
    WithInnerRef extends true ?
    Element & { innerRef?: InnerRef<Element>; } :
    Element
>;


export type Elements = JSX.IntrinsicElements;
export type Tags = keyof JSX.IntrinsicElements;


export type ElementByTag<Tag extends Tags> = Partial<Elements[ Tag ]>;

export type FComponentByTag<Tag extends Tags, Element = {}> = FComponent<Partial<Element> & ElementByTag<Tag>>;

export type InferElement<Element extends JSXBase.HTMLAttributes> = Element extends JSXBase.HTMLAttributes<infer U> ? U : never;


export type Attributes<Element> = JSXBase.HTMLAttributes<Element>;

export type Props<Element> = Element & Attributes<Element> & { innerRef?: InnerRef<Element>; };
export type PropsByTag<Tag extends Tags> = Props<ElementByTag<Tag>>;

export type AttributesByTag<Tag extends Tags> = Attributes<ElementByTag<Tag>>;
