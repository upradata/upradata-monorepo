import { Element, IteratorElement } from '../element';
import { ObjectConvertOptions, ObjectOptions } from './object-options';


export class ObjectElement extends Element {
    private index = -1;

    constructor(value: {}, options: ObjectConvertOptions /*  | boolean */, level: number) {
        super(value, new ObjectOptions(options), level);
    }



    public next(): IteratorResult<IteratorElement> {
        const getKeys = (): string[] => {

            // if (this.options.all)
            return Object.getOwnPropertyNames(this.value);

            // return Object.getOwnPropertyNames(this.options.specific).filter(key => isDefined(this.value[ key ]));
        };

        const keys = getKeys();

        ++this.index;

        if (this.index < keys.length) {
            const key = keys[ this.index ];

            return {
                done: false,
                value: { key, value: this.value[ key ], isLast: this.index === keys.length - 1, isLeaf: false }
            };
        }

        return { done: true, value: null };
    }



    /*
    public *[Symbol.iterator](): IterableIterator<IteratorElement> {
        if (this.option.all)
            yield* this.iteratortAll();
        else
            yield* this.iteratorPartial();
    }


    private *iteratortAll(): IterableIterator<IteratorElement> {
        const entries = Object.entries(this.value);
        let index = 0;

        for (const [key, elmt] of entries)
            yield [key, elmt, ++index === entries.length];

    }


    private *iteratorPartial(): IterableIterator<IteratorElement> {
        const keys = Object.keys(this.option.optionsOption).filter(key => this.value[key] !== undefined);
        let index = 0;

        for (const key of keys) {
           // if (this.value[key] !== undefined) {
                yield [key, this.value[key], ++index === keys.length];
          //  }
        }
    }
    */

}
