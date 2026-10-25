
export const isString = (s: any): s is string => typeof s === 'string';
export const ensureArray = <T>(a: T | T[]): T[] => Array.isArray(a) ? a : [ a ];
