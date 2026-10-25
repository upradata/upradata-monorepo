import { Literal } from '../types';
import { Element, IteratorElement } from '../element';
import { LiteralConvertOptions, LiteralOptions } from './literal-options';


export class LiteralElement extends Element {
    private done = false;

    constructor(protected value: Literal, options: LiteralConvertOptions /* | boolean */, level: number) {
        super(value, new LiteralOptions(options), level);
    }


    public next(): IteratorResult<IteratorElement> {
        if (!this.done) {
            this.done = true;

            return {
                done: false,
                value: { key: null, value: this.value, isLast: true, isLeaf: true }
            };

        }

        return {
            done: true,
            value: null
        };
    }

    /* impossible for es5 compatibility :(

    public *[Symbol.iterator](): IterableIterator<IteratorElement> {
       //  let key: string = typeof this.value;

       // if (key === 'object')
       //     key = 'null';

    yield [this.value, new NullElement(), true];
    } */
}
