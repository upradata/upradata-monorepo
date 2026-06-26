
import { RequiredProperty } from './required-property';
import { RequiredParameter } from './required-parameter';
import { ClassType, FunctionType } from './definition';



export class Validate {
    public static validateMethod(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<FunctionType>) {
        const method = descriptor.value;

        descriptor.value = function () {
            RequiredParameter.check(target, propertyName, method, arguments);
            return method.apply(this, arguments);
        };
    }



    public static validateClass(constructor: ClassType, onlyDefinedProperties: boolean = false) {
        // save a reference to the original constructor
        const originalConstructor = constructor;

        // the new constructor behaviour
        const newConstructor: any = function (...args) {
            const newObj = new originalConstructor(...args);

            if (!onlyDefinedProperties)
                RequiredParameter.check(originalConstructor.prototype, 'constructor', originalConstructor, arguments);
            else
                RequiredProperty.check(constructor.prototype, newObj);

            return newObj;

        };

        // copy prototype so intanceof operator still works
        newConstructor.prototype = originalConstructor.prototype;

        // return new constructor (will override original)
        return newConstructor;
    }
}
