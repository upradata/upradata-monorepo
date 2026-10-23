/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import 'reflect-metadata';

type PropertyType = string | symbol;

interface Optional {
    optional: boolean;
}

export interface Property extends Optional {
    name: PropertyType;
}

const propsSymbolKey = Symbol('properties');

// biome-ignore lint/complexity/noBannedTypes: <explanation>
interface SavePropType extends Function {
    get: (konstructor: Class) => Property[];
}

/* export type SavePropType =
    ({ optional }: Optional) => (prototype: any, propertyKey: PropertyType) => void
        & { get: (constructor: Class) => Property[] }; */

export const SaveProp: SavePropType = (({ optional }: Optional = { optional: false }) =>
    function register(prototype: any, propertyKey: PropertyType): void {
        const properties: Property[] = Reflect.getOwnMetadata(propsSymbolKey, prototype) || [];

        properties.push({ name: propertyKey, optional });
        Reflect.defineMetadata(propsSymbolKey, properties, prototype);
    }) as any;

export interface Class {
    new (...args: Array<any>): object;
}

SaveProp.get = (konstructor: Class) => Reflect.getOwnMetadata(propsSymbolKey, konstructor.prototype);
