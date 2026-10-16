import { defineConfig, type NormalizedOptions, type Options } from 'tsup';

type TsupConfig = Omit<Options, 'dts'> & {
    dts: NormalizedOptions['dts'];
};

export type GetConfig = (opts: {
    cliOptions: Options;
    previousConfig: TsupConfig;
    isProduction: boolean;
}) => TsupConfig;

export const createConfig = (...getConfigs: GetConfig[]): ReturnType<typeof defineConfig> => {
    const config = defineConfig(cliOptions => {
        //
        const isProduction = ['prod', 'production'].some(v => !cliOptions.env || cliOptions.env?.NODE_ENV === v);

        const baseConfig = {
            entry: ['src/index.ts'],
            outDir: 'dist',
            format: isProduction ? ['esm', 'cjs'] : 'esm',
            bundle: false,
            splitting: isProduction,
            dts: {
                compilerOptions: {
                    ignoreDeprecations: '6.0',
                },
            },
            sourcemap: true,
            clean: true,
            minify: false,
            treeshake: isProduction,
            keepNames: !isProduction,
            define: {
                __DEV__: String(!isProduction),
                'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
            },
            ...cliOptions,
        } satisfies Options;

        const config = getConfigs.reduce((prevConfig, getConfig) => {
            return getConfig({
                cliOptions,
                previousConfig: prevConfig,
                isProduction,
            });
        }, baseConfig as TsupConfig);

        console.log('--- COMPUTED TSUP CONFIG ---');
        console.log(JSON.stringify({ cliOptions, computedConfig: config }, null, 4));
        console.log('----------------------------');

        return config;
    });

    return config;
};
