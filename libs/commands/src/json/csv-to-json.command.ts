#!/usr/bin/env node

import fs from 'fs-extra';

import { parsers, type CommandInit } from '@upradata/cli';
import { csvToJson, green, red, type CsvToJsonOpts } from '@upradata/node-util';

type Options = CsvToJsonOpts & { out?: string; indent: number };

export const csvToJsonCommand: CommandInit = {
    name: 'csv-json',
    description: 'csv ⟶ json conversion',
    arguments: [{ name: 'csv-file', description: 'csv file to convert', required: true }],
    options: [
        { flags: '--skip-empty-rows [bool]', description: 'skip empty rows', parser: parsers.boolean },
        {
            flags: '-d, --delimiter <symbol>',
            description:
                'delimiter used for seperating columns. Use "auto" if delimiter is unknown in advance, in this case, delimiter will be auto-detected (by best attempt). Use an array to give a list of potential delimiters e.g. [",","|","$"]',
            defaultValue: ';',
        },
        {
            flags: '--ignore-columns <regexp>',
            description:
                'this parameter instructs the parser to ignore columns as specified by the regular expression. Example: /(name|age)/ will ignore columns whose header contains "name" or "age"',
            parser: parsers.regex,
        },
        {
            flags: '--include-columns <regexp>',
            description:
                'this parameter instructs the parser to include only those columns as specified by the regular expression. Example: /(name|age)/ will parse and include columns whose header contains "name" or "age"',
            parser: parsers.regex,
        },
        {
            flags: '--quote <symbol>',
            description:
                'if a column contains delimiter, it is able to use quote character to surround the column content. e.g. "hello, world" wont be split into two columns while parsing. Set to "off" will ignore all quotes',
            defaultValue: '"',
        },
        {
            flags: '--trim [bool]',
            description:
                'indicate if parser trim off spaces surrounding column content. e.g. " content " will be trimmed to "content"',
            parser: parsers.boolean,
            defaultValue: true,
        },
        {
            flags: '--check-type [bool]',
            description: 'this parameter turns on and off whether check field type',
            parser: parsers.boolean,
            defaultValue: false,
        },
        {
            flags: '--ignore-empty [bool]',
            description:
                'ignore the empty value in CSV columns. If a column value is not given, set this to true to skip them',
            parser: parsers.boolean,
            defaultValue: false,
        },
        {
            flags: '--noheader [bool]',
            description: 'indicating csv data has no header row and first row is data row',
            parser: parsers.boolean,
            defaultValue: false,
        },
        {
            flags: '-h, --headers <[header1, header2, ...]>',
            description:
                'an array to specify the headers of CSV data. If --noheader is false, this value will override CSV header row. Default: null. Example: ["my field","name"]',
            parser: parsers.array(),
        },
        {
            flags: '--flat-keys [bool]',
            description:
                "Don't interpret dots (.) and square brackets in header fields as nested object or array identifiers at all (treat them like regular characters for JSON field identifiers).",
            parser: parsers.boolean,
            defaultValue: false,
        },
        {
            flags: '--max-row-length <number>',
            description:
                'the max character a csv row could have. 0 means infinite. If max number exceeded, parser will emit "error" of "row_exceed". if a possibly corrupted csv data provided, give it a number like 65535 so the parser wont consume memory',
            parser: parsers.int,
            defaultValue: 0,
        },
        {
            flags: '--check-column [bool]',
            description:
                'whether check column number of a row is the same as headers. If column number mismatched headers number, an error of "mismatched_column" will be emitted',
            parser: parsers.boolean,
            defaultValue: false,
        },
        {
            flags: '--escape <character>',
            description:
                'escape character used in quoted column. Default is double quote (") according to RFC4108. Change to back slash (\\) or other chars for your own case',
            defaultValue: '"',
        },
        {
            flags: '--col-parser [bool]',
            description:
                'Allows override parsing logic for a specific column. It accepts a JSON object with fields like: headName: <String | Function> . e.g. {field1:\'number\'} will use built-in number parser to convert value of the field1 column to number. Another example {"name":nameProcessFunc} will use specified function to parse the value.',
            parser: parsers.boolean,
        },
        {
            flags: '--eol <character>',
            description:
                'end of line character. If omitted, parser will attempt to retrieve it from the first chunks of CSV data',
        },
        {
            flags: '--always-split-at-EOL [bool]',
            description:
                'always interpret each line (as defined by eol) as a row. This will prevent eol characters from being used within a row (even inside a quoted field). Change to true if you are confident no inline line breaks (like line break in a cell which has multi line text)',
            parser: parsers.boolean,
            aliases: [{ flags: '--always-split-at-e-o-l [bool]', mode: 'two-way' }],
            defaultValue: false,
        },
        {
            flags: '--null-object [bool]',
            description: 'convert string "null" to null object in JSON outputs',
            parser: parsers.boolean,
            defaultValue: false,
        },
        {
            flags: '--indent <nb>',
            description: 'the json output indentation (0 for compact json)',
            parser: parsers.int,
            defaultValue: 4,
        },
        { flags: '-o, --out <json-file>', description: 'output json file path' },
    ],
    actions: async ({ args, opts }) => {
        const csvFile = args[0] as string;
        const options = opts as Options;

        try {
            const json = await csvToJson(csvFile, options);

            const output = options.out || csvFile.replace(/\.csv$/, '.json');
            await fs.writeJSON(output, json, { spaces: options.indent });

            console.log(green`✔ ${output}`);
        } catch (e) {
            const err = e as Error;

            console.error(red`${err.message || 'Error during csv ⟶ json conversion'}`);
            console.error(err.stack || err);
        }
    },
};
