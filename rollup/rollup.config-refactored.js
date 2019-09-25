// rollup.config.js
import typescript from 'rollup-plugin-typescript2';

export default {
    input: {
        'index-cli': './src-refactored/index-cli.ts',
        index: './src-refactored/index.ts'
    },
    output: {
        sourcemap: 'inline',
        format: 'cjs',
        dir: 'dist'
    },
    plugins: [
        typescript({
            tsconfigDefaults: {
                compilerOptions: {
                    lib: ['es2018']
                }
            }
        })
    ],
    external: [
        'handlebars',
        'marked',
        'lodash',
        'path',
        'util',
        'fs-extra',
        'live-server',
        'typescript',
        'highlight.js',
        'semver',
        'json5',
        'ts-simple-ast',
        'i18next',
        'loglevel',
        'ts-morph'
    ]
};
