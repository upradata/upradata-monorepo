import type { ConfigReducer, DefineConfigParams } from '../config-reducer.ts';

import type { TsDownConfig } from './tsdown-reducer';

// import packageJson from '../../../package.json' with { type: 'json' };

export const baseConfigReducer: ConfigReducer<TsDownConfig, DefineConfigParams> = (
    previousConfig,
    { isProduction },
) => ({
    ...previousConfig,
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: isProduction ? ['esm', 'cjs'] : 'esm',
    unbundle: true,
    banner: `/** (c) 2024 Upra-Data | MIT License */`, // Upra-Data Library v${packageJson.version}
    // dts: {
    //     compilerOptions: {
    //         ignoreDeprecations: '6.0',
    //     },
    // },
    sourcemap: true,
    dts: {
        sourcemap: true,
    },
    clean: true,
    minify: false,
    treeshake: isProduction,
    outputOptions: {
        keepNames: !isProduction,
    },
    define: {
        '__DEV__': String(!isProduction),
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    },
    ...previousConfig,
});
