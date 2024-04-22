# Compodoc architecture and operating

## Libraries used inside generate static HTML pages

### Libs not sync with npm

-   d3 from d3-flextree: 3.x.x
-   EventDispatcher
-   htmlparser: 2.0.0
-   innersvg: 2.x.x
-   prism: 1.29.0
-   promise
-   deep-iterator: 2.4.0

### Libs sync with npm

-   bootstrap native: 5.0.0
-   es6-shim: 0.35.1
-   svg-pan-zoom: 3.6.1
-   tablesort: 5.4.0
-   vis: 4.21.0
-   zepto: 1.2.0
-   lunr: 2.3.9

## Entry files

If you are using Compodoc in module mode with a JavaScript file, `require('@compodoc/compodoc')`, the first entry file is `src/index.ts`.

If you are using Compodoc with the CLI, the first entry file is `src/index-cli.ts`.

## Process

The process of Compodoc is:

-   handle CLI flags
-   find files to scan using `tsconfig.json` include and/or exclude options, or use the root folder of `tsconfig.json`
-   scan the files using TypeScript compiler
-   generate all the internal stuff
-   emit files for each category (modules, components, etc)
-   echo the result of the generation.

## Testing

Unit testing is done by running several documentation generation with many different files and projects.

E2E testing is done with SauceLabs service.

### Local unit testing

```shell
npm run test
```

### Local E2E

1. Install [selenium-standalone](https://www.npmjs.com/package/selenium-standalone):

    ```shell
    npm install selenium-standalone@latest -g
    ```

1. Configure `selenium-standalone`:
    
    ```shell
    selenium-standalone install
    ```

1. Start `selenium-standalone`:

    ```shell
    selenium-standalone start
    ```

1. Start local documentation generation in another terminal tab:

    ```shell
    npm run test:simple-doc
    ```

1. Start local E2E testing:
    
    ```shell
    npm run local-test-e2e-mocha
    ```

## Development setup

1. Install

    ```shell
    npm i
    ```

1. Init

    ```shell
    npm run build
    ```

1. Link

    ```shell
    npm link
    ```
    This will make `compodoc` command available everywhere.

1. Start

    ```shell
    npm start
    ```
    Launch watch process for source files and rollup build.

## Node.js inspecting

1. Install sleep package:

    ```shell
    npm i sleep
    ```

1. Add these lines in `index-cli.ts`, after `--files` check:

    ```JavaScript
    const sleep = require('sleep');
    const isInInspectMode = /--inspect/.test(process.execArgv.join(' '));
    if (isInInspectMode) {
        // wait 10 seconds for debugger to connect in Chrome devtools
        sleep.sleep(10);
    }
    ```

1. Open one terminal and run inside `compodoc` folder:

    ```shell
    npm run start
    ```

1. Add `debugger` statement where you want to debug your code.
1. Open Chrome and this url: `chrome://inspect`.
1. Open another terminal with the source code of the [demo project](https://github.com/compodoc/compodoc-demo-todomvc-angular), and run:

    ```shell
    node --inspect ../compodoc/bin/index-cli.js -p tsconfig.json -a screenshots -n 'TodoMVC Angular documentation' --includes additional-doc --toggleMenuItems "'all'" -s
    ```
1. Compodoc will wait 10s before starting when it detects `--inspect` flag.
1. Open the debug window in Chrome, and click `inspect`.
