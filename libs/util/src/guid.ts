
/*
import { random } from './random';

 IT IS WORKING. BUT WITH TOOLS LIKE ROLLUP/WEBPACK, IT IS A NIGHTMARE BECAUSE THEY CAN TRY TO INCLUDE NODEJS CRYPTO IN BROWER ENVIRONMENT (WEBPACK I FOUND THE SOLUTION TO
NO TO, BUT ROLLUP NO).

I PREFER TO SEPARATE THEM
*/
/** biome-ignore-all lint/style/useTemplate: <explanation> */


import type { TypedArray } from './types';
export type NumberArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array;

export function guidGenerator(random: (array: TypedArray) => NumberArray) {
    return () => ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: string) =>
        (+c ^ random(new Uint8Array(1))[ 0 ] & 15 >> +c / 4).toString(16)
    );
}
