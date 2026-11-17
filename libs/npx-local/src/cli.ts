import { createCli, parsers, type CommandInit, type OptionInit } from '@upradata/cli';
import { findUp, oneLine } from '@upradata/node-util';

import { LocalInstall } from './local-install';
import { INSTALL_MODES, type LocalInstallOptions } from './local-install.options';
import { mergeInto } from './merge-to-branch';
import type { DependencyType, SemVersionType } from './types';
import { dependenciesDef, semVerDefinitions } from './util';

// a value-less flag (or "true") selects `selected`, any other value is kept as is
const flagToChoice = (selected: string) => (value: string) => (value === '' || value === 'true' ? selected : value);

const installCommand = (commandName: 'install' | 'add', description: string): CommandInit => {
    const isAdd = commandName === 'add';

    const addOptions: readonly OptionInit[] = [
        { flags: '-l, --local-packages <packages...>', description: 'local packages to install' },
        {
            flags: '--dependency-type <type>',
            description: `add the local dependency in one of [ ${dependenciesDef.map(d => d.depType).join(', ')} ]`,
            choices: dependenciesDef.map(d => d.depType),
            defaultValue: 'prod' satisfies DependencyType,
            aliases: dependenciesDef.map(({ flags, depName, depType }) => ({
                flags: `${flags} [bool]`,
                description: `add the local dependency in ${depName}`,
                transform: flagToChoice(depType),
            })),
        },
    ];

    return {
        name: commandName,
        description,
        arguments: isAdd
            ? [{ name: 'local-packages', description: 'local packages to install', required: true, variadic: true }]
            : [],
        options: [
            ...(isAdd ? addOptions : []),
            {
                flags: '-p, --project-dir <path>',
                description: 'directory of project where to install local dependencies',
                defaultValue: './',
            },
            {
                flags: '-i, --install-dir <path>',
                description: 'directory where to install local packages (node_modules per default',
                defaultValue: 'node_modules',
            },
            {
                flags: '-m, --mode <mode>',
                description: 'choose if the local dependency files are copied or linked in node_modules',
                choices: INSTALL_MODES,
                defaultValue: 'link',
            },
            {
                flags: '--find-up',
                description: oneLine`enable find-up algorithm to find a package.json directory for both the project
                     where to install the dependencies and the folder where there is the local dependency`,
            },
            { flags: '-w, --watch', description: 'enable watch mode' },
        ],
        actions: ({ args, opts }) => {
            const options = opts as LocalInstallOptions;
            const commandArguments = isAdd ? (args[0] as string[]) : [];

            const localPackages = (options.localPackages || []).concat(commandArguments);
            return new LocalInstall({ ...options, localPackages }).install();
        },
    };
};

const copyLocalToNpmDepsCommand = (): CommandInit => ({
    name: 'local-to-npm',
    aliases: ['transfer'],
    description: 'copy all local dependencies to npm dependencies [package.json].dependencies/devDependencies',
    actions: () => new LocalInstall().copyLocalDepsToNpmProperty(),
});

const mergeIntoBranchCommand = (): CommandInit => ({
    name: 'merge-into',
    aliases: ['merge'],
    description: 'merge current branch to specified branch',
    options: [
        { flags: '-b, --branch <branch>', description: 'branch name where to merge', defaultValue: 'master' },
        { flags: '--no-patch', description: 'patch version before merging' },
        { flags: '--no-publish', description: 'publish to npm registry' },
    ],
    actions: ({ opts }) => {
        const options = opts as { branch: string; patch: boolean; publish: boolean };
        return mergeInto(options.branch, { bumpVersion: options.patch, npmPublish: options.publish });
    },
});

const bumpVersionCommand = (): CommandInit => ({
    name: 'bump-version',
    description: 'Bump SemVer package version',
    options: [
        {
            flags: '-t, --type [semver type]',
            description: 'SemVer part to bump',
            choices: semVerDefinitions.map(d => d.name),
            defaultValue: 'patch' satisfies SemVersionType,
            aliases: semVerDefinitions.map(({ name, flags }) => ({
                flags: `${flags} [bool]`,
                description: `bump SemVer ${name} part`,
                transform: flagToChoice(name),
            })),
        },
        { flags: '-v, --version <version>', description: 'specify exatcly the version' },
    ],
    actions: ({ opts }) => {
        const options = opts as { type: SemVersionType; version: string };
        return new LocalInstall().bumpVersion({ ...options, semVer: options.type });
    },
});

export const createNpxLocalCli = () =>
    createCli({
        name: 'npx-local',
        description: 'cli to install local projects to node_modules',
        packageJson: findUp.sync('package.json', { from: __dirname }),
        options: [
            {
                flags: '-v, --verbose',
                description: 'enable verbose mode',
                parser: parsers.increaseNumber(),
                defaultValue: 0,
            },
            { flags: '-q, --quiet', description: 'enable quiet mode' },
        ],
        subcommands: [
            installCommand('add', 'add local dependencies to package.json'),
            installCommand('install', 'install local dependencies from package.json'),
            copyLocalToNpmDepsCommand(),
            mergeIntoBranchCommand(),
            bumpVersionCommand(),
        ],
    });

export function runCli() {
    void createNpxLocalCli()
        .run(process.argv.slice(2))
        .then(code => {
            process.exitCode = code;
        });
}
