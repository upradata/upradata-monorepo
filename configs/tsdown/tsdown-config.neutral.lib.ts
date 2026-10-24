import { createConfig, type GetConfig } from './tsdown-config.base';

export const neutralLibConfig: GetConfig = ({ previousConfig }) => ({
    ...previousConfig,
    entry: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts', '!src/**/*.d.ts', '!src/@types/**/*.ts'],
    platform: 'neutral',
});

export default createConfig(neutralLibConfig);
