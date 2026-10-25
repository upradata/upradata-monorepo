import { isArray, isDefined, isNull } from '@upradata/util';


export type Key = number | string | symbol | null;

export type LevelDetails = { level: number; isLast: boolean; isLeaf: boolean; };
export type SimpleTransformer<K extends Key = Key, T = unknown, R = unknown> = (key?: K, value?: T, details?: LevelDetails) => R;


export type RecursiveValueOpts<T = unknown> = RecursiveValue<T> | T;

export const isRecursiveValue = (v: any): v is RecursiveValue => {
    return v instanceof RecursiveValue || isDefined((v as RecursiveValue)?.value);
};

export class RecursiveValue<T = unknown> {
    value: T;
    recursive?: boolean = false;

    constructor(options: RecursiveValueOpts<T>, recursive?: boolean) {
        Object.assign(this, (isRecursiveValue(options) ? options : { value: options }));

        if (isDefined(recursive))
            this.recursive = recursive;
    }
}


export type RecursiveTransformer<K extends Key = Key, T = unknown, R = unknown> = RecursiveValue<SimpleTransformer<K, T, R>>;
export type RecursiveTransformerOpts<K extends Key = Key, T = unknown, R = unknown> = RecursiveValueOpts<SimpleTransformer<K, T, R>>;


export const makeRecursive = <T>(options: RecursiveValueOpts<T>): RecursiveValue<T> => {
    return new RecursiveValue(options, true);
};

export const makeRecursiveTransform = <K extends Key = Key, T = unknown, R = unknown>(options: RecursiveTransformerOpts<K, T, R>): RecursiveTransformer<K, T, R> => {
    return new RecursiveValue(options, true);
};


export interface _Literals {
    number: number;
    bigint: bigint;
    string: string;
    boolean: boolean;
    symbol: symbol;
    function: Function;
    regexp: RegExp;
    undefined: undefined;
    null: null;
}


export type Literal = _Literals[ keyof _Literals ];
export type TypeOfLiterals = keyof _Literals;

export type TypeOf = TypeOfLiterals | 'array' | 'object';


export type GetType<T extends TypeOf> = |
    T extends 'array' ? unknown[] :
    T extends RegExp ? 'regexp' :
    T extends 'object' ? object :
    _Literals[ T & TypeOfLiterals ];


export const typeOf = (value: unknown): TypeOf => {
    if (isNull(value))
        return 'null';

    if (isArray(value))
        return 'array';

    if (value instanceof RegExp)
        return 'regexp';

    return typeof value;
};
