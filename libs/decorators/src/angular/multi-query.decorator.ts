import {
    TemplateRef, ElementRef, ViewContainerRef, Provider, Type,
    ViewChildDecorator, ViewChildrenDecorator, ContentChildrenDecorator, ContentChildDecorator
} from '@angular/core';


// original https://medium.com/@a.yurich.zuev/angular-viewchild-how-to-read-multiple-instances-cde38ef19041

// Mais je l'ai modifié

/* export interface Read<T1, T2 = Null, T3 = Null, T4 = Null, T5 = Null> {

}
 */

export type QueryDecorator = ViewChildDecorator | ViewChildrenDecorator | ContentChildDecorator | ContentChildrenDecorator;


export type Read<Component, Directive, Service> = TemplateRef<Component> | ViewContainerRef | ElementRef<Component> | Provider |
{
    component?: Component | boolean;
    directive?: Directive;
    service?: Service;
};

export interface QueryOptions<Component, Directive, Service> {
    read: Read<Component, Directive, Service>;
    descendants?: boolean;
}

function isQueryOptions<Component, Directive, Service>(o: any): o is QueryOptions<Component, Directive, Service> {
    const keys = Object.keys(o);

    return keys.length < 2 && o.read !== undefined &&
        keys.find(k => k !== 'read' && k !== 'descendants').length === 0;
}


export function MultiQuery<Component, Directive, Service>(
    queryDecorator: QueryDecorator,
    selector: Type<Component> | (() => Component) | string,
    opts: QueryOptions<Component, Directive, Service>[] | Read<Component, Directive, Service>[]) {

    // bug TypeScript => cannot find the union of the types??
    // all types in QueryDecorator are the same except in ContentChildren, there is a descendants option
    const qDecorator = queryDecorator as ContentChildrenDecorator;

    const queryDecoratorsFactory: (target: any, prop: string) => any = {} as undefined;


    let options: QueryOptions<Component, Directive, Service>[];
    if (isQueryOptions<Component, Directive, Service>(opts))
        options = opts as any; // typing not working ? :((
    else
        options = (opts as any).map(o => ({ read: o }));


    if (options.length === 0)
        queryDecoratorsFactory[ 'component' ] = qDecorator(selector);
    else {
        //  decs = tokens.map(x => ({ name: firstSmallLetter(x.name), child: ViewChild(selector, { read: x }) });

        for (const o of options) {

            if ((o.read as any).name !== undefined) // token is a constructor like ElementRef, ViewContainerRef ...
                // qDecorator == ViewChild or ContentChild or ...
                queryDecoratorsFactory[ firstSmallLetter((o.read as any).name) ] = qDecorator(selector, o);
            else {
                // o = { component, directive, service }
                for (const [ k, v ] of Object.values(o.read)) {
                    if (v !== true)
                        continue;

                    /* if (v === true)
                        v = undefined; // component: true
                    else
                        continue; */

                    queryDecoratorsFactory[ firstSmallLetter(k) ] = qDecorator(selector, { read: undefined /* v */ });
                }

            }

        }

        return function (target: any, name: string) {
            const targetObj2 = {};

            for (const [ key, decorator ] of Object.entries(queryDecoratorsFactory)) {
                decorator(target, subPropertyName(name, key));
                targetObj2[ key ] = target[ subPropertyName(name, key) ];
            }


            Object.defineProperty(target, name, {
                // tslint:disable-next-line:object-literal-shorthand
                // eslint-disable-next-line object-shorthand
                get: function () {
                    // return decs.map((x, i) => this[`${name}_${i}`], this);
                    const targetObj = {};

                    for (const key of Object.keys(queryDecoratorsFactory))
                        targetObj[ key ] = this[ subPropertyName(name, key) ];


                    return targetObj;
                }
            });
        };
    }
}

function subPropertyName(name: string, key: string) {
    return `${name}_${key}`;
}

function firstSmallLetter(word: string) {
    return word[ 0 ].toLowerCase() + word.slice(1);
}


type Null = '________null________';

type MutliView<T> =
    T extends ElementRef ? { elementRef: T; } :
    T extends ViewContainerRef ? { viewContainerRef: T; } :
    T extends TemplateRef<any> ? { templateRef: T; } :
    T extends Provider ? { provider: T; } :
    T extends Null ? {} :
    T;
// { renderElement: T };


export type MultiViewQuery<T1, T2 = Null, T3 = Null, T4 = Null, T5 = Null> =
    MutliView<T1> &
    MutliView<T2> &
    MutliView<T3> &
    MutliView<T4> &
    MutliView<T5>;


/* class A { }
type Example = MultiViewChildType<ElementRef, Provider, TemplateRef<A>, ViewContainerRef, { component: A }>;
const a: Example = undefined;
a.templateRef = undefined;
a.component = undefined; */
