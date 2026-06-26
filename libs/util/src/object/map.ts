/* eslint-disable no-redeclare */
/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import type { AnyFunction, Constructor, Function1, Function2, Function3 } from '../function';
import type { Arr, Key, ValueOf } from '../types';

type DistributiveArr<T> = T extends any ? Arr<T> : never;
type ListOfKeys = DistributiveArr<Key>;

// create object from keys
// makeObject([ 'a', 'b', 'c' ] as const, k => `value: ${ k }` as const);
// makeObject([ 'a', 'b', 'c' ] as const, k => ({ key: k, value: `value: ${ k }` as const }))
// makeObject({ a: 1, b: 2, c: 3 }, k => `value: ${ k }` as const);
// makeObject(class { a: 1; b: 2; c: 3; }, k => `value: ${ k }` as const);
// gives the same result => { a: 'value a', b: 'value b', c: 'value c' };


// input is Class with default constructor
// handler returns a value
type MakeObjectKlassHandler<Klass extends Constructor> = (
    key: keyof InstanceType<Klass>, value?: ValueOf<InstanceType<Klass>>, arg?: InstanceType<Klass>
) => any;

// input is an object
// handler returns a value
type MakeObjectObjHandler<O extends {}> = (key: keyof O, value: ValueOf<O>, arg: O) => any;

// input is an array with keys
// handler returns a value
type MakeObjectArrayHandlerWithKeys<Keys extends ListOfKeys> = (key: Keys[ number ], arg: Key[]) => any;

// input is an array with values
// handler return a { key, value }
type MakeObjectArrayHandlerWithValues<Values extends Arr<any>> = (value: Values[ number ], arg: Key[]) => { key: Key; value: any; };


type AnyHandler = Function1<any> | Function2<any, any> | Function3<any, any, any>;

type MakeObjectReturn<V extends AnyHandler, T> = ReturnType<V> extends { key: any; value: any; } ?
    Record<ReturnType<V>[ 'key' ], ReturnType<V>[ 'value' ]> :
    Record<keyof T, ReturnType<V>>;


export function makeObject<Klass extends Constructor, H extends MakeObjectKlassHandler<Klass>>(
    klass: Klass, handler: H
): MakeObjectReturn<H, InstanceType<Klass>>;

export function makeObject<Values extends Arr<any>, H extends MakeObjectArrayHandlerWithValues<Values>>(
    listOfValues: Values, handler: H
): Record<ReturnType<H>[ 'key' ], ReturnType<H>[ 'value' ]>;

export function makeObject<Keys extends ListOfKeys, H extends MakeObjectArrayHandlerWithKeys<Keys>>(
    listOfKeys: Keys, handler: H
): Record<Keys[ number ], ReturnType<H>>;

export function makeObject<O extends {}, H extends MakeObjectObjHandler<O>>(obj: O, handler: H): MakeObjectReturn<H, O>;

export function makeObject(arg: Key[] | object | Constructor, handler: (k: Key, valueOrArg: any, arg?: object) => any): object {
    const values = Array.isArray(arg) ? arg : arg.constructor && typeof arg === 'function' ? new (arg as Constructor)() : arg;
    const keys = (Array.isArray(arg) ? arg : Object.keys(values)) as Key[];

    return keys.reduce((o, k) => {
        const r = Array.isArray(arg) ? handler(k, arg) : handler(k, (arg as any)[ k ], arg);

        // r can be undefined | null !!
        const key = r?.key || k;
        const v = r?.key ? r.value : r;

        o[ key ] = v;
        return o;
    }, {} as any);
}

export const map = makeObject;
