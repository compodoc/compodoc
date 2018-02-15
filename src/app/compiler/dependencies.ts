import * as path from 'path';
import * as util from 'util';

import * as _ from 'lodash';
import * as ts from 'typescript';
import Ast from 'ts-simple-ast';
import { TypeGuards } from 'ts-simple-ast';

import { compilerHost, detectIndent } from '../../utilities';
import { logger } from '../../logger';
import { markedtags, mergeTagsAndArgs } from '../../utils/utils';
import { kindToType } from '../../utils/kind-to-type';
import { CodeGenerator } from './code-generator';
import { Configuration } from '../configuration';
import { $componentsTreeEngine } from '../engines/components-tree.engine';
import { DirectiveDepFactory } from './deps/directive-dep.factory';
import { ComponentHelper, ComponentCache } from './deps/helpers/component-helper';
import { ModuleDepFactory } from './deps/module-dep.factory';
import { ComponentDepFactory } from './deps/component-dep.factory';
import { ModuleHelper } from './deps/helpers/module-helper';
import { JsDocHelper } from './deps/helpers/js-doc-helper';
import { SymbolHelper } from './deps/helpers/symbol-helper';
import { ClassHelper } from './deps/helpers/class-helper';
import { ConfigurationInterface } from '../interfaces/configuration.interface';
import {
    JsdocParserUtil,
    RouterParserUtil,
    ImportsUtil,
    isModuleWithProviders,
    getModuleWithProviders,
    hasSpreadElementInArray
} from '../../utils';
import {
    IInjectableDep,
    IPipeDep,
    IDep,
    IInterfaceDep,
    IFunctionDecDep,
    IEnumDecDep,
    ITypeAliasDecDep
} from './dependencies.interfaces';

const marked = require('marked');
const ast = new Ast();

// TypeScript reference : https://github.com/Microsoft/TypeScript/blob/master/lib/typescript.d.ts

export class Dependencies {

    private files: string[];
    private program: ts.Program;
    private typeChecker: ts.TypeChecker;
    private engine: any;
    private cache: ComponentCache = new ComponentCache();
    private componentHelper: ComponentHelper;
    private moduleHelper = new ModuleHelper(this.cache);
    private jsDocHelper = new JsDocHelper();
    private symbolHelper = new SymbolHelper();
    private classHelper: ClassHelper;

    private jsdocParserUtil = new JsdocParserUtil();
    private importsUtil = new ImportsUtil();

    constructor(
        files: string[],
        options: any,
        private configuration: ConfigurationInterface,
        private routerParser: RouterParserUtil) {
        this.files = files;
        const transpileOptions = {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
            tsconfigDirectory: options.tsconfigDirectory
        };
        this.program = ts.createProgram(this.files, transpileOptions, compilerHost(transpileOptions));
        this.typeChecker = this.program.getTypeChecker();
        this.classHelper = new ClassHelper(this.typeChecker, this.configuration);
        this.componentHelper = new ComponentHelper(this.classHelper);
    }

    public getDependencies() {
        let deps = {
            modules: [],
            modulesForGraph: [],
            components: [],
            injectables: [],
            interceptors: [],
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

            if (path.extname(filePath) === '.ts') {

                if (filePath.lastIndexOf('.d.ts') === -1 && filePath.lastIndexOf('spec.ts') === -1) {
                    logger.info('parsing', filePath);
                    this.getSourceFileDecorators(file, deps);
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
                                _var.initializer.elements.forEach((element) => {
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

                let onLink = (mod) => {
                    if (mod.file === _variable.file) {
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
                                newVar.forEach((newEle) => {
                                    if (typeof _.find(initialArray, { 'name': newEle.name }) === 'undefined') {
                                        initialArray.push(newEle);
                                    }
                                });
                            }
                        };
                        process(mod.imports, _variable);
                        process(mod.exports, _variable);
                        process(mod.declarations, _variable);
                        process(mod.providers, _variable);
                    }
                };

                deps.modules.forEach(onLink);
                deps.modulesForGraph.forEach(onLink);
            });
        }

        // RouterParser.printModulesRoutes();
        // RouterParser.printRoutes();

        /*if (RouterParser.incompleteRoutes.length > 0) {
            if (deps['miscellaneous']['variables'].length > 0) {
                RouterParser.fixIncompleteRoutes(deps['miscellaneous']['variables']);
            }
        }*/

        // $componentsTreeEngine.createTreesForComponents();

        this.routerParser.linkModulesAndRoutes();
        this.routerParser.constructModulesTree();

        deps.routesTree = this.routerParser.constructRoutesTree();

        return deps;
    }

    private processClass(node, file, srcFile, outputSymbols, fileBody) {
        let name = this.getSymboleName(node);
        let IO = this.getClassIO(file, srcFile, node, fileBody);
        let deps: any = {
            name,
            id: 'class-' + name + '-' + Date.now(),
            file: file,
            type: 'class',
            sourceCode: srcFile.getText()
        };
        if (IO.constructor) {
            deps.constructorObj = IO.constructor;
        }
        if (IO.properties) {
            deps.properties = IO.properties;
        }
        if (IO.description) {
            deps.description = IO.description;
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
        if (IO.implements && IO.implements.length > 0) {
            deps.implements = IO.implements;
        }
        if (IO.accessors) {
            deps.accessors = IO.accessors;
        }
        this.debug(deps);
        outputSymbols.classes.push(deps);
    }

    private getSourceFileDecorators(initialSrcFile: ts.SourceFile, outputSymbols: any): void {

        let cleaner = (process.cwd() + path.sep).replace(/\\/g, '/');
        let fileName = initialSrcFile.fileName.replace(cleaner, '');
        let scannedFile = initialSrcFile;

        // Search in file for variable statement as routes definitions

        const astFile = (typeof ast.getSourceFile(initialSrcFile.fileName) !== 'undefined') ?
                        ast.getSourceFile(initialSrcFile.fileName) :
                        ast.addExistingSourceFile(initialSrcFile.fileName);

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
                        if (variableDeclarations[i].compilerNode.type.typeName &&
                            variableDeclarations[i].compilerNode.type.typeName.text === 'Routes') {
                            hasRoutesStatements = true;
                        }
                    }
                }
            });
        }

        if (hasRoutesStatements) {
            // Clean file for spread and dynamics inside routes definitions
            logger.info('Analysing routes definitions and clean them if necessary');

            // scannedFile = this.routerParser.cleanFileIdentifiers(astFile).compilerNode;
            let firstClean = this.routerParser.cleanFileSpreads(astFile);
            scannedFile = firstClean.compilerNode;
            scannedFile = this.routerParser.cleanFileDynamics(astFile).compilerNode;

            scannedFile.kind = ts.SyntaxKind.SourceFile;
        }

        ts.forEachChild(scannedFile, (initialNode: ts.Node) => {
            if (this.jsDocHelper.hasJSDocInternalTag(fileName, scannedFile, initialNode) && this.configuration.mainData.disableInternal) {
                return;
            }
            let parseNode = (file, srcFile, node, fileBody) => {
                if (node.decorators) {
                    let classWithCustomDecorator = false;
                    let visitNode = (visitedNode, index) => {

                        let deps: IDep;

                        let metadata = node.decorators;
                        let name = this.getSymboleName(node);
                        let props = this.findProperties(visitedNode, srcFile);
                        let IO = this.componentHelper.getComponentIO(file, srcFile, node, fileBody);

                        if (this.isModule(metadata)) {
                            const moduleDep = new ModuleDepFactory(this.moduleHelper).create(file, srcFile, name, props, IO);
                            if (this.routerParser.hasRouterModuleInImports(moduleDep.imports)) {
                                this.routerParser.addModuleWithRoutes(name, this.moduleHelper.getModuleImportsRaw(props, srcFile), file);
                            }
                            this.routerParser.addModule(name, moduleDep.imports);
                            outputSymbols.modules.push(moduleDep);
                            outputSymbols.modulesForGraph.push(moduleDep);
                            deps = moduleDep;
                        } else if (this.isComponent(metadata)) {
                            if (props.length === 0) {
                                return;
                            }
                            const componentDep = new ComponentDepFactory(this.componentHelper, this.configuration).create(file, srcFile, name, props, IO);
                            $componentsTreeEngine.addComponent(componentDep);
                            outputSymbols.components.push(componentDep);
                            deps = componentDep;
                        } else if (this.isInjectable(metadata)) {
                            let injectableDeps: IInjectableDep = {
                                name,
                                id: 'injectable-' + name + '-' + Date.now(),
                                file: file,
                                type: 'injectable',
                                properties: IO.properties,
                                methods: IO.methods,
                                description: IO.description,
                                sourceCode: srcFile.getText(),
                                exampleUrls: this.componentHelper.getComponentExampleUrls(srcFile.getText())
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
                            if (IO.implements && IO.implements.length > 0) {
                                if (_.indexOf(IO.implements, 'HttpInterceptor') >= 0) {
                                    outputSymbols.interceptors.push(injectableDeps);
                                } else {
                                    outputSymbols.injectables.push(injectableDeps);
                                }
                            } else {
                                outputSymbols.injectables.push(injectableDeps);
                            }

                            deps = injectableDeps;
                        } else if (this.isPipe(metadata)) {
                            let pipeDeps: IPipeDep = {
                                name,
                                id: 'pipe-' + name + '-' + Date.now(),
                                file: file,
                                type: 'pipe',
                                description: IO.description,
                                properties: IO.properties,
                                methods: IO.methods,
                                pure: this.componentHelper.getComponentPure(props, srcFile),
                                ngname: this.componentHelper.getComponentName(props, srcFile),
                                sourceCode: srcFile.getText(),
                                exampleUrls: this.componentHelper.getComponentExampleUrls(srcFile.getText())
                            };
                            if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                                pipeDeps.jsdoctags = IO.jsdoctags[0].tags;
                            }
                            outputSymbols.pipes.push(pipeDeps);
                            deps = pipeDeps;
                        } else if (this.isDirective(metadata)) {
                            if (props.length === 0) {
                                return;
                            }
                            let directiveDeps = new DirectiveDepFactory(this.componentHelper, this.configuration).create(file, srcFile, name, props, IO);
                            outputSymbols.directives.push(directiveDeps);
                            deps = directiveDeps;
                        } else {
                            // Just a class
                            if (!classWithCustomDecorator) {
                                classWithCustomDecorator = true;
                                this.processClass(node, file, srcFile, outputSymbols, fileBody);
                            }
                        }
                        this.cache.set(name, deps);
                        this.debug(deps);
                    };

                    let filterByDecorators = (filteredNode) => {
                        if (filteredNode.expression && filteredNode.expression.expression) {
                            let _test = /(NgModule|Component|Injectable|Pipe|Directive)/.test(filteredNode.expression.expression.text);
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

                    node.decorators
                        .filter(filterByDecorators)
                        .forEach(visitNode);
                } else if (node.symbol) {
                    if (node.symbol.flags === ts.SymbolFlags.Class) {
                        this.processClass(node, file, srcFile, outputSymbols, fileBody);
                    } else if (node.symbol.flags === ts.SymbolFlags.Interface) {
                        let name = this.getSymboleName(node);
                        let IO = this.getInterfaceIO(file, srcFile, node, fileBody);
                        let interfaceDeps: IInterfaceDep = {
                            name,
                            id: 'interface-' + name + '-' + Date.now(),
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
                        this.debug(interfaceDeps);
                        outputSymbols.interfaces.push(interfaceDeps);
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
                        if (infos.jsdoctags && infos.jsdoctags.length > 0) {
                            functionDep.jsdoctags = infos.jsdoctags;
                        }

                        outputSymbols.miscellaneous.functions.push(functionDep);
                    } else if (ts.isEnumDeclaration(node)) {
                        let infos = this.visitEnumDeclaration(node);
                        let name = node.name.text;
                        let enumDeps: IEnumDecDep = {
                            name,
                            childs: infos,
                            ctype: 'miscellaneous',
                            subtype: 'enum',
                            description: this.visitEnumTypeAliasFunctionDeclarationDescription(node),
                            file: file
                        };
                        outputSymbols.miscellaneous.enumerations.push(enumDeps);
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
                        outputSymbols.miscellaneous.typealiases.push(typeAliasDeps);
                    } else if (ts.isModuleDeclaration(node)) {
                        if (node.body) {
                            if (node.body.statements && node.body.statements.length > 0) {
                                node.body.statements
                                    .forEach((statement) => parseNode(file, srcFile, statement, node.body));
                            }
                        }
                    }
                } else {
                    let IO = this.getRouteIO(file, srcFile, node);
                    if (IO.routes) {
                        let newRoutes;
                        try {
                            newRoutes = this.routerParser.cleanRawRouteParsed(IO.routes);
                        } catch (e) {
                            // tslint:disable-next-line:max-line-length
                            logger.error('Routes parsing error, maybe a trailing comma or an external variable, trying to fix that later after sources scanning.');
                            newRoutes = IO.routes.replace(/ /gm, '');
                            this.routerParser.addIncompleteRoute({
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
                    if (ts.isExpressionStatement(node)) {
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
                                resultNode = this.findExpressionByNameInExpressions(node.expression, 'bootstrapModule');
                            }
                            if (!resultNode) {
                                if (node.expression && node.expression.arguments && node.expression.arguments.length > 0) {
                                    resultNode = this.findExpressionByNameInExpressionArguments(node.expression.arguments, 'bootstrapModule');
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
                                    this.routerParser.setRootModule(rootModule);
                                }
                            }
                        }
                    }
                    if (ts.isVariableStatement(node) && !this.routerParser.isVariableRoutes(node)) {
                        let infos: any = this.visitVariableDeclaration(node);
                        let name = infos.name;
                        let deps: any = {
                            name,
                            ctype: 'miscellaneous',
                            subtype: 'variable',
                            file: file
                        };
                        deps.type = (infos.type) ? infos.type : '';
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
                            this.routerParser.addModuleWithRoutes(name, [routingInitializer], file);
                            this.routerParser.addModule(name, [routingInitializer]);
                        }

                        outputSymbols.miscellaneous.variables.push(deps);
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
                        outputSymbols.miscellaneous.typealiases.push(deps);
                    }
                    if (ts.isFunctionDeclaration(node)) {
                        let infos = this.visitFunctionDeclaration(node);
                        let name = infos.name;
                        let deps: IFunctionDecDep = {
                            name,
                            ctype: 'miscellaneous',
                            subtype: 'function',
                            file: file,
                            description: this.visitEnumTypeAliasFunctionDeclarationDescription(node)
                        };
                        if (infos.args) {
                            deps.args = infos.args;
                        }
                        if (infos.jsdoctags && infos.jsdoctags.length > 0) {
                            deps.jsdoctags = infos.jsdoctags;
                        }
                        outputSymbols.miscellaneous.functions.push(deps);
                    }
                    if (ts.isEnumDeclaration(node)) {
                        let infos = this.visitEnumDeclaration(node);
                        let name = node.name.text;
                        let deps: IEnumDecDep = {
                            name,
                            childs: infos,
                            ctype: 'miscellaneous',
                            subtype: 'enum',
                            description: this.visitEnumTypeAliasFunctionDeclarationDescription(node),
                            file: file
                        };
                        outputSymbols.miscellaneous.enumerations.push(deps);
                    }
                }
            }

            parseNode(fileName, scannedFile, initialNode);

        });

    }
    private debug(deps: IDep) {
        if (deps) {
            logger.debug('found', `${deps.name}`);
        } else {
            return;
        }
        [
            'imports', 'exports', 'declarations', 'providers', 'bootstrap'
        ].forEach(symbols => {
            if (deps[symbols] && deps[symbols].length > 0) {
                logger.debug('', `- ${symbols}:`);
                deps[symbols].map(i => i.name).forEach(d => {
                    logger.debug('', `\t- ${d}`);
                });

            }
        });
    }

    private findExpressionByNameInExpressions(entryNode, name) {
        let result;
        let loop = function (node, z) {
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
        };
        loop(entryNode, name);
        return result;
    }

    private findExpressionByNameInExpressionArguments(arg, name) {
        let result;
        let that = this;
        let i = 0;
        let len = arg.length;
        let loop = function (node, z) {
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

    private isComponent(metadatas) {
        return this.parseDecorators(metadatas, 'Component');
    }

    private isPipe(metadatas) {
        return this.parseDecorators(metadatas, 'Pipe');
    }

    private isDirective(metadatas) {
        return this.parseDecorators(metadatas, 'Directive');
    }

    private isInjectable(metadatas) {
        return this.parseDecorators(metadatas, 'Injectable');
    }

    private isModule(metadatas) {
        return this.parseDecorators(metadatas, 'NgModule');
    }

    private getSymboleName(node): string {
        return node.name.text;
    }

    private findProperties(visitedNode: ts.Decorator, sourceFile: ts.SourceFile): ReadonlyArray<ts.ObjectLiteralElementLike> {
        if (visitedNode.expression && visitedNode.expression.arguments && visitedNode.expression.arguments.length > 0) {
            let pop = visitedNode.expression.arguments[0];

            if (pop && pop.properties && pop.properties.length >= 0) {
                return pop.properties;
            } else {
                logger.warn('Empty metadatas, trying to found it with imports.');
                return this.importsUtil.findValueInImportOrLocalVariables(pop.text, sourceFile);
            }
        }

        return [];
    }

    private isAngularLifecycleHook(methodName) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        const ANGULAR_LIFECYCLE_METHODS = [
            'ngOnInit', 'ngOnChanges', 'ngDoCheck', 'ngOnDestroy', 'ngAfterContentInit', 'ngAfterContentChecked',
            'ngAfterViewInit', 'ngAfterViewChecked', 'writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState'
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

    private visitFunctionDeclaration(method: ts.FunctionDeclaration) {
        let result: any = {
            name: method.name.text,
            args: method.parameters ? method.parameters.map((prop) => this.visitArgument(prop)) : []
        };
        let jsdoctags = this.jsdocParserUtil.getJSDocs(method);

        if (typeof method.type !== 'undefined') {
            result.returnType = this.classHelper.visitType(method.type);
        }

        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                let kinds = method.modifiers.map((modifier) => {
                    return modifier.kind;
                }).reverse();
                if (_.indexOf(kinds, ts.SyntaxKind.PublicKeyword) !== -1 && _.indexOf(kinds, ts.SyntaxKind.StaticKeyword) !== -1) {
                    kinds = kinds.filter((kind) => kind !== ts.SyntaxKind.PublicKeyword);
                };
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
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
                    defaultValue: node.declarationList.declarations[i].initializer ?
                        this.classHelper.stringifyDefaultValue(node.declarationList.declarations[i].initializer) : undefined
                };
                if (node.declarationList.declarations[i].initializer) {
                    result.initializer = node.declarationList.declarations[i].initializer;
                }
                if (node.declarationList.declarations[i].type) {
                    result.type = this.classHelper.visitType(node.declarationList.declarations[i].type);
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
                this.routerParser.addRoute({
                    name: node.declarationList.declarations[i].name.text,
                    data: this.routerParser.cleanRawRoute(data),
                    filename: fileName
                });
                return [{
                    routes: data
                }];
            }
        }
        return [];
    }

    private getRouteIO(filename: string, sourceFile: ts.SourceFile, node: ts.Node) {
        let res;
        if (sourceFile.statements) {
            res = sourceFile.statements.reduce((directive, statement) => {
                if (this.routerParser.isVariableRoutes(statement)) {
                    if (statement.pos === node.pos && statement.end === node.end) {
                        return directive.concat(this.visitEnumDeclarationForRoutes(filename, statement));
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
        let reducedSource = (fileBody) ? fileBody.statements : sourceFile.statements;
        let res = reducedSource.reduce((directive, statement) => {

            if (ts.isClassDeclaration(statement)) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(this.classHelper.visitClassDeclaration(filename, statement, sourceFile));
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
        let reducedSource = (fileBody) ? fileBody.statements : sourceFile.statements;
        let res = reducedSource.reduce((directive, statement) => {

            if (ts.isInterfaceDeclaration(statement)) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(this.classHelper.visitClassDeclaration(filename, statement, sourceFile));
                }
            }

            return directive;
        }, []);

        return res[0] || {};
    }

}
