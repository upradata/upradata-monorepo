import { FunctionalComponent, h, VNode } from '@stencil/core';
import { ensureArray } from '@upradata/util';
import { PropsByTag, Tags } from './jsx.types';

export const vnodeToComponent = <T extends {}>(vnodes: VNode | VNode[]): FunctionalComponent<T> => {
    const vnodeList = ensureArray(vnodes).filter(v => !!v);

    return (props, children, utils) => utils.map(vnodeList, vnode => ({
        ...vnode,
        vchildren: [ ...(vnode.vchildren || []), ...children ],
        vattrs: {
            ...(vnode.vattrs || {}),
            ...props
        }
    }));
};


export const tagToComponent = <Tag extends Tags>(tag: Tag): FunctionalComponent<PropsByTag<Tag>> => {
    return (props: {}, children) => h(tag, { ...props }, children);
};
