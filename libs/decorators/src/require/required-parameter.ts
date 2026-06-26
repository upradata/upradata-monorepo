import 'reflect-metadata';
import { methodArgs } from './helper';
import { Condition, ParamCond, requiredSymbolKey, ClassType } from './definition';

export class RequiredParameter {

    public static register(condition: Condition, target: any, methodName: string | symbol, parameterIndex: number) {

        const _require = (target: any, propertyKey: string | symbol, parameterIndex: number) => {
            const existingRequiredParameters: ParamCond[] = Reflect.getOwnMetadata(requiredSymbolKey, target, propertyKey) || [];

            existingRequiredParameters.push({ index: parameterIndex, condition });
            Reflect.defineMetadata(requiredSymbolKey, existingRequiredParameters, target, propertyKey);
        };


        if (methodName === undefined)
            _require(target.prototype, 'constructor', parameterIndex);
        else
            _require(target, methodName, parameterIndex);


    }


    public static check(prototype: any, methodName: string, method: Function | ClassType, args: ArrayLike<any>) {
        const requiredParameters: ParamCond[] = Reflect.getOwnMetadata(requiredSymbolKey, prototype, methodName);

        if (requiredParameters) {
            for (const param of requiredParameters) {
                if (param.condition === undefined || param.condition()) {
                    if (param.index >= args.length || args[ param.index ] === undefined) {

                        const args = methodArgs(method);
                        const arg = ` "${args[ param.index ]}" `;

                        // tslint:disable-next-line:no-parameter-reassignment
                        let signature = args.reduce((accu, arg) => accu += `${arg}, `, '');
                        signature = signature.slice(0, -2);


                        throw new Error(
                            `Missing ${arg} required argument:
                             at index ${param.index + 1} in method ${methodName}(${signature}) in class ${prototype.constructor.name}`);
                    }
                }
            }
        }
    }


}
