export type Style = {
    bold: (text: string) => string;
    dim: (text: string) => string;
    red: (text: string) => string;
    green: (text: string) => string;
    yellow: (text: string) => string;
    blue: (text: string) => string;
    magenta: (text: string) => string;
    cyan: (text: string) => string;
};

const paint = (open: number, close: number) => (enabled: boolean) => (text: string) =>
    enabled ? `\u001b[${open}m${text}\u001b[${close}m` : text;

export const style = (enabled: boolean): Style => ({
    bold: paint(1, 22)(enabled),
    dim: paint(2, 22)(enabled),
    red: paint(31, 39)(enabled),
    green: paint(32, 39)(enabled),
    yellow: paint(33, 39)(enabled),
    blue: paint(34, 39)(enabled),
    magenta: paint(35, 39)(enabled),
    cyan: paint(36, 39)(enabled)
});

export const supportsColor = (env: Readonly<Record<string, string | undefined>>, isTTY: boolean): boolean =>
    env.NO_COLOR !== undefined && env.NO_COLOR !== ''
        ? false
        : env.FORCE_COLOR !== undefined && env.FORCE_COLOR !== ''
          ? env.FORCE_COLOR !== '0'
          : isTTY;
