// rollup.config.js
import typescript from 'rollup-plugin-typescript';

export default {
    output: {
        sourcemap: 'inline'
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
        'loglevel'
    ]
};
