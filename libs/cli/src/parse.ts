import { CliError, suggestionText } from './errors';
import { boolean } from './parsers';
import type { ArgumentDef, CommandDef, OptionDef, Values } from './schema';
import { commandNames } from './schema';
import { parseScalar, setIn } from './util';

export type ParseSettings = {
    allowUnknownOption?: boolean | undefined;
    allowExcessArguments?: boolean | undefined;
    showSuggestionAfterError?: boolean | undefined;
    env?: Readonly<Record<string, string | undefined>>;
    version?: string | undefined;
};

export type ParseResult =
    | { kind: 'run'; command: CommandDef; path: readonly CommandDef[]; opts: Values; args: readonly unknown[]; unknown: readonly string[] }
    | { kind: 'help'; path: readonly CommandDef[] }
    | { kind: 'version' }
    | { kind: 'error'; error: CliError };

type Acc = { opts: Values; positionals: readonly string[]; unknown: readonly string[] };

type Ctx = {
    path: readonly CommandDef[];
    options: readonly OptionDef[];
    settings: ParseSettings;
};

type Scanned = { kind: 'done'; ctx: Ctx; acc: Acc } | { kind: 'help'; path: readonly CommandDef[] } | { kind: 'version' };

const invalid = (message: string): CliError => new CliError(message, { code: 'cli.invalid' });

const withSuggestion = (message: string, word: string, candidates: readonly string[], settings: ParseSettings): string =>
    [message, settings.showSuggestionAfterError === false ? '' : suggestionText(word, candidates)].filter(Boolean).join(' ');

const isNegativeNumber = (token: string): boolean => /^-\d+(\.\d+)?$/.test(token);

const isFlagLike = (token: string): boolean => token.startsWith('-') && token.length > 1 && !isNegativeNumber(token);

const currentCommand = (ctx: Ctx): CommandDef => ctx.path[ctx.path.length - 1] as CommandDef;

const makeCtx = (parent: Ctx | undefined, command: CommandDef, settings: ParseSettings): Ctx => ({
    path: [...(parent?.path ?? []), command],
    options: [...command.options, ...(parent?.options ?? [])],
    settings
});

export const applyValue = (opt: OptionDef, raw: string, previous: unknown): unknown => {
    if (opt.choices !== undefined && !opt.choices.includes(raw)) {
        throw invalid(`option '${opt.flags}' argument '${raw}' is invalid. Allowed choices are ${opt.choices.join(', ')}.`);
    }

    if (opt.parser === undefined) {
        return opt.variadic ? [...((previous as unknown[] | undefined) ?? []), raw] : raw;
    }

    try {
        return opt.parser(raw, previous);
    } catch (e) {
        throw invalid(`option '${opt.flags}' argument '${raw}' is invalid. ${e instanceof Error ? e.message : String(e)}`.trimEnd());
    }
};

const withOpt = (acc: Acc, opt: OptionDef, value: unknown): Acc => ({ ...acc, opts: { ...acc.opts, [opt.attr]: value } });

const splitVariadic = (tokens: readonly string[]): [readonly string[], readonly string[]] => {
    const index = tokens.findIndex(isFlagLike);
    const at = index === -1 ? tokens.length : index;
    return [tokens.slice(0, at), tokens.slice(at)];
};

const setNone = (opt: OptionDef, acc: Acc): Acc =>
    withOpt(acc, opt, opt.parser ? applyValue(opt, '', acc.opts[opt.attr]) : !opt.negate);

// one hop only: values received through a link are not propagated again (two-way links would loop)
const propagate = (ctx: Ctx, opt: OptionDef, raws: readonly string[], acc: Acc): Acc =>
    opt.links.reduce((current, link) => {
        const target = ctx.options.find(o => o.attr === link.attr && o !== opt);

        if (target === undefined) {
            return current;
        }

        return raws.length === 0
            ? target.takes === 'none'
                ? setNone(target, current)
                : withOpt(current, target, true)
            : raws.reduce((a, raw) => withOpt(a, target, applyValue(target, link.transform(raw), a.opts[target.attr])), current);
    }, acc);

const applyNone = (ctx: Ctx, opt: OptionDef, acc: Acc): Acc => propagate(ctx, opt, [], setNone(opt, acc));

const consume = (ctx: Ctx, opt: OptionDef, inline: string | undefined, rest: readonly string[], acc: Acc): { acc: Acc; rest: readonly string[] } => {
    if (opt.takes === 'none') {
        if (inline !== undefined) {
            throw invalid(`option '${opt.flags}' does not take a value`);
        }

        return { acc: applyNone(ctx, opt, acc), rest };
    }

    const [raws, remaining] = opt.variadic
        ? ((): [readonly string[], readonly string[]] => {
              const [values, others] = splitVariadic(rest);
              return [inline !== undefined ? [inline, ...values] : values, others];
          })()
        : inline !== undefined
          ? [[inline], rest]
          : rest[0] !== undefined && (opt.takes === 'required' || !isFlagLike(rest[0]))
            ? [[rest[0]], rest.slice(1)]
            : [[], rest];

    if (raws.length === 0) {
        if (opt.takes === 'required') {
            throw invalid(`option '${opt.flags}' argument missing`);
        }

        return { acc: propagate(ctx, opt, [], withOpt(acc, opt, true)), rest: remaining };
    }

    const own = withOpt(acc, opt, raws.reduce<unknown>((previous, raw) => applyValue(opt, raw, previous), acc.opts[opt.attr]));
    return { acc: propagate(ctx, opt, raws, own), rest: remaining };
};

const findLong = (ctx: Ctx, name: string): OptionDef | undefined => ctx.options.find(o => o.long === name);

const findShort = (ctx: Ctx, name: string): OptionDef | undefined => ctx.options.find(o => o.short === name);

const findDotted = (ctx: Ctx, name: string): OptionDef | undefined =>
    ctx.options.find(o => o.dotted && o.long !== undefined && name.startsWith(`${o.long}.`));

const longCandidates = (ctx: Ctx): readonly string[] => [
    ...ctx.options.filter(o => !o.hidden && o.long !== undefined).map(o => o.long as string),
    '--help'
];

const unknownOption = (ctx: Ctx, token: string, name: string, rest: readonly string[], acc: Acc): Scanned => {
    const command = currentCommand(ctx);
    const isRouter = command.subcommands.length > 0 && command.arguments.length === 0 && command.actions.length === 0;
    const fallback = isRouter && acc.positionals.length === 0 ? command.subcommands.find(s => s.isDefault) : undefined;

    if (fallback !== undefined) {
        return scan(makeCtx(ctx, fallback, ctx.settings), [token, ...rest], acc);
    }

    if (ctx.settings.allowUnknownOption === true) {
        return scan(ctx, rest, { ...acc, unknown: [...acc.unknown, token] });
    }

    throw invalid(withSuggestion(`unknown option '${name}'`, name, longCandidates(ctx), ctx.settings));
};

const scanDotted = (ctx: Ctx, opt: OptionDef, name: string, inline: string | undefined, rest: readonly string[], acc: Acc): Scanned => {
    const keys = name.slice((opt.long as string).length + 1).split('.');
    const raw = inline ?? rest[0];

    if (raw === undefined) {
        throw invalid(`option '${opt.flags}' argument missing`);
    }

    const previous = acc.opts[opt.attr];
    const value = setIn((previous as Values | undefined) ?? {}, keys, parseScalar(raw));
    return scan(ctx, inline === undefined ? rest.slice(1) : rest, withOpt(acc, opt, value));
};

const scanLong = (ctx: Ctx, token: string, rest: readonly string[], acc: Acc): Scanned => {
    const eq = token.indexOf('=');
    const name = eq === -1 ? token : token.slice(0, eq);
    const inline = eq === -1 ? undefined : token.slice(eq + 1);
    const opt = findLong(ctx, name);

    if (opt !== undefined) {
        const next = consume(ctx, opt, inline, rest, acc);
        return scan(ctx, next.rest, next.acc);
    }

    if (name === '--help') {
        return { kind: 'help', path: ctx.path };
    }

    if (name === '--version' && ctx.settings.version !== undefined) {
        return { kind: 'version' };
    }

    const dotted = findDotted(ctx, name);
    return dotted !== undefined ? scanDotted(ctx, dotted, name, inline, rest, acc) : unknownOption(ctx, token, name, rest, acc);
};

const scanShort = (ctx: Ctx, chars: string, rest: readonly string[], acc: Acc): Scanned => {
    if (chars === '') {
        return scan(ctx, rest, acc);
    }

    const flag = `-${chars.charAt(0)}`;
    const remainder = chars.slice(1);
    const opt = findShort(ctx, flag);

    if (opt === undefined) {
        if (flag === '-h') {
            return { kind: 'help', path: ctx.path };
        }

        if (flag === '-V' && ctx.settings.version !== undefined) {
            return { kind: 'version' };
        }

        return unknownOption(ctx, `-${chars}`, flag, rest, acc);
    }

    if (opt.takes === 'none') {
        return scanShort(ctx, remainder, rest, applyNone(ctx, opt, acc));
    }

    const next = consume(ctx, opt, remainder === '' ? undefined : remainder.replace(/^=/, ''), rest, acc);
    return scan(ctx, next.rest, next.acc);
};

const findSubcommand = (command: CommandDef, word: string): CommandDef | undefined =>
    command.subcommands.find(sub => commandNames(sub).includes(word));

const scanPositional = (ctx: Ctx, token: string, rest: readonly string[], acc: Acc): Scanned => {
    const command = currentCommand(ctx);
    const sub = acc.positionals.length === 0 ? findSubcommand(command, token) : undefined;

    if (sub !== undefined) {
        return scan(makeCtx(ctx, sub, ctx.settings), rest, acc);
    }

    const isRouter = command.subcommands.length > 0 && command.arguments.length === 0 && command.actions.length === 0;

    if (acc.positionals.length === 0 && isRouter) {
        const fallback = command.subcommands.find(s => s.isDefault);

        if (fallback === undefined) {
            const names = command.subcommands.filter(s => !s.hidden).flatMap(commandNames);
            throw invalid(withSuggestion(`unknown command '${token}'`, token, names, ctx.settings));
        }

        return scan(makeCtx(ctx, fallback, ctx.settings), [token, ...rest], acc);
    }

    return scan(ctx, rest, { ...acc, positionals: [...acc.positionals, token] });
};

const finish = (ctx: Ctx, acc: Acc): Scanned => {
    const command = currentCommand(ctx);
    const isRouter = command.subcommands.length > 0 && command.actions.length === 0;

    if (isRouter && acc.positionals.length === 0) {
        const fallback = command.subcommands.find(s => s.isDefault);
        return fallback === undefined ? { kind: 'help', path: ctx.path } : scan(makeCtx(ctx, fallback, ctx.settings), [], acc);
    }

    return { kind: 'done', ctx, acc };
};

const scan = (ctx: Ctx, tokens: readonly string[], acc: Acc): Scanned => {
    const [head, ...rest] = tokens;

    return head === undefined
        ? finish(ctx, acc)
        : head === '--'
          ? finish(ctx, { ...acc, positionals: [...acc.positionals, ...rest] })
          : head.startsWith('--')
            ? scanLong(ctx, head, rest, acc)
            : isFlagLike(head)
              ? scanShort(ctx, head.slice(1), rest, acc)
              : scanPositional(ctx, head, rest, acc);
};

const fromEnv = (opt: OptionDef, raw: string): unknown =>
    opt.takes === 'none'
        ? opt.negate
            ? false
            : (() => {
                  try {
                      return boolean(raw, undefined);
                  } catch {
                      return true;
                  }
              })()
        : opt.variadic
          ? [applyValue(opt, raw, undefined)]
          : applyValue(opt, raw, undefined);

// like commander, `--no-x` does not default to true when a `--x` option is defined too
const hasPositiveSibling = (options: readonly OptionDef[], opt: OptionDef): boolean =>
    opt.negate && opt.defaultValue === true && options.some(o => !o.negate && o.attr === opt.attr);

export const resolveOptions = (options: readonly OptionDef[], cli: Values, env: Readonly<Record<string, string | undefined>>): Values => {
    const ordered = [...options.filter(o => !o.negate), ...options.filter(o => o.negate)];

    const base = ordered.reduce<Values>((values, opt) => {
        if (values[opt.attr] !== undefined) {
            return values;
        }

        const envValue = opt.envVar === undefined ? undefined : env[opt.envVar];

        if (envValue !== undefined) {
            return { ...values, [opt.attr]: fromEnv(opt, envValue) };
        }

        const defaultValue = hasPositiveSibling(options, opt) ? undefined : opt.defaultValue;
        return defaultValue === undefined ? values : { ...values, [opt.attr]: defaultValue };
    }, cli);

    return options.reduce<Values>(
        (values, opt) => (opt.objectPath === undefined || values[opt.attr] === undefined ? values : setIn(values, opt.objectPath, values[opt.attr])),
        base
    );
};

const parseArgument = (def: ArgumentDef, raw: string): unknown => {
    if (def.choices !== undefined && !def.choices.includes(raw)) {
        throw invalid(`command-argument value '${raw}' is invalid for argument '${def.name}'. Allowed choices are ${def.choices.join(', ')}.`);
    }

    try {
        return def.parser ? def.parser(raw, undefined) : raw;
    } catch (e) {
        throw invalid(`command-argument value '${raw}' is invalid for argument '${def.name}'. ${e instanceof Error ? e.message : String(e)}`.trimEnd());
    }
};

export const assignArguments = (
    command: CommandDef,
    positionals: readonly string[],
    settings: ParseSettings
): { args: readonly unknown[]; excess: readonly string[] } => {
    const defs = command.arguments;

    const args = defs.map((def, i) => {
        const raws = def.variadic ? positionals.slice(i) : positionals.slice(i, i + 1);

        if (raws.length === 0) {
            if (def.required && def.defaultValue === undefined) {
                throw invalid(`missing required argument '${def.name}'`);
            }

            return def.defaultValue;
        }

        return def.variadic ? raws.map(raw => parseArgument(def, raw)) : parseArgument(def, raws[0] as string);
    });

    const hasVariadic = defs.some(d => d.variadic);
    const excess = hasVariadic ? [] : positionals.slice(defs.length);

    if (excess.length > 0 && settings.allowExcessArguments !== true) {
        throw invalid(
            `too many arguments for '${command.name}'. Expected ${defs.length} argument${defs.length === 1 ? '' : 's'} but got ${positionals.length}.`
        );
    }

    return { args, excess };
};

export const parseArgv = (root: CommandDef, argv: readonly string[], settings: ParseSettings = {}): ParseResult => {
    try {
        const scanned = scan(makeCtx(undefined, root, settings), argv, { opts: {}, positionals: [], unknown: [] });

        if (scanned.kind !== 'done') {
            return scanned;
        }

        const { ctx, acc } = scanned;
        const command = currentCommand(ctx);
        const opts = resolveOptions(ctx.options, acc.opts, settings.env ?? process.env);

        const missing = ctx.options.find(o => o.required && opts[o.attr] === undefined);

        if (missing !== undefined) {
            throw invalid(`required option '${missing.flags}' not specified`);
        }

        const { args, excess } = assignArguments(command, acc.positionals, settings);

        return { kind: 'run', command, path: ctx.path, opts, args, unknown: [...acc.unknown, ...excess] };
    } catch (e) {
        return { kind: 'error', error: e instanceof CliError ? e : new CliError(e instanceof Error ? e.message : String(e)) };
    }
};
