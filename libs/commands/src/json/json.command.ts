#!/usr/bin/env node

import { createCli } from '@upradata/cli';

import { csvToJsonCommand } from './csv-to-json.command';
import { jsonToCsvCommand } from './json-to-csv.command';

const cli = createCli({
    name: 'json',
    description: 'set of json commands',
    subcommands: [jsonToCsvCommand, csvToJsonCommand],
});

void cli.run(process.argv.slice(2)).then(code => {
    process.exitCode = code;
});
