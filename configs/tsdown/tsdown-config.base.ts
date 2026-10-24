import { defineConfig, type InlineConfig, type UserConfig, type ViteUserConfigFnObject } from 'vite-plus';

import packageJson from '../../package.json' with { type: 'json' };

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type RemoveArrayAndUndefined<T> = T extends any[] ? never : T extends undefined ? never : T;
type TsDownConfig = RemoveArrayAndUndefined<UserConfig['pack']>;

export type GetConfig = (opts: {
    cliOptions: InlineConfig;
    previousConfig: TsDownConfig;
    isProduction: boolean;
}) => TsDownConfig;

export const createConfig = (...getConfigs: GetConfig[]): ViteUserConfigFnObject => {
    const config = defineConfig(cliOptions => {
        //
        const isProduction = cliOptions.mode.toLowerCase() === 'production';

        const baseConfig = {
            entry: ['src/index.ts'],
            outDir: 'dist',
            format: isProduction ? ['esm', 'cjs'] : 'esm',
            unbundle: true,
            banner: `Upra-Data Library v${packageJson.version} | (c) 2024 Upra-Data | MIT License`,
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
            ...cliOptions,
        } satisfies TsDownConfig;

        const config = getConfigs.reduce((prevConfig, getConfig) => {
            return getConfig({
                cliOptions,
                previousConfig: prevConfig,
                isProduction,
            });
        }, baseConfig as TsDownConfig);

        console.log('--- COMPUTED TSUP CONFIG ---');
        console.log(JSON.stringify({ cliOptions, computedConfig: config }, null, 4));
        console.log('----------------------------');

        return { pack: config } satisfies UserConfig;
    });

    return config;
};
