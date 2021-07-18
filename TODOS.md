# Todos

## Dependencies

-   pdfjs : move to modern version if Node.js > 14 | Optional chaining support
-   remove lodash, imported in 17 files : forEach, sortBy, cloneDeep, find, findIndex, map, filter, clone, includes, indexOf, groupBy, slice, flatMap, concat, uniq,

## TypeScript errors to fix

-   code-generator.ts - 80 lines
-   class-helper.ts - 1200 lines
-   component-helper.ts - 268 lines
-   js-doc-helper.ts - 40 lines
-   symbol-helper.ts - 261 lines
-   dependencies.engine.ts - 455 lines
-   jsdoc-parser.util.ts - 159 lines
-   router-parser.util.ts - 775 lines

## Split files

-   index-cli.ts - 910 lines
-   application.ts - 2800 lines
-   angular-dependencies.ts - 1300 lines
-   router-parser.util.ts - 642 lines
-   class-helper.ts - 1200 lines

## Clean architecture refactoring

### Main todos

[] - serve in a service
[] - coverage in a service
[] - process in application.ts linked sequentially

### New splitted architecture

Domain driven design + TDD refactoring

#### Start phase

-   [x] init flags
-   [x] init config
-   handle global actions : serve, generate, coverage
-   for serving : check folder and run

#### For coverage and generate phase

-   handle tsconfig
-   find files
-   init ts-morph with files
-   parse files AST
-   find doc informations
-   process informations : generate doc or coverage
