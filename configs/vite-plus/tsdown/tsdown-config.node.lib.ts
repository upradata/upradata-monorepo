import { neutralLibConfigReducers } from './tsdown-config.neutral.lib.ts';
import { defineTsdownConfigReducers } from './tsdown-reducer.ts';

export const nodeLibConfigReducers = defineTsdownConfigReducers(...neutralLibConfigReducers, previousConfig => ({
    ...previousConfig,
    platform: 'node',
}));
