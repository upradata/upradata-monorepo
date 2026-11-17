import { Component, Host, Prop, h } from '@stencil/core';
import { BooleanAttribute, toBoolean } from '#util';


@Component({
    tag: 'mt-visible',
    styleUrl: 'mt-visible.css',
    shadow: false,
    scoped: true
})
export class MtVisible {
    @Prop() visible: BooleanAttribute = true;

    render() {
        return (
            <Host class={toBoolean(this.visible) ? '' : 'invisible'}>
                <slot></slot>
            </Host>
        );
    }

}
