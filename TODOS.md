# Todos

## TypeScript errors to fix

-   code-generator.ts - 80 lines
-   class-helper.ts - 1200 lines
-   component-helper.ts - 268 lines
-   js-doc-helper.ts - 40 lines
-   symbol-helper.ts - 261 lines
-   dependencies.engine.ts - 455 lines
-   jsdoc-parser.util.ts - 159 lines
-   router-parser.util.ts - 775 lines

## split files

-   angular-dependencies.ts - 1300 lines
-   application.ts - 2800 lines
-   router-parser.util.ts - 642 lines
-   class-helper.ts - 1200 lines

## Clean architecture refactoring

### main todos

[] - serve in a service
[] - coverage in a service
[] - process in application.ts linked sequentialy

### new splitted architecture

#### start phase

-   init flags
-   handle global actions : serve, generate, coverage
-   for serving : check folder and run
-   for coverage and generate : all the stuff

-   handle tsconfig
-   find files
-   init ts-morph with files
-   parse files AST
-   find doc informations
-   process informations : generate doc or coverage
