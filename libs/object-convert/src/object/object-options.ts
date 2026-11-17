import { ElementOptions } from '../element-options';
import { BaseOpts, Options } from '../options';
import { ObjectConcatenator } from '../concatenator';
import { Key, typeOf } from '../types';

export type ObjectConvertOptions<T = {}> = Options<Key, T>;


export class ObjectOptions extends ElementOptions {
    constructor(options: ObjectConvertOptions /* | boolean */) {
        super({
            /* ...(isBoolean(options) ? { includes: true } as BaseOpts : options) */
            concatenatorCtor: ObjectConcatenator,
            ...options,
        });
    }


    protected getDetailedOptions(key: Key, value: unknown): BaseOpts {
        // key is prop name of the property (i.e. {a:1} => "a")
        return { ...this.details[ key ], ...this.details[ typeOf(value) ] };
    }

}
