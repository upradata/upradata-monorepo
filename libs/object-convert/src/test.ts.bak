import { isNumber, isString } from '@upradata/util';
import { convert, ConvertOptions, Key, LevelDetails, makeRecursive, makeRecursiveTransform, LiteralConcatenator, Concatenator, ConcatenatorCtor } from '.';
import emojis from '../test/data/emoji.json';

export interface Data {
    a: number;
    b: string;
    c: [ string, number, { c1: number; c2: [ number, string ]; c3: string; } ];
    d: { d1: number; d2: string; };
}


/* const options: ConvertOptions = {
    all: true
};


const all = convert({ a: 1, b: '2', c: { c1: { c2: true } } }, options);
console.log(all);
 */


/* const options: ConvertOptions = {
    filter: {
        visitor: (key, _value, { isLeaf }) => {
            return isLeaf || [ 'a', 'c', '1', '3', 'c2' ].some(k => k === key);
        },
        recursive: true
    }
};
 */

/* const options: ConvertOptions<Data> = {
    object: {
        filter: (key, _value) => `${key}`.startsWith('c'),
    },
    a: {
        mutate: (key, value) => `${key} => ${value}`
    },
    mutate: {
        transform: (key, value, { isLeaf }) => !isLeaf && typeof value === 'string' ? `${key} <> ${value}` : value,
        recursive: true
    }
};

const expected = {
    a: 1,
    c: [ 2, { c2: [ 4, 5 ] } ]
};

const converted = convert({
    a: 1,
    b: 'b',
    c: [ 'c', 2, { c1: 3, c2: [ 4, '5' ], c3: '3' } ],
    d: { d1: 6, d2: 'd2' }
}, options);

 */


/* const options: ConvertOptions<Data> = {
    next: {
        filter: (key, _value, { isLeaf }) => isLeaf || [ 'a', 'c', 1, 2, 'c2', 'd2' ].some(k => k === key)
    }
}; */

/* const options: ConvertOptions<Data> = {
    options: (key, value) => {
        if (key === 'a')
            return { mutate: (key, value) => `${key} => ${value}` };

        if (key === 'c')
            return {
                next: {
                    filter: (key, _value) => [ 1, 2 ].some(k => k === key),
                    mutate: (key, value, { isLeaf }) => {
                        if (!isLeaf && (isString(value) || isNumber(value)))
                            return `${key} !! ${value}`;

                        return value;
                    }
                },
            };

        if ((value as any).d1 === 6)
            return { mutate: () => ({ ...(value as { d1: number; d2: string; }), d3: 3 }) };
    }
};

const converted = convert({
    a: 1,
    b: 'b',
    c: [ 'c', 2, { c1: 3, c2: [ 4, '5' ], c3: '3' } ],
    d: { d1: 6, d2: 'd2' }
}, options);


const expected = {
    a: 1,
    b: 'b',
    c: [ 2, { c1: 3, c2: [ 4, '5' ], c3: '3' } ],
    d: { d1: 6, d2: 'd2', d3: 3 }
};


console.log({ expected, converted });
 */



class Indenter {
    private _indent: number;

    constructor(indent = 4) {
        this._indent = indent;
    }

    indent(level: number) {
        return ' '.repeat((level) * this._indent);
    }
}


abstract class ToString extends Concatenator<unknown, string> {
    private indenter: Indenter;
    protected container: string;


    constructor(opener: string, private closer: string, indent = 4) {
        super();
        this.container = `${opener}\n`;
        this.indenter = new Indenter(indent);

    }

    push(key: Key, value: unknown, { isLast, level }: LevelDetails) {
        const isNew = typeof value === 'string' && value[ 0 ] !== '{' && value[ 0 ] !== '[';
        const v = this.getValue(key, value, isNew);

        if (isLast)
            this.container += `${this.indenter.indent(level + 1)}${v}\n${this.indenter.indent(level)}${this.closer}`;
        else
            this.container += `${this.indenter.indent(level + 1)}${v},\n`;

    }

    abstract getValue(key: Key, value: unknown, isNew: boolean): string;

    value() {
        return this.container;
    }
}


class ArrayToString extends ToString {
    constructor() {
        super('[', ']');

    }

    getValue(_key: Key, value: unknown, isNew: boolean) {
        return isNew ? `"${value}"` : `${value}`;
    }

    value() {
        return this.container;
    }
}


class ObjectToString extends ToString {
    constructor() {
        super('{', '}');

    }

    getValue(key: Key, value: unknown, _isNew: boolean) {
        return `"${String(key)}": ${value}`;
    }

    value() {
        return this.container;
    }
}


const o = convert({
    a: 1,
    b: 'b',
    c: [ 'c', 2, { c1: 3, c2: [ 4, '5' ], c3: '3' } ],
    d: { d1: 6, d2: 'd2' }
}, {
    concatenatorCtor: {
        value: (_key, value) => Array.isArray(value) ? ArrayToString : typeof value === 'object' ? ObjectToString : LiteralConcatenator,
        recursive: true
    }
});

console.log(o);

interface Emoji {
    name: string;
    unified: string;
    non_qualified: string;
    docomo: string;
    au: string;
    softbank: string;
    google: string;
    image: string;
    sheet_x: number;
    sheet_y: number;
    short_name: string;
    short_names: string[];
    text: string;
    texts: string;
    category: string;
    subcategory: string;
    sort_order: number;
    added_in: string;
    has_img_apple: boolean;
    has_img_google: boolean;
    has_img_twitter: boolean;
    has_img_facebook: boolean;
}


convert(emojis as Emoji[], {
    filter: makeRecursiveTransform((key, value, _details) => value !== null)
});





convert({ a: 1, b: [ 1, 2 ] }, {
    filter: makeRecursiveTransform((key, value, _details) => value !== null),
    concatenatorCtor: (_key, value) => Array.isArray(value) ? ArrayToString : typeof value === 'object' ? ObjectToString : LiteralConcatenator
});
