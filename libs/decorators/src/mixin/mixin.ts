// Inspired by https://github.com/michaelolof/typescript-mix/blob/master/src/index.ts
import { ensureArray, Constructor } from '@upradata/util';


export type Mixin<T> = T extends Constructor<any, any> | Object ? T : never;

export type Override = 'override' | 'merge' | 'none';

export interface MixinOpts<M extends (Mixin<any> | Mixin<any>[])> {
    mix: M;
    override?: Override;
    // instanceFields?: boolean;
}


export type MixinOptions = MixinOpts<Mixin<any> | Mixin<any>[]>;

export type MixinOptions1<M1> = MixinOpts<Mixin<M1> | [ Mixin<M1> ]>;
export type MixinOptions2<M1, M2> = MixinOpts<[ Mixin<M1>, Mixin<M2> ]>;
export type MixinOptions3<M1, M2, M3> = MixinOpts<[ Mixin<M1>, Mixin<M2>, Mixin<M3> ]>;
export type MixinOptions4<M1, M2, M3, M4> = MixinOpts<[ Mixin<M1>, Mixin<M2>, Mixin<M3>, Mixin<M4> ]>;
export type MixinOptions5<M1, M2, M3, M4, M5> = MixinOpts<[ Mixin<M1>, Mixin<M2>, Mixin<M3>, Mixin<M4>, Mixin<M5> ]>;



/* function f(m: MixinOptions2<{ a: string; }, { b: number; }>): MixinOptions2<{ a: string; }, { b: number; }> { return undefined; };

f({
    override: 'none',
    mix: [ { a: '1' }, { b: 2 } ]
}); */


export function mix(client: object, mixins: MixinOptions, isClientInstance: boolean = false) {
    for (const mixin of ensureArray(mixins.mix)) {
        mergeMixin(client, mixin, { override: mixins.override, /* instanceFields: mixins.instanceFields || false, */ isClientInstance });
    }

    return client;
}


function mergeMixin(client: object, mixin: Mixin<any>, options: { override: Override; /* instanceFields: boolean; */ isClientInstance: boolean; }) {
    const { override, /* instanceFields, */ /* isClientInstance */ } = options;

    const mixinO: object = typeof mixin === 'object' ? mixin : mixin.prototype;

    // if (!instanceFields) {
    // mixinO = typeof mixin === 'object' ? mixin : mixin.prototype;

    if (!mixinO) {
        console.warn(`Could not merge the mixin. It must be an object with prototype or an object`);
        return;
    }
    /* } else {
        if (typeof mixin !== 'object' && instanceFields) {
            mixinO = new mixin();
        } else
            return;
    } */

    for (const key of Object.getOwnPropertyNames(mixinO).filter(name => name !== 'constructor')) {
        setDescriptor({ client, mixin: mixinO, key, override: override || 'merge' });
    }
}

const setDescriptor = (options: { client: object; mixin: object; key: string; override: Override; }) => {
    const { client, mixin, key, override } = options;

    const descr = {
        client: Object.getOwnPropertyDescriptor(client, key),
        mixin: Object.getOwnPropertyDescriptor(mixin, key)
    };

    if (descr.client === undefined)
        Object.defineProperty(client, key, descr.mixin);
    else {
        if (override !== 'none') {
            const type = objectType(client, key);

            if (type !== objectType(mixin, key) || typeof descr.client[ type ] !== typeof descr.mixin[ type ]) {
                throw new Error(`Mixin: "class ${client.constructor.name}" --> ${descr.client[ type ]} and ${descr.mixin[ type ]} do not have the same type`);
            }

            if (override === 'override' || type === 'get')
                Object.defineProperty(client, key, descr.mixin);
            else {
                if (typeof descr.client[ type ] !== 'function') {
                    Object.defineProperty(client, key, descr.mixin);
                    // console.warn(`Mixin: "class ${client.constructor.name}" --> ${descr.client[ type ]} has been overriden. Set options override: true to remove this message.`);
                } else {

                    Object.defineProperty(client, key, {
                        // eslint-disable-next-line object-shorthand
                        [ type ]: function (...args: any[]) {
                            descr.mixin[ type ].apply(this, args);
                            return descr.client[ type ].apply(this, args);
                        }
                    });
                }
            }
        }
    }
};

const objectType = (o: object, key: string): 'get' | 'set' | 'value' => {
    const descr = Object.getOwnPropertyDescriptor(o, key);
    return descr.get ? 'get' : descr.set ? 'set' : 'value';
};




/**
 * Takes a list of classes or object literals and adds their methods
 * to the class calling it.
 */
type Const = Constructor | { constructor: Constructor; };

export const Mixin = (mixins: MixinOptions) => {
    return <T extends Const>(target: T, propertyKey?: string): T => {
        const cons = (!propertyKey ? (target as Constructor).prototype : target) as Constructor;

        /* if (propertyKey)
            mix(target, mixins, true); */

        mix(cons, mixins);

        return target;
    };
};

const decorator = (mixins: MixinOptions) => <T>(target: T, propertyKey?: string): any => Mixin(mixins)(target as any, propertyKey) as any;

export const Mixin1: Mix1 = decorator as any;
export const Mixin2: Mix2 = decorator as any;
export const Mixin3: Mix3 = decorator as any;
export const Mixin4: Mix4 = decorator as any;
export const Mixin5: Mix5 = decorator as any;



/*

export function Mixin1<M1>(mixins: MixinOptions1<M1>) {
    return <T extends Const = any>(target: T, propertyKey?: string): T & Mixin<M1> => Mixin(mixins)(target, propertyKey) as any;
}

export function Mixin2<M1, M2>(mixins: MixinOptions2<M1, M2>) {
    return <T>(target: T, propertyKey?: string):  T & Mixin<M1> & Mixin<M2> => Mixin(mixins)(target as any, propertyKey) as any;
}

export function Mixin3<M1, M2, M3>(mixins: MixinOptions3<M1, M2, M3>) {
    return <T extends Const>(target: T, propertyKey?: string): T & Mixin<M1> & Mixin<M2> & Mixin<M3> => Mixin(mixins)(target, propertyKey) as any;
}


export function Mixin4<M1, M2, M3, M4>(mixins: MixinOptions4<M1, M2, M3, M4>) {
    return <T extends Const>(target: T, propertyKey?: string): T & Mixin<M1> & Mixin<M2> & Mixin<M3> & Mixin<M4> => Mixin(mixins)(target, propertyKey) as any;
}


export function Mixin5<M1, M2, M3, M4, M5>(mixins: MixinOptions5<M1, M2, M3, M4, M5>) {
    return <T extends Const>(target: T, propertyKey?: string): T & Mixin<M1> & Mixin<M2> & Mixin<M3> & Mixin<M4> & Mixin<M5> => Mixin(mixins)(target, propertyKey) as any;
}
 */


// export const Mixin = mixin as any as Mix1 & Mix2 & Mix3 & Mix4 & Mix5;
/**
 * Takes a method as a parameter and add it to the class calling it.
 */
/* export function delegate(method: (...args: any[]) => any) {
    return function (target: any, propertyKey: string) {
        target.constructor.prototype[ propertyKey ] = method;
    };
} */

// export type MixinType<T> = T extends Constructor<T> ? InstanceType<T> : T;
/*
export type Mix = <Target>(mixins: MixinOptions) => Target;
export type Mix1 = <Target, M1>(mixins: MixinOptions1<M1>) => Target & MixinType<M1>;
export type Mix2 = <Target, M1, M2>(mixins: MixinOptions2<M1, M2>) => Target & MixinType<M1> & MixinType<M2>;
export type Mix3 = <Target, M1, M2, M3>(mixins: MixinOptions3<M1, M2, M3>) => Target & MixinType<M1> & MixinType<M2> & MixinType<M3>;
export type Mix4 = <Target, M1, M2, M3, M4>(mixins: MixinOptions4<M1, M2, M3, M4>) => Target & MixinType<M1> & MixinType<M2> & MixinType<M3> & MixinType<M4>;
export type Mix5 = <Target, M1, M2, M3, M4, M5>(mixins: MixinOptions5<M1, M2, M3, M4, M5>) => Target & MixinType<M1> & MixinType<M2> & MixinType<M3> & MixinType<M4> & MixinType<M5>;
 */

type Decorator<M> = <S extends string | never, T extends S extends string ? any : Const>(target: T, propertyKey?: S) => S extends string ? any : T & M;
type Mix1 = <M1>(mixins: MixinOptions1<M1>) => Decorator<Mixin<M1>>;
type Mix2 = <M1, M2>(mixins: MixinOptions2<M1, M2>) => Decorator<Mixin<M1> & Mixin<M2>>;
type Mix3 = <M1, M2, M3>(mixins: MixinOptions3<M1, M2, M3>) => Decorator<Mixin<M1> & Mixin<M2> & Mixin<M3>>;
type Mix4 = <M1, M2, M3, M4>(mixins: MixinOptions4<M1, M2, M3, M4>) => Decorator<Mixin<M1> & Mixin<M2> & Mixin<M3> & Mixin<M4>>;
type Mix5 = <M1, M2, M3, M4, M5>(mixins: MixinOptions5<M1, M2, M3, M4, M5>) => Decorator<Mixin<M1> & Mixin<M2> & Mixin<M3> & Mixin<M4> & Mixin<M5>>;

export type Mix<M0, M1, M2 = {}, M3 = {}, M4 = {}, M5 = {}> = M0 & M1 & M2 & M3 & M4 & M5;
