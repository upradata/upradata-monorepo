import { isNumber, isString } from '@upradata/util';
import { convert, ConvertOptions, Key } from '../../src';
import { Data, data } from '../data';



describe('object converter', () => {

    it('convert without options should work', () => {
        expect(convert(data())).toEqual(data());
    });


    it('non-recursive option "mutate" should work', () => {
        const converted = convert(data(), {
            mutate: (key, value) => {
                if (isString(value) || isNumber(value))
                    return `${key} => ${value}`;

                return value;
            }
        });

        expect(converted).toEqual({
            a: 'a => 1',
            b: 'b => b',
            c: [ 'c', 2, { c1: 3, c2: [ 4, '5' ], c3: '3' } ],
            d: { d1: 6, d2: 'd2' }
        });
    });


    it('recursive option "mutate" should work', () => {
        const options: ConvertOptions<Data> = {
            mutate: {
                value: (key, value, { isLeaf }) => {
                    if (!isLeaf && (isString(value) || isNumber(value)))
                        return `${String(key)} => ${value}`;

                    return value;
                },
                recursive: true
            }
        };


        const expected = {
            a: 'a => 1',
            b: 'b => b',
            c: [ '0 => c', '1 => 2', { c1: 'c1 => 3', c2: [ '0 => 4', '1 => 5' ], c3: 'c3 => 3' } ],
            d: { d1: 'd1 => 6', d2: 'd2 => d2' }
        };

        expect(convert(data(), options)).toEqual(expected);
    });


    it('non-recursive option "filter" should work', () => {
        const options: ConvertOptions<Data> = {
            filter: (key, _value, { isLeaf }) => isLeaf || [ 'a', 'c', 1, 2, 'c2' ].some(k => k === key)
        };

        const expected = {
            a: 1,
            c: [ 'c', 2, { c1: 3, c2: [ 4, '5' ], c3: '3' } ]
        };


        expect(convert(data(), options)).toEqual(expected);
    });


    it('recursive option "filter" should work', () => {
        const options: ConvertOptions<Data> = {
            filter: {
                value: (key, _value, { isLeaf }) => {
                    return isLeaf || [ 'a', 'c', 1, 2, 'c2' ].some(k => k === key);
                },
                recursive: true
            }
        };


        const expected = {
            a: 1,
            c: [ 2, { c2: [ '5' ] } ]
        };

        expect(convert(data(), options)).toEqual(expected);
    });


    it('non-recursive option "next" should work', () => {
        const options: ConvertOptions<Data> = {
            next: {
                filter: (key, _value, { isLeaf }) => isLeaf || [ 'a', 'c', 1, 2, 'c2', 'd2' ].some(k => k === key)
            }
        };

        const expected = {
            a: 1,
            b: 'b',
            c: [ 2, { c1: 3, c2: [ 4, '5' ], c3: '3' } ],
            d: { d2: 'd2' }
        };

        expect(convert(data(), options)).toEqual(expected);
    });


    it('recursive option "next" should work', () => {
        const options: ConvertOptions<Data> = {
            next: {
                filter: {
                    value: (key, _value, { isLeaf }) => isLeaf || [ 'a', 'c', 1, 2, 'c2', 'd2' ].some(k => k === key),
                    recursive: true
                }
            }
        };

        const expected = {
            a: 1,
            b: 'b',
            c: [ 2, { c2: [ '5' ] } ],
            d: { d2: 'd2' }
        };

        expect(convert(data(), options)).toEqual(expected);
    });


    it('non-recursive option "options" should work', () => {
        const options: ConvertOptions<Data> = {
            options: (key, value) => {
                if (key === 'a')
                    return { mutate: (key, value) => `${key} => ${value}` };

                if (key === 'c') {
                    return {
                        next: {
                            filter: (key, _value) => [ 1, 2 ].some(k => k === parseInt(key)),
                            mutate: (key, value, { isLeaf }) => {
                                if (!isLeaf && (isString(value) || isNumber(value)))
                                    return `${String(key)} !! ${value}`;

                                return value;
                            }
                        },
                    };
                }

                if ((value as any).d1 === 6)
                    return { mutate: () => ({ ...(value as { d1: number; d2: string; }), d3: 3 }) };
            }
        };

        const expected = {
            a: 'a => 1',
            b: 'b',
            c: [ '1 !! 2', { c1: 3, c2: [ 4, '5' ], c3: '3' } ],
            d: { d1: 6, d2: 'd2', d3: 3 }
        };

        expect(convert(data(), options)).toEqual(expected);
    });


    it('recursive option "options" should work', () => {
        const options: ConvertOptions<Data> = {
            options: {
                value: (key: Key, value) => {
                    if (key === 'a')
                        return { mutate: () => `${key} => ${value}` };

                    if (key === 'c2' || key === 'd3')
                        return { mutate: () => `${key} !! ${value}`, };

                    if ((value as any).d1 === 6)
                        return { mutate: () => ({ ...(value as { d1: number; d2: string; }), d3: 3 }) };
                },
                recursive: true
            }
        };

        const expected = {
            a: 'a => 1',
            b: 'b',
            c: [ 'c', 2, { c1: 3, c2: 'c2 !! 4,5', c3: '3' } ],
            d: { d1: 6, d2: 'd2', d3: 'd3 !! 3' }
        };

        expect(convert(data(), options)).toEqual(expected);
    });


    it('detailed options should work', () => {
        const options: ConvertOptions<Data> = {
            object: {
                filter: {
                    value: (key, _value) => `${String(key)}`.startsWith('c'),
                    recursive: true
                }
            },
            a: {
                mutate: (key, value) => `${key} => ${value}`
            },
            mutate: {
                value: (key, value, { isLeaf }) => !isLeaf && typeof value === 'string' ? `${String(key)} <> ${value}` : value,
                recursive: true
            }
        };

        const expected = {
            a: 'a => 1',
            b: 'b <> b',
            c: [ '0 <> c', 2, { c1: 3, c2: [ 4, '1 <> 5' ], c3: 'c3 <> 3' } ]
        };

        expect(convert(data(), options)).toEqual(expected);
    });
});
