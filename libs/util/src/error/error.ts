export const errorToString = (error: unknown, defaultMessage?: string): string => {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error && typeof error === 'object' && 'toString' in error && typeof error.toString === 'function') {
        // oxlint-disable-next-line typescript/no-base-to-string
        return error.toString();
    }

    return defaultMessage ?? String(error);
};
