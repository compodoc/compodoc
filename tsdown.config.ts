import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: {
        'index-cli': 'src/index-cli.ts',
        index: 'src/index.ts',
        'template-playground-server': 'src/template-playground/template-playground-server.ts'
    },
    format: ['cjs'],
    outDir: 'dist',
    sourcemap: 'inline',
    // Keep .js extension for CJS output — bin/index-cli.js and package.json
    // "main" field both resolve to dist/*.js.
    outExtensions: () => ({ js: '.js' }),
    // Externalize every package import — production deps are installed alongside
    // the CLI and should never be bundled. Node built-ins are auto-externalized.
    // Sub-path imports (e.g. neotraverse/legacy) are covered by the regex.
    deps: {
        neverBundle: [/^[^./]/]
    },
    dts: false,
    clean: true
});
