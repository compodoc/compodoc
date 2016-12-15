// rollup.config.js
import typescript from 'rollup-plugin-typescript';
import babel from 'rollup-plugin-babel';

export default {
    entry: './src/index.ts',
    dest: 'dist/index.js',
    format: 'cjs',
    plugins: [
        typescript({
            typescript: require('typescript')
        }),
        babel()
    ]
}
