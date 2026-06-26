import { ClassType } from './definition';

export function methodArgs(method: Function | ClassType) {
    let args: string;

    // First match everything inside the method argument parens.
    if (method.prototype) {
        const constructorRegexp = /constructor\s*\(([^)]*)\)/;
        args = method.toString().match(constructorRegexp)[1];
    } else {
        const methodRegexp = /(\*?\[Symbol\.)?[a-z$][\w\d]+\]?\s*\(([^)]*)\)/;
        args = method.toString().match(methodRegexp)[2];
    }

    // Split the arguments string into an array comma delimited.
    return args.split(',').map(function (arg) {
        // Ensure no inline comments are parsed and trim the whitespace.
        return arg.replace(/\/\*.*\*\//, '').trim();
    }).filter(function (arg) {
        // Ensure no undefined values are added.
        return arg;
    });
}
