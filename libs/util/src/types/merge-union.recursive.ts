import type { Levels } from './useful';

/* The key trick is:

type MergeValue<T> =
    AllObjects<T> extends true
    ? MergeRecursive<T>
    : T;

because for c2.c3 the union is:

    'c3' | 33 | '-'

which should not recurse, whereas for c2 the union is:

    { c3 ?: 'c3'; } |
        { c3: 33; c4: 44 } |
        { c3: '-'; c5: 55 }

which should recurse.; */

type Simplify<T> = {
    [K in keyof T]: T[K];
};

type UnionKeys<T> = T extends unknown ? keyof T : never;

type RequiredKeys<T> = T extends unknown
    ? {
          [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
      }[keyof T]
    : never;

type HasRequired<T, K extends PropertyKey> = T extends any
    ? K extends keyof T
        ? {} extends Pick<T, K>
            ? never
            : true
        : never
    : never;

type IsRecursivable<T> = [T] extends [never]
    ? never
    : T extends RegExp | Date | Promise<any>
      ? false
      : T extends (...args: any[]) => any
        ? false
        : T extends unknown[]
          ? true
          : T extends object
            ? true
            : false;

type AllRecursivable<T> = Exclude<T extends unknown ? IsRecursivable<T> : never, true> extends never ? true : false;

// type A = AllRecursivable<{ a: 1; } | { b: 2; }>;      // true
// type B = AllRecursivable<Date | { a: 1; }>;          // false
// type C = AllRecursivable<string | { a: 1; }>;        // false
// type D = AllRecursivable<string[]>;                 // true
// type E = AllRecursivable<(() => void) | {}>;        // false

type Get<T, K extends PropertyKey> = T extends any ? (K extends keyof T ? T[K] : never) : never;

type Clean<T, Required extends boolean> = Required extends true ? Exclude<T, undefined> : T;

type Value<T, K extends PropertyKey> = Clean<Get<T, K>, HasRequired<T, K> extends never ? false : true>;

export type MergeRecursive<T, Depth extends number = 6> = Simplify<
    {
        [K in Extract<UnionKeys<T>, RequiredKeys<T>>]: AllRecursivable<Value<T, K>> extends true
            ? Depth extends 0
                ? Value<T, K>
                : MergeRecursive<Value<T, K>, Levels[Depth]>
            : Value<T, K>;
    } & {
        [K in Exclude<UnionKeys<T>, RequiredKeys<T>>]?: AllRecursivable<Value<T, K>> extends true
            ? Depth extends 0
                ? Value<T, K>
                : MergeRecursive<Value<T, K>, Levels[Depth]>
            : Value<T, K>;
    }
>;

/* type Test = MergeRecursive<
    { a: 1; c: { c1?: 'c1', c2: { c3?: 'c3'; }; }; } |
    { b?: 2; c: { a: 11; b: { b1: 'b1'; }; c2: { c3: 33; c4: 44; }; }; } |
    { d: 'd'; c: { c1: '+', c2: { c3: '-'; c5: 55; }; c33: 333; }; }
>; */

/* type Test = {
    c: {
        c1: "c1" | "+";
        c2: {
            c3: "c3" | 33 | "-";
            c4?: 44;
            c5?: 55;
        };
        b?: {
            b1: 'b1';
        };
        a?: 11;
        c33?: 333;
    };
    d?: "d";
    b?: 2;
    a?: 1;
}; */

// type Test = MergeRecursive<{ a: 1; } | { a: 2; b: 3; }>;
/* type Test = {
    a: 1 | 2;
    b?: 3;
} */

// type Test = MergeRecursive<{ a: 1; } | { a?: 2; }>;
// type Test = {
//     a: 1 | 2 | undefined;
// };
