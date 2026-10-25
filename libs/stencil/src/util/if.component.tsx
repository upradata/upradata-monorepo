import { Fragment, h, VNode } from '@stencil/core';
import { Props } from './jsx.types';
import { vnodeToComponent } from './util.component';

export type ThenElse = { then?: VNode; else?: VNode; };
export type IfProps = Props<{ condition: boolean; } & ThenElse>;

const isThenElse = (v: any): v is ThenElse => {
    return !!v.then;
};

// eslint-disable-next-line react/function-component-definition
export const If = (props: IfProps, children: (VNode | ThenElse)[]): VNode => {
    const childrenThenElse = isThenElse(children[ 0 ]) ? children[ 0 ] : { then: children[ 0 ], else: children[ 1 ] as VNode };


    const ThenComp = vnodeToComponent([ props.then, childrenThenElse.then ]);
    const ElseComp = vnodeToComponent([ props.else, childrenThenElse.else ]);

    return (
        <Fragment>
            <mt-visible visible={props.condition}><ThenComp></ThenComp></mt-visible>
            <mt-visible visible={!props.condition}><ElseComp></ElseComp></mt-visible>
        </Fragment>
    );
};
