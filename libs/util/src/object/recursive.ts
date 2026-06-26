/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
/** biome-ignore-all lint/complexity/noBannedTypes: <explanation> */
import { isDefined, isPlainObject } from '../is';
import { entries } from './access';

import type { Key } from '../types';
import type { ConcatenatedKeysRecursive, FlatKeys, Get } from './recursive.type';


/* const o = {
    a: 1,
    b: {
        b1: 1, b2: 2,
    },
    c: {
        c1: {
            c2: {
                c3: 3, c4: 4
            },
        },
    },
}; */



// const flatKey: FlatKeys<typeof o>; =>  "a" | "b.b1" | "b.b2" | "c.c1.c2.c3" | "c.c1.c2.c4";
// const flatKeys = keysRecursive(o); => Array<"a" | "b.b1" | "b.b2" | "c.c1.c2.c3" | "c.c1.c2.c4">

export type FlattenMergeKey = (key1: string | number, key2?: string | number) => Key;

export class FlattenObjectOption {
    mergeKeys: FlattenMergeKey = (k1, k2) => isDefined(k2) ? `${k1}.${k2}` : k1;
    nbLevels: number = NaN;
}



export const keysRecursive = <O extends {}>(o: O, option?: Partial<FlattenObjectOption>): ConcatenatedKeysRecursive<O> => {
    const { mergeKeys, nbLevels } = Object.assign(new FlattenObjectOption(), option);

    /* const keys = <U>(o: U): ConcatenatedKeysRecursive<U> => {
        return entries(o).flatMap(([ k, v ], level) => {
            if (isPlainObject(v) && level + 1 !== nbLevels)
                return keys<{}>(v).map(key => mergeKeys(k, key));

            return [ mergeKeys(k, undefined) ];
        }) as any;
    }; */

    const keys = (o: {}): string[] => {
        return entries(o).flatMap(([ k, v ], level) => {
            if (isPlainObject(v) && level + 1 !== nbLevels)
                return keys(v).map(key => mergeKeys(k, key));

            return [ mergeKeys(k, undefined) ];
        }) as any;
    };

    return keys(o) as any;
};



// props = a.b.c.d for instance
// getRecursive(o, props) => get o.a.b.c.d
// if prop does not exist, return undefined
export const getRecursive = <O extends {}, Keys extends FlatKeys<O, 6>>(o: O, key: {} extends O ? Key : Keys): {} extends O ? any : Get<O, Keys, 6> => {
    const k = key as any as string;
    return typeof k === 'string' ? k.split('.').reduce((obj, p) => (obj as any)?.[ p ], o) as any : o[ k ];
};

// const t = getRecursive({}, 'b.a');
// const t = getRecursive({ a: 1, b: { b1: { b2: 2 } } }, 'b' as const);

// setRecursive(o, props, value) sets o.a.b.c.d = value
// if a prop does not exist, it is created as {}
export const setRecursive = <O extends {}, Keys extends FlatKeys<O, 6>>(
    o: O, key: {} extends O ? Key : Keys, value: {} extends O ? any : Get<O, Keys, 6>
): O => {
    const k = key as string;

    if (typeof k === 'string') {

        k.split('.').reduce((obj, p, i, arr) => {
            const oAny = obj as any;

            oAny[ p ] = i === arr.length - 1 ? value : oAny[ p ] || {};
            return oAny[ p ];
        }, o);

    } else {
        (o as any)[ k ] = value;
    }

    return o;
};


export const set = setRecursive;
export const get = getRecursive;
