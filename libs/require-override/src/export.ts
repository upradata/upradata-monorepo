import Module from 'module';
import { getFullPathNormalized } from './full-path';
import { ModuleExports, ReRequireModuleAccept, ReRequireModuleAcceptFunction, ReRequireObject } from './types';
import { ensureArray, isString } from './util';


const originalLoader = Module._load;


export interface RequireExport {
    type: 'fail' | 'success' | 'not-found';
    errors?: Error[];
    moduleExports?: ModuleExports;
}


export class ExportContext {
    constructor(public fromModule: string, public _export: Export) { }

    fullPath(filePath: string) {
        return getFullPathNormalized(filePath, this.fromModule);
    }

    add(requireObj: ReRequireObject<ReRequireModuleAccept>) {
        const { module } = requireObj;

        if (isString(module)) {
            this._export.statics[ this.fullPath(module) ] = requireObj as ReRequireObject<string>;
        } else {
            this._export.callbacks.push(requireObj as ReRequireObject<ReRequireModuleAcceptFunction>);
        }
    }

    has(filePath: string) {
        return this._export.statics.hasOwnProperty(this.fullPath(filePath));
    }

    get(filePath: string) {
        return this._export.statics[ this.fullPath(filePath) ];
    }

    require(filePath: string, parent: Module): RequireExport {
        let fileExport: ReRequireObject<ReRequireModuleAccept> = this._export.statics[ this.fullPath(filePath) ];

        if (!fileExport) {
            for (const moduleExported of this._export.callbacks) {
                if (moduleExported.module(filePath, parent)) {
                    fileExport = moduleExported;
                    break;
                }
            }
        }

        if (!fileExport)
            return { type: 'not-found' };

        const { exports, newModule } = fileExport;

        if (typeof exports !== 'undefined')
            return { type: 'success', moduleExports: exports };


        const getNewPaths = () => {
            if (typeof newModule === 'function')
                return ensureArray(newModule(filePath, parent));

            return ensureArray(newModule);
        };

        const newPaths = getNewPaths().filter(path => !!path).map(path => this.fullPath(path));

        const tryLoad = (newPaths: string[], errors: Error[] = []): RequireExport => {
            const [ newPath, ...restPaths ] = newPaths;

            if (!newPath)
                return { type: 'fail', errors };

            try {
                const moduleExported = originalLoader(newPath, parent);  // require(newPath);
                return { type: 'success', moduleExports: moduleExported };

            } catch (e) {
                const res = tryLoad(restPaths, [ ...errors, e ]);

                if (res.type === 'success')
                    return res;

                return { type: 'fail', errors: res.errors };
            }
        };


        return tryLoad(newPaths);

        // throw new Error(`Overrided require could not find module ${filePath}`);
    }

    delete(filePath: string) {
        delete this._export.statics[ this.fullPath(filePath) ];
    }
}


export type Exports = { [ path: string ]: ReRequireObject<string>; };

export class Export {
    statics: Exports;
    callbacks: ReRequireObject<ReRequireModuleAcceptFunction>[];

    constructor() {
        this.init();
    }

    fromModule(from: string) {
        return new ExportContext(from, this);
    }

    init() {
        this.statics = {};
        this.callbacks = [];
    }
}
