import { style } from './style';
import { similar } from './util';

export type CliErrorOptions = { code?: string; exitCode?: number };

export class CliError extends Error {
    readonly code: string;
    readonly exitCode: number;

    constructor(message: string, { code = 'cli.error', exitCode = 1 }: CliErrorOptions = {}) {
        super(message);
        this.name = 'CliError';
        this.code = code;
        this.exitCode = exitCode;
    }
}

export class CliCancelled extends Error {
    constructor() {
        super('cancelled');
        this.name = 'CliCancelled';
    }
}

export const suggestionText = (word: string, candidates: readonly string[]): string => {
    const found = similar(word, candidates);

    return found.length === 0
        ? ''
        : found.length === 1
          ? `(Did you mean ${found[0]}?)`
          : `(Did you mean one of ${found.join(', ')}?)`;
};

export const formatError = (err: unknown, color: boolean): string => {
    const s = style(color);
    const message = err instanceof Error ? err.message : String(err);
    const [first = '', ...rest] = message.split('\n');
    const hint = /\(Did you mean [^)]*\)$/.exec(first);
    const main = hint ? first.slice(0, hint.index).trimEnd() : first;

    return [`${s.red(s.bold('error:'))} ${main}${hint ? ` ${s.yellow(hint[0])}` : ''}`, ...rest].join('\n');
};
