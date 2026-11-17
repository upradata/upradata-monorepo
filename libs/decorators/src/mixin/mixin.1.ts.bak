import { ensureArray, Constructor } from '@upradata/util';


export type Mixin<T> = T extends Constructor<any, any> | Object ? T : never;

export type Override = 'override' | 'merge' | 'none';

export interface MixinOpts<M extends (Mixin<any> | Mixin<any>[])> {
    mix: M;
    override?: Override;
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


function mix(client: Constructor, mixins: MixinOptions) {
    for (const mixin of ensureArray(mixins.mix)) {
        mergeMixin(client, mixin, mixins.override);
    }

    return client;
}


function mergeMixin(client: Constructor<any>, mixin: Mixin<any>, override: Override) {
    const mixinO = typeof mixin === 'object' ? mixin : mixin.prototype;

    if (!mixinO) {
        console.warn(`Could not merge the mixin. It must be an object with prototype or an object`);
        return;
    }

    for (const key of Object.getOwnPropertyNames(mixinO).filter(name => name !== 'constructor')) {
        setDescriptor({ client, mixin: mixinO, key, override: override || 'merge' });
    }
}

const setDescriptor = (options: { client: Constructor<any>, mixin: object, key: string; override: Override; }) => {
    const { client, mixin, key, override } = options;

    const descr = {
        client: Object.getOwnPropertyDescriptor(client, key),
        mixin: Object.getOwnPropertyDescriptor(mixin, key)
    };

    if (descr.client === undefined)
        Object.defineProperty(client.prototype, key, descr.mixin);
    else {
        if (override !== 'none') {
            const type = objectType(client, key);

            if (type !== objectType(mixin, key) || typeof descr.client[ type ] !== typeof descr.mixin[ type ]) {
                throw new Error(`Mixin: "class ${client.constructor.name}" --> ${descr.client[ type ]} and ${descr.mixin[ type ]} do not have the same type`);
            }

            if (override === 'override')
                Object.defineProperty(client.prototype, key, descr.mixin);
            else {
                if (typeof descr.client[ type ] !== 'function') {
                    Object.defineProperty(client.prototype, key, descr.mixin);
                    // console.warn(`Mixin: "class ${client.constructor.name}" --> ${descr.client[ type ]} has been overriden. Set options override: true to remove this message.`);
                } else {

                    Object.defineProperty(client.prototype, key, {
                        [ type ]: function (...args: any[]) {
                            descr.client[ type ].apply(this, args);
                            descr.mixin[ type ].apply(this, args);
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
export function Mixin(mixins: MixinOptions) {
    return <T extends Constructor>(target: T): T => mix(target, mixins) as any;
}


export function Mixin1<M1>(mixins: MixinOptions1<M1>) {
    return <T>(target: T): T & Mixin<M1> => mix(target as any, mixins) as any;
}

export function Mixin2<M1, M2>(mixins: MixinOptions2<M1, M2>) {
    return <T>(target: T): T & Mixin<M1> & Mixin<M2> => mix(target as any, mixins) as any;
}


export function Mixin3<M1, M2, M3>(mixins: MixinOptions3<M1, M2, M3>) {
    return <T>(target: T): T & Mixin<M1> & Mixin<M2> & Mixin<M3> => mix(target as any, mixins) as any;
}


export function Mixin4<M1, M2, M3, M4>(mixins: MixinOptions4<M1, M2, M3, M4>) {
    return <T>(target: T): T & Mixin<M1> & Mixin<M2> & Mixin<M3> & Mixin<M4> => mix(target as any, mixins) as any;
}


export function Mixin5<M1, M2, M3, M4, M5>(mixins: MixinOptions5<M1, M2, M3, M4, M5>) {
    return <T>(target: T): T & Mixin<M1> & Mixin<M2> & Mixin<M3> & Mixin<M4> & Mixin<M5> => mix(target as any, mixins) as any;
}



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
/*export type Mix = <Target>(mixins: MixinOptions) => Target;
export type Mix1 = <Target, M1>(mixins: MixinOptions1<M1>) => Target & MixinType<M1>;
export type Mix2 = <Target, M1, M2>(mixins: MixinOptions2<M1, M2>) => Target & MixinType<M1> & MixinType<M2>;
export type Mix3 = <Target, M1, M2, M3>(mixins: MixinOptions3<M1, M2, M3>) => Target & MixinType<M1> & MixinType<M2> & MixinType<M3>;
export type Mix4 = <Target, M1, M2, M3, M4>(mixins: MixinOptions4<M1, M2, M3, M4>) => Target & MixinType<M1> & MixinType<M2> & MixinType<M3> & MixinType<M4>;
export type Mix5 = <Target, M1, M2, M3, M4, M5>(mixins: MixinOptions5<M1, M2, M3, M4, M5>) => Target & MixinType<M1> & MixinType<M2> & MixinType<M3> & MixinType<M4> & MixinType<M5>;
 */

export type Mix<M0, M1, M2 = {}, M3 = {}, M4 = {}, M5 = {}> = M0 & M1 & M2 & M3 & M4 & M5;
