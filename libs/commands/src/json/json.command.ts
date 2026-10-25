#!/usr/bin/env node

import { createCli } from '@upradata/node-util';

import { csvToJsonCommand } from './csv-to-json.command';
import { jsonToCsvCommand } from './json-to-csv.command';

const command = createCli();

command.description('set of json commands');

command.addCommand(jsonToCsvCommand.name('json-csv'));
command.addCommand(csvToJsonCommand.name('csv-json'));

void command.parseAsync();
