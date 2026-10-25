import { assignRecursive } from '@upradata/util';

export interface Target {
    a: number;
    b: {
        b1: number;
        b2?: string;
    };
    c: { c1: number };
    d?: { d1: string };
    e?: string;
}

export interface MakeTargetOptions {
    optional: boolean;
}

export const makeTarget = <T = unknown>(overwrite: T = {} as any, options?: MakeTargetOptions): Target & T =>
    assignRecursive(
        options?.optional
            ? {
                  a: 1,
                  b: { b1: 2, b2: 'b2' },
                  c: { c1: 3 },
                  d: { d1: 'd1' },
                  e: 'e',
              }
            : {
                  a: 1,
                  b: { b1: 2 },
                  c: { c1: 3 },
              },
        overwrite,
    ) as any as Target & T;
