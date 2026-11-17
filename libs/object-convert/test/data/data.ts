export interface Data {
    a: number;
    b: string;
    c: [ string, number, { c1: number; c2: [ number, string ]; c3: string; } ];
    d: { d1: number; d2: string; };
}

export const data = (): Data => ({
    a: 1,
    b: 'b',
    c: [ 'c', 2, { c1: 3, c2: [ 4, '5' ], c3: '3' } ],
    d: { d1: 6, d2: 'd2' }
});
