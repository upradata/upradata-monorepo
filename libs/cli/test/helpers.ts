import { createCli } from '../src';
import type { CliInit, Prompter } from '../src';

export const capture = (init: CliInit) => {
    const out: string[] = [];
    const err: string[] = [];
    const cli = createCli({ color: false, width: 100, env: {}, out: t => void out.push(t), err: t => void err.push(t), ...init });

    return { cli, out, err, stdout: () => out.join(''), stderr: () => err.join('') };
};

export type Script = { select?: unknown[]; multiselect?: unknown[][]; text?: string[]; confirm?: boolean[] };

export const fakePrompter = (script: Script): Prompter & { calls: string[] } => {
    const queues = {
        select: [...(script.select ?? [])],
        multiselect: [...(script.multiselect ?? [])],
        text: [...(script.text ?? [])],
        confirm: [...(script.confirm ?? [])]
    };
    const calls: string[] = [];

    return {
        calls,
        select: async o => (calls.push(`select:${o.message}`), queues.select.shift() as never),
        multiselect: async o => (calls.push(`multiselect:${o.message}`), queues.multiselect.shift() as never),
        text: async o => (calls.push(`text:${o.message}`), queues.text.shift() as string),
        confirm: async o => (calls.push(`confirm:${o.message}`), queues.confirm.shift() as boolean)
    };
};
