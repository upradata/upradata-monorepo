// https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */

interface Constructor<T> {
    new (...args: any[]): T;
}

export function InheritBuiltin(): (target: Constructor<any>) => any {
    return (target: Constructor<any>) => {
        return class extends target {
            constructor(...args: any[]) {
                super(args);
                Object.setPrototypeOf(this, target.prototype);
            }
        };
    };
}
