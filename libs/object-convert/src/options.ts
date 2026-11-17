import { isDefined } from '@upradata/util';
import {
    RecursiveTransformer, TypeOf, RecursiveValueOpts, RecursiveTransformerOpts,
    Key, LevelDetails, RecursiveValue, isRecursiveValue
} from './types';
import { isConcatenatorClass, ConcatenatorCtor } from './concatenator';


export type _BaseOpts<K extends Key = Key, T = unknown, U = T> = {
    next?: RecursiveValueOpts<BaseOpts>;
    filter?: RecursiveTransformerOpts<K, T, boolean>;
    mutate?: RecursiveTransformerOpts<K, T, U>;
    includes?: boolean;
    concatenatorCtor?: RecursiveValueOpts<ConcatenatorCtor<T, U>> | RecursiveTransformerOpts<K, T, ConcatenatorCtor<T, U>>;
};


export type BaseOpts<K extends Key = Key, T = unknown, U = T> = _BaseOpts<K, T, U> & {
    options?: RecursiveTransformerOpts<K, T, _BaseOpts<K, T, U>>;
};



export class BaseOptions<K extends Key = Key, T = unknown, U = T> {
    readonly next?: RecursiveValue<BaseOpts>;
    readonly filter: RecursiveTransformer<K, T, boolean>;
    readonly mutate: RecursiveTransformer<K, T, U>;
    readonly concatenatorCtor: RecursiveTransformer<K, T, ConcatenatorCtor<T, U>>;
    readonly options?: RecursiveTransformer<K, T, _BaseOpts<K, T, U>>;


    constructor(options: BaseOpts<K, T, U>) {
        const { options: opts, mutate, filter, concatenatorCtor, includes, next = {} } = options;

        this.next = new RecursiveValue(next);
        this.mutate = new RecursiveValue(mutate || ((_key, value) => value as unknown as U));
        this.filter = new RecursiveValue(filter || ((_key, _value) => includes || true));

        if (isConcatenatorClass(concatenatorCtor) || isRecursiveValue(concatenatorCtor) && isConcatenatorClass(concatenatorCtor.value))
            this.concatenatorCtor = new RecursiveValue((_k, _v) => concatenatorCtor as any);
        else
            this.concatenatorCtor = new RecursiveValue(concatenatorCtor as any);

        if (isDefined(opts))
            this.options = new RecursiveValue(opts);
    }
}



export type DetailsOpts<K extends Key = Key, T = unknown, U = T> = Partial<
    Record<TypeOf, BaseOpts<K, T, U>> &
    (T extends {} | [] ? Record<keyof T, BaseOpts<K, T, U>> : {})
>;


export type Node<K extends Key = Key, T = unknown> = { key: K; value: T; levelDetails: LevelDetails; };
export type Parent<K extends Key = Key, T = unknown> = { parent: Node<K, T>; };
export type Options<K extends Key = Key, T = unknown, U = T> = BaseOpts<K, T, U> & DetailsOpts<K, T, U> & Parent<K, T>;
