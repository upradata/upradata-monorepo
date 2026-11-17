export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

export const camelcase = (str: string, separator: RegExp = /[-.]/): string =>
    str
        .split(separator)
        .filter(Boolean)
        .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
        .join('');

export const setIn = (obj: Record<string, unknown>, path: readonly string[], value: unknown): Record<string, unknown> => {
    const [head, ...rest] = path;

    if (head === undefined) {
        return obj;
    }

    if (rest.length === 0) {
        return { ...obj, [head]: value };
    }

    const current = obj[head];
    return { ...obj, [head]: setIn(isPlainObject(current) ? current : {}, rest, value) };
};

export const mergeDeep = (target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> =>
    Object.entries(source).reduce<Record<string, unknown>>((acc, [key, value]) => {
        const current = acc[key];
        return { ...acc, [key]: isPlainObject(current) && isPlainObject(value) ? mergeDeep(current, value) : value };
    }, target);

export const levenshtein = (a: string, b: string): number => {
    const initial = Array.from({ length: b.length + 1 }, (_, i) => i);

    const last = [...a].reduce<number[]>(
        (prev, ca, i) =>
            [...b].reduce<number[]>(
                (row, cb, j) => [
                    ...row,
                    Math.min(
                        (prev[j + 1] ?? 0) + 1,
                        (row[j] ?? 0) + 1,
                        (prev[j] ?? 0) + (ca === cb ? 0 : 1)
                    )
                ],
                [i + 1]
            ),
        initial
    );

    return last[b.length] ?? 0;
};

export const similar = (word: string, candidates: readonly string[], maxDistance = 2): string[] =>
    candidates
        .map(candidate => ({ candidate, distance: levenshtein(word, candidate) }))
        .filter(({ candidate, distance }) => distance <= maxDistance && distance < Math.max(word.length, candidate.length))
        .sort((a, b) => a.distance - b.distance)
        .map(({ candidate }) => candidate);

// eslint-disable-next-line no-control-regex
const ansiRegex = /\u001b\[[0-9;]*m/g;

export const stripAnsi = (text: string): string => text.replace(ansiRegex, '');

export const visibleLength = (text: string): number => stripAnsi(text).length;

export const padEndVisible = (text: string, width: number): string =>
    text + ' '.repeat(Math.max(0, width - visibleLength(text)));

export const wrap = (text: string, width: number): string[] =>
    text.split('\n').flatMap(line => {
        const lines = line
            .split(/\s+/)
            .filter(Boolean)
            .reduce<string[]>((acc, word) => {
                const last = acc[acc.length - 1];
                return last !== undefined && visibleLength(last) + 1 + visibleLength(word) <= width
                    ? [...acc.slice(0, -1), `${last} ${word}`]
                    : [...acc, word];
            }, []);

        return lines.length > 0 ? lines : [''];
    });

export const parseScalar = (raw: string): unknown => {
    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
};
