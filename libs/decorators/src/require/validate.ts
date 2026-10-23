/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */
/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import type { ClassType, FunctionType } from './definition';
import { RequiredParameter } from './required-parameter';
import { RequiredProperty } from './required-property';

export class Validate {
    public static validateMethod(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<FunctionType>) {
        const method = descriptor.value;

        descriptor.value = function (...args: any[]) {
            RequiredParameter.check(target, propertyName, method, args);
            return method.apply(this, args);
        };
    }

    public static validateClass(konstructor: ClassType, onlyDefinedProperties: boolean = false) {
        // save a reference to the original constructor
        const originalConstructor = konstructor;

        // the new constructor behaviour
        const newConstructor: any = function (...args) {
            const newObj = new originalConstructor(...args);

            if (!onlyDefinedProperties)
                RequiredParameter.check(originalConstructor.prototype, 'constructor', originalConstructor, arguments);
            else RequiredProperty.check(konstructor.prototype, newObj);

            return newObj;
        };

        // copy prototype so intanceof operator still works
        newConstructor.prototype = originalConstructor.prototype;

        // return new constructor (will override original)
        return newConstructor;
    }
}
