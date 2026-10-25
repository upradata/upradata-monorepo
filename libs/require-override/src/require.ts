import getCallerFile from 'get-caller-file';
/* eslint-disable prefer-rest-params */
import Module from 'module';
import { Export } from './export';
import { ModuleExports, ReRequireExports, ReRequireModuleAccept, ReRequireObject } from './types';


const originalLoader = Module._load;

export class RequireOverride {
    pendingExports = new Export();
    exports = new Export();

    constructor() {
        this.init();
        this.addModuleLoad();
    }

    private init() {
        this.exports.init();
        this.pendingExports.init();
        this.exports.callbacks = this.pendingExports.callbacks;
    }

    private addModuleLoad() {
        const _this = this;

        Module._load = function (request: string, parent: Module): ModuleExports {
            // parent === null =>  current module is the entry point of the current process
            // parent === undefined =>  if the module was loaded by something that is not a CommonJS module (E.G.: REPL or import)
            if (!parent)
                return originalLoader.apply(this, arguments);

            const moduleFrom = parent.filename;

            const pendingExports = _this.pendingExports.fromModule(moduleFrom);
            const exports = _this.exports.fromModule(moduleFrom);

            if (pendingExports.has(request)) {
                exports.add(pendingExports.get(request));
                pendingExports.delete(request);
            }

            const { type, moduleExports, errors } = exports.require(request, parent);

            if (type === 'success')
                return moduleExports;

            try {
                return originalLoader.apply(this, arguments);
            } catch (e) {
                if (type === 'fail') {
                    const message = [ ...errors, e ].map(e => e.message).join('\n');
                    throw new Error(message);
                }

                throw e;
            }
        };
    }


    start(path: ReRequireModuleAccept, exports: ReRequireExports): void;
    start<M extends ReRequireModuleAccept>(options: ReRequireObject<M>): void;
    start<M extends ReRequireModuleAccept>(pathOrOptions: ReRequireModuleAccept | ReRequireObject<M>, exports?: ReRequireExports): void {
        let opts: ReRequireObject<ReRequireModuleAccept> = undefined;

        if (arguments.length === 2) {
            opts = {
                module: pathOrOptions as ReRequireModuleAccept,
                exports,
                newModule: undefined
            };
        } else {
            opts = { ...(pathOrOptions as ReRequireObject<M>) };
        }

        this.pendingExports.fromModule(getCallerFile()).add(opts);
    }

    stop(path: string) {
        const calledFrom = getCallerFile();
        this.pendingExports.fromModule(calledFrom).delete(path);
        this.exports.fromModule(calledFrom).delete(path);
    }

    stopAll() {
        this.init();
    }

    reRequire(path: string) {
        const module = this.exports.fromModule(getCallerFile()).fullPath(path);
        delete require.cache[ require.resolve(module) ];
        return require(module);
    }
}


// export const requireOverride = new RequireOverride();
