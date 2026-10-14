import { createConfig } from './tsup-config.base';
import { neutralLibConfig } from './tsup-config.neutral.lib';

export default createConfig(neutralLibConfig, ({ previousConfig }) => ({
    ...previousConfig,
    platform: 'node',
    bundle: true,
    splitting: true,
}));
