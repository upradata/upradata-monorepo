import { defineConfig } from 'tsup';

export default defineConfig({
    entry: [ 'src/index.ts' ],
    format: [ 'esm', 'cjs' ],
    sourcemap: true,
    dts: {
        compilerOptions: {
            ignoreDeprecations: '6.0'
        }
    },
    clean: true,
    outDir: 'dist'
});
