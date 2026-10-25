import { isNil, ObjectOf } from '@upradata/util';
import { Key, Literal, LevelDetails } from './types';


export const ConcatenatorSymbol = Symbol('Concatenator class');

export abstract class Concatenator<T = unknown, U = T> {
    static [ ConcatenatorSymbol ] = true;
    abstract push(key?: Key, value?: T, details?: LevelDetails): void;
    abstract value(): U;
}


export const isConcatenatorClass = (v: any): v is Concatenator => {
    let klass = v;

    while (!isNil(klass) && klass.constructor.name !== 'Object') {
        if (klass[ ConcatenatorSymbol ])
            return true;

        klass = Object.getPrototypeOf(klass);
    }

    return false;
};

export type ConcatenatorCtor<T = unknown, U = T> = new () => Concatenator<T, U>;


export class ArrayConcatenator<T = unknown> extends Concatenator<T, T[]> {
    private container: T[] = [];

    // it seems useless, but typescript typing is not able to induced that ArrayConcatenator type is ConcatenatorCtor
    // without defining explicitly a constructor !!!!!
    constructor() { super(); }

    push(key: Key, value: T) {
        this.container.push(value);
    }

    value() {
        return this.container;
    }
}


export class ObjectConcatenator<T = unknown> extends Concatenator<T, ObjectOf<T>> {
    private container: ObjectOf<T> = {};

    // it seems useless, but typescript typing is not able to induced that ArrayConcatenator type is ConcatenatorCtor
    // without defining explicitly a constructor !!!!!
    constructor() { super(); }

    push(key: Key, value: T) {
        this.container[ key as string ] = value;
    }


    value() {
        return this.container;
    }
}



export class LiteralConcatenator<T extends Literal = any> extends Concatenator<T> {
    private container: T;

    // it seems useless, but typescript typing is not able to induced that ArrayConcatenator type is ConcatenatorCtor
    // without defining explicitly a constructor !!!!!
    constructor() { super(); }

    push(_key: Key, value: T) {
        this.container = value;
    }

    value() {
        return this.container;
    }
}
