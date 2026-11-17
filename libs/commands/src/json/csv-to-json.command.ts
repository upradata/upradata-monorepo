#!/usr/bin/env node


import fs from 'fs-extra';
import { createCli, csvToJson, CsvToJsonOpts, green, parsers, red } from '@upradata/node-util';


const command = createCli();
export const csvToJsonCommand = command;


command.option(
    '--skip-empty-rows [bool]',
    'skip empty rows',
    parsers.boolean
);

command.option(
    '-d, --delimiter <symbol>',
    'delimiter used for seperating columns. Use "auto" if delimiter is unknown in advance, in this case, delimiter will be auto-detected (by best attempt). Use an array to give a list of potential delimiters e.g. [",","|","$"]',
    ';'
);

command.option(
    '--ignore-columns <regexp>',
    'this parameter instructs the parser to ignore columns as specified by the regular expression. Example: /(name|age)/ will ignore columns whose header contains "name" or "age"',
    (...args) => {
        parsers.regex(...(args as any as [ any ]));
    }
);

command.option(
    '--include-columns <regexp>',
    'this parameter instructs the parser to include only those columns as specified by the regular expression. Example: /(name|age)/ will parse and include columns whose header contains "name" or "age"',
    parsers.regex
);

command.option(
    '--quote <symbol>',
    'if a column contains delimiter, it is able to use quote character to surround the column content. e.g. "hello, world" wont be split into two columns while parsing. Set to "off" will ignore all quotes',
    '"'
);

command.option(
    '--trim [bool]',
    'indicate if parser trim off spaces surrounding column content. e.g. " content " will be trimmed to "content"',
    parsers.boolean,
    true
);

command.option(
    '--check-type [bool]',
    'this parameter turns on and off whether check field type',
    parsers.boolean,
    false
);

command.option(
    '--ignore-empty [bool]',
    'ignore the empty value in CSV columns. If a column value is not given, set this to true to skip them',
    parsers.boolean,
    false
);

command.option(
    '--noheader [bool]',
    'indicating csv data has no header row and first row is data row',
    parsers.boolean,
    false
);

command.option(
    '-h, --headers <[header1, header2, ...]>',
    'an array to specify the headers of CSV data. If --noheader is false, this value will override CSV header row. Default: null. Example: ["my field","name"]',
    parsers.array()
);

command.option(
    '--flat-keys [bool]',
    `Don't interpret dots (.) and square brackets in header fields as nested object or array identifiers at all (treat them like regular characters for JSON field identifiers). .`,
    parsers.boolean,
    false
);

command.option(
    '--max-row-length <number>',
    'the max character a csv row could have. 0 means infinite. If max number exceeded, parser will emit "error" of "row_exceed". if a possibly corrupted csv data provided, give it a number like 65535 so the parser wont consume memory',
    parsers.int,
    0
);

command.option(
    '--check-column [bool]',
    'whether check column number of a row is the same as headers. If column number mismatched headers number, an error of "mismatched_column" will be emitted',
    parsers.boolean,
    false
);

command.option(
    '--escape <character>',
    'escape character used in quoted column. Default is double quote (") according to RFC4108. Change to back slash (\) or other chars for your own case',
    '"'
);

command.option(
    '--col-parser [bool]',
    `Allows override parsing logic for a specific column. It accepts a JSON object with fields like: headName: <String | Function> . e.g. {field1:'number'} will use built-in number parser to convert value of the field1 column to number. Another example {"name":nameProcessFunc} will use specified function to parse the value.`,
    parsers.boolean
);

command.option(
    '--eol <character>',
    'end of line character. If omitted, parser will attempt to retrieve it from the first chunks of CSV data'
);

command.option({
    flags: '--always-split-at-EOL [bool]',
    description: 'always interpret each line (as defined by eol) as a row. This will prevent eol characters from being used within a row (even inside a quoted field). Change to true if you are confident no inline line breaks (like line break in a cell which has multi line text)',
    parser: parsers.boolean,
    aliases: [
        { flags: '--always-split-at-e-o-l [bool]', mode: 'two-way' }
    ],
    defaultValue: false
});

command.option(
    '--null-object [bool]', 'convert string "null" to null object in JSON outputs',
    parsers.boolean,
    false
);

command.option(
    '--indent <nb>',
    'the json output indentation (0 for compact json)',
    parsers.int,
    4
);

command.option('-o, --out <json-file>', 'output json file path');
command.argument('<csv-file>', 'csv file to convert');
command.description('csv ⟶ json conversion');


command.action(async (csvFile: string, options: CsvToJsonOpts & { out?: string; indent: number; }) => {
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


});
