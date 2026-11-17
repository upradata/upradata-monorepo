import { baseConfigReducer } from './tsdown-config.base.ts';
import { defineTsdownConfigReducers } from './tsdown-reducer.ts';

export const neutralAppConfigReducers = defineTsdownConfigReducers(
    baseConfigReducer,
    (previousConfig, { isProduction }) => ({
        ...previousConfig,
        entry: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts', '!src/**/*.d.ts', '!src/@types/**/*.ts'],
        platform: 'neutral',
        minify: isProduction,
        unbundle: false,
    }),
);
