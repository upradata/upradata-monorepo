import { neutralAppConfigReducers } from './tsdown-config.neutral.app.ts';
import { defineTsdownConfigReducers } from './tsdown-reducer.ts';

export const webAppConfigReducers = defineTsdownConfigReducers(...neutralAppConfigReducers, previousConfig => ({
    ...previousConfig,
    platform: 'browser',
}));
