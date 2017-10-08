// rollup.config.js
import typescript from 'rollup-plugin-typescript';
import * as ts from 'typescript';

export default {
    output: {
        sourcemap: 'inline'
    },
    plugins: [
        typescript({
            typescript: ts
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
        'shelljs',
        'typescript',
        'highlight.js'
    ]
}
