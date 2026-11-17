import { describe, expect, it } from 'vite-plus/test';
import { CliError, parsers } from '../../src';
import { camelcase, levenshtein, mergeDeep, parseScalar, setIn, similar, stripAnsi, wrap } from '../../src/util';
import { capture } from '../helpers';

describe('parsers', () => {
    it('int/float/boolean', () => {
        expect(parsers.int('42', undefined)).toBe(42);
        expect(() => parsers.int('x', undefined)).toThrow();
        expect(parsers.float('1.5', undefined)).toBe(1.5);
        expect(parsers.boolean('false', undefined)).toBe(false);
        expect(parsers.boolean('true', undefined)).toBe(true);
    });

    it('increase/decrease', () => {
        expect(parsers.increaseNumber(2)('', 1)).toBe(3);
        expect(parsers.decreaseNumber()('', undefined)).toBe(-1);
    });

    it('array, stringToArray, choices, regex', () => {
        expect(parsers.array()('b', ['a'])).toEqual(['a', 'b']);
        expect(parsers.stringToArray()('a, b,,c', undefined)).toEqual(['a', 'b', 'c']);
        expect(parsers.stringToArray({ parser: parsers.int, separator: ':' })('1:2', undefined)).toEqual([1, 2]);
        expect(parsers.choices(['a', 'b'])('a', undefined)).toBe('a');
        expect(() => parsers.choices(['a', 'b'])('c', undefined)).toThrow('Allowed choices');
        expect(parsers.regex('/ab+/i', undefined)).toEqual(/ab+/i);
    });

    it('object, cumulateObject, compose, tryParser', () => {
        expect(parsers.object('a.b')('1', { a: { c: 2 } })).toEqual({ a: { c: 2, b: 1 } });
        expect(parsers.object()('{"x":1}', undefined)).toEqual({ x: 1 });
        expect(parsers.cumulateObject('{"a":{"b":1}}', { a: { c: 2 } })).toEqual({ a: { b: 1, c: 2 } });
        expect(() => parsers.cumulateObject('3', undefined)).toThrow();
        expect(parsers.compose<number>(parsers.int, (_, p) => (p ?? 0) * 2)('4', undefined)).toBe(8);
        expect(parsers.tryParser(parsers.int, v => v.toUpperCase())('x', undefined)).toBe('X');
    });
});

describe('util', () => {
    it('camelcase, setIn, mergeDeep, parseScalar', () => {
        expect(camelcase('some-long.name')).toBe('someLongName');
        expect(setIn({ a: 1 }, ['b', 'c'], 2)).toEqual({ a: 1, b: { c: 2 } });
        expect(mergeDeep({ a: { b: 1 } }, { a: { c: 2 }, d: 3 })).toEqual({ a: { b: 1, c: 2 }, d: 3 });
        expect(parseScalar('12')).toBe(12);
        expect(parseScalar('true')).toBe(true);
        expect(parseScalar('hello')).toBe('hello');
    });

    it('levenshtein, similar, stripAnsi, wrap', () => {
        expect(levenshtein('kitten', 'sitting')).toBe(3);
        expect(similar('buld', ['build', 'deploy'])).toEqual(['build']);
        expect(stripAnsi('\u001b[31mred\u001b[39m')).toBe('red');
        expect(wrap('aaa bbb ccc', 7)).toEqual(['aaa bbb', 'ccc']);
    });
});

describe('options', () => {
    const make = (env: Record<string, string> = {}) =>
        capture({
            name: 'app',
            env,
            options: [
                { flags: '-n, --name <v>', envVar: 'APP_NAME', defaultValue: 'def' },
                { flags: '--tags <t...>' },
                { flags: '--cfg <v>', dotted: true },
                { flags: '--old-name <v>', aliases: [{ flags: '--new-name <v>', mode: 'target' }] },
                { flags: '--req <v>', required: true },
                { flags: '--flag [v]' }
            ],
            actions: [() => undefined]
        });

    it('precedence: cli > env > default', () => {
        const get = (env: Record<string, string>, argv: string[]) => {
            const r = make(env).cli.parse([...argv, '--req', 'x']);
            return r.kind === 'run' ? r.opts.name : r;
        };
        expect(get({}, [])).toBe('def');
        expect(get({ APP_NAME: 'env' }, [])).toBe('env');
        expect(get({ APP_NAME: 'env' }, ['-n', 'cli'])).toBe('cli');
    });

    it('variadic, dotted and optional-value options', () => {
        const r = make().cli.parse(['--req', 'x', '--tags', 'a', 'b', '--cfg.a.b', '1', '--flag']);
        expect(r.kind === 'run' && r.opts).toMatchObject({ tags: ['a', 'b'], cfg: { a: { b: 1 } }, flag: true });
    });

    it('copies values to target aliases', () => {
        const r = make().cli.parse(['--req', 'x', '--old-name', 'v']);
        expect(r.kind === 'run' && r.opts).toMatchObject({ oldName: 'v', newName: 'v' });
    });

    it('errors on missing required option and missing value', () => {
        const a = make().cli.parse([]);
        expect(a.kind === 'error' && a.error.message).toContain("required option '--req <v>' not specified");
        const b = make().cli.parse(['--req']);
        expect(b.kind === 'error' && b.error).toBeInstanceOf(CliError);
    });
});

describe('help', () => {
    it('renders usage, arguments, options, commands and defaults', () => {
        const c = capture({
            name: 'app',
            description: 'demo',
            version: '1.0.0',
            options: [{ flags: '-p, --port <n>', description: 'the port', defaultValue: 80, envVar: 'PORT' }],
            subcommands: [{ name: 'build', description: 'build it', aliases: ['b'], arguments: ['<src>', '[dest]'] }]
        });
        const text = c.cli.help();
        expect(text).toContain('Usage: app');
        expect(text).toContain('demo');
        expect(text).toContain('--port <n>');
        expect(text).toContain('the port');
        expect(text).toContain('build');
        expect(text).toContain('build it');
        expect(text).toContain('interactive');
        const sub = c.cli.help([c.cli.root, c.cli.root.subcommands[0] as never]);
        expect(sub).toContain('Usage: app build');
        expect(sub).toContain('<src>');
    });

    it('can disable the interactive command', () => {
        const c = capture({ name: 'app', interactive: false, subcommands: [{ name: 'x' }] });
        expect(c.cli.help()).not.toContain('interactive');
    });
});

describe('aliases', () => {
    const run = (aliases: object[], argv: string[], extra: object = {}) => {
        const r = capture({ name: 'app', options: [{ flags: '--main <v>', aliases, ...extra }] as never, actions: [() => undefined] }).cli.parse(argv);
        return r.kind === 'run' ? r.opts : r;
    };

    it('source (default): the alias flag feeds the option, and is a real flag', () => {
        expect(run([{ flags: '-a, --alias <v>' }], ['--alias', 'x'])).toMatchObject({ main: 'x' });
        expect(run([{ flags: '-a, --alias <v>' }], ['-a', 'x'])).toMatchObject({ main: 'x' });
        expect(run([{ flags: '-a, --alias <v>' }], ['--main', 'y'])).toEqual({ main: 'y' });
    });

    it('two-way: values flow in both directions', () => {
        const aliases = [{ flags: '--alias <v>', mode: 'two-way' }];
        expect(run(aliases, ['--alias', 'x'])).toMatchObject({ main: 'x', alias: 'x' });
        expect(run(aliases, ['--main', 'y'])).toMatchObject({ main: 'y', alias: 'y' });
    });

    it('applies raw string transforms and the receiving parser', () => {
        const aliases = [{ flags: '--n <v>', mode: 'target', transform: (v: string) => String(Number(v) * 2) }];
        expect(run(aliases, ['--main', '2'], { parser: parsers.int })).toMatchObject({ main: 2, n: '4' });
        expect(run([{ flags: '--obj <v>', mode: 'target', parser: parsers.object(), transform: parsers.transforms.toObject('k') }], ['--main', '3'])).toMatchObject({ obj: { k: 3 } });
    });

    it('multi-way: every alias is linked, with per-target transforms', () => {
        const aliases = [
            { flags: '--a <v>', mode: 'two-way' },
            { flags: '--b <v>', mode: 'multi-way', transform: { a: (v: string) => `${v}-a`, main: (v: string) => `${v}-m` } }
        ];
        expect(run(aliases, ['--b', 'x'])).toMatchObject({ main: 'x-m', a: 'x-a', b: 'x' });
    });

    it('inherits env var, hidden and defaults (except for source aliases)', () => {
        const aliases = [{ flags: '--t <v>', mode: 'target' }, { flags: '--s <v>' }];
        expect(run(aliases, [], { defaultValue: 'd' })).toEqual({ main: 'd', t: 'd' });
    });
});

describe('dotted option names and negation', () => {
    it('writes nested objects for dotted names', () => {
        const { cli } = capture({
            name: 'app',
            options: [{ flags: '--opt.entry.a <v>' }, { flags: '--opt.entry.b <v>' }],
            actions: [() => undefined]
        });
        const r = cli.parse(['--opt.entry.a', '1', '--opt.entry.b', '2']);
        expect(r.kind === 'run' && r.opts.opt).toEqual({ entry: { a: '1', b: '2' } });
    });

    it('--no-x defaults to true unless --x is also defined', () => {
        const only = capture({ name: 'app', options: [{ flags: '--no-cache' }], actions: [() => undefined] }).cli.parse([]);
        expect(only.kind === 'run' && only.opts.cache).toBe(true);
        const both = capture({ name: 'app', options: [{ flags: '--cache' }, { flags: '--no-cache' }], actions: [() => undefined] }).cli.parse([]);
        expect(both.kind === 'run' && both.opts.cache).toBeUndefined();
    });
});

describe('version', () => {
    it('reads the version from a package.json', async () => {
        const c = capture({ name: 'app', packageJson: new URL('../../package.json', import.meta.url).pathname, version: '0.0.0' });
        await c.cli.run(['--version']);
        expect(c.stdout().trim()).toBe('1.0.0');
    });
});
