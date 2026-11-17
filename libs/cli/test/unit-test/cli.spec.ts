import { describe, expect, it } from 'vite-plus/test';
import { parsers } from '../../src';
import { capture, fakePrompter } from '../helpers';

const base = {
    name: 'app',
    description: 'demo app',
    version: '1.2.3',
    options: [{ flags: '-v, --verbose', description: 'verbose', parser: parsers.increaseNumber(), defaultValue: 0 }],
    subcommands: [
        {
            name: 'build',
            description: 'build things',
            aliases: ['b'],
            isDefault: true,
            arguments: ['[target]'],
            options: [
                { flags: '-p, --port <n>', description: 'port', parser: parsers.int, defaultValue: 80 },
                { flags: '--no-cache', description: 'disable cache' },
                { flags: '-m, --mode <m>', description: 'mode', choices: ['dev', 'prod'] }
            ]
        },
        { name: 'deploy', description: 'deploy', arguments: ['<env>'] }
    ]
};

describe('parse', () => {
    it('parses subcommand options, args and defaults', () => {
        const { cli } = capture(base);
        const r = cli.parse(['build', 'x', '-p', '8080', '-vv']);
        expect(r.kind).toBe('run');
        if (r.kind === 'run') {
            expect(r.command.name).toBe('build');
            expect(r.opts).toMatchObject({ port: 8080, verbose: 2, cache: true });
            expect(r.args).toEqual(['x']);
        }
    });

    it('supports aliases, --opt=value, negation and choices', () => {
        const { cli } = capture(base);
        const r = cli.parse(['b', '--port=1', '--no-cache', '--mode', 'prod']);
        expect(r.kind === 'run' && r.opts).toMatchObject({ port: 1, cache: false, mode: 'prod' });
        expect(cli.parse(['b', '--mode', 'zzz']).kind).toBe('error');
    });

    it('routes to default subcommand', () => {
        const { cli } = capture(base);
        const r = cli.parse(['-p', '3']);
        expect(r.kind === 'run' && r.command.name).toBe('build');
    });

    it('reports errors', () => {
        const { cli } = capture(base);
        const msg = (a: string[]) => {
            const r = cli.parse(a);
            return r.kind === 'error' ? r.error.message : '';
        };
        expect(msg(['deploy'])).toContain("missing required argument 'env'");
        expect(msg(['deploy', 'a', 'b'])).toContain('too many arguments');
        expect(msg(['build', '--nope'])).toContain("unknown option '--nope'");
    });

    it('suggests similar commands when there is no default subcommand', () => {
        const { cli } = capture({ name: 'app', subcommands: [{ name: 'deploy' }, { name: 'build' }] });
        const r = cli.parse(['deplo']);
        expect(r.kind === 'error' && r.error.message).toContain('deploy');
    });

    it('rejects an unknown option on a default subcommand', () => {
        const { cli } = capture(base);
        const r = cli.parse(['--nope']);
        expect(r.kind === 'error' && r.error.message).toContain("unknown option '--nope'");
    });

    it('handles help and version', () => {
        const { cli } = capture(base);
        expect(cli.parse(['--help']).kind).toBe('help');
        expect(cli.parse(['--version']).kind).toBe('version');
    });
});

describe('run', () => {
    it('prints help, version, errors and returns exit codes', async () => {
        const c = capture(base);
        expect(await c.cli.run(['build', '--help'])).toBe(0);
        expect(c.stdout()).toContain('--port <n>');
        expect(await c.cli.run(['--version'])).toBe(0);
        expect(c.stdout()).toContain('1.2.3');
        expect(await c.cli.run(['deploy'])).toBe(1);
        expect(c.stderr()).toContain('error: missing required argument');
    });

    it('runs actions and surfaces thrown errors', async () => {
        const seen: unknown[] = [];
        const c = capture({
            name: 'app',
            subcommands: [
                { name: 'ok', arguments: ['[a]'], actions: [ctx => void seen.push(ctx.args)] },
                {
                    name: 'ko',
                    actions: [
                        () => {
                            throw new Error('boom');
                        }
                    ]
                }
            ]
        });
        expect(await c.cli.run(['ok', 'z'])).toBe(0);
        expect(seen).toEqual([['z']]);
        expect(await c.cli.run(['ko'])).toBe(1);
        expect(c.stderr()).toContain('boom');
    });
});

describe('interactive', () => {
    const names = (cli: ReturnType<typeof capture>['cli']) => cli.root.subcommands.flatMap(c => [c.name, ...c.aliases]);

    it('is "interactive"/"i" by default, renamable and disableable', () => {
        expect(names(capture(base).cli)).toEqual(expect.arrayContaining(['interactive', 'i']));
        expect(names(capture({ ...base, interactive: { name: 'wizard' } }).cli)).toContain('wizard');
        expect(names(capture({ ...base, interactive: { name: 'wizard' } }).cli)).not.toContain('i');
        expect(names(capture({ ...base, interactive: false }).cli)).not.toContain('interactive');
    });

    it('selects a command, arguments and options, then runs it', async () => {
        const seen: unknown[] = [];
        const prompter = fakePrompter({});
        const c = capture({
            name: 'app',
            prompter,
            subcommands: [
                {
                    name: 'build',
                    isDefault: true,
                    arguments: ['[target]'],
                    options: [{ flags: '-p, --port <n>', description: 'port', parser: parsers.int, defaultValue: 80 }],
                    actions: [ctx => void seen.push([ctx.args, ctx.opts.port])]
                }
            ]
        });
        const build = c.cli.root.subcommands[0];
        Object.assign(prompter, fakePrompter({ select: [build], text: ['web', '9000'], multiselect: [[build?.options[0]]] }));
        expect(await c.cli.run(['i'])).toBe(0);
        expect(seen).toEqual([[['web'], 9000]]);
    });

    it('does not preselect negated or zero-default flags', async () => {
        const seen: unknown[] = [];
        const prompter = fakePrompter({});
        const picked: unknown[] = [];
        const c = capture({
            name: 'app',
            prompter,
            subcommands: [
                {
                    name: 'build',
                    options: [{ flags: '--no-cache' }, { flags: '-v, --verbose', parser: parsers.increaseNumber(), defaultValue: 0 }, { flags: '--port <n>', defaultValue: 1 }],
                    actions: [ctx => void seen.push(ctx.opts)]
                }
            ]
        });
        const build = c.cli.root.subcommands[0];
        Object.assign(prompter, {
            select: async () => build,
            multiselect: async (o: { initial: unknown[] }) => (picked.push(o.initial.length), []),
            text: async () => ''
        });
        expect(await c.cli.run(['interactive'])).toBe(0);
        expect(picked).toEqual([1]);
        expect(seen).toEqual([expect.objectContaining({ cache: true })]);
    });
});
