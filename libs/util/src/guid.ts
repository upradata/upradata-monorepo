/*
import { random } from './random';

 IT IS WORKING. BUT WITH TOOLS LIKE ROLLUP/WEBPACK, IT IS A NIGHTMARE BECAUSE THEY CAN TRY TO INCLUDE NODEJS CRYPTO IN BROWER ENVIRONMENT
 (WEBPACK I FOUND THE SOLUTION TO NOT DOING SO, BUT ROLLUP NO).

I PREFER TO SEPARATE THEM
*/
/** biome-ignore-all lint/style/useTemplate: <explanation> */

/* import { TypedArray } from './types';

export function guidGenerator(random: (array: TypedArray) => number) {
    return () => ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: string) =>
        (+c ^ random(new Uint8Array(1))[ 0 ] & 15 >> +c / 4).toString(16)
    );
}
 */

export type UUIDTypes<TBuf extends Uint8Array = Uint8Array> = string | TBuf;

interface Crypto {
    getRandomValues<T extends /*ArrayBufferView| null*/ Uint8Array<ArrayBuffer>>(array: T): T;
    randomUUID?(): string;
    // rng?: (array: Uint8Array) => Uint8Array;
}

export type Version4Options = {
    random?: Uint8Array;
    useCryptoRandomUUIDIfAvailable?: boolean;
    crypto: Crypto;
};

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex: string[] = [];

for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
}

function unsafeStringify(arr: Uint8Array, offset = 0): string {
    // Note: Be careful editing this code!  It's been tuned for performance
    // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
    //
    // Note to future-self: No, you can't remove the `toLowerCase()` call.
    // REF: https://github.com/uuidjs/uuid/pull/677#issuecomment-1757351351
    return (
        byteToHex[arr[offset + 0]] +
        byteToHex[arr[offset + 1]] +
        byteToHex[arr[offset + 2]] +
        byteToHex[arr[offset + 3]] +
        '-' +
        byteToHex[arr[offset + 4]] +
        byteToHex[arr[offset + 5]] +
        '-' +
        byteToHex[arr[offset + 6]] +
        byteToHex[arr[offset + 7]] +
        '-' +
        byteToHex[arr[offset + 8]] +
        byteToHex[arr[offset + 9]] +
        '-' +
        byteToHex[arr[offset + 10]] +
        byteToHex[arr[offset + 11]] +
        byteToHex[arr[offset + 12]] +
        byteToHex[arr[offset + 13]] +
        byteToHex[arr[offset + 14]] +
        byteToHex[arr[offset + 15]]
    ).toLowerCase();
}

// RNG values for use in UUID generation. This *must* use a high-quality source
// of entropy, such as `crypto.getRandomValues()`.  And we reuse an array for
// performance.
const rnds8 = new Uint8Array(16);

// function rng() {
//     return crypto.getRandomValues(rnds8);
// }

function v4(options: Version4Options, buf?: undefined, offset?: number): string;
function v4<TBuf extends Uint8Array = Uint8Array>(options: Version4Options, buf: TBuf, offset?: number): TBuf;
function v4<TBuf extends Uint8Array = Uint8Array>(
    options: Version4Options,
    buf?: TBuf,
    offset?: number,
): UUIDTypes<TBuf> {
    const useCryptoRandomUUIDIfAvailable = options?.useCryptoRandomUUIDIfAvailable ?? true;

    if (!buf && useCryptoRandomUUIDIfAvailable && options.crypto.randomUUID) {
        return options.crypto.randomUUID();
    }

    // Putting tail-code that could just go inline here in a separate function to
    // enable compiler optimizations that dramatically improve performance.
    //
    // REF: https://github.com/uuidjs/uuid/issues/892
    return _v4(options, buf, offset);
}

function _v4<TBuf extends Uint8Array = Uint8Array>(
    options: Version4Options,
    buf?: TBuf,
    offset?: number,
): UUIDTypes<TBuf> {
    const rnds = options.random ?? options.crypto.getRandomValues(rnds8);

    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
        offset = offset || 0;
        if (offset < 0 || offset + 16 > buf.length) {
            throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
        }

        for (let i = 0; i < 16; ++i) {
            buf[offset + i] = rnds[i];
        }

        return buf;
    }

    return unsafeStringify(rnds);
}

export const guidGenerator = v4;
