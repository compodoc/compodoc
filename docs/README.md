# Compodoc architecture and operating

## Libraries used inside generate static HTML pages

- bootstrap native : 1.1.0
- d3 from d3-flextree : 3.x.x
- deep-iterator : 2.4.0
- es6-shim : 0.35.1
- EventDispatcher
- htmlparser : 2.0.0
- innersvg : 2.x.x
- prism : 1.9.0
- promise
- svg-pan-zoom : 3.5.2
- tablesort : 5.0.1
- vis : 4.18.1
- zepto : 1.2.0
- lunr : 2.1.5

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