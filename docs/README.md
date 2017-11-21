# Compodoc architecture and operating

## Entry files

If you are using Compodoc in module mode with a JavaScript file, require('@compodoc/compodoc'), the first entry file is `src/index.ts`.

If you are using Compodoc with the CLI, the first entry file is `src/index-cli.ts`.

## Process

The process of Compodoc is :

- handle CLI flags
- find files to scan using tsconfig.json include and/or exclude options, or use the root folder of tsconfig.json
- scan the files using TypeScript compiler
- generate all the internal stuff
- emit files for each category (modules, components, etc)
- echo the result of the generation.
