import { describe, expect, it, vi } from 'vite-plus/test';

// only argv parsing is tested: the injector (decorators) is not needed
vi.mock('@upradata/dependency-injection', () => {
    const decorator = () => () => undefined;
    return { AppInjector: {}, Component: decorator, Inject: decorator, InjectProp: decorator };
});

import { createNpxLocalCli } from '../../src/cli';

const cli = createNpxLocalCli();

const parse = (...argv: string[]) => {
    const result = cli.parse(argv);

    if (result.kind !== 'run') {
        throw new Error(`unexpected parse result "${result.kind}"`);
    }

    return result;
};

describe('npx-local cli', () => {
    it('add: collects the local packages and defaults', () => {
        const { args, opts } = parse('add', 'a', 'b', '--find-up');

        expect(args).toEqual([['a', 'b']]);
        expect(opts).toMatchObject({
            dependencyType: 'prod',
            projectDir: './',
            installDir: 'node_modules',
            mode: 'link',
            findUp: true,
        });
    });

    it('add: dependency flags select the dependency type', () => {
        expect(parse('add', 'a', '--dev').opts).toMatchObject({ dependencyType: 'dev' });
        expect(parse('add', 'a', '-P').opts).toMatchObject({ dependencyType: 'prod' });
        expect(parse('add', 'a', '--dependency-type', 'peers').opts).toMatchObject({ dependencyType: 'peers' });
    });

    it('bump-version: semver flags select the type', () => {
        expect(parse('bump-version').opts).toMatchObject({ type: 'patch' });
        expect(parse('bump-version', '--major').opts).toMatchObject({ type: 'major' });
        expect(parse('bump-version', '-t', 'minor', '--version', '1.2.3').opts).toMatchObject({
            type: 'minor',
            version: '1.2.3',
        });
    });

    it('merge-into: negated options default to true, and the command has an alias', () => {
        const { command, opts } = parse('merge', '--no-publish', '-b', 'dev');

        expect(command.name).toBe('merge-into');
        expect(opts).toMatchObject({ branch: 'dev', patch: true, publish: false });
    });

    it('lists the interactive command', () => {
        expect(cli.help()).toContain('interactive');
    });
});
