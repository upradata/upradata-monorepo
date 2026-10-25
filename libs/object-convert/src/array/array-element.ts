import { Element, IteratorElement } from '../element';
import { ArrayConvertOptions, ArrayOptions } from './array-options';


export class ArrayElement extends Element {
    private index = -1;


    constructor(protected value: unknown[], options: ArrayConvertOptions /* | boolean */, level: number) {
        super(value, new ArrayOptions(options), level);
    }


    public next(): IteratorResult<IteratorElement> {
        ++this.index;

        if (this.index < this.value.length)
            return {
                done: false,
                value: { key: this.index, value: this.value[ this.index ], isLast: this.index === this.value.length - 1, isLeaf: false }
            };

        return { done: true, value: null };
    }


    /* impossible for es5 compatibility :(
    public *[Symbol.iterator](): IterableIterator<IteratorElement> {

         for (const index of (<any[]>this.value).keys()) {
            yield [index, this.value[index], index === this.value.length - 1];

        }
    }*/

}
