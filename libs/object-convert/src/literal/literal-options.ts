import { typeOf } from '../types';
import { ElementOptions } from '../element-options';
import { BaseOpts, Options } from '../options';
import { LiteralConcatenator } from '../concatenator';

export type LiteralConvertOptions = Options;


export class LiteralOptions extends ElementOptions {
    constructor(options: LiteralConvertOptions) {
        super({
            // ...(isBoolean(options) ? { includes: true } as BaseOpts : options),
            concatenatorCtor: LiteralConcatenator,
            ...options
        });
    }



    protected getDetailedOptions(_key: number | string, value: unknown): BaseOpts {
        const type = typeOf(value);

        if (type === 'object' || type === 'array')
            throw new Error(`A LiteralElement cannot be an "${type}"`);

        return this.details[ type ];
    }

}
