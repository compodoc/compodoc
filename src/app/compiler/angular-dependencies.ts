import * as path from "path";

import * as _ from "lodash";
import { Project, ts, SyntaxKind } from "ts-morph";

import { IsKindType, kindToType } from "../../utils/kind-to-type";
import { logger } from "../../utils/logger";
import {
    cleanLifecycleHooksFromMethods,
    markedtags,
    mergeTagsAndArgs,
} from "../../utils/utils";
import ComponentsTreeEngine from "../engines/components-tree.engine";

import { FrameworkDependencies } from "./framework-dependencies";

import ImportsUtil from "../../utils/imports.util";

import {
    getModuleWithProviders,
    isCoverageIgnore,
    isIgnore,
    isModuleWithProviders,
    JsdocParserUtil,
} from "../../utils";

import ExtendsMerger from "../../utils/extends-merger.util";

import RouterParserUtil from "../../utils/router-parser.util";

import { CodeGenerator } from "./angular/code-generator";

import { ComponentDepFactory } from "./angular/deps/component-dep.factory";
import { ControllerDepFactory } from "./angular/deps/controller-dep.factory";
import { DirectiveDepFactory } from "./angular/deps/directive-dep.factory";
import { ComponentCache } from "./angular/deps/helpers/component-helper";
import { JsDocHelper } from "./angular/deps/helpers/js-doc-helper";
import { ModuleHelper } from "./angular/deps/helpers/module-helper";
import { SymbolHelper } from "./angular/deps/helpers/symbol-helper";
import { ModuleDepFactory } from "./angular/deps/module-dep.factory";
import { EntityDepFactory } from "./angular/deps/entity-dep.factory";

import Configuration from "../configuration";

import {
    IDep,
    IEnumDecDep,
    IFunctionDecDep,
    IInjectableDep,
    IInterfaceDep,
    IPipeDep,
    ITypeAliasDecDep,
} from "./angular/dependencies.interfaces";

import { v4 as uuidv4 } from "uuid";
import { getNodeDecorators, nodeHasDecorator } from "../../utils/node.util";
import { markedAcl } from "../../utils/marked.acl";

const crypto = require("crypto");
const project = new Project();

// TypeScript reference : https://github.com/Microsoft/TypeScript/blob/master/lib/typescript.d.ts

export class AngularDependencies extends FrameworkDependencies {
    private engine: any;
    private cache: ComponentCache = new ComponentCache();
    private moduleHelper = new ModuleHelper(this.cache);
    private jsDocHelper = new JsDocHelper();
    private symbolHelper = new SymbolHelper();
    private jsdocParserUtil = new JsdocParserUtil();
    private allowedSymbols: Set<string> = new Set<string>();
    private allowedFiles: Set<string> = new Set<string>();

    constructor(files: string[], options: any) {
        super(files, options);
        this.initializePublicApiFiltering();
    }

    /**
     * Initialize public API filtering if enabled
     */
    private initializePublicApiFiltering(): void {
        if (
            Configuration.mainData.publicApiOnly &&
            Configuration.mainData.publicApiExports.size > 0
        ) {
            logger.info("Public API filtering enabled");

            // Build set of allowed symbols and files
            for (const [symbolName, sourceFiles] of Configuration.mainData
                .publicApiExports) {
                this.allowedSymbols.add(symbolName);
                for (const sourceFile of sourceFiles) {
                    this.allowedFiles.add(path.resolve(sourceFile));
                }
            }

            logger.info(
                `Allowed ${this.allowedSymbols.size} public API symbol(s) from ${this.allowedFiles.size} file(s)`,
            );
        }
    }

    /**
     * Check if a symbol is part of the public API
     */
    private isSymbolAllowed(symbolName: string, fileName: string): boolean {
        // If public API filtering is not enabled, allow all symbols
        if (!Configuration.mainData.publicApiOnly) {
            return true;
        }

        // If no symbols are defined, allow all (fallback)
        if (this.allowedSymbols.size === 0) {
            return true;
        }

        const resolvedFileName = path.resolve(fileName);

        // Check if the symbol is explicitly allowed
        if (this.allowedSymbols.has(symbolName)) {
            // Verify the symbol is from an allowed file
            const allowedSourceFiles =
                Configuration.mainData.publicApiExports.get(symbolName);
            if (
                allowedSourceFiles &&
                allowedSourceFiles.has(resolvedFileName)
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if dependencies of an allowed symbol should be included
     */
    private isDependencyOfAllowedSymbol(
        symbolName: string,
        fileName: string,
    ): boolean {
        // If public API filtering is not enabled, allow all
        if (!Configuration.mainData.publicApiOnly) {
            return true;
        }

        // Check if the file contains any allowed symbols
        const resolvedFileName = path.resolve(fileName);
        return this.allowedFiles.has(resolvedFileName);
    }

    public getDependencies() {
        let deps = {
            aliases: {},
            modules: [],
            modulesForGraph: [],
            components: [],
            controllers: [],
            entities: [],
            injectables: [],
            interceptors: [],
            guards: [],
            pipes: [],
            directives: [],
            routes: [],
            classes: [],
            interfaces: [],
            typescriptImports: [],
            miscellaneous: {
                variables: [],
                functions: [],
                typealiases: [],
                enumerations: [],
            },
            routesTree: undefined,
        };

        const sourceFiles = this.program.getSourceFiles() || [];

        RouterParserUtil.scannedFiles = sourceFiles;

        sourceFiles.map((file: ts.SourceFile) => {
            const filePath = file.fileName;

            if (
                path.extname(filePath) === ".ts" ||
                path.extname(filePath) === ".tsx"
            ) {
                if (
                    !Configuration.mainData.angularJSProject &&
                    path.extname(filePath) === ".js"
                ) {
                    logger.info("parsing", filePath);
                    this.getSourceFileDecorators(file, deps);
                } else {
                    if (
                        filePath.lastIndexOf(".d.ts") === -1 &&
                        filePath.lastIndexOf("spec.ts") === -1
                    ) {
                        logger.info("parsing", filePath);
                        this.getTypescriptExportsAliases(file, deps);
                        this.getTypescriptImportsAliases(file, deps);
                        this.getSourceFileDecorators(file, deps);
                    }
                }
            }

            return deps;
        });

        // End of file scanning
        // Try merging inside the same file declarated variables & modules with imports | exports | declarations | providers

        if (deps.miscellaneous.variables.length > 0) {
            // Detect variable names that appear in more than one source file.
            // When a collision exists we must scope the substitution to the declaring file
            // to avoid replacing a same-named variable in an unrelated module.
            const variableFilesByName = new Map<string, Set<string>>();
            deps.miscellaneous.variables.forEach((v) => {
                if (!variableFilesByName.has(v.name)) {
                    variableFilesByName.set(v.name, new Set());
                }
                variableFilesByName.get(v.name).add(v.file);
            });

            deps.miscellaneous.variables.forEach((_variable) => {
                let newVar = [];

                // link ...VAR to VAR values, recursively
                ((_var, _newVar) => {
                    // getType pr reconstruire....
                    const elementsMatcher = (variabelToReplace) => {
                        if (variabelToReplace.initializer) {
                            if (variabelToReplace.initializer.elements) {
                                if (
                                    variabelToReplace.initializer.elements
                                        .length > 0
                                ) {
                                    variabelToReplace.initializer.elements.forEach(
                                        (element) => {
                                            // Direct value -> Kind 79
                                            if (
                                                element.text &&
                                                element.kind ===
                                                    SyntaxKind.Identifier
                                            ) {
                                                newVar.push({
                                                    name: element.text,
                                                    type: this.symbolHelper.getType(
                                                        element.text,
                                                    ),
                                                });
                                            }
                                            // if _variable is ArrayLiteralExpression 203
                                            // and has SpreadElements in his elements
                                            // merge them
                                            if (
                                                element.kind ===
                                                    SyntaxKind.SpreadElement &&
                                                element.expression
                                            ) {
                                                const el =
                                                    deps.miscellaneous.variables.find(
                                                        (variable) =>
                                                            variable.name ===
                                                                element
                                                                    .expression
                                                                    .text &&
                                                            variable.file ===
                                                                _variable.file,
                                                    );
                                                if (el) {
                                                    elementsMatcher(el);
                                                }
                                            }
                                        },
                                    );
                                }
                            }
                        }
                    };
                    elementsMatcher(_var);
                })(_variable, newVar);

                const onLink = (mod) => {
                    // When the same variable name is declared in multiple source files,
                    // restrict substitution to the module that lives in the same file.
                    // This prevents cross-file contamination while still allowing the
                    // common pattern of importing an array from a separate barrel file.
                    const nameHasCollision =
                        (variableFilesByName.get(_variable.name)?.size ?? 0) >
                        1;
                    if (nameHasCollision && mod.file !== _variable.file) {
                        return;
                    }
                    const process = (initialArray, _var) => {
                        let indexToClean = 0;
                        let found = false;
                        const findVariableInArray = (el, index) => {
                            if (el.name === _var.name) {
                                indexToClean = index;
                                found = true;
                            }
                        };
                        initialArray.forEach(findVariableInArray);
                        // Clean indexes to replace
                        if (found) {
                            initialArray.splice(indexToClean, 1);
                            // Add variable
                            newVar.forEach((newEle) => {
                                if (
                                    typeof _.find(initialArray, {
                                        name: newEle.name,
                                    }) === "undefined"
                                ) {
                                    initialArray.push(newEle);
                                }
                            });
                        }
                    };
                    process(mod.imports, _variable);
                    process(mod.exports, _variable);
                    process(mod.controllers, _variable);
                    process(mod.declarations, _variable);
                    process(mod.providers, _variable);
                };

                deps.modules.forEach(onLink);
                deps.modulesForGraph.forEach(onLink);
            });
        }

        /**
         * If one thing extends another, merge them, only for internal sources
         * - classes
         * - components
         * - injectables
         * - directives
         * for
         * - inputs
         * - outputs
         * - properties
         * - methods
         */
        deps = ExtendsMerger.merge(deps);

        // RouterParserUtil.printModulesRoutes();
        // RouterParserUtil.printRoutes();

        if (!Configuration.mainData.disableRoutesGraph) {
            RouterParserUtil.linkModulesAndRoutes();
            RouterParserUtil.constructModulesTree();

            deps.routesTree = RouterParserUtil.constructRoutesTree();
        }

        return deps;
    }

    private processClass(
        node,
        file,
        srcFile,
        outputSymbols,
        fileBody,
        astFile,
    ) {
        const name = this.getSymboleName(node);
        const IO = this.getClassIO(file, srcFile, node, fileBody, astFile);
        const sourceCode = srcFile.getText();
        const hash = crypto
            .createHash("sha512")
            .update(sourceCode)
            .digest("hex");
        const deps: any = {
            name,
            id: "class-" + name + "-" + hash,
            file: file,
            coverageIgnore: !!IO.coverageIgnore,
            deprecated: IO.deprecated,
            deprecationMessage: IO.deprecationMessage,
            type: "class",
            sourceCode: srcFile.getText(),
        };
        let excludeFromClassArray = false;

        if (IO.constructor && !Configuration.mainData.disableConstructors) {
            deps.constructorObj = IO.constructor;
        }
        deps.inputsClass = IO.inputs ?? [];
        deps.outputsClass = IO.outputs ?? [];
        if (IO.properties) {
            const { inputSignals, outputSignals, properties } =
                this.componentHelper.getInputOutputSignals(IO.properties);

            deps.inputsClass = deps.inputsClass.concat(inputSignals);
            deps.outputsClass = deps.outputsClass.concat(outputSignals);
            deps.properties = properties;
        }
        if (IO.description) {
            deps.description = IO.description;
        }
        if (IO.rawdescription) {
            deps.rawdescription = IO.rawdescription;
        }
        if (IO.methods) {
            deps.methods = IO.methods;
        }
        if (IO.indexSignatures) {
            deps.indexSignatures = IO.indexSignatures;
        }
        if (IO.extends) {
            deps.extends = IO.extends;
        }
        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
            deps.jsdoctags = IO.jsdoctags[0].tags;
        }
        if (IO.accessors) {
            deps.accessors = IO.accessors;
        }

        if (IO.hostBindings) {
            deps.hostBindings = IO.hostBindings;
        }
        if (IO.hostListeners) {
            deps.hostListeners = IO.hostListeners;
        }
        if (Configuration.mainData.disableLifeCycleHooks) {
            deps.methods = cleanLifecycleHooksFromMethods(deps.methods);
        }
        if (IO.implements && IO.implements.length > 0) {
            deps.implements = IO.implements;

            if (this.isGuard(IO.implements)) {
                // We don't want the Guard to show up in the Classes menu
                excludeFromClassArray = true;
                deps.type = "guard";

                outputSymbols.guards.push(deps);
            }
        }
        if (typeof IO.ignore === "undefined") {
            this.debug(deps);

            if (!excludeFromClassArray) {
                outputSymbols.classes.push(deps);
            }
        } else {
            this.ignore(deps);
        }
    }

    private getTypescriptImportsAliases(
        initialSrcFile: ts.SourceFile,
        outputSymbols: any,
    ): void {
        const astFile =
            typeof project.getSourceFile(initialSrcFile.fileName) !==
            "undefined"
                ? project.getSourceFile(initialSrcFile.fileName)
                : project.addSourceFileAtPath(initialSrcFile.fileName);

        if (astFile) {
            const importDeclarations = astFile.getImportDeclarations();
            if (importDeclarations && importDeclarations.length > 0) {
                importDeclarations.forEach((importDeclaration) => {
                    const namedImports = importDeclaration.getNamedImports();
                    if (namedImports && namedImports.length > 0) {
                        namedImports.forEach((namedImport) => {
                            if (namedImport.getAliasNode()) {
                                if (
                                    outputSymbols.aliases.hasOwnProperty(
                                        namedImport.getName(),
                                    )
                                ) {
                                    outputSymbols.aliases[
                                        namedImport.getName()
                                    ].push(
                                        namedImport.getAliasNode().getText(),
                                    );
                                } else {
                                    outputSymbols.aliases[
                                        namedImport.getName()
                                    ] = [namedImport.getAliasNode().getText()];
                                }
                            }
                        });
                    }
                });
            }
        }
    }

    private getTypescriptExportsAliases(
        initialSrcFile: ts.SourceFile,
        outputSymbols: any,
    ): void {
        const astFile =
            typeof project.getSourceFile(initialSrcFile.fileName) !==
            "undefined"
                ? project.getSourceFile(initialSrcFile.fileName)
                : project.addSourceFileAtPath(initialSrcFile.fileName);

        if (astFile) {
            const exportDeclarations = astFile.getExportDeclarations();
            if (exportDeclarations && exportDeclarations.length > 0) {
                exportDeclarations.forEach((exportDeclaration) => {
                    const hasNamedExports = exportDeclaration.hasNamedExports();
                    if (hasNamedExports) {
                        const namedExports =
                            exportDeclaration.getNamedExports();
                        if (namedExports && namedExports.length > 0) {
                            namedExports.forEach((namedExport) => {
                                if (namedExport.getAliasNode()) {
                                    if (
                                        outputSymbols.aliases.hasOwnProperty(
                                            namedExport.getName(),
                                        )
                                    ) {
                                        outputSymbols.aliases[
                                            namedExport.getName()
                                        ].push(
                                            namedExport
                                                .getAliasNode()
                                                .getText(),
                                        );
                                    } else {
                                        outputSymbols.aliases[
                                            namedExport.getName()
                                        ] = [
                                            namedExport
                                                .getAliasNode()
                                                .getText(),
                                        ];
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    }

    private getSourceFileDecorators(
        initialSrcFile: ts.SourceFile,
        outputSymbols: any,
    ): void {
        const cleaner = (process.cwd() + path.sep).replace(/\\/g, "/");
        const fileName = initialSrcFile.fileName.replace(cleaner, "");
        let scannedFile = initialSrcFile;

        // Search in file for variable statement as routes definitions

        let astFile =
            typeof project.getSourceFile(initialSrcFile.fileName) !==
            "undefined"
                ? project.getSourceFile(initialSrcFile.fileName)
                : project.addSourceFileAtPath(initialSrcFile.fileName);

        const variableRoutesStatements = astFile.getVariableStatements();
        let hasRoutesStatements = false;

        if (variableRoutesStatements.length > 0) {
            // Clean file for spread and dynamics inside routes definitions
            variableRoutesStatements.forEach((s) => {
                const variableDeclarations = s.getDeclarations();
                let len = variableDeclarations.length;
                let i = 0;
                for (i; i < len; i++) {
                    if (variableDeclarations[i].compilerNode.type) {
                        if (
                            variableDeclarations[i].compilerNode.type
                                .typeName &&
                            variableDeclarations[i].compilerNode.type.typeName
                                .text === "Routes"
                        ) {
                            hasRoutesStatements = true;
                        }
                    }
                }
            });
        }

        if (hasRoutesStatements && !Configuration.mainData.disableRoutesGraph) {
            // Clean file for spread and dynamics inside routes definitions
            logger.info(
                "Analysing routes definitions and clean them if necessary",
            );

            // scannedFile = RouterParserUtil.cleanFileIdentifiers(astFile).compilerNode;
            RouterParserUtil.cleanFileSpreads(astFile);

            astFile = RouterParserUtil.cleanCallExpressions(astFile);
            scannedFile =
                RouterParserUtil.cleanFileDynamics(astFile).compilerNode;

            scannedFile.kind = SyntaxKind.SourceFile;
        }

        ts.forEachChild(scannedFile, (initialNode: ts.Node) => {
            if (
                this.jsDocHelper.hasJSDocInternalTag(
                    fileName,
                    scannedFile,
                    initialNode,
                ) &&
                Configuration.mainData.disableInternal
            ) {
                return;
            }
            const parseNode = (file, srcFile, node, fileBody, astFile) => {
                const sourceCode = srcFile.getText();
                const hash = crypto
                    .createHash("sha512")
                    .update(sourceCode)
                    .digest("hex");

                if (nodeHasDecorator(node)) {
                    let classWithCustomDecorator = false;
                    const nodeDecorators = getNodeDecorators(node);
                    const visitDecorator = (visitedDecorator, index) => {
                        let deps: IDep;

                        const name = this.getSymboleName(node);

                        // Check if this decorated class is allowed by public API filter
                        if (!this.isSymbolAllowed(name, file)) {
                            logger.debug(
                                `Skipping decorated class ${name} (not in public API)`,
                            );
                            return;
                        }

                        const props = this.findProperties(
                            visitedDecorator,
                            srcFile,
                        );
                        const IO = this.componentHelper.getComponentIO(
                            file,
                            srcFile,
                            node,
                            fileBody,
                            astFile,
                        );

                        if (this.isModule(visitedDecorator)) {
                            const moduleDep = new ModuleDepFactory(
                                this.moduleHelper,
                            ).create(file, srcFile, name, props, IO);
                            if (
                                RouterParserUtil.hasRouterModuleInImports(
                                    moduleDep.imports,
                                )
                            ) {
                                RouterParserUtil.addModuleWithRoutes(
                                    name,
                                    this.moduleHelper.getModuleImportsRaw(
                                        props,
                                        srcFile,
                                    ),
                                    file,
                                );
                            }
                            deps = moduleDep;
                            if (typeof IO.ignore === "undefined") {
                                RouterParserUtil.addModule(
                                    name,
                                    moduleDep.imports,
                                );
                                outputSymbols.modules.push(moduleDep);
                                outputSymbols.modulesForGraph.push(moduleDep);
                            }
                        } else if (this.isComponent(visitedDecorator)) {
                            if (props.length === 0) {
                                return;
                            }
                            const componentDep = new ComponentDepFactory(
                                this.componentHelper,
                            ).create(file, srcFile, name, props, IO);
                            deps = componentDep;
                            if (typeof IO.ignore === "undefined") {
                                ComponentsTreeEngine.addComponent(componentDep);
                                outputSymbols.components.push(componentDep);
                            }
                        } else if (this.isController(visitedDecorator)) {
                            const controllerDep =
                                new ControllerDepFactory().create(
                                    file,
                                    srcFile,
                                    name,
                                    props,
                                    IO,
                                );
                            deps = controllerDep;
                            if (typeof IO.ignore === "undefined") {
                                outputSymbols.controllers.push(controllerDep);
                            }
                        } else if (this.isEntity(visitedDecorator)) {
                            const entityDep = new EntityDepFactory().create(
                                file,
                                srcFile,
                                name,
                                props,
                                IO,
                            );
                            deps = entityDep;

                            if (typeof IO.ignore === "undefined") {
                                outputSymbols.entities.push(entityDep);
                            }
                        } else if (this.isInjectable(visitedDecorator)) {
                            const injectableDeps: IInjectableDep = {
                                name,
                                id: "injectable-" + name + "-" + hash,
                                file: file,
                                coverageIgnore: !!IO.coverageIgnore,
                                properties: IO.properties,
                                methods: IO.methods,
                                deprecated: IO.deprecated,
                                deprecationMessage: IO.deprecationMessage,
                                description: IO.description,
                                rawdescription: IO.rawdescription,
                                sourceCode: srcFile.getText(),
                                exampleUrls:
                                    this.componentHelper.getComponentExampleUrls(
                                        srcFile.getText(),
                                    ),
                            };
                            if (
                                IO.constructor &&
                                !Configuration.mainData.disableConstructors
                            ) {
                                injectableDeps.constructorObj = IO.constructor;
                            }
                            if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                                injectableDeps.jsdoctags = IO.jsdoctags[0].tags;
                            }
                            if (IO.accessors) {
                                injectableDeps.accessors = IO.accessors;
                            }
                            if (IO.extends) {
                                injectableDeps.extends = IO.extends;
                            }
                            const providedInRaw = this.symbolHelper.getSymbolDepsRaw(
                                props,
                                'providedIn',
                            );
                            if (providedInRaw.length > 0) {
                                const rawNode = providedInRaw[0] as ts.PropertyAssignment;
                                if (rawNode && rawNode.initializer) {
                                    injectableDeps.providedIn = ts.isStringLiteral(rawNode.initializer)
                                        ? rawNode.initializer.text
                                        : rawNode.initializer.getText(srcFile);
                                }
                            }
                            if (Configuration.mainData.disableLifeCycleHooks) {
                                injectableDeps.methods =
                                    cleanLifecycleHooksFromMethods(
                                        injectableDeps.methods,
                                    );
                            }
                            deps = injectableDeps;
                            if (typeof IO.ignore === "undefined") {
                                if (
                                    _.includes(IO.implements, "HttpInterceptor")
                                ) {
                                    injectableDeps.type = "interceptor";
                                    outputSymbols.interceptors.push(
                                        injectableDeps,
                                    );
                                } else if (this.isGuard(IO.implements)) {
                                    injectableDeps.type = "guard";
                                    outputSymbols.guards.push(injectableDeps);
                                } else {
                                    injectableDeps.type = "injectable";
                                    this.addNewEntityInStore(
                                        injectableDeps,
                                        outputSymbols.injectables,
                                    );
                                }
                            }
                        } else if (this.isPipe(visitedDecorator)) {
                            const pipeDeps: IPipeDep = {
                                name,
                                id: "pipe-" + name + "-" + hash,
                                file: file,
                                type: "pipe",
                                coverageIgnore: !!IO.coverageIgnore,
                                deprecated: IO.deprecated,
                                deprecationMessage: IO.deprecationMessage,
                                description: IO.description,
                                rawdescription: IO.rawdescription,
                                properties: IO.properties,
                                methods: IO.methods,
                                standalone:
                                    this.componentHelper.getComponentStandalone(
                                        props,
                                        srcFile,
                                    )
                                        ? true
                                        : false,
                                pure: this.componentHelper.getComponentPure(
                                    props,
                                    srcFile,
                                ),
                                ngname: this.componentHelper.getComponentName(
                                    props,
                                    srcFile,
                                ),
                                sourceCode: srcFile.getText(),
                                exampleUrls:
                                    this.componentHelper.getComponentExampleUrls(
                                        srcFile.getText(),
                                    ),
                            };
                            if (Configuration.mainData.disableLifeCycleHooks) {
                                pipeDeps.methods =
                                    cleanLifecycleHooksFromMethods(
                                        pipeDeps.methods,
                                    );
                            }
                            if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                                pipeDeps.jsdoctags = IO.jsdoctags[0].tags;
                            }
                            deps = pipeDeps;
                            if (typeof IO.ignore === "undefined") {
                                outputSymbols.pipes.push(pipeDeps);
                            }
                        } else if (this.isDirective(visitedDecorator)) {
                            const directiveDeps = new DirectiveDepFactory(
                                this.componentHelper,
                            ).create(file, srcFile, name, props, IO);
                            deps = directiveDeps;
                            if (typeof IO.ignore === "undefined") {
                                outputSymbols.directives.push(directiveDeps);
                            }
                        } else {
                            const hasMultipleDecoratorsWithInternalOne =
                                this.hasInternalDecorator(nodeDecorators);
                            // Just a class
                            if (
                                !classWithCustomDecorator &&
                                !hasMultipleDecoratorsWithInternalOne
                            ) {
                                classWithCustomDecorator = true;
                                this.processClass(
                                    node,
                                    file,
                                    srcFile,
                                    outputSymbols,
                                    fileBody,
                                );
                            }
                        }
                        this.cache.set(name, deps);

                        if (typeof IO.ignore === "undefined") {
                            this.debug(deps);
                        } else {
                            this.ignore(deps);
                        }
                    };

                    const filterByDecorators = (filteredNode) => {
                        if (
                            filteredNode.expression &&
                            filteredNode.expression.expression
                        ) {
                            let _test =
                                /(NgModule|Component|Injectable|Pipe|Directive)/.test(
                                    filteredNode.expression.expression.text,
                                );
                            if (!_test && ts.isClassDeclaration(node)) {
                                _test = true;
                            }
                            return _test;
                        }
                        if (ts.isClassDeclaration(node)) {
                            return true;
                        }
                        return false;
                    };

                    nodeDecorators
                        .filter(filterByDecorators)
                        .forEach(visitDecorator);
                } else if (node.symbol) {
                    if (node.symbol.flags === ts.SymbolFlags.Class) {
                        // Check if class is allowed by public API filter
                        const className = this.getSymboleName(node);
                        if (!this.isSymbolAllowed(className, file)) {
                            logger.debug(
                                `Skipping class ${className} (not in public API)`,
                            );
                            return;
                        }
                        this.processClass(
                            node,
                            file,
                            srcFile,
                            outputSymbols,
                            fileBody,
                            astFile,
                        );
                    } else if (node.symbol.flags === ts.SymbolFlags.Interface) {
                        const name = this.getSymboleName(node);

                        // Check if interface is allowed by public API filter
                        if (!this.isSymbolAllowed(name, file)) {
                            logger.debug(
                                `Skipping interface ${name} (not in public API)`,
                            );
                            return;
                        }

                        const IO = this.getInterfaceIO(
                            file,
                            srcFile,
                            node,
                            fileBody,
                            astFile,
                        );
                        const interfaceDeps: IInterfaceDep = {
                            name,
                            id: "interface-" + name + "-" + hash,
                            file: file,
                            deprecated: IO.deprecated,
                            deprecationMessage: IO.deprecationMessage,
                            type: "interface",
                            sourceCode: srcFile.getText(),
                        };
                        if (IO.properties) {
                            interfaceDeps.properties = IO.properties;
                        }
                        if (IO.indexSignatures) {
                            interfaceDeps.indexSignatures = IO.indexSignatures;
                        }
                        if (IO.kind) {
                            interfaceDeps.kind = IO.kind;
                        }
                        if (IO.description) {
                            interfaceDeps.description = IO.description;
                            interfaceDeps.rawdescription = IO.rawdescription;
                        }
                        if (IO.methods) {
                            interfaceDeps.methods = IO.methods;
                        }
                        if (IO.extends) {
                            interfaceDeps.extends = IO.extends;
                        }
                        if (typeof IO.ignore === "undefined") {
                            this.debug(interfaceDeps);
                            outputSymbols.interfaces.push(interfaceDeps);
                        } else {
                            this.ignore(interfaceDeps);
                        }
                    } else if (ts.isFunctionDeclaration(node)) {
                        const infos = this.visitFunctionDeclaration(node);
                        const name = infos.name;

                        // Check if function is allowed by public API filter
                        if (!this.isSymbolAllowed(name, file)) {
                            logger.debug(
                                `Skipping function ${name} (not in public API)`,
                            );
                            return;
                        }

                        const deprecated = infos.deprecated;
                        const deprecationMessage = infos.deprecationMessage;
                        const functionDep: IFunctionDecDep = {
                            name,
                            file: file,
                            ctype: "miscellaneous",
                            subtype: "function",
                            coverageIgnore: isCoverageIgnore(node),
                            deprecated,
                            deprecationMessage,
                            rawdescription:
                                this.visitEnumTypeAliasFunctionDeclarationRawDescription(
                                    node,
                                ),
                            description:
                                this.visitEnumTypeAliasFunctionDeclarationDescription(
                                    node,
                                ),
                        };
                        if (infos.args) {
                            functionDep.args = infos.args;
                        }
                        if (infos.returnType) {
                            functionDep.returnType = infos.returnType;
                        }
                        if (infos.jsdoctags && infos.jsdoctags.length > 0) {
                            functionDep.jsdoctags = infos.jsdoctags;
                        }
                        if (typeof infos.ignore === "undefined") {
                            if (
                                !(
                                    this.hasPrivateJSDocTag(
                                        functionDep.jsdoctags,
                                    ) && Configuration.mainData.disablePrivate
                                )
                            ) {
                                this.debug(functionDep);
                                outputSymbols.miscellaneous.functions.push(
                                    functionDep,
                                );
                            }
                        }
                    } else if (ts.isEnumDeclaration(node)) {
                        const infos = this.visitEnumDeclaration(node);
                        const name = infos.name;

                        // Check if enum is allowed by public API filter
                        if (!this.isSymbolAllowed(name, file)) {
                            logger.debug(
                                `Skipping enum ${name} (not in public API)`,
                            );
                            return;
                        }

                        const deprecated = infos.deprecated;
                        const deprecationMessage = infos.deprecationMessage;
                        const enumDeps: IEnumDecDep = {
                            name,
                            childs: infos.members,
                            ctype: "miscellaneous",
                            subtype: "enum",
                            deprecated,
                            deprecationMessage,
                            rawdescription:
                                this.visitEnumTypeAliasFunctionDeclarationRawDescription(
                                    node,
                                ),
                            description:
                                this.visitEnumTypeAliasFunctionDeclarationDescription(
                                    node,
                                ),
                            file: file,
                        };

                        if (!isIgnore(node)) {
                            this.debug(enumDeps);
                            outputSymbols.miscellaneous.enumerations.push(
                                enumDeps,
                            );
                        }
                    } else if (ts.isTypeAliasDeclaration(node)) {
                        const infos = this.visitTypeDeclaration(node);
                        const name = infos.name;

                        // Check if type alias is allowed by public API filter
                        if (!this.isSymbolAllowed(name, file)) {
                            logger.debug(
                                `Skipping type alias ${name} (not in public API)`,
                            );
                            return;
                        }

                        const deprecated = infos.deprecated;
                        const deprecationMessage = infos.deprecationMessage;
                        const typeAliasDeps: ITypeAliasDecDep = {
                            name,
                            ctype: "miscellaneous",
                            subtype: "typealias",
                            coverageIgnore: isCoverageIgnore(node),
                            rawtype: this.classHelper.visitType(node),
                            file: file,
                            deprecated,
                            deprecationMessage,
                            rawdescription:
                                this.visitEnumTypeAliasFunctionDeclarationRawDescription(
                                    node,
                                ),
                            description:
                                this.visitEnumTypeAliasFunctionDeclarationDescription(
                                    node,
                                ),
                        };
                        if (node.type) {
                            typeAliasDeps.kind = node.type.kind;
                            if (typeAliasDeps.rawtype === "") {
                                typeAliasDeps.rawtype =
                                    this.classHelper.visitType(node);
                            }
                        }

                        if (
                            typeAliasDeps.kind &&
                            typeAliasDeps.kind ===
                                SyntaxKind.TemplateLiteralType &&
                            node.type
                        ) {
                            typeAliasDeps.rawtype = srcFile.text.substring(
                                node.type.pos,
                                node.type.end,
                            );
                        }

                        if (!isIgnore(node)) {
                            outputSymbols.miscellaneous.typealiases.push(
                                typeAliasDeps,
                            );
                        }

                        if (typeof infos.ignore === "undefined") {
                            this.debug(typeAliasDeps);
                        }
                    } else if (ts.isModuleDeclaration(node)) {
                        if (node.body) {
                            if (
                                node.body.statements &&
                                node.body.statements.length > 0
                            ) {
                                node.body.statements.forEach((statement) =>
                                    parseNode(
                                        file,
                                        srcFile,
                                        statement,
                                        node.body,
                                        astFile,
                                    ),
                                );
                            }
                        }
                    }
                } else {
                    const IO = this.getRouteIO(file, srcFile, node);
                    if (IO.routes) {
                        let newRoutes;
                        try {
                            newRoutes = RouterParserUtil.cleanRawRouteParsed(
                                IO.routes,
                            );
                        } catch (e) {
                            // tslint:disable-next-line:max-line-length
                            logger.error(
                                "Routes parsing error, maybe a trailing comma or an external variable, trying to fix that later after sources scanning.",
                            );
                            newRoutes = IO.routes.replace(/ /gm, "");
                            RouterParserUtil.addIncompleteRoute({
                                data: newRoutes,
                                file: file,
                            });
                            return true;
                        }
                        outputSymbols.routes = [
                            ...outputSymbols.routes,
                            ...newRoutes,
                        ];
                    }
                    if (ts.isClassDeclaration(node)) {
                        this.processClass(
                            node,
                            file,
                            srcFile,
                            outputSymbols,
                            fileBody,
                        );
                    }
                    if (
                        ts.isExpressionStatement(node) ||
                        ts.isIfStatement(node)
                    ) {
                        const bootstrapModuleReference = "bootstrapModule";
                        // Find the root module with bootstrapModule call
                        // 1. find a simple call : platformBrowserDynamic().bootstrapModule(AppModule);
                        // 2. or inside a call :
                        // () => {
                        //     platformBrowserDynamic().bootstrapModule(AppModule);
                        // });
                        // 3. with a catch : platformBrowserDynamic().bootstrapModule(AppModule).catch(error => console.error(error));
                        // 4. with parameters : platformBrowserDynamic().bootstrapModule(AppModule, {}).catch(error => console.error(error));
                        // Find recusively in expression nodes one with name 'bootstrapModule'
                        let rootModule;
                        let resultNode;
                        if (
                            srcFile.text.indexOf(bootstrapModuleReference) !==
                            -1
                        ) {
                            if (node.expression) {
                                resultNode =
                                    this.findExpressionByNameInExpressions(
                                        node.expression,
                                        "bootstrapModule",
                                    );
                            }
                            if (typeof node.thenStatement !== "undefined") {
                                if (
                                    node.thenStatement.statements &&
                                    node.thenStatement.statements.length > 0
                                ) {
                                    let firstStatement =
                                        node.thenStatement.statements[0];
                                    resultNode =
                                        this.findExpressionByNameInExpressions(
                                            firstStatement.expression,
                                            "bootstrapModule",
                                        );
                                }
                            }
                            if (!resultNode) {
                                if (
                                    node.expression &&
                                    node.expression.arguments &&
                                    node.expression.arguments.length > 0
                                ) {
                                    resultNode =
                                        this.findExpressionByNameInExpressionArguments(
                                            node.expression.arguments,
                                            "bootstrapModule",
                                        );
                                }
                            }
                            if (resultNode) {
                                if (resultNode.arguments.length > 0) {
                                    _.forEach(
                                        resultNode.arguments,
                                        (argument: any) => {
                                            if (argument.text) {
                                                rootModule = argument.text;
                                            }
                                        },
                                    );
                                }
                                if (rootModule) {
                                    RouterParserUtil.setRootModule(rootModule);
                                }
                            }
                        }
                    }
                    if (ts.isVariableStatement(node)) {
                        const isRoutesVariable =
                            RouterParserUtil.isVariableRoutes(node);
                        // Process all variables, including exported routes variables for miscellaneous
                        if (
                            !isRoutesVariable ||
                            this.isExportedVariable(node)
                        ) {
                            let isDestructured = false;
                            let isArrayDestructured = false;
                            let isObjectDestructured = false;
                            // Check for destructuring array or object
                            const nodeVariableDeclarations =
                                node.declarationList.declarations;
                            if (nodeVariableDeclarations) {
                                if (nodeVariableDeclarations.length > 0) {
                                    if (
                                        nodeVariableDeclarations[0].name &&
                                        nodeVariableDeclarations[0].name
                                            .kind ===
                                            SyntaxKind.ArrayBindingPattern
                                    ) {
                                        isDestructured = true;
                                        isArrayDestructured = true;
                                    } else if (
                                        nodeVariableDeclarations[0].name &&
                                        nodeVariableDeclarations[0].name
                                            .kind ===
                                            SyntaxKind.ObjectBindingPattern
                                    ) {
                                        isDestructured = true;
                                        isObjectDestructured = true;
                                    }
                                }
                            }

                            const visitVariableNode = (variableNode) => {
                                const infos: any =
                                    this.visitVariableDeclaration(variableNode);
                                if (infos) {
                                    const name = infos.name;
                                    const deprecated = infos.deprecated;
                                    const deprecationMessage =
                                        infos.deprecationMessage;
                                    const deps: any = {
                                        name,
                                        ctype: "miscellaneous",
                                        subtype: "variable",
                                        file: file,
                                        coverageIgnore: isCoverageIgnore(
                                            variableNode,
                                        ),
                                        deprecated,
                                        deprecationMessage,
                                    };
                                    deps.type = infos.type ? infos.type : "";
                                    if (infos.defaultValue) {
                                        deps.defaultValue = infos.defaultValue;
                                    }
                                    if (infos.initializer) {
                                        deps.initializer = infos.initializer;
                                    }
                                    if (
                                        variableNode.jsDoc &&
                                        variableNode.jsDoc.length > 0 &&
                                        variableNode.jsDoc[0].comment
                                    ) {
                                        const rawDescription =
                                            this.jsdocParserUtil.parseJSDocNode(
                                                variableNode.jsDoc[0],
                                            );
                                        deps.rawdescription = rawDescription;
                                        deps.description =
                                            markedAcl(rawDescription);
                                    }
                                    if (isModuleWithProviders(variableNode)) {
                                        const routingInitializer =
                                            getModuleWithProviders(
                                                variableNode,
                                            );
                                        RouterParserUtil.addModuleWithRoutes(
                                            name,
                                            [routingInitializer],
                                            file,
                                        );
                                        RouterParserUtil.addModule(name, [
                                            routingInitializer,
                                        ]);
                                    }
                                    if (!isIgnore(variableNode)) {
                                        // Check if variable is allowed by public API filter
                                        if (!this.isSymbolAllowed(name, file)) {
                                            logger.debug(
                                                `Skipping variable ${name} (not in public API)`,
                                            );
                                            return;
                                        }
                                        this.debug(deps);
                                        outputSymbols.miscellaneous.variables.push(
                                            deps,
                                        );
                                    }
                                }
                            };

                            if (isDestructured) {
                                if (nodeVariableDeclarations[0].name.elements) {
                                    const destructuredVariables =
                                        nodeVariableDeclarations[0].name
                                            .elements;

                                    for (
                                        let i = 0;
                                        i < destructuredVariables.length;
                                        i++
                                    ) {
                                        const destructuredVariable =
                                            destructuredVariables[i];
                                        let name = "";

                                        if (isObjectDestructured) {
                                            // For object destructuring like { question } or { baseUrl: serverUrl }
                                            // element.name is the local variable name (alias or original)
                                            if (destructuredVariable.name) {
                                                name =
                                                    destructuredVariable.name
                                                        .escapedText ||
                                                    destructuredVariable.name
                                                        .text ||
                                                    "";
                                            }
                                        } else {
                                            // For array destructuring like [a, b, c]
                                            name = destructuredVariable.name
                                                ? destructuredVariable.name
                                                      .escapedText
                                                : "";
                                        }

                                        const deps: any = {
                                            name,
                                            ctype: "miscellaneous",
                                            subtype: "variable",
                                            file: file,
                                            coverageIgnore:
                                                isCoverageIgnore(node),
                                            deprecated: false,
                                            deprecationMessage: "",
                                        };

                                        if (isArrayDestructured) {
                                            if (
                                                nodeVariableDeclarations[0]
                                                    .initializer
                                            ) {
                                                if (
                                                    nodeVariableDeclarations[0]
                                                        .initializer.elements
                                                ) {
                                                    deps.initializer =
                                                        nodeVariableDeclarations[0].initializer.elements[
                                                            i
                                                        ];
                                                }
                                                deps.defaultValue =
                                                    deps.initializer
                                                        ? this.classHelper.stringifyDefaultValue(
                                                              deps.initializer,
                                                          )
                                                        : undefined;
                                            }
                                        } else if (isObjectDestructured) {
                                            if (
                                                nodeVariableDeclarations[0]
                                                    .initializer
                                            ) {
                                                deps.defaultValue =
                                                    this.classHelper.stringifyDefaultValue(
                                                        nodeVariableDeclarations[0]
                                                            .initializer,
                                                    );

                                                // Try to infer type from function return type
                                                if (
                                                    ts.isCallExpression(
                                                        nodeVariableDeclarations[0]
                                                            .initializer,
                                                    )
                                                ) {
                                                    const functionType =
                                                        this.inferTypeFromFunctionCall(
                                                            nodeVariableDeclarations[0]
                                                                .initializer,
                                                            name,
                                                            srcFile,
                                                        );
                                                    if (functionType) {
                                                        deps.type =
                                                            functionType;
                                                    }
                                                }
                                            }

                                            // Extract JSDoc from the variable statement
                                            if (
                                                node.jsDoc &&
                                                node.jsDoc.length > 0
                                            ) {
                                                for (const jsDoc of node.jsDoc) {
                                                    if (jsDoc.comment) {
                                                        const rawDescription =
                                                            this.jsdocParserUtil.parseJSDocNode(
                                                                jsDoc,
                                                            );
                                                        deps.rawdescription =
                                                            rawDescription;
                                                        deps.description =
                                                            markedAcl(
                                                                rawDescription,
                                                            );
                                                    }
                                                }
                                            }
                                        }

                                        if (
                                            !isIgnore(destructuredVariables[i])
                                        ) {
                                            // Check if variable is allowed by public API filter
                                            if (
                                                !this.isSymbolAllowed(
                                                    name,
                                                    file,
                                                )
                                            ) {
                                                logger.debug(
                                                    `Skipping destructured variable ${name} (not in public API)`,
                                                );
                                                continue;
                                            }
                                            this.debug(deps);
                                            outputSymbols.miscellaneous.variables.push(
                                                deps,
                                            );
                                        }
                                    }
                                }
                            } else {
                                visitVariableNode(node);
                            }
                        } // End of new if condition for isRoutesVariable || isExportedVariable
                    }
                    if (ts.isTypeAliasDeclaration(node)) {
                        const infos = this.visitTypeDeclaration(node);
                        const name = infos.name;
                        const deprecated = infos.deprecated;
                        const deprecationMessage = infos.deprecationMessage;
                        const deps: ITypeAliasDecDep = {
                            name,
                            ctype: "miscellaneous",
                            subtype: "typealias",
                            coverageIgnore: isCoverageIgnore(node),
                            rawtype: this.classHelper.visitType(node),
                            file: file,
                            deprecated,
                            deprecationMessage,
                            rawdescription:
                                this.visitEnumTypeAliasFunctionDeclarationRawDescription(
                                    node,
                                ),
                            description:
                                this.visitEnumTypeAliasFunctionDeclarationDescription(
                                    node,
                                ),
                        };
                        if (node.type) {
                            deps.kind = node.type.kind;
                        }
                        if (
                            deps.kind &&
                            deps.kind === SyntaxKind.TemplateLiteralType &&
                            node.type
                        ) {
                            deps.rawtype = srcFile.text.substring(
                                node.type.pos,
                                node.type.end,
                            );
                        }
                        if (!isIgnore(node)) {
                            this.debug(deps);
                            outputSymbols.miscellaneous.typealiases.push(deps);
                        }
                    }
                    if (ts.isFunctionDeclaration(node)) {
                        const infos = this.visitFunctionDeclaration(node);
                        const name = infos.name;
                        const deprecated = infos.deprecated;
                        const deprecationMessage = infos.deprecationMessage;
                        const functionDep: IFunctionDecDep = {
                            name,
                            ctype: "miscellaneous",
                            subtype: "function",
                            file: file,
                            coverageIgnore: isCoverageIgnore(node),
                            deprecated,
                            deprecationMessage,
                            rawdescription:
                                this.visitEnumTypeAliasFunctionDeclarationRawDescription(
                                    node,
                                ),
                            description:
                                this.visitEnumTypeAliasFunctionDeclarationDescription(
                                    node,
                                ),
                        };
                        if (infos.args) {
                            functionDep.args = infos.args;
                        }
                        if (infos.returnType) {
                            functionDep.returnType = infos.returnType;
                        }
                        if (infos.jsdoctags && infos.jsdoctags.length > 0) {
                            functionDep.jsdoctags = infos.jsdoctags;
                        }
                        if (typeof infos.ignore === "undefined") {
                            if (
                                !(
                                    this.hasPrivateJSDocTag(
                                        functionDep.jsdoctags,
                                    ) && Configuration.mainData.disablePrivate
                                )
                            ) {
                                this.debug(functionDep);
                                outputSymbols.miscellaneous.functions.push(
                                    functionDep,
                                );
                            }
                        }
                    }
                    if (ts.isEnumDeclaration(node)) {
                        const infos = this.visitEnumDeclaration(node);
                        const name = infos.name;
                        const deprecated = infos.deprecated;
                        const deprecationMessage = infos.deprecationMessage;
                        const enumDeps: IEnumDecDep = {
                            name,
                            childs: infos.members,
                            ctype: "miscellaneous",
                            subtype: "enum",
                            deprecated,
                            deprecationMessage,
                            rawdescription:
                                this.visitEnumTypeAliasFunctionDeclarationRawDescription(
                                    node,
                                ),
                            description:
                                this.visitEnumTypeAliasFunctionDeclarationDescription(
                                    node,
                                ),
                            file: file,
                        };
                        if (!isIgnore(node)) {
                            this.debug(enumDeps);
                            outputSymbols.miscellaneous.enumerations.push(
                                enumDeps,
                            );
                        }
                    }
                }
            };

            parseNode(fileName, scannedFile, initialNode, null, astFile);
        });
    }

    /**
     * Function to in a specific store an entity, and check before is there is not the same one
     * in that store : same name, id and file
     * @param entity Entity to store
     * @param store Store
     */
    private addNewEntityInStore(entity, store) {
        const findSameEntityInStore = _.filter(store, {
            name: entity.name,
            id: entity.id,
            file: entity.file,
        });
        if (findSameEntityInStore.length === 0) {
            store.push(entity);
        }
    }

    private debug(deps: IDep) {
        if (deps) {
            logger.debug("found", `${deps.name}`);
        } else {
            return;
        }
        [
            "imports",
            "exports",
            "declarations",
            "providers",
            "bootstrap",
        ].forEach((symbols) => {
            if (deps[symbols] && deps[symbols].length > 0) {
                logger.debug("", `- ${symbols}:`);
                deps[symbols]
                    .map((i) => i.name)
                    .forEach((d) => {
                        logger.debug("", `\t- ${d}`);
                    });
            }
        });
    }

    private ignore(deps: IDep) {
        if (deps) {
            logger.warn("ignore", `${deps.name}`);
        } else {
            return;
        }
    }

    private checkForDeprecation(
        tags: any[],
        result: { [key in string | number]: any },
    ) {
        _.forEach(tags, (tag) => {
            if (
                tag.tagName &&
                tag.tagName.text &&
                tag.tagName.text.indexOf("deprecated") > -1
            ) {
                result.deprecated = true;
                result.deprecationMessage =
                    this.jsdocParserUtil.parseJSDocNode(tag);
            }
        });
    }

    private findExpressionByNameInExpressions(entryNode, name) {
        let result;
        const loop = function (node, z) {
            if (node) {
                if (node.expression && !node.expression.name) {
                    loop(node.expression, z);
                }
                if (node.expression && node.expression.name) {
                    if (node.expression.name.text === z) {
                        result = node;
                    } else {
                        loop(node.expression, z);
                    }
                }
            }
        };
        loop(entryNode, name);
        return result;
    }

    private findExpressionByNameInExpressionArguments(arg, name) {
        let result;
        const that = this;
        let i = 0;
        let len = arg.length;
        const loop = function (node, z) {
            if (node.body) {
                if (node.body.statements && node.body.statements.length > 0) {
                    let j = 0;
                    const leng = node.body.statements.length;
                    for (j; j < leng; j++) {
                        result = that.findExpressionByNameInExpressions(
                            node.body.statements[j],
                            z,
                        );
                    }
                }
            }
        };
        for (i; i < len; i++) {
            loop(arg[i], name);
        }
        return result;
    }

    private parseDecorators(decorators, type: string): boolean {
        let result = false;
        if (decorators.length > 1) {
            _.forEach(decorators, function (decorator: any) {
                if (decorator.expression.expression) {
                    if (decorator.expression.expression.text === type) {
                        result = true;
                    }
                }
            });
        } else {
            if (decorators[0].expression.expression) {
                if (decorators[0].expression.expression.text === type) {
                    result = true;
                }
            }
        }
        return result;
    }

    private parseDecorator(decorator, type: string): boolean {
        let result = false;
        if (decorator.expression.expression) {
            if (decorator.expression.expression.text === type) {
                result = true;
            }
        }
        return result;
    }

    private isController(metadata) {
        return this.parseDecorator(metadata, "Controller");
    }

    private isEntity(metadata) {
        return this.parseDecorator(metadata, "Entity");
    }

    private isComponent(metadata) {
        return this.parseDecorator(metadata, "Component");
    }

    private isPipe(metadata) {
        return this.parseDecorator(metadata, "Pipe");
    }

    private isDirective(metadata) {
        return this.parseDecorator(metadata, "Directive");
    }

    private isInjectable(metadata) {
        return this.parseDecorator(metadata, "Injectable");
    }

    private isModule(metadata) {
        return (
            this.parseDecorator(metadata, "NgModule") ||
            this.parseDecorator(metadata, "Module")
        );
    }

    private hasInternalDecorator(metadatas) {
        return (
            this.parseDecorators(metadatas, "Controller") ||
            this.parseDecorators(metadatas, "Component") ||
            this.parseDecorators(metadatas, "Pipe") ||
            this.parseDecorators(metadatas, "Directive") ||
            this.parseDecorators(metadatas, "Injectable") ||
            this.parseDecorators(metadatas, "NgModule") ||
            this.parseDecorators(metadatas, "Module")
        );
    }

    private isGuard(ioImplements: string[]): boolean {
        return (
            _.includes(ioImplements, "CanActivate") ||
            _.includes(ioImplements, "CanActivateChild") ||
            _.includes(ioImplements, "CanDeactivate") ||
            _.includes(ioImplements, "Resolve") ||
            _.includes(ioImplements, "CanLoad")
        );
    }

    private getSymboleName(node): string {
        return node.name.text;
    }

    private findProperties(
        visitedNode: ts.Decorator,
        sourceFile: ts.SourceFile,
    ): ReadonlyArray<ts.ObjectLiteralElementLike> {
        if (
            visitedNode.expression &&
            visitedNode.expression.arguments &&
            visitedNode.expression.arguments.length > 0
        ) {
            const pop = visitedNode.expression.arguments[0];

            if (pop && pop.properties && pop.properties.length >= 0) {
                return pop.properties;
            } else if (
                pop &&
                pop.kind &&
                pop.kind === SyntaxKind.StringLiteral
            ) {
                return [pop];
            } else {
                logger.warn("Empty metadatas, trying to find it with imports.");
                return ImportsUtil.findValueInImportOrLocalVariables(
                    pop.text,
                    sourceFile,
                );
            }
        }

        return [];
    }

    private isAngularLifecycleHook(methodName) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        const ANGULAR_LIFECYCLE_METHODS = [
            "ngOnInit",
            "ngOnChanges",
            "ngDoCheck",
            "ngOnDestroy",
            "ngAfterContentInit",
            "ngAfterContentChecked",
            "ngAfterViewInit",
            "ngAfterViewChecked",
            "writeValue",
            "registerOnChange",
            "registerOnTouched",
            "setDisabledState",
        ];
        return ANGULAR_LIFECYCLE_METHODS.indexOf(methodName) >= 0;
    }

    private visitTypeDeclaration(node: ts.TypeAliasDeclaration) {
        const result: any = {
            deprecated: false,
            deprecationMessage: "",
            name: node.name.text,
            kind: node.kind,
        };
        const jsdoctags = this.jsdocParserUtil.getJSDocs(node);

        if (jsdoctags && jsdoctags.length >= 1 && jsdoctags[0].tags) {
            this.checkForDeprecation(jsdoctags[0].tags, result);
            result.jsdoctags = markedtags(jsdoctags[0].tags);
        }
        return result;
    }

    private visitArgument(arg) {
        if (arg.name && arg.name.kind == SyntaxKind.ObjectBindingPattern) {
            let results = [];

            const destrucuredGroupId = uuidv4();

            results = arg.name.elements.map((element) =>
                this.visitArgument(element),
            );

            results = results.map((result) => {
                result.destrucuredGroupId = destrucuredGroupId;
                return result;
            });

            if (arg.name.elements && arg.type && arg.type.members) {
                if (arg.name.elements.length === arg.type.members.length) {
                    for (let i = 0; i < arg.name.elements.length; i++) {
                        results[i].type = this.classHelper.visitType(
                            arg.type.members[i],
                        );
                    }
                }
            }

            if (arg.name.elements && arg.type && arg.type.typeName) {
                results[0].type = this.classHelper.visitType(arg.type);
            }

            return results;
        } else {
            const result: any = {
                name: arg.name.text,
                type: this.classHelper.visitType(arg),
                deprecated: false,
                deprecationMessage: "",
            };

            if (arg.dotDotDotToken) {
                result.dotDotDotToken = true;
            }
            if (arg.questionToken) {
                result.optional = true;
            }
            if (arg.initializer) {
                result.defaultValue = arg.initializer
                    ? this.classHelper.stringifyDefaultValue(arg.initializer)
                    : undefined;
            }
            if (arg.type) {
                result.type = this.mapType(arg.type.kind);
                if (arg.type.kind === SyntaxKind.TypeReference) {
                    // try replace TypeReference with typeName
                    if (arg.type.typeName) {
                        result.type = arg.type.typeName.text;
                    }
                }
            }
            const jsdoctags = this.jsdocParserUtil.getJSDocs(arg);

            if (jsdoctags && jsdoctags.length >= 1 && jsdoctags[0].tags) {
                this.checkForDeprecation(jsdoctags[0].tags, result);
            }
            return result;
        }
    }

    private mapType(type): string | undefined {
        switch (type) {
            case SyntaxKind.NullKeyword:
                return "null";
            case SyntaxKind.AnyKeyword:
                return "any";
            case SyntaxKind.BooleanKeyword:
                return "boolean";
            case SyntaxKind.NeverKeyword:
                return "never";
            case SyntaxKind.NumberKeyword:
                return "number";
            case SyntaxKind.StringKeyword:
                return "string";
            case SyntaxKind.UndefinedKeyword:
                return "undefined";
            case SyntaxKind.TypeReference:
                return "typeReference";
        }
    }

    private hasPrivateJSDocTag(tags): boolean {
        let result = false;
        if (tags) {
            tags.forEach((tag) => {
                if (
                    tag.tagName &&
                    tag.tagName.text &&
                    tag.tagName.text === "private"
                ) {
                    result = true;
                }
            });
        }
        return result;
    }

    private visitFunctionDeclaration(method: ts.FunctionDeclaration) {
        const methodName = method.name ? method.name.text : "Unnamed function";
        const resultArguments = [];
        const result: any = {
            deprecated: false,
            deprecationMessage: "",
            name: methodName,
        };

        for (let i = 0; i < method.parameters.length; i++) {
            const argument = method.parameters[i];
            if (argument) {
                const argumentParsed = this.visitArgument(argument);
                if (argumentParsed.length > 0) {
                    for (let j = 0; j < argumentParsed.length; j++) {
                        const argumentParsedInside = argumentParsed[j];
                        argumentParsedInside.destructuredParameter = true;
                        resultArguments.push(argumentParsedInside);
                    }
                } else {
                    resultArguments.push(argumentParsed);
                }
            }
        }

        result.args = resultArguments;

        const jsdoctags = this.jsdocParserUtil.getJSDocs(method);

        if (typeof method.type !== "undefined") {
            result.returnType = this.classHelper.visitType(method.type);
        }

        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                let kinds = method.modifiers
                    .map((modifier) => {
                        return modifier.kind;
                    })
                    .reverse();
                if (
                    _.indexOf(kinds, SyntaxKind.PublicKeyword) !== -1 &&
                    _.indexOf(kinds, SyntaxKind.StaticKeyword) !== -1
                ) {
                    kinds = kinds.filter(
                        (kind) => kind !== SyntaxKind.PublicKeyword,
                    );
                }
            }
        }
        if (jsdoctags && jsdoctags.length >= 1 && jsdoctags[0].tags) {
            this.checkForDeprecation(jsdoctags[0].tags, result);
            result.jsdoctags = markedtags(jsdoctags[0].tags);
            _.forEach(jsdoctags[0].tags, (tag) => {
                if (tag.tagName) {
                    if (tag.tagName.text) {
                        if (tag.tagName.text.indexOf("ignore") > -1) {
                            result.ignore = true;
                        }
                    }
                }
            });
        }
        if (result.jsdoctags && result.jsdoctags.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args, result.jsdoctags);
        } else if (result.args.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args);
        }
        return result;
    }

    private visitVariableDeclaration(node) {
        if (node.declarationList && node.declarationList.declarations) {
            let i = 0;
            const len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                const result: any = {
                    name: node.declarationList.declarations[i].name.text,
                    defaultValue: node.declarationList.declarations[i]
                        .initializer
                        ? this.classHelper.stringifyDefaultValue(
                              node.declarationList.declarations[i].initializer,
                          )
                        : undefined,
                    deprecated: false,
                    deprecationMessage: "",
                };
                if (node.declarationList.declarations[i].initializer) {
                    result.initializer =
                        node.declarationList.declarations[i].initializer;
                }
                if (node.declarationList.declarations[i].type) {
                    result.type = this.classHelper.visitType(
                        node.declarationList.declarations[i].type,
                    );
                }
                if (typeof result.type === "undefined" && result.initializer) {
                    result.type = kindToType(result.initializer.kind);
                }
                const jsdoctags = this.jsdocParserUtil.getJSDocs(
                    node.declarationList.declarations[i],
                );
                if (jsdoctags && jsdoctags.length >= 1 && jsdoctags[0].tags) {
                    this.checkForDeprecation(jsdoctags[0].tags, result);
                }
                return result;
            }
        }
    }

    private visitEnumTypeAliasFunctionDeclarationRawDescription(node): string {
        let rawDescription: string = "";
        if (node.jsDoc) {
            if (node.jsDoc.length > 0) {
                const lastJsDoc = node.jsDoc[node.jsDoc.length - 1];
                if (typeof lastJsDoc.comment !== "undefined") {
                    rawDescription =
                        this.jsdocParserUtil.parseJSDocNode(lastJsDoc);
                }
            }
        }
        return rawDescription;
    }

    private visitEnumTypeAliasFunctionDeclarationDescription(node): string {
        let description: string = "";
        if (node.jsDoc) {
            if (node.jsDoc.length > 0) {
                const lastJsDoc = node.jsDoc[node.jsDoc.length - 1];
                if (typeof lastJsDoc.comment !== "undefined") {
                    const rawDescription =
                        this.jsdocParserUtil.parseJSDocNode(lastJsDoc);
                    description = markedAcl(rawDescription);
                }
            }
        }
        return description;
    }

    private visitEnumDeclaration(node: ts.EnumDeclaration) {
        const result: any = {
            deprecated: false,
            deprecationMessage: "",
            name: node.name.text,
            members: [],
        };
        if (node.members) {
            let i = 0;
            let len = node.members.length;
            let memberjsdoctags = [];
            for (i; i < len; i++) {
                const member: any = {
                    name: node.members[i].name.text,
                    deprecated: false,
                    deprecationMessage: "",
                };
                if (node.members[i].initializer) {
                    // if the initializer kind is a number do cast to the number type
                    member.value = IsKindType.NUMBER(
                        node.members[i].initializer.kind,
                    )
                        ? Number(node.members[i].initializer.text)
                        : node.members[i].initializer.text;
                }
                memberjsdoctags = this.jsdocParserUtil.getJSDocs(
                    node.members[i],
                );
                if (
                    memberjsdoctags &&
                    memberjsdoctags.length >= 1 &&
                    memberjsdoctags[0].tags
                ) {
                    this.checkForDeprecation(memberjsdoctags[0].tags, member);
                }
                result.members.push(member);
            }
        }
        const jsdoctags = this.jsdocParserUtil.getJSDocs(node);
        if (jsdoctags && jsdoctags.length >= 1 && jsdoctags[0].tags) {
            this.checkForDeprecation(jsdoctags[0].tags, result);
        }
        return result;
    }

    private visitEnumDeclarationForRoutes(fileName, node) {
        if (node.declarationList.declarations) {
            let i = 0;
            let len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                const routesInitializer =
                    node.declarationList.declarations[i].initializer;
                const data = new CodeGenerator().generate(routesInitializer);
                RouterParserUtil.addRoute({
                    name: node.declarationList.declarations[i].name.text,
                    data: RouterParserUtil.cleanRawRoute(data),
                    filename: fileName,
                });
                return [
                    {
                        routes: data,
                    },
                ];
            }
        }
        return [];
    }

    private getRouteIO(
        filename: string,
        sourceFile: ts.SourceFile,
        node: ts.Node,
    ) {
        let res;
        if (sourceFile.statements) {
            res = sourceFile.statements.reduce((directive, statement) => {
                if (RouterParserUtil.isVariableRoutes(statement)) {
                    if (
                        statement.pos === node.pos &&
                        statement.end === node.end
                    ) {
                        return directive.concat(
                            this.visitEnumDeclarationForRoutes(
                                filename,
                                statement,
                            ),
                        );
                    }
                }

                return directive;
            }, []);
            return res[0] || {};
        } else {
            return {};
        }
    }

    private getClassIO(
        filename: string,
        sourceFile: ts.SourceFile,
        node: ts.Node,
        fileBody,
        astFile,
    ) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        const reducedSource = fileBody
            ? fileBody.statements
            : sourceFile.statements;
        const res = reducedSource.reduce((directive, statement) => {
            if (ts.isClassDeclaration(statement)) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(
                        this.classHelper.visitClassDeclaration(
                            filename,
                            statement,
                            sourceFile,
                            astFile,
                        ),
                    );
                }
            }

            return directive;
        }, []);

        return res[0] || {};
    }

    private getInterfaceIO(
        filename: string,
        sourceFile,
        node,
        fileBody,
        astFile,
    ) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        const reducedSource = fileBody
            ? fileBody.statements
            : sourceFile.statements;
        const res = reducedSource.reduce((directive, statement) => {
            if (ts.isInterfaceDeclaration(statement)) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(
                        this.classHelper.visitClassDeclaration(
                            filename,
                            statement,
                            sourceFile,
                            astFile,
                        ),
                    );
                }
            }

            return directive;
        }, []);

        return res[0] || {};
    }

    /**
     * Check if a variable statement is exported
     */
    private isExportedVariable(node: any): boolean {
        // Check if the node has export modifiers
        return !!(
            node.modifiers &&
            node.modifiers.some(
                (modifier) => modifier.kind === SyntaxKind.ExportKeyword,
            )
        );
    }

    /**
     * Try to infer the type of a destructured property from a function call return type
     */
    private inferTypeFromFunctionCall(
        callExpression: ts.CallExpression,
        propertyName: string,
        sourceFile: ts.SourceFile,
    ): string | undefined {
        if (
            !callExpression.expression ||
            !ts.isIdentifier(callExpression.expression)
        ) {
            return undefined;
        }

        const functionName = callExpression.expression.text;
        const functionDeclaration = this.findFunctionDeclaration(
            functionName,
            sourceFile,
        );

        if (
            functionDeclaration &&
            functionDeclaration.type &&
            functionDeclaration.type.kind === SyntaxKind.TypeLiteral
        ) {
            const typeLiteral = functionDeclaration.type as ts.TypeLiteralNode;
            if (typeLiteral.members) {
                for (const member of typeLiteral.members) {
                    if (
                        ts.isPropertySignature(member) &&
                        member.name &&
                        member.type
                    ) {
                        const memberName =
                            (member.name as any).text ||
                            (member.name as any).escapedText;
                        if (memberName === propertyName) {
                            return this.classHelper.visitType(member.type);
                        }
                    }
                }
            }
        }

        return undefined;
    }

    /**
     * Find a function declaration by name in the source file
     */
    private findFunctionDeclaration(
        functionName: string,
        sourceFile: ts.SourceFile,
    ): ts.FunctionDeclaration | undefined {
        const findFunction = (
            node: ts.Node,
        ): ts.FunctionDeclaration | undefined => {
            if (
                ts.isFunctionDeclaration(node) &&
                node.name &&
                node.name.text === functionName
            ) {
                return node;
            }
            return ts.forEachChild(node, findFunction);
        };
        return findFunction(sourceFile);
    }
}
