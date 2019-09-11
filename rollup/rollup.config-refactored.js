// rollup.config.js
import typescript from 'rollup-plugin-typescript2';

export default {
    output: {
        sourcemap: 'inline'
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
