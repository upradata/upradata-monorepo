import { Key, typeOf } from '../types';
import { ElementOptions } from '../element-options';
import { BaseOpts, Options } from '../options';
import { ArrayConcatenator } from '../concatenator';


export type ArrayConvertOptions = Options;

export class ArrayOptions extends ElementOptions {
    constructor(options: ArrayConvertOptions) {
        super({
            // ...(isBoolean(options) ? { includes: true } as BaseOpts : options),
            concatenatorCtor: ArrayConcatenator,
            ...options
        });
    }


    protected getDetailedOptions(key: Key, value: unknown): BaseOpts {
        return { ...this.details[ key ], ...this.details[ typeOf(value) ] };
    }
}
