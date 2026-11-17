import type { ElementFactory } from './element-factory';
import { ElementOptions } from './element-options';
import { BaseOpts, Node } from './options';
import { Key, RecursiveValue, typeOf } from './types';

export interface IteratorElement {
    key: Key;
    value: unknown;
    isLast: boolean;
    isLeaf: boolean;
}

export abstract class Element implements Iterator<IteratorElement> {
    static lazyElementFactory() {
        return require('./element-factory').ElementFactory as typeof ElementFactory;
    }

    constructor(
        protected value: unknown,
        public options: ElementOptions,
        protected level: number,
    ) {}

    public convert(): unknown {
        const { concatenator: returnable } = this.options;
        let i = 0;

        for (let iterator = this.next(); !iterator.done; iterator = this.next()) {
            const { key, value, isLast, isLeaf } = iterator.value;
            const levelDetails = { level: this.level, isLast, isLeaf };

            const { filter, mutate, next, options } = this.options.getOptions(key, value, levelDetails);

            const isArray = typeOf(this.value) === 'array';

            if (filter.value(key, value, levelDetails)) {
                const mutatedValue = mutate.value(key, value, levelDetails);

                const parsedValue = this.parseNext(
                    { key, value: mutatedValue, levelDetails },
                    { ...next, ...(options?.recursive ? options.value : {}) },
                );

                // If "filter" jumped some indexes, key will miss numbers and the array will have holes
                // so we use "i"
                returnable.push(isArray ? i : key, parsedValue, levelDetails);
            }

            ++i;
        }

        return returnable.value();
    }

    private parseNext(node: Node, nextOptions: RecursiveValue<BaseOpts>) {
        const { value, levelDetails } = node;

        // End of recursive loop
        if (levelDetails.isLeaf) return value;

        return Element.lazyElementFactory()
            .create(
                value,
                this.options.getNextOptions(node, nextOptions), // this.options.getOptions(key, value, details),
                this.level + 1,
            )
            .convert();
    }

    // not es5 compatible :(

    /*  public *[Symbol.iterator](): IterableIterator<IteratorElement> {
         return undefined;
     }
     public [Symbol.iterator](): IterableIterator<IteratorElement> {
         return this;
     }
     */

    // for of loop
    public abstract next(): IteratorResult<IteratorElement, null>;
}
