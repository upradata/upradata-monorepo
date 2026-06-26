import { TT$ } from '@upradata/util';
// export type Service<BaseService = any> = BaseService | any;


/* export type ModuleServices<T = { [ k: string ]: any; }> = {
    [ key in keyof T ]: Service;
}; */

export type DefaultModuleServices<Service> = {
    [ serviceName: string ]: Service;
};

type PromisedValues<O> = { [ K in keyof O ]: TT$<O[ K ]> };
type UnpromisedValues<O> = { [ K in keyof O ]: Awaited<O[ K ]> };


export type ModuleServices<Service, Services extends Record<PropertyKey, Service> = DefaultModuleServices<Service>> = Services;

export type UnresolvedModuleServices<Services extends Record<PropertyKey, TT$<Service>>, Service = any> = PromisedValues<Services>;
export type ResolvedModuleServices<Services extends Record<PropertyKey, TT$<Service>>, Service = any> = UnpromisedValues<Services>;


export type ModulesServices<Modules extends Record<PropertyKey, ModuleServices<any>> = Record<string, DefaultModuleServices<any>>> = Modules;


export type LoadServices<C, M extends ModuleServices<any>> = (configuration?: C) => TT$<UnresolvedModuleServices<M>>;
/* M extends ModuleServices<any> ? {
    (configuration?: C): TT$<M>;
} : never; */


export interface LoadModuleServices<C, M extends ModuleServices<any>> {
    loadServices: LoadServices<C, M>;
}



export type ModuleServicesConfig<M extends ModuleServices<any> = ModuleServices<any>, C = any> = {
    // path?: string; => import(path) will not work with webpack. It does not know what is path during building
    module?: TT$<LoadModuleServices<C, M>>;
    lazyModule?: () => TT$<LoadModuleServices<C, M>>;
    config?: C;
};

/* M extends ModuleServices<any> ? {
    // path?: string; => import(path) will not work with webpack. It does not know what is path during building
    module?: TT$<LoadModuleServices<C, M>>;
    lazyModule?: () => TT$<LoadModuleServices<C, M>>;
    config?: C;
} : never;
 */


export type DefaultModulesOptions<Modules extends ModulesServices> = Partial<Record<keyof Modules, any>>;

export type ModulesServicesConfOptions<Modules extends ModulesServices, ModulesOptions extends DefaultModulesOptions<Modules>> = {
    [ moduleNames in keyof Modules & keyof ModulesOptions ]: ModuleServicesConfig<Modules[ string ], ModulesOptions[ moduleNames ]>
};


export class ModulesServicesConfiguration<
    Modules extends ModulesServices<{}>,
    ModulesConfOptions extends ModulesServicesConfOptions<Modules, any> = ModulesServicesConfOptions<Modules, any>
> {
    config: Partial<ModulesConfOptions> = {};
    windowGlobal: string;
    variable: object;
    include: Partial<Record<keyof Modules, boolean>>;
    exclude: Partial<Record<keyof Modules, boolean>>;
    dispatchEvents: boolean = true;
    beforeDispatchEvents: () => void = () => { };
    servicesLoadedEventName: string = '__services-loaded__';
    serviceLoadedEventName: (name: string) => string = name => `__services-loaded__/${name}`;
}


export type ModulesServicesConfig<
    Modules extends ModulesServices<{}>,
    ModulesOptions extends ModulesServicesConfOptions<Modules, any> = Record<keyof Modules, any>
> = Partial<ModulesServicesConfiguration<Modules, ModulesOptions>>;
