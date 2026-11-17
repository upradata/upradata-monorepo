export const requiredSymbolKey = Symbol('required');

export type ClassType = { new (...args: any[]): any };

export type FunctionType = (...args: any[]) => any;
export type Condition = (...args: any[]) => boolean;

export type ParamCond = { index: number; condition: Condition };
export type PropCond = { name: string | symbol; condition: Condition };
