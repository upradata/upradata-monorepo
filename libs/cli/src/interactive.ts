import { CliCancelled, CliError } from './errors';
import { commandNames, type ArgumentDef, type CommandDef, type OptionDef } from './schema';

export type Choice<T> = { value: T; label: string; hint?: string | undefined };

export type Prompter = {
    select: <T>(opts: { message: string; options: readonly Choice<T>[]; initial?: T | undefined }) => Promise<T>;
    multiselect: <T>(opts: {
        message: string;
        options: readonly Choice<T>[];
        initial: readonly T[];
    }) => Promise<readonly T[]>;
    text: (opts: {
        message: string;
        initial?: string | undefined;
        placeholder?: string | undefined;
        required?: boolean;
    }) => Promise<string>;
    confirm: (opts: { message: string; initial?: boolean }) => Promise<boolean>;
    intro?: (title: string) => void;
    outro?: (message: string) => void;
    note?: (message: string, title?: string) => void;
};

type ClackModule = {
    select: (o: unknown) => Promise<unknown>;
    multiselect: (o: unknown) => Promise<unknown>;
    text: (o: unknown) => Promise<unknown>;
    confirm: (o: unknown) => Promise<unknown>;
    isCancel: (v: unknown) => boolean;
    intro: (t: string) => void;
    outro: (m: string) => void;
    note: (m: string, t?: string) => void;
};

const loadClack = async (): Promise<ClackModule> => {
    const name = '@clack/prompts';
    try {
        return (await import(/* @vite-ignore */ name)) as ClackModule;
    } catch {
        throw new CliError(`interactive mode requires the optional peer dependency '${name}'. Install it to use it.`, {
            code: 'cli.missingPeer',
        });
    }
};

export const clackPrompter = async (): Promise<Prompter> => {
    const clack = await loadClack();
    const guard = async <T>(value: Promise<unknown>): Promise<T> => {
        const result = await value;
        if (clack.isCancel(result)) {
            throw new CliCancelled();
        }
        return result as T;
    };

    return {
        select: opts =>
            guard(clack.select({ message: opts.message, options: opts.options, initialValue: opts.initial })),
        multiselect: opts =>
            guard(
                clack.multiselect({
                    message: opts.message,
                    options: opts.options,
                    initialValues: opts.initial,
                    required: false,
                }),
            ),
        text: opts =>
            guard<string>(
                clack.text({
                    message: opts.message,
                    initialValue: opts.initial,
                    placeholder: opts.placeholder,
                    validate: (v: string | undefined) => (opts.required && !v ? 'a value is required' : undefined),
                }),
            ),
        confirm: opts => guard(clack.confirm({ message: opts.message, initialValue: opts.initial })),
        intro: clack.intro,
        outro: clack.outro,
        note: clack.note,
    };
};

const SELF = Symbol('self');
type Pick = CommandDef | typeof SELF;

const describe = (c: CommandDef): string => c.description;

export const pickCommand = async (
    prompter: Prompter,
    path: readonly CommandDef[],
    exclude: ReadonlySet<CommandDef>,
): Promise<readonly CommandDef[]> => {
    const command = path[path.length - 1] as CommandDef;
    const candidates = command.subcommands.filter(c => !c.hidden && !exclude.has(c));

    if (candidates.length === 0) {
        return path;
    }

    const hasOwnAction = command.actions.length > 0 || command.arguments.length > 0;
    const options: readonly Choice<Pick>[] = [
        ...candidates.map(c => ({
            value: c as Pick,
            label: commandNames(c).join(' | '),
            hint: [describe(c), c.isDefault ? '(default)' : ''].filter(Boolean).join(' '),
        })),
        ...(hasOwnAction
            ? [{ value: SELF as Pick, label: `(run '${command.name}' itself)`, hint: describe(command) }]
            : []),
    ];

    const picked = await prompter.select<Pick>({
        message: path.length === 1 ? 'Select a command' : `Select a subcommand of '${command.name}'`,
        options,
        initial: candidates.find(c => c.isDefault) ?? candidates[0],
    });

    return picked === SELF ? path : pickCommand(prompter, [...path, picked], exclude);
};

const optionTokens = async (prompter: Prompter, opt: OptionDef): Promise<readonly string[]> => {
    const flag = opt.long ?? (opt.short as string);

    if (opt.takes === 'none') {
        return [flag];
    }

    const initial = opt.defaultValue === undefined ? undefined : String(opt.defaultValue);
    const answer = opt.choices
        ? await prompter.select<string>({
              message: `${flag} ${opt.description}`.trim(),
              options: opt.choices.map(value => ({ value, label: value })),
              initial: initial !== undefined && opt.choices.includes(initial) ? initial : undefined,
          })
        : await prompter.text({
              message: `${flag} ${opt.description}`.trim(),
              initial,
              placeholder: opt.valueName,
              required: opt.takes === 'required',
          });

    return answer === '' ? (opt.takes === 'optional' ? [flag] : []) : [flag, answer];
};

const argumentTokens = async (prompter: Prompter, arg: ArgumentDef): Promise<readonly string[]> => {
    const message = `${arg.name}${arg.description ? ` - ${arg.description}` : ''}`;
    const initial = arg.defaultValue === undefined ? undefined : String(arg.defaultValue);

    const answer = arg.choices
        ? await prompter.select<string>({
              message,
              options: arg.choices.map(value => ({ value, label: value })),
              initial: initial !== undefined && arg.choices.includes(initial) ? initial : undefined,
          })
        : await prompter.text({
              message: arg.variadic ? `${message} (space separated)` : message,
              initial,
              required: arg.required,
          });

    return answer === '' ? [] : arg.variadic ? answer.split(/\s+/).filter(Boolean) : [answer];
};

const isPreselected = (opt: OptionDef): boolean =>
    opt.required || (opt.takes === 'none' ? !opt.negate && Boolean(opt.defaultValue) : opt.defaultValue !== undefined);

const quote = (token: string): string => (/^[\w./:=@%+-]+$/.test(token) ? token : JSON.stringify(token));

export type InteractiveSelection = { tokens: readonly string[]; command: CommandDef };

export const interactiveSelect = async (
    prompter: Prompter,
    root: CommandDef,
    exclude: ReadonlySet<CommandDef>,
    binName: string,
): Promise<InteractiveSelection> => {
    prompter.intro?.(`${root.name} - interactive mode`);

    const path = await pickCommand(prompter, [root], exclude);
    const command = path[path.length - 1] as CommandDef;

    const args = await command.arguments.reduce<Promise<readonly string[]>>(
        async (acc, arg) => [...(await acc), ...(await argumentTokens(prompter, arg))],
        Promise.resolve([]),
    );

    const available = path
        .flatMap(c => c.options)
        .filter(o => !o.hidden && (o.long !== undefined || o.short !== undefined));
    const chosen =
        available.length === 0
            ? []
            : await prompter.multiselect<OptionDef>({
                  message: 'Select options (space to toggle)',
                  options: available.map(o => ({
                      value: o,
                      label: o.flags,
                      hint: [
                          o.description,
                          o.defaultValue !== undefined ? `default: ${JSON.stringify(o.defaultValue)}` : '',
                      ]
                          .filter(Boolean)
                          .join(' '),
                  })),
                  initial: available.filter(isPreselected),
              });

    const opts = await chosen.reduce<Promise<readonly string[]>>(
        async (acc, opt) => [...(await acc), ...(await optionTokens(prompter, opt))],
        Promise.resolve([]),
    );

    const tokens = [...path.slice(1).map(c => c.name), ...opts, ...args];
    prompter.note?.([binName, ...tokens].map(quote).join(' '), 'Command');

    return { tokens, command };
};
