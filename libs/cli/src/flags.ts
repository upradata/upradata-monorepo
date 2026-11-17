import { CliError } from './errors';

export type OptionFlags = {
    shortFlag: string | undefined;
    longFlag: string | undefined;
    value: { name: string; required: boolean; variadic: boolean } | undefined;
};

export const splitOptionFlags = (flags: string): OptionFlags => {
    const parts = flags.split(/[ |,]+/).filter(Boolean);

    const valuePart = parts.find(part => /^[<[]/.test(part));
    const flagParts = parts.filter(part => part.startsWith('-'));

    const longFlag = flagParts.find(part => part.startsWith('--'));
    const shortFlag = flagParts.find(part => !part.startsWith('--'));

    if (longFlag === undefined && shortFlag === undefined) {
        throw new Error(`invalid option flags '${flags}'`);
    }

    const value =
        valuePart === undefined
            ? undefined
            : {
                  name: valuePart.replace(/[<>[\].]/g, ''),
                  required: valuePart.startsWith('<'),
                  variadic: valuePart.includes('...')
              };

    return { shortFlag, longFlag, value };
};

export const assertName = (name: string): string => {
    if (!name) {
        throw new CliError('name must not be empty', { code: 'cli.invalidName' });
    }
    return name;
};
