import { convert, Key, LevelDetails, LiteralConcatenator, Concatenator } from '../../src';
import { data } from '../data';

class Indenter {
    private _indent: number;

    constructor(indent = 4) {
        this._indent = indent;
    }

    indent(level: number) {
        return ' '.repeat(level * this._indent);
    }
}

abstract class ToString extends Concatenator<unknown, string> {
    private indenter: Indenter;
    protected container: string;

    constructor(
        opener: string,
        private closer: string,
        indent = 4,
    ) {
        super();
        this.container = `${opener}\n`;
        this.indenter = new Indenter(indent);
    }

    push(key: Key, value: unknown, { isLast, level }: LevelDetails) {
        const isNew = typeof value === 'string' && value[0] !== '{' && value[0] !== '[';
        const v = this.getValue(key, value, isNew);

        if (isLast)
            this.container += `${this.indenter.indent(level + 1)}${v}\n${this.indenter.indent(level)}${this.closer}`;
        else this.container += `${this.indenter.indent(level + 1)}${v},\n`;
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

describe('object converter', () => {
    it('concatenatorCtor should work', () => {
        const converted = convert(data(), {
            concatenatorCtor: {
                value: (_key, value) =>
                    Array.isArray(value)
                        ? ArrayToString
                        : typeof value === 'object'
                          ? ObjectToString
                          : LiteralConcatenator,
                recursive: true,
            },
        });

        const expected = `{\n    "a": 1,\n    "b": b,\n    "c": [\n        "c",\n        2,\n        {\n            "c1": 3,\n            "c2": [\n                4,\n                "5"\n            ],\n            "c3": 3\n        }\n    ],\n    "d": {\n        "d1": 6,\n        "d2": d2\n    }\n}`;

        expect(converted).toBe(expected);
    });
});
