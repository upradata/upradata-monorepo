import { RequiredProperty } from './required-property';
import { RequiredParameter } from './required-parameter';
import { Validate as ValidateDecorator } from './validate';
import { Condition, FunctionType } from './definition';

/*
 *
 *
 * Require & RequireIf decorator
 */

export function Required(target: any, propertyKey: string | symbol, parameterIndex: number, condition: Condition = undefined) {
    if (parameterIndex === undefined) {
        RequiredProperty.register(condition, target, propertyKey);
    }
    else
        RequiredParameter.register(condition, target, propertyKey, parameterIndex);
}


export function RequiredIf(condition: Condition) {

    return (target: any, propertyKey: string | symbol, parameterIndex?: number) => {
        Required(target, propertyKey, parameterIndex, condition);
    };
}




/*
 *
 *
 * Validate decorator
 */

export function ValidateProperties(target: any) {
    return ValidateDecorator.validateClass(target, true);
}

export function Validate(target: any, propertyName?: string, descriptor?: TypedPropertyDescriptor<FunctionType>) {

    if (propertyName === undefined)
        return ValidateDecorator.validateClass(target);


    ValidateDecorator.validateMethod(target, propertyName, descriptor);
}
