import { neutralLibConfigReducers } from './tsdown-config.neutral.lib.ts';
import { defineTsdownConfigReducers } from './tsdown-reducer.ts';

export const webLibConfigReducers = defineTsdownConfigReducers(...neutralLibConfigReducers, previousConfig => ({
    ...previousConfig,
    platform: 'browser',
}));
