// rollup.config.js
import typescript from 'rollup-plugin-typescript';
import replace from 'rollup-plugin-replace';

export default {
    entry: './src/index.ts',
    dest: 'dist/index.js',
    format: 'cjs',
    plugins: [
        typescript({
            typescript: require('typescript')
        }),
        replace({
            PKG_PATH: '../package.json'
        })
    ]
}
