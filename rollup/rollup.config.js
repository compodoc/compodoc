// rollup.config.js
import typescript from 'rollup-plugin-typescript';

export default {
    input: {
        'index-cli': './src/index-cli.ts',
        index: './src/index.ts'
    },
    output: {
        sourcemap: 'inline',
        format: 'cjs',
        dir: 'dist'
    },
    plugins: [
        typescript({
            typescript: require('typescript')
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
        'ts-morph',
        'cosmiconfig'
    ]
};
