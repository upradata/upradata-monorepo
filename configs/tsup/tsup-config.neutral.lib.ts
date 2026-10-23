import { createConfig, type GetConfig } from './tsup-config.base';

export const neutralLibConfig: GetConfig = ({ previousConfig }) => ({
    ...previousConfig,
    entry: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts', '!src/**/*.d.ts', '!src/@types/**/*.ts'],
    platform: 'neutral',
    bundle: false,
    splitting: false,
    declarationMap: true,
    // Force esbuild to keep the directory structure relative to the 'src' folder
    esbuildOptions(options) {
        options.outbase = './src';
    },
    dts: {
        compilerOptions: {
            declarationMap: true,
            ...(previousConfig.dts?.compilerOptions || {}),
        },
    },
});

export default createConfig(neutralLibConfig);
