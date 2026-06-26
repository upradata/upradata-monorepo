import { oneLine, Key } from '@upradata/util';


export class ImmutableValue<T> {
    private _value: T;

    constructor(init?: T) {
        this._value = init;
    }

    get value(): Readonly<T> {
        return this._value;
    }

    set value(v: T | ImmutableValue<T>) {
        this._value = v instanceof ImmutableValue ? v.value : v;
    }

    get $(): Readonly<T> {
        return this.value;
    }

    set $(v: T) {
        this.value = v;
    }

    update(v: Partial<T> | ImmutableValue<Partial<T>>) {
        this._value = { ...this._value, ...(v instanceof ImmutableValue ? v.value : v) };
    }
}



export const throwMutableTypeError = (prop: Key, oldValue: any, newValue: any) => {
    throw new Error(oneLine`
                        Proxy has "mutableType: false".
                        Property "${String(prop)}" has type "${typeof oldValue}" and
                        the value being set has type "${typeof newValue}"
                    `);
};


export const throwExtendableError = (prop: Key) => {
    throw new Error(`Proxy is not extendable and property "${String(prop)}" is being created`);
};
