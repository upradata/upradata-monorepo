import { AssignOptions, assignRecursive, delayedPromise, entries, fromEntries, isPromise, TT$ } from '@upradata/util';
import { dispatchCustomEvent } from '../custom-events';
import {
    DefaultModuleServices,
    LoadModuleServices,
    ModuleServices,
    ModuleServicesConfig,
    ModulesServices,
    ModulesServicesConfig,
    ModulesServicesConfiguration,
    ModulesServicesConfOptions,
    ResolvedModuleServices,
    UnresolvedModuleServices
} from './types';


// import { ReplaySubject, Observable } from 'rxjs'; // ====> A pity to add rxjs dependency. Promise is enough

type Services = any;

// const loaded$ = new ReplaySubject<Services>(1);

const servicesPromise = delayedPromise<Services>();
// new Promise<Services>((res, _rej) => resolve = res);

export const servicesLoaded$ = <Services>(): Promise<Services> => servicesPromise.promise;
// export const servicesObs$ = <Services>(): Observable<Services> => loaded$.asObservable();

type ServicesLoadedSuccess<S> = {
    name: string;
    services: DefaultModuleServices<S>;
    type: 'success';
};

type ServicesLoadedError = {
    name: string;
    error: Error;
    type: 'error';
};


export function loadServices<
    Modules extends ModulesServices<MServices>,
    Service = any,
    MServices extends ModuleServices<Service, {}> = ModuleServices<Service, {}>
>(
    modulesServicesConfig?: ModulesServicesConfig<UnresolvedModuleServices<Modules>>
): TT$<Partial<ResolvedModuleServices<Modules>>> {

    const modulesConfig: ModulesServicesConfiguration<Modules> = assignRecursive(
        new ModulesServicesConfiguration<Modules>(),
        modulesServicesConfig,
        new AssignOptions({ arrayMode: 'replace' })
    );


    const {
        windowGlobal, variable, include, exclude, dispatchEvents,
        servicesLoadedEventName, serviceLoadedEventName, beforeDispatchEvents
    } = modulesConfig;

    const services = {};

    const loadedServices: Array<TT$<ServicesLoadedSuccess<Service> | ServicesLoadedError>> = [];

    const addService = (name: string, config: any, module: TT$<LoadModuleServices<any, DefaultModuleServices<TT$<Service>>>>) => {

        const loaded = Promise.resolve(module).then(m => m.loadServices(config)).then(async services => {
            const resolvedServices = fromEntries<DefaultModuleServices<Service>>(await Promise.all(
                entries(services).map(async ([ key, service ]) => [ key, await service ]))
            );

            return { name, services: resolvedServices, type: 'success' as const };
        }).catch(err => ({ name, error: err instanceof Error ? err : new Error(`Could not load services in module`), type: 'error' as const }));

        loadedServices.push(loaded);
    };

    for (const [ name, serviceConfig ] of entries(modulesConfig.config as ModulesServicesConfOptions<Modules, any>)) {
        const sConfig = serviceConfig as ModuleServicesConfig;

        if (exclude && exclude[ name ])
            continue;

        if (!include || include[ name ]) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const module = (sConfig.module || sConfig.lazyModule?.());
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            addService(name as string, serviceConfig!.config, module! /* || import(serviceConfig.path) */);
        }
    }

    const handleServicesLoaded = (servicesLoaded: Array<ServicesLoadedSuccess<Service> | ServicesLoadedError>): Partial<ResolvedModuleServices<Modules>> => {
        for (const serviceLoaded of servicesLoaded) {
            if (serviceLoaded.type === 'error') {
                console.error(serviceLoaded.error);
            } else {
                const { name, services: s } = serviceLoaded;
                services[ name ] = s;

                if (dispatchEvents)
                    dispatchCustomEvent(serviceLoadedEventName(name), { detail: s });
            }
        }

        const variables = variable ? [ variable ] : [];

        if (windowGlobal) {
            // eslint-disable-next-line no-multi-assign
            const global = window[ windowGlobal ] = window[ windowGlobal ] || {} as any;
            global.services = global.services || {} as any;

            variables.push(global.services);
        }


        for (const variable of variables.filter(v => !!v)) {
            Object.assign(variable, services);
        }

        if (windowGlobal)
            window[ windowGlobal ].loaded = true;

        beforeDispatchEvents();

        if (dispatchEvents)
            dispatchCustomEvent(servicesLoadedEventName, { detail: services });

        servicesPromise.resolve(services);
        // loaded$.next(services);

        return services;
    };

    const returnPromise = loadedServices.some(isPromise);

    return returnPromise ? Promise.all(loadedServices).then(handleServicesLoaded) : handleServicesLoaded(loadedServices as ServicesLoadedSuccess<Service>[]);
}
