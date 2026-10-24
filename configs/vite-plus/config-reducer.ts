import type { ConfigEnv } from 'vite-plus';

export type ConfigReducer<Result, Params = never> = (previous: Result, params: Params) => Result;

// export type ConfigReducer<Options, Result> = (...getConfigs: GetConfig<Options, Result>[]) => Result;

export type ConfigReducerParams<Result, Params = never> = {
    configReducers: readonly ConfigReducer<Result, Params>[];
    configParams?: Params;
    initialValue: Result;
};

export const reduceConfig = <Result, Params>({
    configReducers,
    initialValue,
    configParams,
}: ConfigReducerParams<Result, Params>): Result => {
    return configReducers.reduce((prevConfig, configReducer) => {
        return configReducer(prevConfig, configParams as Params);
    }, initialValue);
};

export type DefineConfigParams = {
    configEnv: ConfigEnv;
    isProduction: boolean;
};
