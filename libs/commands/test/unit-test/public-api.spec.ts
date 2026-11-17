import { describe, expect, it } from 'vite-plus/test';

import { createCli } from '@upradata/cli';

import { csvToJsonCommand, jsonToCsvCommand } from '../../src';

const cli = createCli({ name: 'json', subcommands: [jsonToCsvCommand, csvToJsonCommand] });

describe('commands public API', () => {
    it('exposes each published command definition', () => {
        expect(csvToJsonCommand.name).toBe('csv-json');
        expect(jsonToCsvCommand.name).toBe('json-csv');
    });

    it('parses csv-json options with their defaults', () => {
        const result = cli.parse(['csv-json', 'data.csv', '--indent', '2', '--noheader', '--always-split-at-e-o-l']);

        expect(result.kind).toBe('run');

        if (result.kind === 'run') {
            expect(result.args).toEqual(['data.csv']);
            expect(result.opts).toMatchObject({ indent: 2, noheader: true, delimiter: ';', alwaysSplitAtEOL: true });
        }
    });

    it('parses json-csv options including aliases', () => {
        const result = cli.parse(['json-csv', 'data.json', '--nb-props', '3', '--headers', 'a', 'b']);

        expect(result.kind).toBe('run');

        if (result.kind === 'run') {
            expect(result.args).toEqual(['data.json']);
            expect(result.opts).toMatchObject({ nbKeys: 3, headers: ['a', 'b'] });
        }
    });
});
