# Compodoc architecture and operating

## Libraries used inside generate static HTML pages

### Libs not sync with npm

-   d3 from d3-flextree : 3.x.x
-   EventDispatcher
-   htmlparser : 2.0.0
-   innersvg : 2.x.x
-   prism : 1.29.0
-   promise
-   deep-iterator : 2.4.0

### Libs sync with npm

-   bootstrap native : 5.0.0
-   es6-shim : 0.35.1
-   svg-pan-zoom : 3.6.1
-   tablesort : 5.4.0
-   vis : 4.21.0
-   zepto : 1.2.0
-   lunr : 2.3.9

## Entry files

If you are using Compodoc in module mode with a JavaScript file, require('@compodoc/compodoc'), the first entry file is `src/index.ts`.

If you are using Compodoc with the CLI, the first entry file is `src/index-cli.ts`.

## Process

The process of Compodoc is :

-   handle CLI flags
-   find files to scan using tsconfig.json include and/or exclude options, or use the root folder of tsconfig.json
-   scan the files using TypeScript compiler
-   generate all the internal stuff
-   emit files for each category (modules, components, etc)
-   echo the result of the generation.

## Testing

Unit testing is done by running severals documentation generation with many different files and projects.

E2E testing is done with saucelabs service.

### Local unit testing

> npm run test

### Local E2E

1. install selenium-standalone (https://www.npmjs.com/package/selenium-standalone)

> npm install selenium-standalone@latest -g

2. configure selenium-standalone

> selenium-standalone install

3. start selenium-standalone

> selenium-standalone start

4. start local documentation generation in another terminal tab

> npm run test:simple-doc

5. start local E2E testing

> npm run local-test-e2e-mocha

## Development setup

### Install

> npm i

### Init

> npm run build

### Link

> npm link

This will put compodoc command available everywhere.

### Start

> npm start

Launch watch process for source files and rollup build.

## Node.js inspecting

-   install sleep package `npm i sleep`
-   add these lines in index-cli.ts, atfer --files check

```
const sleep = require('sleep');
const isInInspectMode = /--inspect/.test(process.execArgv.join(' '));
if (isInInspectMode) {
    // wait 10 seconds for debugger to connect in Chrome devtools
    sleep.sleep(10);
}
```

-   open one terminal and run inside compodoc folder : `npm run start`
-   add `debugger`statement where you want to debug your code
-   open Chrome and this url : chrome://inspect
-   open another terminal with the source code of the [demo project](https://github.com/compodoc/compodoc-demo-todomvc-angular), and run `node --inspect ../compodoc/bin/index-cli.js -p tsconfig.json -a screenshots -n 'TodoMVC Angular documentation' --includes additional-doc --toggleMenuItems "'all'" -s`
-   Compodoc will wait 10s before starting when it detects --inspect flag
-   open the debug window in Chrome, and click `inspect`
