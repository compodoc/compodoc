// rollup.config.js
import typescript from 'rollup-plugin-typescript';
import babel from 'rollup-plugin-babel';

export default {
    entry: './src/index-cli.ts',
    dest: 'dist/index-cli.js',
    format: 'cjs',
    plugins: [
        typescript({
            typescript: require('typescript')
        }),
        babel()
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
