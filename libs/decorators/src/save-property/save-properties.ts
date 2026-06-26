import 'reflect-metadata';

type PropertyType = string | symbol;

interface Optional {
    optional: boolean;
}

interface Property extends Optional {
    name: PropertyType;
}


const propsSymbolKey = Symbol('properties');


interface SavePropType extends Function {
    get: (constructor: Class) => Property[];
}


/* export type SavePropType =
    ({ optional }: Optional) => (prototype: any, propertyKey: PropertyType) => void
        & { get: (constructor: Class) => Property[] }; */

export const SaveProp: SavePropType = function ({ optional }: Optional = { optional: false }) {

    return function register(prototype: any, propertyKey: PropertyType): void {

        const properties: Property[] = Reflect.getOwnMetadata(propsSymbolKey, prototype) || [];

        properties.push({ name: propertyKey, optional });
        Reflect.defineMetadata(propsSymbolKey, properties, prototype);
    };
} as any;


export interface Class {
    new(...args: Array<any>): {};
}

SaveProp.get = (constructor: Class) => Reflect.getOwnMetadata(propsSymbolKey, constructor.prototype);
