import * as path from 'path';

import * as _ from 'lodash';
import Ast, { ts, SyntaxKind } from 'ts-simple-ast';

import { kindToType } from '../../utils/kind-to-type';
import { logger } from '../../utils/logger';
import { cleanLifecycleHooksFromMethods, markedtags, mergeTagsAndArgs } from '../../utils/utils';
import ComponentsTreeEngine from '../engines/components-tree.engine';

import { FrameworkDependencies } from './framework-dependencies';

import ImportsUtil from '../../utils/imports.util';

import {
    getModuleWithProviders,
    isIgnore,
    isModuleWithProviders,
    JsdocParserUtil
} from '../../utils';

import ExtendsMerger from '../../utils/extends-merger.util';

import RouterParserUtil from '../../utils/router-parser.util';

import { CodeGenerator } from './angular/code-generator';

import { ComponentDepFactory } from './angular/deps/component-dep.factory';
import { ControllerDepFactory } from './angular/deps/controller-dep.factory';
import { DirectiveDepFactory } from './angular/deps/directive-dep.factory';
import { ComponentCache } from './angular/deps/helpers/component-helper';
import { JsDocHelper } from './angular/deps/helpers/js-doc-helper';
import { ModuleHelper } from './angular/deps/helpers/module-helper';
import { SymbolHelper } from './angular/deps/helpers/symbol-helper';
import { ModuleDepFactory } from './angular/deps/module-dep.factory';

import Configuration from '../configuration';

import {
    IDep,
    IEnumDecDep,
    IFunctionDecDep,
    IInjectableDep,
    IInterfaceDep,
    IPipeDep,
    ITypeAliasDecDep
} from './angular/dependencies.interfaces';

const crypto = require('crypto');
const marked = require('marked');
const ast = new Ast();

// TypeScript reference : https://github.com/Microsoft/TypeScript/blob/master/lib/typescript.d.ts

export class AngularDependencies extends FrameworkDependencies {
    private engine: any;
    private cache: ComponentCache = new ComponentCache();
    private moduleHelper = new ModuleHelper(this.cache);
    private jsDocHelper = new JsDocHelper();
    private symbolHelper = new SymbolHelper();
    private jsdocParserUtil = new JsdocParserUtil();

    constructor(files: string[], options: any) {
        super(files, options);
    }

    public getDependencies() {
        let deps = {
            modules: [],
            modulesForGraph: [],
            components: [],
            controllers: [],
            injectables: [],
            interceptors: [],
            guards: [],
            pipes: [],
            directives: [],
            routes: [],
            classes: [],
            interfaces: [],
            miscellaneous: {
                variables: [],
                functions: [],
                typealiases: [],
                enumerations: []
            },
            routesTree: undefined
        };

        let sourceFiles = this.program.getSourceFiles() || [];

        sourceFiles.map((file: ts.SourceFile) => {
            let filePath = file.fileName;

            if (path.extname(filePath) === '.ts' || path.extname(filePath) === '.tsx') {
                if (!Configuration.mainData.angularJSProject && path.extname(filePath) === '.js') {
                    logger.info('parsing', filePath);
                    this.getSourceFileDecorators(file, deps);
                } else {
                    if (
                        filePath.lastIndexOf('.d.ts') === -1 &&
                        filePath.lastIndexOf('spec.ts') === -1
                    ) {
                        logger.info('parsing', filePath);
                        this.getSourceFileDecorators(file, deps);
                    }
                }
            }

            return deps;
        });

        // End of file scanning
        // Try merging inside the same file declarated variables & modules with imports | exports | declarations | providers

        if (deps.miscellaneous.variables.length > 0) {
            deps.miscellaneous.variables.forEach(_variable => {
                let newVar = [];
                ((_var, _newVar) => {
                    // getType pr reconstruire....
                    if (_var.initializer) {
                        if (_var.initializer.elements) {
                            if (_var.initializer.elements.length > 0) {
                                _var.initializer.elements.forEach(element => {
                                    if (element.text) {
                                        newVar.push({
                                            name: element.text,
                                            type: this.symbolHelper.getType(element.text)
                                        });
                                    }
                                });
                            }
                        }
                    }
                })(_variable, newVar);

                let onLink = mod => {
                    let process = (initialArray, _var) => {
                        let indexToClean = 0;
                        let found = false;
                        let findVariableInArray = (el, index, theArray) => {
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
                            newVar.forEach(newEle => {
                                if (
                                    typeof _.find(initialArray, { name: newEle.name }) ===
                                    'undefined'
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

    private processClass(node, file, srcFile, outputSymbols, fileBody) {
        let name = this.getSymboleName(node);
        let IO = this.getClassIO(file, srcFile, node, fileBody);
        let sourceCode = srcFile.getText();
        let hash = crypto
            .createHash('md5')
            .update(sourceCode)
            .digest('hex');
        let deps: any = {
            name,
            id: 'class-' + name + '-' + hash,
            file: file,
            type: 'class',
            sourceCode: srcFile.getText()
        };
        let excludeFromClassArray = false;

        if (IO.constructor) {
            deps.constructorObj = IO.constructor;
        }
        if (IO.properties) {
            deps.properties = IO.properties;
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
        if (IO.inputs) {
            deps.inputsClass = IO.inputs;
        }
        if (IO.outputs) {
            deps.outputsClass = IO.outputs;
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
                deps.type = 'guard';

                outputSymbols.guards.push(deps);
            }
        }
        if (typeof IO.ignore === 'undefined') {
            this.debug(deps);

            if (!excludeFromClassArray) {
                outputSymbols.classes.push(deps);
            }
        } else {
            this.ignore(deps);
        }
    }

    private getSourceFileDecorators(initialSrcFile: ts.SourceFile, outputSymbols: any): void {
        let cleaner = (process.cwd() + path.sep).replace(/\\/g, '/');
        let fileName = initialSrcFile.fileName.replace(cleaner, '');
        let scannedFile = initialSrcFile;

        // Search in file for variable statement as routes definitions

        const astFile =
            typeof ast.getSourceFile(initialSrcFile.fileName) !== 'undefined'
                ? ast.getSourceFile(initialSrcFile.fileName)
                : ast.addExistingSourceFile(initialSrcFile.fileName);

        const variableRoutesStatements = astFile.getVariableStatements();
        let hasRoutesStatements = false;

        if (variableRoutesStatements.length > 0) {
            // Clean file for spread and dynamics inside routes definitions
            variableRoutesStatements.forEach(s => {
                const variableDeclarations = s.getDeclarations();
                let len = variableDeclarations.length;
                let i = 0;
                for (i; i < len; i++) {
                    if (variableDeclarations[i].compilerNode.type) {
                        if (
                            variableDeclarations[i].compilerNode.type.typeName &&
                            variableDeclarations[i].compilerNode.type.typeName.text === 'Routes'
                        ) {
                            hasRoutesStatements = true;
                        }
                    }
                }
            });
        }

        if (hasRoutesStatements && !Configuration.mainData.disableRoutesGraph) {
            // Clean file for spread and dynamics inside routes definitions
            logger.info('Analysing routes definitions and clean them if necessary');

            // scannedFile = RouterParserUtil.cleanFileIdentifiers(astFile).compilerNode;
            let firstClean = RouterParserUtil.cleanFileSpreads(astFile).compilerNode;
            scannedFile = RouterParserUtil.cleanCallExpressions(astFile).compilerNode;
            scannedFile = RouterParserUtil.cleanFileDynamics(astFile).compilerNode;

            scannedFile.kind = SyntaxKind.SourceFile;
        }

        ts.forEachChild(scannedFile, (initialNode: ts.Node) => {
            if (
                this.jsDocHelper.hasJSDocInternalTag(fileName, scannedFile, initialNode) &&
                Configuration.mainData.disableInternal
            ) {
                return;
            }
            let parseNode = (file, srcFile, node, fileBody) => {
                let sourceCode = srcFile.getText();
                let hash = crypto
                    .createHash('md5')
                    .update(sourceCode)
                    .digest('hex');

                if (node.decorators) {
                    let classWithCustomDecorator = false;
                    let visitDecorator = (visitedDecorator, index) => {
                        let deps: IDep;

                        let metadata = node.decorators;
                        let name = this.getSymboleName(node);
                        let props = this.findProperties(visitedDecorator, srcFile);
                        let IO = this.componentHelper.getComponentIO(file, srcFile, node, fileBody);

                        if (this.isModule(visitedDecorator)) {
                            const moduleDep = new ModuleDepFactory(this.moduleHelper).create(
                                file,
                                srcFile,
                                name,
                                props,
                                IO
                            );
                            if (RouterParserUtil.hasRouterModuleInImports(moduleDep.imports)) {
                                RouterParserUtil.addModuleWithRoutes(
                                    name,
                                    this.moduleHelper.getModuleImportsRaw(props, srcFile),
                                    file
                                );
                            }
                            deps = moduleDep;
                            if (typeof IO.ignore === 'undefined') {
                                RouterParserUtil.addModule(name, moduleDep.imports);
                                outputSymbols.modules.push(moduleDep);
                                outputSymbols.modulesForGraph.push(moduleDep);
                            }
                        } else if (this.isComponent(visitedDecorator)) {
                            if (props.length === 0) {
                                return;
                            }
                            const componentDep = new ComponentDepFactory(
                                this.componentHelper
                            ).create(file, srcFile, name, props, IO);
                            deps = componentDep;
                            if (typeof IO.ignore === 'undefined') {
                                ComponentsTreeEngine.addComponent(componentDep);
                                outputSymbols.components.push(componentDep);
                            }
                        } else if (this.isController(visitedDecorator)) {
                            const controllerDep = new ControllerDepFactory().create(
                                file,
                                srcFile,
                                name,
                                props,
                                IO
                            );
                            deps = controllerDep;
                            if (typeof IO.ignore === 'undefined') {
                                outputSymbols.controllers.push(controllerDep);
                            }
                        } else if (this.isInjectable(visitedDecorator)) {
                            let injectableDeps: IInjectableDep = {
                                name,
                                id: 'injectable-' + name + '-' + hash,
                                file: file,
                                properties: IO.properties,
                                methods: IO.methods,
                                description: IO.description,
                                sourceCode: srcFile.getText(),
                                exampleUrls: this.componentHelper.getComponentExampleUrls(
                                    srcFile.getText()
                                )
                            };
                            if (IO.constructor) {
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
                            deps = injectableDeps;
                            if (typeof IO.ignore === 'undefined') {
                                if (_.includes(IO.implements, 'HttpInterceptor')) {
                                    injectableDeps.type = 'interceptor';
                                    outputSymbols.interceptors.push(injectableDeps);
                                } else if (this.isGuard(IO.implements)) {
                                    injectableDeps.type = 'guard';
                                    outputSymbols.guards.push(injectableDeps);
                                } else {
                                    injectableDeps.type = 'injectable';
                                    this.addNewEntityInStore(
                                        injectableDeps,
                                        outputSymbols.injectables
                                    );
                                }
                            }
                        } else if (this.isPipe(visitedDecorator)) {
                            let pipeDeps: IPipeDep = {
                                name,
                                id: 'pipe-' + name + '-' + hash,
                                file: file,
                                type: 'pipe',
                                description: IO.description,
                                properties: IO.properties,
                                methods: IO.methods,
                                pure: this.componentHelper.getComponentPure(props, srcFile),
                                ngname: this.componentHelper.getComponentName(props, srcFile),
                                sourceCode: srcFile.getText(),
                                exampleUrls: this.componentHelper.getComponentExampleUrls(
                                    srcFile.getText()
                                )
                            };
                            if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                                pipeDeps.jsdoctags = IO.jsdoctags[0].tags;
                            }
                            deps = pipeDeps;
                            if (typeof IO.ignore === 'undefined') {
                                outputSymbols.pipes.push(pipeDeps);
                            }
                        } else if (this.isDirective(visitedDecorator)) {
                            if (props.length === 0) {
                                return;
                            }
                            let directiveDeps = new DirectiveDepFactory(
                                this.componentHelper
                            ).create(file, srcFile, name, props, IO);
                            deps = directiveDeps;
                            if (typeof IO.ignore === 'undefined') {
                                outputSymbols.directives.push(directiveDeps);
                            }
                        } else {
                            let hasMultipleDecoratorsWithInternalOne = this.hasInternalDecorator(
                                node.decorators
                            );
                            // Just a class
                            if (
                                !classWithCustomDecorator &&
                                !hasMultipleDecoratorsWithInternalOne
                            ) {
                                classWithCustomDecorator = true;
                                this.processClass(node, file, srcFile, outputSymbols, fileBody);
                            }
                        }
                        this.cache.set(name, deps);

                        if (typeof IO.ignore === 'undefined') {
                            this.debug(deps);
                        } else {
                            this.ignore(deps);
                        }
                    };

                    let filterByDecorators = filteredNode => {
                        if (filteredNode.expression && filteredNode.expression.expression) {
                            let _test = /(NgModule|Component|Injectable|Pipe|Directive)/.test(
                                filteredNode.expression.expression.text
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

                    node.decorators.filter(filterByDecorators).forEach(visitDecorator);
                } else if (node.symbol) {
                    if (node.symbol.flags === ts.SymbolFlags.Class) {
                        this.processClass(node, file, srcFile, outputSymbols, fileBody);
                    } else if (node.symbol.flags === ts.SymbolFlags.Interface) {
                        let name = this.getSymboleName(node);
                        let IO = this.getInterfaceIO(file, srcFile, node, fileBody);
                        let interfaceDeps: IInterfaceDep = {
                            name,
                            id: 'interface-' + name + '-' + hash,
                            file: file,
                            type: 'interface',
                            sourceCode: srcFile.getText()
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
                        }
                        if (IO.methods) {
                            interfaceDeps.methods = IO.methods;
                        }
                        if (IO.extends) {
                            interfaceDeps.extends = IO.extends;
                        }
                        if (typeof IO.ignore === 'undefined') {
                            this.debug(interfaceDeps);
                            outputSymbols.interfaces.push(interfaceDeps);
                        } else {
                            this.ignore(interfaceDeps);
                        }
                    } else if (ts.isFunctionDeclaration(node)) {
                        let infos = this.visitFunctionDeclaration(node);
                        // let tags = this.visitFunctionDeclarationJSDocTags(node);
                        let name = infos.name;
                        let functionDep: IFunctionDecDep = {
                            name,
                            file: file,
                            ctype: 'miscellaneous',
                            subtype: 'function',
                            description: this.visitEnumTypeAliasFunctionDeclarationDescription(node)
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
                        if (typeof infos.ignore === 'undefined') {
                            if (
                                !(
                                    this.hasPrivateJSDocTag(functionDep.jsdoctags) &&
                                    Configuration.mainData.disablePrivate
                                )
                            ) {
                                outputSymbols.miscellaneous.functions.push(functionDep);
                            }
                        }
                    } else if (ts.isEnumDeclaration(node)) {
                        let infos = this.visitEnumDeclaration(node);
                        let name = node.name.text;
                        let enumDeps: IEnumDecDep = {
                            name,
                            childs: infos,
                            ctype: 'miscellaneous',
                            subtype: 'enum',
                            description: this.visitEnumTypeAliasFunctionDeclarationDescription(
                                node
                            ),
                            file: file
                        };
                        if (!isIgnore(node)) {
                            outputSymbols.miscellaneous.enumerations.push(enumDeps);
                        }
                    } else if (ts.isTypeAliasDeclaration(node)) {
                        let infos = this.visitTypeDeclaration(node);
                        let name = infos.name;
                        let typeAliasDeps: ITypeAliasDecDep = {
                            name,
                            ctype: 'miscellaneous',
                            subtype: 'typealias',
                            rawtype: this.classHelper.visitType(node),
                            file: file,
                            description: this.visitEnumTypeAliasFunctionDeclarationDescription(node)
                        };
                        if (node.type) {
                            typeAliasDeps.kind = node.type.kind;
                            if (typeAliasDeps.rawtype === '') {
                                typeAliasDeps.rawtype = kindToType(node.type.kind);
                            }
                        }
                        if (!isIgnore(node)) {
                            outputSymbols.miscellaneous.typealiases.push(typeAliasDeps);
                        }
                    } else if (ts.isModuleDeclaration(node)) {
                        if (node.body) {
                            if (node.body.statements && node.body.statements.length > 0) {
                                node.body.statements.forEach(statement =>
                                    parseNode(file, srcFile, statement, node.body)
                                );
                            }
                        }
                    }
                } else {
                    let IO = this.getRouteIO(file, srcFile, node);
                    if (IO.routes) {
                        let newRoutes;
                        try {
                            newRoutes = RouterParserUtil.cleanRawRouteParsed(IO.routes);
                        } catch (e) {
                            // tslint:disable-next-line:max-line-length
                            logger.error(
                                'Routes parsing error, maybe a trailing comma or an external variable, trying to fix that later after sources scanning.'
                            );
                            newRoutes = IO.routes.replace(/ /gm, '');
                            RouterParserUtil.addIncompleteRoute({
                                data: newRoutes,
                                file: file
                            });
                            return true;
                        }
                        outputSymbols.routes = [...outputSymbols.routes, ...newRoutes];
                    }
                    if (ts.isClassDeclaration(node)) {
                        this.processClass(node, file, srcFile, outputSymbols, fileBody);
                    }
                    if (ts.isExpressionStatement(node) || ts.isIfStatement(node)) {
                        let bootstrapModuleReference = 'bootstrapModule';
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
                        if (srcFile.text.indexOf(bootstrapModuleReference) !== -1) {
                            if (node.expression) {
                                resultNode = this.findExpressionByNameInExpressions(
                                    node.expression,
                                    'bootstrapModule'
                                );
                            }
                            if (typeof node.thenStatement !== 'undefined') {
                                if (
                                    node.thenStatement.statements &&
                                    node.thenStatement.statements.length > 0
                                ) {
                                    let firstStatement = node.thenStatement.statements[0];
                                    resultNode = this.findExpressionByNameInExpressions(
                                        firstStatement.expression,
                                        'bootstrapModule'
                                    );
                                }
                            }
                            if (!resultNode) {
                                if (
                                    node.expression &&
                                    node.expression.arguments &&
                                    node.expression.arguments.length > 0
                                ) {
                                    resultNode = this.findExpressionByNameInExpressionArguments(
                                        node.expression.arguments,
                                        'bootstrapModule'
                                    );
                                }
                            }
                            if (resultNode) {
                                if (resultNode.arguments.length > 0) {
                                    _.forEach(resultNode.arguments, (argument: any) => {
                                        if (argument.text) {
                                            rootModule = argument.text;
                                        }
                                    });
                                }
                                if (rootModule) {
                                    RouterParserUtil.setRootModule(rootModule);
                                }
                            }
                        }
                    }
                    if (ts.isVariableStatement(node) && !RouterParserUtil.isVariableRoutes(node)) {
                        let infos: any = this.visitVariableDeclaration(node);
                        let name = infos.name;
                        let deps: any = {
                            name,
                            ctype: 'miscellaneous',
                            subtype: 'variable',
                            file: file
                        };
                        deps.type = infos.type ? infos.type : '';
                        if (infos.defaultValue) {
                            deps.defaultValue = infos.defaultValue;
                        }
                        if (infos.initializer) {
                            deps.initializer = infos.initializer;
                        }
                        if (node.jsDoc && node.jsDoc.length > 0 && node.jsDoc[0].comment) {
                            deps.description = marked(node.jsDoc[0].comment);
                        }
                        if (isModuleWithProviders(node)) {
                            let routingInitializer = getModuleWithProviders(node);
                            RouterParserUtil.addModuleWithRoutes(name, [routingInitializer], file);
                            RouterParserUtil.addModule(name, [routingInitializer]);
                        }
                        if (!isIgnore(node)) {
                            outputSymbols.miscellaneous.variables.push(deps);
                        }
                    }
                    if (ts.isTypeAliasDeclaration(node)) {
                        let infos = this.visitTypeDeclaration(node);
                        let name = infos.name;
                        let deps: ITypeAliasDecDep = {
                            name,
                            ctype: 'miscellaneous',
                            subtype: 'typealias',
                            rawtype: this.classHelper.visitType(node),
                            file: file,
                            description: this.visitEnumTypeAliasFunctionDeclarationDescription(node)
                        };
                        if (node.type) {
                            deps.kind = node.type.kind;
                        }
                        if (!isIgnore(node)) {
                            outputSymbols.miscellaneous.typealiases.push(deps);
                        }
                    }
                    if (ts.isFunctionDeclaration(node)) {
                        let infos = this.visitFunctionDeclaration(node);
                        let name = infos.name;
                        let functionDep: IFunctionDecDep = {
                            name,
                            ctype: 'miscellaneous',
                            subtype: 'function',
                            file: file,
                            description: this.visitEnumTypeAliasFunctionDeclarationDescription(node)
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
                        if (typeof infos.ignore === 'undefined') {
                            if (
                                !(
                                    this.hasPrivateJSDocTag(functionDep.jsdoctags) &&
                                    Configuration.mainData.disablePrivate
                                )
                            ) {
                                outputSymbols.miscellaneous.functions.push(functionDep);
                            }
                        }
                    }
                    if (ts.isEnumDeclaration(node)) {
                        let infos = this.visitEnumDeclaration(node);
                        let name = node.name.text;
                        let enumDeps: IEnumDecDep = {
                            name,
                            childs: infos,
                            ctype: 'miscellaneous',
                            subtype: 'enum',
                            description: this.visitEnumTypeAliasFunctionDeclarationDescription(
                                node
                            ),
                            file: file
                        };
                        if (!isIgnore(node)) {
                            outputSymbols.miscellaneous.enumerations.push(enumDeps);
                        }
                    }
                }
            };

            parseNode(fileName, scannedFile, initialNode);
        });
    }

    /**
     * Function to in a specific store an entity, and check before is there is not the same one
     * in that store : same name, id and file
     * @param entity Entity to store
     * @param store Store
     */
    private addNewEntityInStore(entity, store) {
        let findSameEntityInStore = _.filter(store, {
            name: entity.name,
            id: entity.id,
            file: entity.file
        });
        if (findSameEntityInStore.length === 0) {
            store.push(entity);
        }
    }

    private debug(deps: IDep) {
        if (deps) {
            logger.debug('found', `${deps.name}`);
        } else {
            return;
        }
        ['imports', 'exports', 'declarations', 'providers', 'bootstrap'].forEach(symbols => {
            if (deps[symbols] && deps[symbols].length > 0) {
                logger.debug('', `- ${symbols}:`);
                deps[symbols]
                    .map(i => i.name)
                    .forEach(d => {
                        logger.debug('', `\t- ${d}`);
                    });
            }
        });
    }

    private ignore(deps: IDep) {
        if (deps) {
            logger.warn('ignore', `${deps.name}`);
        } else {
            return;
        }
    }

    private findExpressionByNameInExpressions(entryNode, name) {
        let result;
        let loop = function(node, z) {
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
        let that = this;
        let i = 0;
        let len = arg.length;
        let loop = function(node, z) {
            if (node.body) {
                if (node.body.statements && node.body.statements.length > 0) {
                    let j = 0;
                    let leng = node.body.statements.length;
                    for (j; j < leng; j++) {
                        result = that.findExpressionByNameInExpressions(node.body.statements[j], z);
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
            _.forEach(decorators, function(decorator: any) {
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
        return this.parseDecorator(metadata, 'Controller');
    }

    private isComponent(metadata) {
        return this.parseDecorator(metadata, 'Component');
    }

    private isPipe(metadata) {
        return this.parseDecorator(metadata, 'Pipe');
    }

    private isDirective(metadata) {
        return this.parseDecorator(metadata, 'Directive');
    }

    private isInjectable(metadata) {
        return this.parseDecorator(metadata, 'Injectable');
    }

    private isModule(metadata) {
        return this.parseDecorator(metadata, 'NgModule') || this.parseDecorator(metadata, 'Module');
    }

    private hasInternalDecorator(metadatas) {
        return (
            this.parseDecorators(metadatas, 'Controller') ||
            this.parseDecorators(metadatas, 'Component') ||
            this.parseDecorators(metadatas, 'Pipe') ||
            this.parseDecorators(metadatas, 'Directive') ||
            this.parseDecorators(metadatas, 'Injectable') ||
            this.parseDecorators(metadatas, 'NgModule') ||
            this.parseDecorators(metadatas, 'Module')
        );
    }

    private isGuard(ioImplements: string[]): boolean {
        return (
            _.includes(ioImplements, 'CanActivate') ||
            _.includes(ioImplements, 'CanActivateChild') ||
            _.includes(ioImplements, 'CanDeactivate') ||
            _.includes(ioImplements, 'Resolve') ||
            _.includes(ioImplements, 'CanLoad')
        );
    }

    private getSymboleName(node): string {
        return node.name.text;
    }

    private findProperties(
        visitedNode: ts.Decorator,
        sourceFile: ts.SourceFile
    ): ReadonlyArray<ts.ObjectLiteralElementLike> {
        if (
            visitedNode.expression &&
            visitedNode.expression.arguments &&
            visitedNode.expression.arguments.length > 0
        ) {
            let pop = visitedNode.expression.arguments[0];

            if (pop && pop.properties && pop.properties.length >= 0) {
                return pop.properties;
            } else if (pop && pop.kind && pop.kind === SyntaxKind.StringLiteral) {
                return [pop];
            } else {
                logger.warn('Empty metadatas, trying to found it with imports.');
                return ImportsUtil.findValueInImportOrLocalVariables(pop.text, sourceFile);
            }
        }

        return [];
    }

    private isAngularLifecycleHook(methodName) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        const ANGULAR_LIFECYCLE_METHODS = [
            'ngOnInit',
            'ngOnChanges',
            'ngDoCheck',
            'ngOnDestroy',
            'ngAfterContentInit',
            'ngAfterContentChecked',
            'ngAfterViewInit',
            'ngAfterViewChecked',
            'writeValue',
            'registerOnChange',
            'registerOnTouched',
            'setDisabledState'
        ];
        return ANGULAR_LIFECYCLE_METHODS.indexOf(methodName) >= 0;
    }

    private visitTypeDeclaration(node: ts.TypeAliasDeclaration) {
        let result: any = {
            name: node.name.text,
            kind: node.kind
        };
        let jsdoctags = this.jsdocParserUtil.getJSDocs(node);

        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    }

    private visitArgument(arg) {
        let result: any = {
            name: arg.name.text,
            type: this.classHelper.visitType(arg)
        };
        if (arg.dotDotDotToken) {
            result.dotDotDotToken = true;
        }
        if (arg.questionToken) {
            result.optional = true;
        }
        if (arg.type) {
            result.type = this.mapType(arg.type.kind);
            if (arg.type.kind === 157) {
                // try replace TypeReference with typeName
                if (arg.type.typeName) {
                    result.type = arg.type.typeName.text;
                }
            }
        }
        return result;
    }

    private mapType(type): string | undefined {
        switch (type) {
            case 95:
                return 'null';
            case 119:
                return 'any';
            case 122:
                return 'boolean';
            case 130:
                return 'never';
            case 133:
                return 'number';
            case 136:
                return 'string';
            case 139:
                return 'undefined';
            case 159:
                return 'typeReference';
        }
    }

    private hasPrivateJSDocTag(tags): boolean {
        let result = false;
        if (tags) {
            tags.forEach(tag => {
                if (tag.tagName && tag.tagName.text && tag.tagName.text === 'private') {
                    result = true;
                }
            });
        }
        return result;
    }

    private visitFunctionDeclaration(method: ts.FunctionDeclaration) {
        let methodName = method.name ? method.name.text : 'Unnamed function';
        let result: any = {
            name: methodName,
            args: method.parameters ? method.parameters.map(prop => this.visitArgument(prop)) : []
        };
        let jsdoctags = this.jsdocParserUtil.getJSDocs(method);

        if (typeof method.type !== 'undefined') {
            result.returnType = this.classHelper.visitType(method.type);
        }

        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                let kinds = method.modifiers
                    .map(modifier => {
                        return modifier.kind;
                    })
                    .reverse();
                if (
                    _.indexOf(kinds, SyntaxKind.PublicKeyword) !== -1 &&
                    _.indexOf(kinds, SyntaxKind.StaticKeyword) !== -1
                ) {
                    kinds = kinds.filter(kind => kind !== SyntaxKind.PublicKeyword);
                }
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
                _.forEach(jsdoctags[0].tags, tag => {
                    if (tag.tagName) {
                        if (tag.tagName.text) {
                            if (tag.tagName.text.indexOf('ignore') > -1) {
                                result.ignore = true;
                            }
                        }
                    }
                });
            }
        }
        if (result.jsdoctags && result.jsdoctags.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args, result.jsdoctags);
        } else if (result.args.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args);
        }
        return result;
    }

    private visitVariableDeclaration(node) {
        if (node.declarationList.declarations) {
            let i = 0;
            let len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                let result: any = {
                    name: node.declarationList.declarations[i].name.text,
                    defaultValue: node.declarationList.declarations[i].initializer
                        ? this.classHelper.stringifyDefaultValue(
                              node.declarationList.declarations[i].initializer
                          )
                        : undefined
                };
                if (node.declarationList.declarations[i].initializer) {
                    result.initializer = node.declarationList.declarations[i].initializer;
                }
                if (node.declarationList.declarations[i].type) {
                    result.type = this.classHelper.visitType(
                        node.declarationList.declarations[i].type
                    );
                }
                if (typeof result.type === 'undefined' && result.initializer) {
                    result.type = kindToType(result.initializer.kind);
                }
                return result;
            }
        }
    }

    private visitFunctionDeclarationJSDocTags(node: ts.FunctionDeclaration): string {
        let jsdoctags = this.jsdocParserUtil.getJSDocs(node);
        let result;
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    }

    private visitEnumTypeAliasFunctionDeclarationDescription(node): string {
        let description: string = '';
        if (node.jsDoc) {
            if (node.jsDoc.length > 0) {
                if (typeof node.jsDoc[0].comment !== 'undefined') {
                    description = marked(node.jsDoc[0].comment);
                }
            }
        }
        return description;
    }

    private visitEnumDeclaration(node: ts.EnumDeclaration) {
        let result = [];
        if (node.members) {
            let i = 0;
            let len = node.members.length;
            for (i; i < len; i++) {
                let member: any = {
                    name: node.members[i].name.text
                };
                if (node.members[i].initializer) {
                    member.value = node.members[i].initializer.text;
                }
                result.push(member);
            }
        }
        return result;
    }

    private visitEnumDeclarationForRoutes(fileName, node) {
        if (node.declarationList.declarations) {
            let i = 0;
            let len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                let routesInitializer = node.declarationList.declarations[i].initializer;
                let data = new CodeGenerator().generate(routesInitializer);
                RouterParserUtil.addRoute({
                    name: node.declarationList.declarations[i].name.text,
                    data: RouterParserUtil.cleanRawRoute(data),
                    filename: fileName
                });
                return [
                    {
                        routes: data
                    }
                ];
            }
        }
        return [];
    }

    private getRouteIO(filename: string, sourceFile: ts.SourceFile, node: ts.Node) {
        let res;
        if (sourceFile.statements) {
            res = sourceFile.statements.reduce((directive, statement) => {
                if (RouterParserUtil.isVariableRoutes(statement)) {
                    if (statement.pos === node.pos && statement.end === node.end) {
                        return directive.concat(
                            this.visitEnumDeclarationForRoutes(filename, statement)
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

    private getClassIO(filename: string, sourceFile: ts.SourceFile, node: ts.Node, fileBody) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        let reducedSource = fileBody ? fileBody.statements : sourceFile.statements;
        let res = reducedSource.reduce((directive, statement) => {
            if (ts.isClassDeclaration(statement)) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(
                        this.classHelper.visitClassDeclaration(filename, statement, sourceFile)
                    );
                }
            }

            return directive;
        }, []);

        return res[0] || {};
    }

    private getInterfaceIO(filename: string, sourceFile, node, fileBody) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        let reducedSource = fileBody ? fileBody.statements : sourceFile.statements;
        let res = reducedSource.reduce((directive, statement) => {
            if (ts.isInterfaceDeclaration(statement)) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(
                        this.classHelper.visitClassDeclaration(filename, statement, sourceFile)
                    );
                }
            }

            return directive;
        }, []);

        return res[0] || {};
    }
}
