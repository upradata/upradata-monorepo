import type { ArgumentDef, CommandDef, OptionDef } from './schema';
import { style } from './style';
import { padEndVisible, visibleLength, wrap } from './util';

export type HelpSettings = {
    color?: boolean;
    width?: number;
    version?: string | undefined;
    sortOptions?: boolean;
    sortSubcommands?: boolean;
};

type Row = { term: string; plainTerm: string; description: string };

const argumentTerm = (arg: ArgumentDef): string => {
    const name = `${arg.name}${arg.variadic ? '...' : ''}`;
    return arg.required ? `<${name}>` : `[${name}]`;
};

const builtinOptions = (version: string | undefined): readonly string[] => [
    ...(version === undefined ? [] : ['-V, --version']),
    '-h, --help',
];

const optionBadges = (opt: OptionDef): string[] => [
    ...(opt.required ? ['required'] : []),
    ...(opt.choices ? [`choices: ${opt.choices.map(c => JSON.stringify(c)).join(', ')}`] : []),
    ...(opt.defaultValue !== undefined || opt.defaultValueDescription !== undefined
        ? [`default: ${opt.defaultValueDescription ?? JSON.stringify(opt.defaultValue)}`]
        : []),
    ...(opt.envVar ? [`env: ${opt.envVar}`] : []),
];

const argumentBadges = (arg: ArgumentDef): string[] => [
    ...(arg.choices ? [`choices: ${arg.choices.map(c => JSON.stringify(c)).join(', ')}`] : []),
    ...(arg.defaultValue !== undefined ? [`default: ${JSON.stringify(arg.defaultValue)}`] : []),
];

const withBadges = (description: string, badges: readonly string[]): string =>
    [description, badges.length > 0 ? `(${badges.join(', ')})` : ''].filter(Boolean).join(' ');

const sorted = <T>(items: readonly T[], key: (item: T) => string, enabled: boolean | undefined): readonly T[] =>
    enabled ? [...items].sort((a, b) => key(a).localeCompare(key(b))) : items;

export const usageLine = (path: readonly CommandDef[]): string => {
    const command = path[path.length - 1] as CommandDef;
    return [
        ...path.map(c => c.name),
        '[options]',
        ...(command.subcommands.length > 0 ? ['[command]'] : []),
        ...command.arguments.map(argumentTerm),
    ].join(' ');
};

const renderSection = (title: string, rows: readonly Row[], width: number, color: boolean): readonly string[] => {
    const s = style(color);
    const termWidth = Math.min(Math.max(...rows.map(r => visibleLength(r.term))) + 2, Math.floor(width / 2));
    const descWidth = Math.max(20, width - termWidth - 2);

    return rows.length === 0
        ? []
        : [
              '',
              s.bold(s.yellow(`${title}:`)),
              ...rows.flatMap(row => {
                  const [first = '', ...more] = wrap(row.description, descWidth);
                  const head =
                      visibleLength(row.term) + 2 > termWidth
                          ? [`  ${row.term}`, `  ${' '.repeat(termWidth)}${first}`]
                          : [`  ${padEndVisible(row.term, termWidth)}${first}`];
                  return [...head, ...more.map(line => `  ${' '.repeat(termWidth)}${line}`)].map(l => l.trimEnd());
              }),
          ];
};

export const renderHelp = (path: readonly CommandDef[], settings: HelpSettings = {}): string => {
    const color = settings.color ?? false;
    const width = settings.width ?? 80;
    const s = style(color);
    const command = path[path.length - 1] as CommandDef;

    const own = command.options.filter(o => !o.hidden);
    const inherited = path
        .slice(0, -1)
        .flatMap(c => c.options)
        .filter(o => !o.hidden);

    const optionRows: readonly Row[] = [
        ...sorted([...own, ...inherited], o => o.long ?? o.short ?? '', settings.sortOptions).map(o => ({
            term: s.green(o.flags),
            plainTerm: o.flags,
            description: withBadges(o.description, optionBadges(o)),
        })),
        ...builtinOptions(settings.version).map(flags => ({
            term: s.green(flags),
            plainTerm: flags,
            description: flags.includes('version') ? 'output the version number' : 'display help for command',
        })),
    ];

    const argumentRows: readonly Row[] = command.arguments.map(a => ({
        term: s.cyan(argumentTerm(a)),
        plainTerm: argumentTerm(a),
        description: withBadges(a.description, argumentBadges(a)),
    }));

    const commandRows: readonly Row[] = sorted(
        command.subcommands.filter(c => !c.hidden),
        c => c.name,
        settings.sortSubcommands,
    ).map(c => {
        const term = [...[c.name, ...c.aliases].join('|'), ...c.arguments.map(argumentTerm)].join(' ');
        return {
            term: s.cyan(term),
            plainTerm: term,
            description: withBadges(c.description, c.isDefault ? ['default'] : []),
        };
    });

    return [
        `${s.bold(s.yellow('Usage:'))} ${usageLine(path)}`,
        ...(command.description ? ['', ...wrap(command.description, width)] : []),
        ...renderSection('Arguments', argumentRows, width, color),
        ...renderSection('Options', optionRows, width, color),
        ...renderSection('Commands', commandRows, width, color),
        '',
    ].join('\n');
};
