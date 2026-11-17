import { CliError } from './errors';
import { splitOptionFlags } from './flags';
import { camelcase } from './util';

export type Parser<T = unknown> = { bivarianceHack(value: string, previous: T | undefined): T }['bivarianceHack'];

// source: alias value flows to the option; target: option value flows to the alias
export type AliasMode = 'source' | 'target' | 'two-way' | 'multi-way';

// works on the raw string, the receiving option then parses the result with its own parser
export type AliasTransform = (value: string) => string;

export type AliasTransforms = Readonly<Record<string, AliasTransform>>;

export type ChoicesInit = readonly string[] | { values: readonly string[]; parser?: Parser };

export type OptionInit = {
    flags: string;
    description?: string;
    defaultValue?: unknown;
    defaultValueDescription?: string | undefined;
    envVar?: string | undefined;
    parser?: Parser | undefined;
    hidden?: boolean | undefined;
    choices?: ChoicesInit | undefined;
    aliases?: readonly AliasInit[];
    noNegate?: boolean;
    negateNoDefault?: boolean;
    required?: boolean;
    dotted?: boolean;
};

export type AliasInit = Omit<OptionInit, 'aliases'> & { mode?: AliasMode; transform?: AliasTransform | AliasTransforms };

export type AliasLink = { attr: string; transform: AliasTransform };

export type OptionDef = {
    flags: string;
    short: string | undefined;
    long: string | undefined;
    attr: string;
    takes: 'none' | 'required' | 'optional';
    variadic: boolean;
    negate: boolean;
    description: string;
    defaultValue: unknown;
    defaultValueDescription: string | undefined;
    envVar: string | undefined;
    parser: Parser | undefined;
    hidden: boolean;
    choices: readonly string[] | undefined;
    links: readonly AliasLink[];
    required: boolean;
    dotted: boolean;
    objectPath: readonly string[] | undefined;
    valueName: string | undefined;
};

export type ArgumentInit = {
    name: string;
    description?: string;
    required?: boolean;
    variadic?: boolean;
    defaultValue?: unknown;
    choices?: readonly string[];
    parser?: Parser;
};

export type ArgumentDef = {
    name: string;
    description: string;
    required: boolean;
    variadic: boolean;
    defaultValue: unknown;
    choices: readonly string[] | undefined;
    parser: Parser | undefined;
};

export type Values = Record<string, unknown>;

export type ActionContext = {
    opts: Values;
    args: readonly unknown[];
    command: CommandDef;
    path: readonly CommandDef[];
    unknown: readonly string[];
};

export type Action = (ctx: ActionContext) => void | Promise<void>;

export type CommandInit = {
    name: string;
    description?: string;
    aliases?: readonly string[];
    options?: readonly OptionInit[];
    arguments?: readonly (ArgumentInit | string)[];
    subcommands?: readonly CommandInit[];
    isDefault?: boolean;
    hidden?: boolean;
    actions?: Action | readonly Action[];
};

export type CommandDef = {
    name: string;
    description: string;
    aliases: readonly string[];
    options: readonly OptionDef[];
    arguments: readonly ArgumentDef[];
    subcommands: readonly CommandDef[];
    isDefault: boolean;
    hidden: boolean;
    actions: readonly Action[];
};

const identity: AliasTransform = value => value;

const buildOption = (init: Omit<OptionInit, 'aliases'>): OptionDef => {
    const { shortFlag, longFlag, value } = splitOptionFlags(init.flags);

    const negate = longFlag?.startsWith('--no-') === true && init.noNegate !== true;
    const name = (longFlag ?? shortFlag ?? '').replace(/^-+/, '');
    const attr = camelcase(negate ? name.slice(3) : name, /[-.]/);
    const dotted = init.dotted ?? false;

    const choices = Array.isArray(init.choices) ? (init.choices as readonly string[]) : (init.choices as { values: readonly string[] } | undefined)?.values;
    const choiceParser = Array.isArray(init.choices) ? undefined : (init.choices as { parser?: Parser } | undefined)?.parser;

    return {
        flags: init.flags,
        short: shortFlag,
        long: longFlag,
        attr,
        takes: value === undefined ? 'none' : value.required ? 'required' : 'optional',
        variadic: value?.variadic ?? false,
        negate,
        description: init.description ?? '',
        defaultValue: init.defaultValue ?? (negate && init.negateNoDefault !== true ? true : undefined),
        defaultValueDescription: init.defaultValueDescription,
        envVar: init.envVar,
        parser: init.parser ?? choiceParser,
        hidden: init.hidden ?? false,
        choices,
        links: [],
        required: init.required ?? false,
        dotted,
        objectPath: !dotted && name.includes('.') ? name.split('.').map(part => camelcase(part)) : undefined,
        valueName: value?.name
    };
};

const aliasOption = (main: OptionDef, alias: AliasInit): OptionDef => {
    const { mode = 'source', transform, ...own } = alias;
    const inheritsValue = transform === undefined;

    return buildOption({
        description: main.description,
        defaultValueDescription: main.defaultValueDescription,
        envVar: main.envVar,
        hidden: main.hidden,
        choices: inheritsValue ? main.choices : undefined,
        parser: inheritsValue ? main.parser : undefined,
        ...own,
        defaultValue: mode === 'source' ? undefined : 'defaultValue' in own ? own.defaultValue : main.defaultValue
    });
};

const transformFor = (transform: AliasInit['transform'], target: OptionDef): AliasTransform =>
    typeof transform === 'function'
        ? transform
        : (transform?.[(target.long ?? target.short ?? '').replace(/^-+/, '')] ?? transform?.[target.attr] ?? identity);

const addLink = (options: readonly OptionDef[], from: number, to: number, transform: AliasInit['transform']): readonly OptionDef[] =>
    options.map((opt, i) =>
        i === from ? { ...opt, links: [...opt.links, { attr: (options[to] as OptionDef).attr, transform: transformFor(transform, options[to] as OptionDef) }] } : opt
    );

const addAlias = (options: readonly OptionDef[], alias: AliasInit): readonly OptionDef[] => {
    const main = options[0] as OptionDef;
    const created = [...options, aliasOption(main, alias)];
    const index = created.length - 1;
    const { mode = 'source', transform } = alias;
    const others = mode === 'multi-way' ? created.slice(0, index).map((_, i) => i) : [0];

    return others.reduce<readonly OptionDef[]>((opts, other) => {
        const intoAlias = mode === 'target' || mode === 'two-way' || mode === 'multi-way';
        const intoOther = mode === 'source' || mode === 'two-way' || mode === 'multi-way';
        const withTarget = intoAlias ? addLink(opts, other, index, transform) : opts;
        return intoOther ? addLink(withTarget, index, other, transform) : withTarget;
    }, created);
};

// the option followed by the options created from its aliases
export const defineOptions = (init: OptionInit): readonly OptionDef[] =>
    (init.aliases ?? []).reduce<readonly OptionDef[]>(addAlias, [buildOption(init)]);

export const defineOption = (init: OptionInit): OptionDef => defineOptions(init)[0] as OptionDef;

export const defineArgument = (init: ArgumentInit | string): ArgumentDef => {
    if (typeof init !== 'string') {
        return {
            name: init.name,
            description: init.description ?? '',
            required: init.required ?? false,
            variadic: init.variadic ?? false,
            defaultValue: init.defaultValue,
            choices: init.choices,
            parser: init.parser
        };
    }

    const match = /^([<[])(.+?)(\.\.\.)?[>\]]$/.exec(init);

    if (!match) {
        throw new CliError(`invalid argument syntax '${init}'`, { code: 'cli.invalidArgument' });
    }

    return {
        name: match[2] ?? init,
        description: '',
        required: match[1] === '<',
        variadic: match[3] !== undefined,
        defaultValue: undefined,
        choices: undefined,
        parser: undefined
    };
};

export const defineCommand = (init: CommandInit): CommandDef => ({
    name: init.name,
    description: init.description ?? '',
    aliases: init.aliases ?? [],
    options: (init.options ?? []).flatMap(defineOptions),
    arguments: (init.arguments ?? []).map(defineArgument),
    subcommands: (init.subcommands ?? []).map(defineCommand),
    isDefault: init.isDefault ?? false,
    hidden: init.hidden ?? false,
    actions: init.actions === undefined ? [] : Array.isArray(init.actions) ? (init.actions as readonly Action[]) : [init.actions as Action]
});

export const commandNames = (command: CommandDef): readonly string[] => [command.name, ...command.aliases];
