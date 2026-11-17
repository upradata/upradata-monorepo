/* eslint-disable spaced-comment */
import { Levels } from '@upradata/util';
import { TypeOf, Literal, GetType, Key } from './types';
import * as Types from './types';
// import { BaseOpts as OriginalBaseOpts } from './options';
import { ConcatenatorCtor } from './concatenator';


//////////////////////////// State that will be used //////////////////////////////////

type State = {
    isTypeOptions: boolean;
    onlyRecursive: boolean;
    level: number;
};

type InitState<N extends number> = {
    isTypeOptions: false;
    onlyRecursive: false;
    level: N;
};


type SetState<OldS extends State, NewS extends Partial<State>> = Omit<OldS, keyof NewS> & NewS;


//////////////////////////// Redefinition of Options //////////////////////////////////

type RecursiveValue<T, Bool extends boolean = boolean> = Omit<Types.RecursiveValue<T>, 'recursive'> & { recursive?: Bool; };

type RecursiveValueOpts<T> =
    | T
    | RecursiveValue<T, false>
    | RecursiveValue<unknown, true>;

type RecursiveTransformOpts<K extends Key, T, R = unknown> =
    | Types.SimpleTransformer<K, T, R>
    | RecursiveValue<Types.SimpleTransformer<K, T, R>, false>
    | RecursiveValue<Types.SimpleTransformer<Key, unknown, R>, true>;


type OnlyRecursiveTransformOpts<K extends Key, T, R = unknown> = RecursiveValue<Types.SimpleTransformer<K, T, R>, true>;


type _BaseOpts<K extends Key, T, S extends State> = {
    next?: ConvertOptions<T, S>;
    filter?: RecursiveTransformOpts<K, T, boolean>;
    mutate?: RecursiveTransformOpts<K, T>;
    includes?: boolean;
    concatenatorCtor?: RecursiveValueOpts<ConcatenatorCtor<T>> | RecursiveTransformOpts<K, T, ConcatenatorCtor<T>>;
};


type BaseOpts<K extends Key, T, S extends State = InitState<0>> = _BaseOpts<K, T, S> & {
    options?: RecursiveTransformOpts<K, T, _BaseOpts<K, T, S>>;
};

type OnlyRecursiveBaseOpts<K extends Key, T, S extends State> = {
    next?: ConvertOptions<T, SetState<S, { onlyRecursive: true; }>>;
    filter?: OnlyRecursiveTransformOpts<K, T, boolean>;
    mutate?: OnlyRecursiveTransformOpts<K, T>;
    includes?: boolean;
    concatenatorCtor?: RecursiveValue<ConcatenatorCtor<T>> | OnlyRecursiveTransformOpts<K, T, ConcatenatorCtor<T>>;
    options?: OnlyRecursiveTransformOpts<K, T, _BaseOpts<K, T, S>>;
};



//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////   Options reflecting the input to convert     //////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////


declare const _Stop: unique symbol;
type Stop = typeof _Stop;


// & string allow to force the type to be an object and not an array or tuple
// i.e. c2: [ number, string ] => would have been [ Options, Options ]
type IsTuple<T> = T extends { length: infer N; } ? number extends N ? false : true : false;
type Indices<T> = Exclude<keyof T, keyof unknown[]>;
type KeyOf<T> = T extends Literal ? never : IsTuple<T> extends true ? Indices<T> : T extends unknown[] ? keyof T & number : keyof T;

type ExtractTypeKeys<T, Type, V = never> = [ T ] extends [ T ] ? {
    [ K in KeyOf<T> ]?: | [ T ] extends [ T ] ?
    T[ K ] extends unknown[] ? (Type extends unknown[] ? K : V) :
    T[ K ] extends RegExp ? (Type extends RegExp ? K : V) :
    T[ K ] extends Type ? K : V : never
    // T[ K ] extends Type ?
    // when Type is object, any[] and object will pass the test
    // so we are obliged to be sure to fail when any[] extends object
    // T[ K ] extends unknown[] ? (object extends Type ? V : K) : K : V
}[ KeyOf<T> ] : never;

type ExtractType<T, Type> = T[ ExtractTypeKeys<T, Type> ];


/////////////////////////////////////////////

type SimpleKey<Type> = Type extends null ? Key : Type extends unknown[] ? number  /* : Type extends object ? Key */ : Key;

type _TypeOptions<K extends Key, E, Type, S extends State> =
    // Stop type distribution
    [ K ] extends [ Stop ] ?
    OnlyRecursiveBaseOpts<SimpleKey<Type>, Type, S> :
    [ true ] extends [ false ] ? never :
    BaseOpts<Exclude<K, Stop>, E, S> & ConvertOptions<E, SetState<S, { isTypeOptions: true; }>>;

type TypeOptions<T, S extends State> = {
    [ Type in TypeOf ]?: _TypeOptions<
        ExtractTypeKeys<T, GetType<Type>, Stop>,
        ExtractType<T, GetType<Type>>,
        GetType<Type>,
        S
    >
};

type _BaseOptions<T, S extends State, O = Exclude<T, Literal>> =
    S[ 'isTypeOptions' ] extends true ? {} :
    BaseOpts<KeyOf<O>, O[ KeyOf<O> ] | Extract<T, Literal>, S>;


type ObjectConvertOptions<T, S extends State, O = Exclude<T, Literal>> = {
    [ K in KeyOf<O> ]?: ConvertOptions<O[ K ], SetState<S, { level: Levels[ S[ 'level' ] ]; }>>;
};


/////////////////////////////////////////////

export type ConvertOptions<T, S extends State = InitState<20>> =
    // [ T ] extends [ Literal ] avoid type distribution => C<A|B> and not C<A> | C<B>
    // https://github.com/microsoft/TypeScript/issues/29368
    // Sometimes, when T is a union of few types, like when prop "next" is used,  T[ KeyOf<T> ]
    [ T ] extends [ Literal ] ? S[ 'isTypeOptions' ] extends true ? {} : BaseOpts<null, T> :
    // Stops type distribution (in each branch of the condition "extends ... ?", we have to disable it)
    [ true ] extends [ false ] ? never :
    S[ 'level' ] extends 0 ?
    TypeOptions<T, S> & _BaseOptions<T, S> :
    [ true ] extends [ false ] ? never :
    ObjectConvertOptions<T, S> & TypeOptions<T, S> & _BaseOptions<T, S>;



///////////////    FOR TESTING    ////////////////////

/*
// b: [ number, string ]; c: number;  },  { a: number; b: [ number, string ]; c: number; }, { a: number; b: [ number, string ]; c: number; }
type CCC = ConvertOptions<[ { a: number; }, { b: string; }, RegExp, number, string ]>;


const cc: CCC = {
    concatenatorCtor: undefined,
    filter: undefined,
    null: {
        filter: {
            value: (_k, _v) => true,
            recursive: true
        }
    },
    // null: {
    //     filter: {
    //         value: (_k, _v) => true,
    //         recursive: false
    //     }
    // },
    // null: (_k, _v) => true,
    object: {
        filter: (k, v) => k === '0' && !!(v as { a: number; }).a
    },
    next: {
        a: {},
        filter: (_k, _v) => true
    }
};



const dd: ConvertOptions<[ number ]> = {
    number: {
        filter: (_k, _v) => _v[ 0 ]
    }
};


type JJJ = ExtractTypeKeys<[ {
    a: number;
    b: [ number, string ];
    c: number;
}, {
    a: number;
    b: [ number, string ];
    c: number;
}, {
    a: number;
    b: [ number, string ];
    c: number;
} ], number>;


interface Data {
    a: number;
    b: string;
    c: [ string, number, { c1: number; c2: [ number, string ]; c3: string; } ];
    d: { d1: number; d2: string; };
}



type DataConvert = ConvertOptions<Data>;

const a: DataConvert = {
    object: {
        filter: (_k, _v) => true
    },
    mutate: (k, v) => `${k} ==> ${v}`,
    filter: (_k, _v) => true,
    next: {
        filter: (_k, _v) => true
    },
    // null: {
    //     mutate: (_k, v) => !!v,
    //     filter: (k, v) => k === v
    // },
    a: {
        mutate: {
            value: (k, v) => k === v,
            recursive: true
        }
    },
    b: {
        mutate: (k, v) => k === v,
        filter: (_k, _v) => true,
        // string: {
        //     mutate: (k, v) => k === v,
        //     filter: (k, v) => k === v,
        // },
        // boolean: {
        //     mutate: (k, v) => `${k} ==> ${v}`,
        //     filter: (_k, _v) => true
        // }
    },
    c: {
        next: {
            filter: (_k, _v) => true
        },
        0: {
            mutate: (k, v) => k === v,
            filter: (k, v) => k === v,
        },
        object: {
            mutate: (k, v) => `${k} ==> ${v}`,
            filter: (_k, _v) => true
        }
    },
    d: {
        mutate: (k, v) => `${k} ==> ${v}`,
        filter: (_k, _v) => true,
        d2: {
            mutate: (k, v) => k === v,
            filter: (k, v) => k === v,
            includes: true
        }
    }
};


console.log(a);
 */
