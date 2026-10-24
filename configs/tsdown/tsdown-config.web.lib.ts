import { createConfig } from './tsdown-config.base';
import { neutralLibConfig } from './tsdown-config.neutral.lib';

export default createConfig(neutralLibConfig, ({ previousConfig }) => ({
    ...previousConfig,
    platform: 'browser',
}));
