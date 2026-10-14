import { createConfig } from './tsup-config.base';
import { neutralLibConfig } from './tsup-config.neutral.lib';

export default createConfig(neutralLibConfig, ({ previousConfig }) => ({
    ...previousConfig,
    platform: 'browser',
    bundle: false,
    splitting: false,
}));
