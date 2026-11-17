import { describe, expect, it, vi } from 'vite-plus/test';

vi.mock('@upradata/node-util', async importOriginal => {
    const original = (await importOriginal()) as Record<string, unknown>;

    return {
        ...original,
        createCli: () => {
            const command = {
                option: () => command,
                argument: () => command,
                description: () => command,
                action: () => command,
                name: () => command,
                addCommand: () => command,
                parseAsync: async () => undefined,
            };

            return command;
        },
    };
});

import { csvToJsonCommand, jsonToCsvCommand } from '../../src';

describe('commands public API', () => {
    it('exposes each published command entrypoint', () => {
        expect(csvToJsonCommand).toBeDefined();
        expect(jsonToCsvCommand).toBeDefined();
        expect(typeof csvToJsonCommand.parseAsync).toBe('function');
        expect(typeof jsonToCsvCommand.parseAsync).toBe('function');
    });
});
