#!/usr/bin/env node

import fs from 'fs-extra';

import { parsers, type CommandInit } from '@upradata/cli';
import { green, jsonToCsv, red, type JsonToCsvOptions } from '@upradata/node-util';

type Options = JsonToCsvOptions<unknown> & { out?: string };

export const jsonToCsvCommand: CommandInit = {
    name: 'json-csv',
    description: 'json ⟶ csv conversion',
    arguments: [{ name: 'json-file', description: 'json file to convert', required: true }],
    options: [
        { flags: '--headers <keys...>', description: 'filter json properties to be included as csv headers' },
        {
            flags: '--nb-keys <nb>',
            description: 'number of properties of the json object (that will be in the csv headers)',
            parser: parsers.int,
            aliases: [{ flags: '--nb-props <nb>' }],
        },
        { flags: '-d, --delimiter <symbol>', description: 'delimiter used for seperating columns', defaultValue: ';' },
        { flags: '-o, --out <csv-file>', description: 'output csv file path' },
    ],
    actions: async ({ args, opts }) => {
        const jsonFile = args[0] as string;
        const options = opts as Options;

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
    },
};
