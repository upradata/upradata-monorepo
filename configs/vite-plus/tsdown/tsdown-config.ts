import { baseConfigReducer } from './tsdown-config.base.ts';
import { neutralAppConfigReducers } from './tsdown-config.neutral.app.ts';
import { neutralLibConfigReducers } from './tsdown-config.neutral.lib.ts';
import { nodeAppConfigReducer } from './tsdown-config.node.app.ts';
import { nodeLibConfigReducers } from './tsdown-config.node.lib.ts';
import { webAppConfigReducers } from './tsdown-config.web.app.ts';
import { webLibConfigReducers } from './tsdown-config.web.lib.ts';

export const tsdownConfigReducers = {
    base: baseConfigReducer,
    neutralLib: neutralLibConfigReducers,
    neutralApp: neutralAppConfigReducers,
    webApp: webAppConfigReducers,
    nodeApp: nodeAppConfigReducer,
    webLib: webLibConfigReducers,
    nodeLib: nodeLibConfigReducers,
};

type TrimStart<S> = S extends `${infer Char}${infer Rest}` ? (Char extends ' ' ? TrimStart<Rest> : S) : S;

type KebabCase<S, R extends string = ''> = S extends `${infer Char}${infer Rest}`
    ? Char extends ' '
        ? TrimStart<S> extends infer TrimS
            ? TrimS extends ''
                ? R
                : KebabCase<TrimS, R extends '' ? R : `${R}-`>
            : never
        : // 2 cases: 1) rest=ab... 2) we have rest=Ab....
          Rest extends Uncapitalize<Rest>
          ? KebabCase<Rest, `${R}${Uncapitalize<Char>}`>
          : KebabCase<Rest, `${R}${Uncapitalize<Char>}-`>
    : R;

export type TsDownConfigType = KebabCase<keyof typeof tsdownConfigReducers>;

const STRING_CAMELIZE_REGEXP = /(-|_|\.|\s)+(.)?/g;

const camelize = (str: string): string =>
    str
        .replace(STRING_CAMELIZE_REGEXP, (_match: string, _separator: string, chr: string) => {
            return chr ? chr.toUpperCase() : '';
        })
        .replace(/^([A-Z])/, (match: string) => match.toLowerCase());

const ensureArray = <T>(value: T | readonly T[] | T[]): readonly T[] | T[] =>
    Array.isArray(value) ? value : [value as T];
export const getTsDownConfigReducer = (configType: TsDownConfigType) => {
    const reducer = tsdownConfigReducers[camelize(configType) as keyof typeof tsdownConfigReducers];

    if (!reducer) {
        throw new Error(`No config reducer found for type: ${configType}`);
    }
    return ensureArray(reducer);
};
