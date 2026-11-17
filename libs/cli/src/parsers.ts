import { createRequire } from 'node:module';
import type { Parser } from './schema';
import { isPlainObject, mergeDeep, parseScalar, setIn } from './util';

export const int: Parser<number> = value => {
    const n = Number.parseInt(value, 10);

    if (Number.isNaN(n)) {
        throw new Error('Not a number.');
    }

    return n;
};

export const float: Parser<number> = value => {
    const n = Number.parseFloat(value);

    if (Number.isNaN(n)) {
        throw new Error('Not a number.');
    }

    return n;
};

export const string: Parser<string> = value => value;

export const boolean: Parser<boolean> = value => {
    const v = value.trim().toLowerCase();

    if (['true', '1', 'yes', 'y', 'on', ''].includes(v)) {
        return true;
    }

    if (['false', '0', 'no', 'n', 'off'].includes(v)) {
        return false;
    }

    throw new Error('Not a boolean.');
};

export const reduce =
    <T>(fn: (previous: T | undefined, value: string) => T): Parser<T> =>
    (value, previous) =>
        fn(previous, value);

export const increaseNumber = (step = 1): Parser<number> => (_, previous) => (previous ?? 0) + step;

export const decreaseNumber = (step = 1): Parser<number> => increaseNumber(-step);

export const array =
    <T = string>(parser?: Parser<T>): Parser<T[]> =>
    (value, previous) => [...(previous ?? []), (parser ? parser(value, undefined) : value) as T];

export type StringToArrayOptions<T> = { separator?: string | RegExp; parser?: Parser<T> };

export const stringToArray =
    <T = string>({ separator = ',', parser }: StringToArrayOptions<T> = {}): Parser<T[]> =>
    value =>
        value
            .split(separator)
            .map(item => item.trim())
            .filter(Boolean)
            .map(item => (parser ? parser(item, undefined) : item) as T);

export const object =
    (key?: string): Parser<Record<string, unknown>> =>
    (value, previous) => {
        const parsed = parseScalar(value);
        return key === undefined ? (isPlainObject(parsed) ? parsed : { value: parsed }) : setIn(previous ?? {}, key.split('.'), parsed);
    };

export const cumulateObject: Parser<Record<string, unknown>> = (value, previous) => {
    const parsed = parseScalar(value);

    if (!isPlainObject(parsed)) {
        throw new Error('Not a JSON object.');
    }

    return mergeDeep(previous ?? {}, parsed);
};

export const choices =
    <T extends string>(values: readonly T[]): Parser<T> =>
    value => {
        if (!values.includes(value as T)) {
            throw new Error(`Allowed choices are ${values.join(', ')}.`);
        }

        return value as T;
    };

export const regex: Parser<RegExp> = value => {
    const match = /^\/(.*)\/([a-z]*)$/s.exec(value);
    return match ? new RegExp(match[1] ?? '', match[2]) : new RegExp(value);
};

export const require_: Parser<unknown> = value => createRequire(`${process.cwd()}/`)(value);

export const compose =
    <T>(...parsers: readonly Parser<T>[]): Parser<T> =>
    (value, previous) =>
        parsers.reduce<T | undefined>((acc, parser) => parser(value, acc), previous) as T;

export const tryParser =
    <T, F>(parser: Parser<T>, fallback: (value: string, error: unknown) => F): Parser<T | F> =>
    (value, previous) => {
        try {
            return parser(value, previous as T | undefined);
        } catch (e) {
            return fallback(value, e);
        }
    };

export const transforms = {
    toObject:
        (prop: string) =>
        (value: string): string =>
            JSON.stringify(object(prop)(value, undefined))
};

export { require_ as require };
