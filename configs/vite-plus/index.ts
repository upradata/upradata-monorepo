// import { defineConfig as defineViteConfig } from 'vite-plus';
import { defineConfig as defineViteConfig, type UserConfig } from 'vite-plus';

import { type ConfigReducer, type DefineConfigParams, reduceConfig } from './config-reducer.ts';
import { getTsDownConfigReducer, type TsDownConfigType } from './tsdown/tsdown-config.ts';
import { reduceTsdownConfig } from './tsdown/tsdown-reducer.ts';

// import packageJson from '../../../package.json' with { type: 'json' };

export type VitePlusConfig = Omit<UserConfig, 'pack'> & {
    tsdown?: TsDownConfigType;
};

export const defineConfig = (...configReducers: readonly ConfigReducer<VitePlusConfig, DefineConfigParams>[]) => {
    return defineViteConfig(configEnv => {
        // works only when vite-plus is called with "vp build --mode (production|development)"
        // but not when called with "vp package --mode (production|development)"
        // const isProduction = configEnv.mode === 'production';
        const isProduction = process.env.UPRADATA_PACK_MODE === 'production';

        const config = reduceConfig({
            configReducers: configReducers.map(
                configReducer => (previousConfig: UserConfig, params: DefineConfigParams) => {
                    const { tsdown, ...config } = configReducer(previousConfig, params);

                    if (tsdown) {
                        console.log(`tsdown config used: "${tsdown}"`);

                        return {
                            ...config,
                            pack: reduceTsdownConfig({
                                configReducers: getTsDownConfigReducer(tsdown),
                                configParams: params,
                            }),
                        };
                    }

                    return config;
                },
            ),
            configParams: {
                configEnv,
                isProduction,
            },
            initialValue: {} as UserConfig,
        });

        if (process.env.DEBUG_CONFIG === '1') {
            console.dir(config, { depth: null, colors: true });
        }

        return config;
    });
};
