import { readFileSync } from 'node:fs';

import { CliCancelled, CliError, formatError } from './errors';
import { renderHelp } from './help';
import { clackPrompter, interactiveSelect } from './interactive';
import type { Prompter } from './interactive';
import { parseArgv } from './parse';
import type { ParseResult } from './parse';
import { defineCommand } from './schema';
import type { CommandDef, CommandInit } from './schema';
import { supportsColor } from './style';

export type InteractiveInit = { name?: string; aliases?: readonly string[] };

export type CliInit = CommandInit & {
    version?: string;
    // path of a package.json whose version takes precedence over `version`
    packageJson?: string;
    allowUnknownOption?: boolean;
    allowExcessArguments?: boolean;
    showSuggestionAfterError?: boolean;
    interactive?: false | InteractiveInit;
    prompter?: Prompter;
    out?: (text: string) => void;
    err?: (text: string) => void;
    env?: Readonly<Record<string, string | undefined>>;
    color?: boolean;
    width?: number;
};

export type Cli = {
    root: CommandDef;
    parse: (argv: readonly string[]) => ParseResult;
    run: (argv: readonly string[]) => Promise<number>;
    help: (path?: readonly CommandDef[]) => string;
};

export const createCli = (init: CliInit): Cli => {
    const {
        version: versionInit,
        packageJson,
        allowUnknownOption,
        allowExcessArguments,
        showSuggestionAfterError,
        interactive,
        prompter,
        out = text => void process.stdout.write(text),
        err = text => void process.stderr.write(text),
        env = process.env,
        color = supportsColor(env, Boolean(process.stdout.isTTY)),
        width = process.stdout.columns ?? 80,
        ...commandInit
    } = init;

    const version = (packageJson === undefined ? undefined : (JSON.parse(readFileSync(packageJson, 'utf8')) as { version?: string }).version) ?? versionInit;

    // filled once the root is built: the interactive action needs both
    const holder: { root?: CommandDef; run?: (argv: readonly string[]) => Promise<number>; nestedExit?: number | undefined } = {};

    const interactiveOptions = interactive === false ? undefined : (interactive ?? {});
    const interactiveName = interactiveOptions === undefined ? undefined : (interactiveOptions.name ?? 'interactive');
    const interactiveInit: CommandInit | undefined =
        interactiveName === undefined
            ? undefined
            : {
                  name: interactiveName,
                  description: 'Pick a command, its arguments and options from interactive prompts',
                  aliases: interactiveOptions?.aliases ?? (interactiveOptions?.name === undefined ? ['i'] : []),
                  actions: async () => {
                      const root = holder.root as CommandDef;
                      const self = root.subcommands.find(c => c.name === interactiveName) as CommandDef;
                      const p = prompter ?? (await clackPrompter());
                      const { tokens } = await interactiveSelect(p, root, new Set([self]), root.name);
                      p.outro?.('Running');
                      holder.nestedExit = await (holder.run as (argv: readonly string[]) => Promise<number>)(tokens);
                  }
              };

    const root = defineCommand({
        ...commandInit,
        subcommands: [...(commandInit.subcommands ?? []), ...(interactiveInit ? [interactiveInit] : [])]
    });
    holder.root = root;

    const settings = { allowUnknownOption, allowExcessArguments, showSuggestionAfterError, env, version };
    const help = (path: readonly CommandDef[] = [root]) => renderHelp(path, { color, width, version });
    const parse = (argv: readonly string[]) => parseArgv(root, argv, settings);

    const run = async (argv: readonly string[]): Promise<number> => {
        const result = parse(argv);

        switch (result.kind) {
            case 'help':
                out(`${help(result.path)}\n`);
                return 0;
            case 'version':
                out(`${version ?? ''}\n`);
                return 0;
            case 'error':
                err(`${formatError(result.error, color)}\n`);
                return result.error.exitCode;
            case 'run':
                try {
                    const ctx = { opts: result.opts, args: result.args, command: result.command, path: result.path, unknown: result.unknown };
                    const results = result.command.actions.map(action => action(ctx));
                    await Promise.all(results);
                    const nested = holder.nestedExit;
                    holder.nestedExit = undefined;
                    return nested ?? 0;
                } catch (e) {
                    if (e instanceof CliCancelled) {
                        err('cancelled\n');
                        return 130;
                    }
                    err(`${formatError(e, color)}\n`);
                    return e instanceof CliError ? e.exitCode : 1;
                }
        }
    };

    holder.run = run;

    return { root, parse, run, help };
};
