import type { UserConfig } from 'vite-plus/pack';

import {
    type ConfigReducer,
    type ConfigReducerParams,
    type DefineConfigParams,
    reduceConfig,
} from '../config-reducer.ts';

export type TsDownConfig = UserConfig;

export type TsDownConfigReducerParams = {
    configReducers: readonly ConfigReducer<TsDownConfig, DefineConfigParams>[];
    initialValue: TsDownConfig;
};

type ReduceTsDownConfigParams = Omit<ConfigReducerParams<TsDownConfig, DefineConfigParams>, 'initialValue'>;

export const reduceTsdownConfig = (params: ReduceTsDownConfigParams): TsDownConfig => {
    return reduceConfig({
        ...params,
        initialValue: {} as TsDownConfig,
    });
};

export const defineTsdownConfigReducers = (
    ...configReducers: readonly ConfigReducer<TsDownConfig, DefineConfigParams>[]
) => configReducers;
