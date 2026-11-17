#!/usr/bin/env node


import { jsonToCsv, JsonToCsvOptions, createCli, parsers, green, red } from '@upradata/node-util';
import fs from 'fs-extra';

const command = createCli();
export const jsonToCsvCommand = command;

command.option(
    '--headers <keys...>',
    'filter json properties to be included as csv headers'
);

command.option({
    flags: '--nb-keys <nb>',
    description: 'number of properties of the json object (that will be in the csv headers)',
    parser: parsers.int,
    aliases: [
        { flags: '--nb-props <nb>' }
    ]
});

command.option(
    '-d, --delimiter <symbol>',
    'delimiter used for seperating columns',
    ';'
);

command.option('-o, --out <csv-file>', 'output csv file path');
command.argument('<json-file>', 'json file to convert');

command.description('json ⟶ csv conversion');

command.action(async (jsonFile: string, options: JsonToCsvOptions<unknown> & { out?: string; }) => {
    try {
        const csv = jsonToCsv(await fs.readJSON(jsonFile), options);

        const output = options.out || jsonFile.replace(/\.json$/, '.csv');
        await fs.outputFile(output, csv);

        console.log(green`✔ ${output}`);

    } catch (e) {
        const err = e as Error;

        console.error(red`${err.message || 'Error during json ⟶ csv conversion'}`);
        console.error(err.stack || err);
    }
});
