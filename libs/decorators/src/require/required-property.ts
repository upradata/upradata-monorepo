import 'reflect-metadata';
import { PropCond, requiredSymbolKey, Condition } from './definition';


export class RequiredProperty {
    public static register(condition: Condition, prototype: any, propertyKey: string | symbol) {
        const existingRequiredIf: PropCond[] = Reflect.getOwnMetadata(requiredSymbolKey, prototype) || [];

        existingRequiredIf.push({ name: propertyKey, condition });
        Reflect.defineMetadata(requiredSymbolKey, existingRequiredIf, prototype);
    }




    public static check(prototype: any, thisObj: any) {
        const requiredProps: PropCond[] = Reflect.getOwnMetadata(requiredSymbolKey, prototype);

        if (requiredProps) {

            for (const prop of requiredProps) {
                if (prop.condition.call(thisObj)) {
                    if (thisObj[ prop.name ] === undefined) {
                        throw new Error(
                            `The property ${String(prop.name)} of class ${prototype.constructor.name} doesn't fullfill
                             the required condition: \n${prop.condition}`);

                    }
                }
            }
        }
    }

}
