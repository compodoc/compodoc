import * as path from 'path';
import * as util from 'util';
import { readFileSync } from 'fs-extra';

import { compilerHost, detectIndent } from '../../utilities';
import { logger } from '../../logger';
import { RouterParser } from '../../utils/router.parser';
import { LinkParser } from '../../utils/link-parser';
import { JSDocTagsParser } from '../../utils/jsdoc.parser';
import { markedtags } from '../../utils/utils';
import { kindToType } from '../../utils/kind-to-type';
import { generate } from './codegen';
import { stripBom, hasBom, cleanLifecycleHooksFromMethods } from '../../utils/utils';
import { Configuration } from '../configuration';
import { $componentsTreeEngine } from '../engines/components-tree.engine';

const marked = require('marked'),
      ts = require('typescript'),
      _ = require('lodash');

// TypeScript reference : https://github.com/Microsoft/TypeScript/blob/master/lib/typescript.d.ts

interface NodeObject {
    kind: Number;
    pos: Number;
    end: Number;
    text: string;
    initializer: NodeObject,
    name?: { text: string };
    expression?: NodeObject;
    elements?: NodeObject[];
    arguments?: NodeObject[];
    properties?: any[];
    parserContextFlags?: Number;
    equalsGreaterThanToken?: NodeObject[];
    parameters?: NodeObject[];
    Component?: string;
    body?: {
        pos: Number;
        end: Number;
        statements: NodeObject[];
    }
}

interface Deps {
    name: string;
    type: string;
    label?: string;
    file?: string;
    sourceCode?: string;
    description?: string;

    //Component

    animations?: string[]; // TODO
    changeDetection?: string;
    encapsulation?: string;
    entryComponents?: string; // TODO
    exportAs?: string;
    host?: string;
    inputs?: string[];
    interpolation?: string; // TODO
    moduleId?: string;
    outputs?: string[];
    queries?: Deps[]; // TODO
    selector?: string;
    styleUrls?: string[];
    styles?: string[];
    template?: string;
    templateUrl?: string[];
    viewProviders?: string[];

    implements?;
    extends?;

    inputsClass?: Object[];
    outputsClass?: Object[];
    propertiesClass?: Object[];
    methodsClass?: Object[];

    //common
    providers?: Deps[];

    //module
    declarations?: Deps[];
    bootstrap?: Deps[];

    imports?: Deps[];
    exports?: Deps[];

    routesTree?;
}

interface SymbolDeps {
    full: string;
    alias: string;
}

export class Dependencies {

    private files: string[];
    private program: ts.Program;
    private typeChecker: ts.TypeChecker;
    private engine: any;
    private __cache: any = {};
    private __nsModule: any = {};
    private unknown = '???';
    private configuration = Configuration.getInstance();

    constructor(files: string[], options: any) {
        this.files = files;
        const transpileOptions = {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
            tsconfigDirectory: options.tsconfigDirectory
        };
        this.program = ts.createProgram(this.files, transpileOptions, compilerHost(transpileOptions));
        this.typeChecker = this.program.getTypeChecker();
    }

    getDependencies() {
        let deps: any = {
            'modules': [],
            'components': [],
            'injectables': [],
            'pipes': [],
            'directives': [],
            'routes': [],
            'classes': [],
            'interfaces': [],
            'miscellaneous': {
                variables: [],
                functions: [],
                typealiases: [],
                enumerations: [],
                types: []
            }
        };

        let sourceFiles = this.program.getSourceFiles() || [];

        /**
         * Clean files with UTF-8 BOM
         */
        sourceFiles.forEach((file, index) => {
            let filePath = file.fileName;

            if (path.extname(filePath) === '.ts') {
                if (filePath.lastIndexOf('.d.ts') === -1 && filePath.lastIndexOf('spec.ts') === -1) {
                    if (hasBom(file.text)) {
                        let text = stripBom(file.text),
                            tt = file.update(text, {
                                newLength: text.length,
                                span: {
                                    start: 0,
                                    length: file.text.length
                                }
                            });
                        if (!tt.moduleAugmentations) {
                            tt.moduleAugmentations = [];
                        }
                        sourceFiles[index] = tt;
                    }
                }
            }
        });

        sourceFiles.map((file: ts.SourceFile) => {

            let filePath = file.fileName;

            if (path.extname(filePath) === '.ts') {

                if (filePath.lastIndexOf('.d.ts') === -1 && filePath.lastIndexOf('spec.ts') === -1) {
                    logger.info('parsing', filePath);

                    try {
                        this.getSourceFileDecorators(file, deps);
                    } catch (e) {
                        logger.error(e, file.fileName);
                    }
                }

            }

            return deps;

        });

        // End of file scanning
        // Try merging inside the same file declarated variables & modules with imports | exports | declarations | providers

        if (deps['miscellaneous'].variables.length > 0) {
            deps['miscellaneous'].variables.forEach(_variable => {
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
                                            type: this.getType(element.text)
                                        })
                                    }
                                });
                            }
                        }
                    }
                })(_variable, newVar);

                deps['modules'].forEach(mod => {
                    if (mod.file === _variable.file) {
                        let process = (initialArray, _var) => {
                            let indexToClean = 0,
                                found = false;
                            let findVariableInArray = (el, index, theArray) => {
                                if (el.name === _var.name) {
                                    indexToClean = index;
                                    found = true;
                                }
                            }
                            initialArray.forEach(findVariableInArray);
                            // Clean indexes to replace
                            if (found) {
                                initialArray.splice(indexToClean, 1);
                                // Add variable
                                newVar.forEach((newEle) => {
                                    if (typeof _.find(initialArray, { 'name': newEle.name}) === 'undefined') {
                                        initialArray.push(newEle);
                                    }
                                });
                            }
                        }
                        process(mod.imports, _variable);
                        process(mod.exports, _variable);
                        process(mod.declarations, _variable);
                        process(mod.providers, _variable);
                    }
                });
            });
        }

        //RouterParser.printModulesRoutes();
        //RouterParser.printRoutes();

        /*if (RouterParser.incompleteRoutes.length > 0) {
            if (deps['miscellaneous']['variables'].length > 0) {
                RouterParser.fixIncompleteRoutes(deps['miscellaneous']['variables']);
            }
        }*/

        //$componentsTreeEngine.createTreesForComponents();

        RouterParser.linkModulesAndRoutes();
        RouterParser.constructModulesTree();

        deps.routesTree = RouterParser.constructRoutesTree();

        return deps;
    }

    private getSourceFileDecorators(srcFile: ts.SourceFile, outputSymbols: Object): void {

        let cleaner = (process.cwd() + path.sep).replace(/\\/g, '/'),
            file = srcFile.fileName.replace(cleaner, '');

        ts.forEachChild(srcFile, (node: ts.Node) => {

            let deps: Deps = <Deps>{};
            if (node.decorators) {
                let visitNode = (visitedNode, index) => {

                    let metadata = node.decorators;
                    let name = this.getSymboleName(node);
                    let props = this.findProps(visitedNode);
                    let IO = this.getComponentIO(file, srcFile, node);

                    if (this.isModule(metadata)) {
                        deps = {
                            name,
                            file: file,
                            providers: this.getModuleProviders(props),
                            declarations: this.getModuleDeclations(props),
                            imports: this.getModuleImports(props),
                            exports: this.getModuleExports(props),
                            bootstrap: this.getModuleBootstrap(props),
                            type: 'module',
                            description: IO.description,
                            sourceCode: srcFile.getText()
                        };
                        if (RouterParser.hasRouterModuleInImports(deps.imports)) {
                            RouterParser.addModuleWithRoutes(name, this.getModuleImportsRaw(props), file);
                        }
                        RouterParser.addModule(name, deps.imports);
                        outputSymbols['modules'].push(deps);
                    }
                    else if (this.isComponent(metadata)) {
                        if(props.length === 0) return;
                        //console.log(util.inspect(props, { showHidden: true, depth: 10 }));
                        deps = {
                            name,
                            file: file,
                            //animations?: string[]; // TODO
                            changeDetection: this.getComponentChangeDetection(props),
                            encapsulation: this.getComponentEncapsulation(props),
                            //entryComponents?: string; // TODO waiting doc infos
                            exportAs: this.getComponentExportAs(props),
                            host: this.getComponentHost(props),
                            inputs: this.getComponentInputsMetadata(props),
                            //interpolation?: string; // TODO waiting doc infos
                            moduleId: this.getComponentModuleId(props),
                            outputs: this.getComponentOutputs(props),
                            providers: this.getComponentProviders(props),
                            //queries?: Deps[]; // TODO
                            selector: this.getComponentSelector(props),
                            styleUrls: this.getComponentStyleUrls(props),
                            styles: this.getComponentStyles(props), // TODO fix args
                            template: this.getComponentTemplate(props),
                            templateUrl: this.getComponentTemplateUrl(props),
                            viewProviders: this.getComponentViewProviders(props),
                            inputsClass: IO.inputs,
                            outputsClass: IO.outputs,
                            propertiesClass: IO.properties,
                            methodsClass: IO.methods,
                            description: IO.description,
                            type: 'component',
                            sourceCode: srcFile.getText(),
                            exampleUrls: _this.getComponentExampleUrls(srcFile.getText())
                        };
                        if (this.configuration.mainData.disablePrivateOrInternalSupport) {
                            deps.methodsClass = cleanLifecycleHooksFromMethods(deps.methodsClass);
                        }
                        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                            deps.jsdoctags = IO.jsdoctags[0].tags
                        }
                        if(IO.constructor) {
                            deps.constructorObj = IO.constructor;
                        }
                        if (IO.extends) {
                            deps.extends = IO.extends;
                        }
                        if (IO.implements && IO.implements.length > 0) {
                            deps.implements = IO.implements;
                        }
                        $componentsTreeEngine.addComponent(deps);
                        outputSymbols['components'].push(deps);
                    }
                    else if (this.isInjectable(metadata)) {
                        deps = {
                            name,
                            file: file,
                            type: 'injectable',
                            properties: IO.properties,
                            methods: IO.methods,
                            description: IO.description,
                            sourceCode: srcFile.getText()
                        };
                        if(IO.constructor) {
                            deps.constructorObj = IO.constructor;
                        }
                        outputSymbols['injectables'].push(deps);
                    }
                    else if (this.isPipe(metadata)) {
                        deps = {
                            name,
                            file: file,
                            type: 'pipe',
                            description: IO.description,
                            sourceCode: srcFile.getText()
                        };
                        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                            deps.jsdoctags = IO.jsdoctags[0].tags
                        }
                        outputSymbols['pipes'].push(deps);
                    }
                    else if (this.isDirective(metadata)) {
                        if(props.length === 0) return;
                        deps = {
                            name,
                            file: file,
                            type: 'directive',
                            description: IO.description,
                            sourceCode: srcFile.getText(),
                            selector: this.getComponentSelector(props),
                            providers: this.getComponentProviders(props),

                            inputsClass: IO.inputs,
                            outputsClass: IO.outputs,

                            propertiesClass: IO.properties,
                            methodsClass: IO.methods,
                            exampleUrls: _this.getComponentExampleUrls(srcFile.getText())
                        };
                        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                            deps.jsdoctags = IO.jsdoctags[0].tags
                        }
                        if (IO.implements && IO.implements.length > 0) {
                            deps.implements = IO.implements;
                        }
                        if(IO.constructor) {
                            deps.constructorObj = IO.constructor;
                        }
                        outputSymbols['directives'].push(deps);
                    }

                    this.debug(deps);

                    this.__cache[name] = deps;
                }

                let filterByDecorators = (node) => {
                    if (node.expression && node.expression.expression) {
                        return /(NgModule|Component|Injectable|Pipe|Directive)/.test(node.expression.expression.text)
                    }
                    return false;
                };

                node.decorators
                    .filter(filterByDecorators)
                    .forEach(visitNode);
            }
            else if (node.symbol) {
                if(node.symbol.flags === ts.SymbolFlags.Class) {
                    let name = this.getSymboleName(node);
                    let IO = this.getClassIO(file, srcFile, node);
                    deps = {
                        name,
                        file: file,
                        type: 'class',
                        sourceCode: srcFile.getText()
                    };
                    if(IO.constructor) {
                        deps.constructorObj = IO.constructor;
                    }
                    if(IO.properties) {
                        deps.properties = IO.properties;
                    }
                    if(IO.description) {
                        deps.description = IO.description;
                    }
                    if(IO.methods) {
                        deps.methods = IO.methods;
                    }
                    if (IO.extends) {
                        deps.extends = IO.extends;
                    }
                    if (IO.implements && IO.implements.length > 0) {
                        deps.implements = IO.implements;
                    }
                    this.debug(deps);
                    outputSymbols['classes'].push(deps);
                } else if(node.symbol.flags === ts.SymbolFlags.Interface) {
                    let name = this.getSymboleName(node);
                    let IO = this.getInterfaceIO(file, srcFile, node);
                    deps = {
                        name,
                        file: file,
                        type: 'interface',
                        sourceCode: srcFile.getText()
                    };
                    if(IO.properties) {
                        deps.properties = IO.properties;
                    }
                    if(IO.indexSignatures) {
                        deps.indexSignatures = IO.indexSignatures;
                    }
                    if(IO.kind) {
                        deps.kind = IO.kind;
                    }
                    if(IO.description) {
                        deps.description = IO.description;
                    }
                    if(IO.methods) {
                        deps.methods = IO.methods;
                    }
                    this.debug(deps);
                    outputSymbols['interfaces'].push(deps);
                } else if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
                    let infos = this.visitFunctionDeclaration(node),
                        tags = this.visitFunctionDeclarationJSDocTags(node),
                        name = infos.name;
                    deps = {
                        name,
                        file: file,
                        description: this.visitEnumAndFunctionDeclarationDescription(node)
                    }
                    if (infos.args) {
                        deps.args = infos.args;
                    }
                    if (tags && tags.length > 0) {
                        deps.jsdoctags = tags;
                    }
                    outputSymbols['miscellaneous'].functions.push(deps);
                } else if (node.kind === ts.SyntaxKind.EnumDeclaration) {
                    let infos = this.visitEnumDeclaration(node),
                        name = node.name.text;
                    deps = {
                        name,
                        childs: infos,
                        description: this.visitEnumAndFunctionDeclarationDescription(node),
                        file: file
                    }
                    outputSymbols['miscellaneous'].enumerations.push(deps);
                }
            } else {
                let IO = this.getRouteIO(file, srcFile);
                if(IO.routes) {
                    let newRoutes;
                    try {
                        newRoutes = RouterParser.cleanRawRouteParsed(IO.routes);
                    } catch (e) {
                        logger.error('Routes parsing error, maybe a trailing comma or an external variable, trying to fix that later after sources scanning.');
                        newRoutes = IO.routes.replace(/ /gm, '')
                        RouterParser.addIncompleteRoute({
                            data: newRoutes,
                            file: file
                        });
                        return true;
                    }
                    outputSymbols['routes'] = [...outputSymbols['routes'], ...newRoutes];
                }
                if (node.kind === ts.SyntaxKind.ClassDeclaration) {
                    let name = this.getSymboleName(node);
                    let IO = this.getClassIO(file, srcFile, node);
                    deps = {
                        name,
                        file: file,
                        type: 'class',
                        sourceCode: srcFile.getText()
                    };
                    if(IO.constructor) {
                        deps.constructorObj = IO.constructor;
                    }
                    if(IO.properties) {
                        deps.properties = IO.properties;
                    }
                    if(IO.indexSignatures) {
                        deps.indexSignatures = IO.indexSignatures;
                    }
                    if(IO.description) {
                        deps.description = IO.description;
                    }
                    if(IO.methods) {
                        deps.methods = IO.methods;
                    }
                    if (IO.extends) {
                        deps.extends = IO.extends;
                    }
                    if (IO.implements && IO.implements.length > 0) {
                        deps.implements = IO.implements;
                    }
                    this.debug(deps);
                    outputSymbols['classes'].push(deps);
                }
                if (node.kind === ts.SyntaxKind.ExpressionStatement) {
                    let bootstrapModuleReference = 'bootstrapModule';
                    //Find the root module with bootstrapModule call
                    //1. find a simple call : platformBrowserDynamic().bootstrapModule(AppModule);
                    //2. or inside a call :
                    // () => {
                    //     platformBrowserDynamic().bootstrapModule(AppModule);
                    // });
                    //3. with a catch : platformBrowserDynamic().bootstrapModule(AppModule).catch(error => console.error(error));
                    //4. with parameters : platformBrowserDynamic().bootstrapModule(AppModule, {}).catch(error => console.error(error));
                    //Find recusively in expression nodes one with name 'bootstrapModule'
                    let rootModule,
                        resultNode;
                    if (srcFile.text.indexOf(bootstrapModuleReference) !== -1) {
                        if (node.expression) {
                            resultNode = this.findExpressionByNameInExpressions(node.expression, 'bootstrapModule');
                        }
                        if (!resultNode) {
                            if (node.expression && node.expression.arguments && node.expression.arguments.length > 0) {
                                resultNode = this.findExpressionByNameInExpressionArguments(node.expression.arguments, 'bootstrapModule');
                            }
                        }
                        if(resultNode) {
                            if(resultNode.arguments.length > 0) {
                                _.forEach(resultNode.arguments, function(argument) {
                                    if(argument.text) {
                                        rootModule = argument.text;
                                    }
                                });
                            }
                            if (rootModule) {
                                RouterParser.setRootModule(rootModule);
                            }
                        }
                    }
                }
                if (node.kind === ts.SyntaxKind.VariableStatement && !this.isVariableRoutes(node)) {
                    let infos = this.visitVariableDeclaration(node),
                        name = infos.name;
                    deps = {
                        name,
                        file: file
                    }
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
                    outputSymbols['miscellaneous'].variables.push(deps);
                }
                if (node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
                    let infos = this.visitTypeDeclaration(node),
                        name = infos.name;
                    deps = {
                        name,
                        file: file
                    }
                    outputSymbols['miscellaneous'].types.push(deps);
                }
                if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
                    let infos = this.visitFunctionDeclaration(node),
                        name = infos.name;
                    deps = {
                        name,
                        file: file,
                        description: this.visitEnumAndFunctionDeclarationDescription(node)
                    }
                    if (infos.args) {
                        deps.args = infos.args;
                    }
                    outputSymbols['miscellaneous'].functions.push(deps);
                }
                if (node.kind === ts.SyntaxKind.EnumDeclaration) {
                    let infos = this.visitEnumDeclaration(node),
                        name = node.name.text;
                    deps = {
                        name,
                        childs: infos,
                        description: this.visitEnumAndFunctionDeclarationDescription(node),
                        file: file
                    }
                    outputSymbols['miscellaneous'].enumerations.push(deps);
                }
            }
        });


    }
    private debug(deps: Deps) {
        logger.debug('found', `${deps.name}`);
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

    private isVariableRoutes(node) {
        var result = false;
        if( node.declarationList.declarations ) {
            let i = 0,
                len = node.declarationList.declarations.length;
            for(i; i<len; i++) {
                if(node.declarationList.declarations[i].type) {
                    if(node.declarationList.declarations[i].type.typeName && node.declarationList.declarations[i].type.typeName.text === 'Routes') {
                        result = true;
                    }
                }
            }
        }
        return result;
    }

    private findExpressionByNameInExpressions(entryNode, name) {
        let result,
            loop = function(node, name) {
                if(node.expression && !node.expression.name) {
                    loop(node.expression, name);
                }
                if(node.expression && node.expression.name) {
                    if(node.expression.name.text === name) {
                        result = node;
                    } else {
                        loop(node.expression, name);
                    }
                }
            }
        loop(entryNode, name);
        return result;
    }

    private findExpressionByNameInExpressionArguments(arg, name) {
        let result,
            that = this,
            i = 0,
            len = arg.length,
            loop = function(node, name) {
                if(node.body) {
                    if (node.body.statements && node.body.statements.length > 0) {
                        let j = 0,
                            leng = node.body.statements.length;
                        for (j; j<leng; j++) {
                            result = that.findExpressionByNameInExpressions(node.body.statements[j], name);
                        }
                    }
                }
            }
        for (i; i < len; i++) {
            loop(arg[i], name);
        }
        return result;
    }

    private parseDecorators(decorators, type: string): boolean {
        let result = false;
        if (decorators.length > 1) {
            _.forEach(decorators, function(decorator) {
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

    private getType(name) {
        let type;
        if( name.toLowerCase().indexOf('component') !== -1 ) {
            type = 'component';
        } else if( name.toLowerCase().indexOf('pipe') !== -1 ) {
            type = 'pipe';
        } else if( name.toLowerCase().indexOf('module') !== -1 ) {
            type = 'module';
        } else if( name.toLowerCase().indexOf('directive') !== -1 ) {
            type = 'directive';
        }
        return type;
    }

    private getSymboleName(node): string {
        return node.name.text;
    }

    private getComponentSelector(props: NodeObject[]): string {
        return this.getSymbolDeps(props, 'selector').pop();
    }

    private getComponentExportAs(props: NodeObject[]): string {
        return this.getSymbolDeps(props, 'exportAs').pop();
    }

    private getModuleProviders(props: NodeObject[]): Deps[] {
        return this.getSymbolDeps(props, 'providers').map((providerName) => {
            return this.parseDeepIndentifier(providerName);
        });
    }

    private findProps(visitedNode) {
        if(visitedNode.expression.arguments.length > 0) {
            return visitedNode.expression.arguments.pop().properties;
        } else {
            return '';
        }
    }

    private getModuleDeclations(props: NodeObject[]): Deps[] {
        return this.getSymbolDeps(props, 'declarations').map((name) => {
            let component = this.findComponentSelectorByName(name);

            if (component) {
                return component;
            }

            return this.parseDeepIndentifier(name);
        });
    }

    private getModuleImportsRaw(props: NodeObject[]): Deps[] {
        return this.getSymbolDepsRaw(props, 'imports');
    }

    private getModuleImports(props: NodeObject[]): Deps[] {
        return this.getSymbolDeps(props, 'imports').map((name) => {
            return this.parseDeepIndentifier(name);
        });
    }

    private getModuleExports(props: NodeObject[]): Deps[] {
        return this.getSymbolDeps(props, 'exports').map((name) => {
            return this.parseDeepIndentifier(name);
        });
    }

    private getComponentHost(props: NodeObject[]): Object {
        return this.getSymbolDepsObject(props, 'host');
    }

    private getModuleBootstrap(props: NodeObject[]): Deps[] {
        return this.getSymbolDeps(props, 'bootstrap').map((name) => {
            return this.parseDeepIndentifier(name);
        });
    }

    private getComponentInputsMetadata(props: NodeObject[]): string[] {
        return this.getSymbolDeps(props, 'inputs');
    }

    private getDecoratorOfType(node, decoratorType) {
      var decorators = node.decorators || [];

      for (var i = 0; i < decorators.length; i++) {
          if (decorators[i].expression.expression) {
              if (decorators[i].expression.expression.text === decoratorType) {
                  return decorators[i];
              }
          }
      }

      return null;
    }

    private visitInput(property, inDecorator, sourceFile?) {
        var inArgs = inDecorator.expression.arguments,
            _return = {};
        _return.name = (inArgs.length > 0) ? inArgs[0].text : property.name.text;
        _return.defaultValue = property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined;
        if (property.symbol) {
            _return.description = marked(LinkParser.resolveLinks(ts.displayPartsToString(property.symbol.getDocumentationComment())))
        }
        if (!_return.description) {
            if (property.jsDoc) {
                if (property.jsDoc.length > 0) {
                    if (typeof property.jsDoc[0].comment !== 'undefined') {
                        _return.description = marked(property.jsDoc[0].comment);
                    }
                }
            }
        }
        _return.line = this.getPosition(property, sourceFile).line + 1;
        if (property.type) {
            _return.type = this.visitType(property);
        } else {
            // handle NewExpression
            if (property.initializer) {
                if (property.initializer.kind === ts.SyntaxKind.NewExpression) {
                    if (property.initializer.expression) {
                        _return.type = property.initializer.expression.text;
                    }
                }
            }
        }
        return _return;
    }

    private visitType(node) {
        let _return = 'void';
        if (node) {
            if (node.typeName) {
                _return = node.typeName.text;
            } else if (node.type) {
                if (node.type.kind) {
                    _return = kindToType(node.type.kind);
                }
                if (node.type.typeName) {
                    _return = node.type.typeName.text;
                }
                if (node.type.typeArguments) {
                    _return += '<';
                    for (const argument of node.type.typeArguments) {
                        if (argument.kind) {
                            _return += kindToType(argument.kind);
                        }
                        if (argument.typeName) {
                            _return += argument.typeName.text;
                        }
                    }
                    _return += '>';
                }
            } else if (node.elementType) {
                _return = kindToType(node.elementType.kind) + kindToType(node.kind);
            } else if (node.types && node.kind === ts.SyntaxKind.UnionType) {
                _return = '';
                let i = 0,
                    len = node.types.length;
                for (i; i<len; i++) {
                    _return += kindToType(node.types[i].kind);
                    if (i<len-1) {
                        _return += '|';
                    }
                }
            } else if (node.dotDotDotToken) {
                _return = 'any[]';
            } else {
                _return = kindToType(node.kind);
            }
            if (node.typeArguments) {
                _return += '<';
                for (const argument of node.typeArguments) {
                    _return += kindToType(argument.kind);
                }
                _return += '>';
            }
        }
        return _return;
    }

    private visitOutput(property, outDecorator, sourceFile?) {
        var inArgs = outDecorator.expression.arguments,
            _return = {};
        _return.name = (inArgs.length > 0) ? inArgs[0].text : property.name.text;
        _return.defaultValue = property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined;
        if (property.symbol) {
            _return.description = marked(LinkParser.resolveLinks(ts.displayPartsToString(property.symbol.getDocumentationComment())))
        }
        if (!_return.description) {
            if (property.jsDoc) {
                if (property.jsDoc.length > 0) {
                    if (typeof property.jsDoc[0].comment !== 'undefined') {
                        _return.description = marked(property.jsDoc[0].comment);
                    }
                }
            }
        }
        _return.line = this.getPosition(property, sourceFile).line + 1;

        if (property.type) {
            _return.type = this.visitType(property);
        } else {
            // handle NewExpression
            if (property.initializer) {
                if (property.initializer.kind === ts.SyntaxKind.NewExpression) {
                    if (property.initializer.expression) {
                        _return.type = property.initializer.expression.text;
                    }
                }
            }
        }
        return _return;
    }

    private isPublic(member): boolean {
        if (member.modifiers) {
            const isPublic: boolean = member.modifiers.some(function(modifier) {
                return modifier.kind === ts.SyntaxKind.PublicKeyword;
            });
            if (isPublic) {
                return true;
            }
        }
        return this.isHiddenMember(member);
    }

    private isPrivate(member): boolean {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        if (member.modifiers) {
            const isPrivate: boolean = member.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.PrivateKeyword);
            if (isPrivate) {
                return true;
            }
        }
        return this.isHiddenMember(member);
    }

    private isInternal(member): boolean {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        const internalTags: string[] = ['internal'];
        if (member.jsDoc) {
            for (const doc of member.jsDoc) {
                if (doc.tags) {
                    for (const tag of doc.tags) {
                        if (internalTags.indexOf(tag.tagName.text) > -1) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    private isHiddenMember(member): boolean {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        const internalTags: string[] = ['hidden'];
        if (member.jsDoc) {
            for (const doc of member.jsDoc) {
                if (doc.tags) {
                    for (const tag of doc.tags) {
                        if (internalTags.indexOf(tag.tagName.text) > -1) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
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

    private visitConstructorDeclaration(method, sourceFile?) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var result = {
            name: 'constructor',
            description: '',
            args: method.parameters ? method.parameters.map((prop) => this.visitArgument(prop)) : [],
            line: this.getPosition(method, sourceFile).line + 1
        },
            jsdoctags = JSDocTagsParser.getJSDocs(method),



        if (method.symbol) {
            result.description = marked(LinkParser.resolveLinks(ts.displayPartsToString(method.symbol.getDocumentationComment())));
        }

        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                result.modifierKind = method.modifiers[0].kind;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    }

    private visitConstructorProperties(method) {
        var that = this;
        if (method.parameters) {
            var _parameters = [],
                i = 0,
                len = method.parameters.length;
            for(i; i < len; i++) {
                if (that.isPublic(method.parameters[i])) {
                    _parameters.push(that.visitArgument(method.parameters[i]));
                }
            }
            return _parameters;
        } else {
            return [];
        }
    }

    private visitCallDeclaration(method, sourceFile) {
        var result = {
            description: marked(LinkParser.resolveLinks(ts.displayPartsToString(method.symbol.getDocumentationComment()))),
            args: method.parameters ? method.parameters.map((prop) => this.visitArgument(prop)) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        },
        jsdoctags = JSDocTagsParser.getJSDocs(method);
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    }

    private visitIndexDeclaration(method, sourceFile?) {
        return {
            description: marked(LinkParser.resolveLinks(ts.displayPartsToString(method.symbol.getDocumentationComment()))),
            args: method.parameters ? method.parameters.map((prop) => this.visitArgument(prop)) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        }
    }

    private getPosition(node, sourceFile): ts.LineAndCharacter {
        var position:ts.LineAndCharacter;
        if (node['name'] && node['name'].end) {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node['name'].end);
        } else {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node.pos);
        }
        return position;
    }

    private visitMethodDeclaration(method, sourceFile) {
        var result = {
            name: method.name.text,
            args: method.parameters ? method.parameters.map((prop) => this.visitArgument(prop)) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        },
            jsdoctags = JSDocTagsParser.getJSDocs(method);

        if (method.symbol) {
            result.description = marked(LinkParser.resolveLinks(ts.displayPartsToString(method.symbol.getDocumentationComment())));
        }

        if (method.decorators) {
            result.decorators = this.formatDecorators(method.decorators);
        }

        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                result.modifierKind = method.modifiers[0].kind;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    }

    private visitArgument(arg) {
        let _result = {
            name: arg.name.text,
            type: this.visitType(arg)
        }
        if (arg.dotDotDotToken) {
            _result.dotDotDotToken = true
        }
        return _result;
    }

    private getNamesCompareFn(name) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        name = name || 'name';
        var t = (a, b) => {
            if (a[name]) {
                return a[name].localeCompare(b[name])
            } else {
                return 0;
            }
        };
        return t;
    }

    private stringifyDefaultValue(node) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        if (node.text) {
            return node.text;
        } else if (node.kind === ts.SyntaxKind.FalseKeyword) {
            return 'false';
        } else if (node.kind === ts.SyntaxKind.TrueKeyword) {
            return 'true';
        }
    }

    private formatDecorators(decorators) {
        let _decorators = [];

        _.forEach(decorators, (decorator) => {
            if (decorator.expression) {
                if (decorator.expression.text) {
                    _decorators.push({
                        name: decorator.expression.text
                    });
                }
                if (decorator.expression.expression) {
                    var info = {
                        name: decorator.expression.expression.text
                    }
                    if (decorator.expression.expression.arguments) {
                        if (decorator.expression.expression.arguments.length > 0) {
                            info.args = decorator.expression.expression.arguments;
                        }
                    }
                    _decorators.push(info);
                }
            }
        });

        return _decorators;
    }

    private visitProperty(property, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
         var result = {
             name: property.name.text,
             defaultValue: property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined,
             type: this.visitType(property),
             description: '',
             line: this.getPosition(property, sourceFile).line + 1
         },
            jsdoctags = JSDocTagsParser.getJSDocs(property);

         if (property.symbol) {
             result.description = marked(LinkParser.resolveLinks(ts.displayPartsToString(property.symbol.getDocumentationComment())));
         }

         if (property.decorators) {
             result.decorators = this.formatDecorators(property.decorators);
         }

         if (property.modifiers) {
             if (property.modifiers.length > 0) {
                 result.modifierKind = property.modifiers[0].kind;
             }
         }
         if (jsdoctags && jsdoctags.length >= 1) {
             if (jsdoctags[0].tags) {
                 result.jsdoctags = markedtags(jsdoctags[0].tags);
             }
         }
         return result;
    }

    private visitMembers(members, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var inputs = [],
            outputs = [],
            methods = [],
            properties = [],
            indexSignatures = [],
            kind,
            inputDecorator,
            constructor,
            outDecorator;

        for (var i = 0; i < members.length; i++) {
            inputDecorator = this.getDecoratorOfType(members[i], 'Input');
            outDecorator = this.getDecoratorOfType(members[i], 'Output');

            kind = members[i].kind;

            if (inputDecorator) {
                inputs.push(this.visitInput(members[i], inputDecorator, sourceFile));
            } else if (outDecorator) {
                outputs.push(this.visitOutput(members[i], outDecorator, sourceFile));
            } else if (!this.isHiddenMember(members[i])) {

                if ( (this.isPrivate(members[i]) || this.isInternal(members[i])) && this.configuration.mainData.disablePrivateOrInternalSupport) {} else {
                    if ((members[i].kind === ts.SyntaxKind.MethodDeclaration ||
                        members[i].kind === ts.SyntaxKind.MethodSignature)) {
                        methods.push(this.visitMethodDeclaration(members[i], sourceFile));
                    } else if (
                        members[i].kind === ts.SyntaxKind.PropertyDeclaration ||
                        members[i].kind === ts.SyntaxKind.PropertySignature || members[i].kind === ts.SyntaxKind.GetAccessor) {
                        properties.push(this.visitProperty(members[i], sourceFile));
                    } else if (members[i].kind === ts.SyntaxKind.CallSignature) {
                        properties.push(this.visitCallDeclaration(members[i], sourceFile));
                    } else if (members[i].kind === ts.SyntaxKind.IndexSignature) {
                        indexSignatures.push(this.visitIndexDeclaration(members[i], sourceFile));
                    } else if (members[i].kind === ts.SyntaxKind.Constructor) {
                        let _constructorProperties = this.visitConstructorProperties(members[i]),
                            j = 0,
                            len = _constructorProperties.length;
                        for(j; j<len; j++) {
                            properties.push(_constructorProperties[j]);
                        }
                        constructor = this.visitConstructorDeclaration(members[i], sourceFile);
                    }
                }
            }
        }

        inputs.sort(this.getNamesCompareFn());
        outputs.sort(this.getNamesCompareFn());
        properties.sort(this.getNamesCompareFn());
        indexSignatures.sort(this.getNamesCompareFn());

        return {
            inputs,
            outputs,
            methods,
            properties,
            indexSignatures,
            kind,
            constructor
        };
    }

    private visitDirectiveDecorator(decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var selector;
        var exportAs;
        var properties;

        if (decorator.expression.arguments.length > 0) {
            properties = decorator.expression.arguments[0].properties;

            for (var i = 0; i < properties.length; i++) {
                if (properties[i].name.text === 'selector') {
                    // TODO: this will only work if selector is initialized as a string literal
                    selector = properties[i].initializer.text;
                }
                if (properties[i].name.text === 'exportAs') {
                    // TODO: this will only work if selector is initialized as a string literal
                    exportAs = properties[i].initializer.text;
                }
            }
        }

        return {
            selector,
            exportAs
        };
    }

    private isPipeDecorator(decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'Pipe' : false;
    }

    private isModuleDecorator(decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'NgModule' : false;
    }

    private isDirectiveDecorator(decorator) {
        if (decorator.expression.expression) {
            var decoratorIdentifierText = decorator.expression.expression.text;
            return decoratorIdentifierText === 'Directive' || decoratorIdentifierText === 'Component';
        } else {
            return false;
        }
    }

    private isServiceDecorator(decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'Injectable' : false;
    }

    private visitClassDeclaration(fileName, classDeclaration, sourceFile?) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var symbol = this.typeChecker.getSymbolAtLocation(classDeclaration.name);
        var description = '';
        if (symbol) {
            description = marked(LinkParser.resolveLinks(ts.displayPartsToString(symbol.getDocumentationComment())));
        }
        var className = classDeclaration.name.text;
        var directiveInfo;
        var members;
        var implementsElements = [];
        var extendsElement;
        var jsdoctags = [];

        if (typeof ts.getClassImplementsHeritageClauseElements !== 'undefined') {
            var implementedTypes = ts.getClassImplementsHeritageClauseElements(classDeclaration);
            if (implementedTypes) {
                let i = 0,
                    len = implementedTypes.length;
                for(i; i<len; i++) {
                    if (implementedTypes[i].expression) {
                        implementsElements.push(implementedTypes[i].expression.text);
                    }
                }
            }
        }

        if (typeof ts.getClassExtendsHeritageClauseElement !== 'undefined') {
            var extendsTypes = ts.getClassExtendsHeritageClauseElement(classDeclaration);
            if (extendsTypes) {
                if (extendsTypes.expression) {
                    extendsElement = extendsTypes.expression.text
                }
            }
        }

        if (symbol) {
            if (symbol.valueDeclaration) {
                jsdoctags = JSDocTagsParser.getJSDocs(symbol.valueDeclaration);
            }
        }

        if (classDeclaration.decorators) {
            for (var i = 0; i < classDeclaration.decorators.length; i++) {
                if (this.isDirectiveDecorator(classDeclaration.decorators[i])) {
                    directiveInfo = this.visitDirectiveDecorator(classDeclaration.decorators[i]);
                    members = this.visitMembers(classDeclaration.members, sourceFile);
                    return {
                        description,
                        inputs: members.inputs,
                        outputs: members.outputs,
                        properties: members.properties,
                        methods: members.methods,
                        indexSignatures: members.indexSignatures,
                        kind: members.kind,
                        constructor: members.constructor,
                        jsdoctags: jsdoctags,
                        extends: extendsElement,
                        implements: implementsElements
                    };
                } else if (this.isServiceDecorator(classDeclaration.decorators[i])) {
                    members = this.visitMembers(classDeclaration.members, sourceFile);
                    return [{
                        fileName,
                        className,
                        description,
                        methods: members.methods,
                        indexSignatures: members.indexSignatures,
                        properties: members.properties,
                        kind: members.kind,
                        constructor: members.constructor,
                        extends: extendsElement,
                        implements: implementsElements
                    }];
                } else if (this.isPipeDecorator(classDeclaration.decorators[i]) || this.isModuleDecorator(classDeclaration.decorators[i])) {
                    return [{
                        fileName,
                        className,
                        description,
                        jsdoctags: jsdoctags
                    }];
                } else {
                    //console.log('custom decorator');
                }
            }
        } else if (description) {
            members = this.visitMembers(classDeclaration.members, sourceFile);

            return [{
                description,
                methods: members.methods,
                indexSignatures: members.indexSignatures,
                properties: members.properties,
                kind: members.kind,
                constructor: members.constructor,
                extends: extendsElement,
                implements: implementsElements
            }];
        } else {
            members = this.visitMembers(classDeclaration.members, sourceFile);

            return [{
                methods: members.methods,
                indexSignatures: members.indexSignatures,
                properties: members.properties,
                kind: members.kind,
                constructor: members.constructor,
                extends: extendsElement,
                implements: implementsElements
            }];
        }

        return [];
    }

    private visitTypeDeclaration(type) {
        var result:any = {
                name: type.name.text
            },
            jsdoctags = JSDocTagsParser.getJSDocs(type);

        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    }

    private visitFunctionDeclaration(method) {
        let mapTypes = function(type) {
            switch (type) {
                case 94:
                    return 'Null';
                case 118:
                    return 'Any';
                case 121:
                    return 'Boolean';
                case 129:
                    return 'Never';
                case 132:
                    return 'Number';
                case 134:
                    return 'String';
                case 137:
                    return 'Undefined';
                case 157:
                    return 'TypeReference';
            }
        }
        let visitArgument = function(arg) {
            var result: any = {
                name: arg.name.text
            };
            if (arg.type) {
                result.type = mapTypes(arg.type.kind);
                if (arg.type.kind === 157) {
                    //try replace TypeReference with typeName
                    if (arg.type.typeName) {
                        result.type = arg.type.typeName.text;
                    }
                }
            }
            return result;
        }

        var result:any = {
            name: method.name.text,
            args: method.parameters ? method.parameters.map((prop) => visitArgument(prop)) : []
        },
        jsdoctags = JSDocTagsParser.getJSDocs(method);

        if (typeof method.type !== 'undefined') {
            result.returnType = this.visitType(method.type);
        }

        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                result.modifierKind = method.modifiers[0].kind;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    }

    private visitVariableDeclaration(node) {
        if( node.declarationList.declarations ) {
            let i = 0,
                len = node.declarationList.declarations.length;
            for(i; i<len; i++) {
                var result = {
                    name: node.declarationList.declarations[i].name.text,
                    defaultValue: node.declarationList.declarations[i].initializer ? this.stringifyDefaultValue(node.declarationList.declarations[i].initializer) : undefined
                }
                if(node.declarationList.declarations[i].initializer) {
                    result.initializer = node.declarationList.declarations[i].initializer;
                }
                if(node.declarationList.declarations[i].type) {
                    result.type = this.visitType(node.declarationList.declarations[i].type);
                }
                return result;
            }
        }
    }

    private visitFunctionDeclarationJSDocTags(node): string {
        let jsdoctags = JSDocTagsParser.getJSDocs(node),
            result;
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    }

    private visitEnumAndFunctionDeclarationDescription(node): string {
        let description:string = '';
        if (node.jsDoc) {
            if (node.jsDoc.length > 0) {
                if (typeof node.jsDoc[0].comment !== 'undefined') {
                    description = marked(node.jsDoc[0].comment);
                }
            }
        }
        return description;
    }

    private visitEnumDeclaration(node) {
        let result = [],
        if( node.members ) {
            let i = 0,
                len = node.members.length;
            for(i; i<len; i++) {
                let member = {
                    name: node.members[i].name.text
                }
                if (node.members[i].initializer) {
                    member.value = node.members[i].initializer.text;
                }
                result.push(member);
            }
        }
        return result;
    }

    private visitEnumDeclarationForRoutes(fileName, node) {
        if( node.declarationList.declarations ) {
            let i = 0,
                len = node.declarationList.declarations.length;
            for(i; i<len; i++) {
                if(node.declarationList.declarations[i].type) {
                    if(node.declarationList.declarations[i].type.typeName && node.declarationList.declarations[i].type.typeName.text === 'Routes') {
                        let data = generate(node.declarationList.declarations[i].initializer)
                        RouterParser.addRoute({
                            name: node.declarationList.declarations[i].name.text,
                            data: RouterParser.cleanRawRoute(data),
                            filename: fileName
                        });
                        return [{
                            routes: data
                        }];
                    }
                }
            }
        }
        return [];
    }

    private getRouteIO(filename, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce((directive, statement) => {

            if (statement.kind === ts.SyntaxKind.VariableStatement) {
                return directive.concat(this.visitEnumDeclarationForRoutes(filename, statement));
            }

            return directive;
        }, [])

        return res[0] || {};
    }

    private getComponentIO(filename: string, sourceFile, node) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce((directive, statement) => {

            if (statement.kind === ts.SyntaxKind.ClassDeclaration) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(this.visitClassDeclaration(filename, statement, sourceFile));
                }
            }

            return directive;
        }, [])

        return res[0] || {};
    }

    private getClassIO(filename: string, sourceFile, node) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce((directive, statement) => {

            if (statement.kind === ts.SyntaxKind.ClassDeclaration) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(this.visitClassDeclaration(filename, statement, sourceFile));
                }
            }

            return directive;
        }, [])

        return res[0] || {};
    }

    private getInterfaceIO(filename: string, sourceFile, node) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce((directive, statement) => {

            if (statement.kind === ts.SyntaxKind.InterfaceDeclaration) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(this.visitClassDeclaration(filename, statement, sourceFile));
                }
            }

            return directive;
        }, [])

        return res[0] || {};
    }

    private getComponentOutputs(props: NodeObject[]): string[] {
        return this.getSymbolDeps(props, 'outputs');
    }

    private getComponentProviders(props: NodeObject[]): Deps[] {
        return this.getSymbolDeps(props, 'providers').map((name) => {
            return this.parseDeepIndentifier(name);
        });
    }

    private getComponentViewProviders(props: NodeObject[]): Deps[] {
        return this.getSymbolDeps(props, 'viewProviders').map((name) => {
            return this.parseDeepIndentifier(name);
        });
    }

    private getComponentDirectives(props: NodeObject[]): Deps[] {
        return this.getSymbolDeps(props, 'directives').map((name) => {
            let identifier = this.parseDeepIndentifier(name);
            identifier.selector = this.findComponentSelectorByName(name);
            identifier.label = '';
            return identifier;
        });
    }

    private getComponentExampleUrls = function (text) {
        var exampleUrlsMatches = text.match(/<example-url>(.*?)<\/example-url>/g);
        var exampleUrls = null;
        if (exampleUrlsMatches && exampleUrlsMatches.length) {
            exampleUrls = exampleUrlsMatches.map(function(val){
                return val.replace(/<\/?example-url>/g,'');
            });
        }
        return exampleUrls;
    }

    private parseDeepIndentifier(name: string): any {
        let nsModule = name.split('.'),
            type = this.getType(name);
        if (nsModule.length > 1) {

            // cache deps with the same namespace (i.e Shared.*)
            if (this.__nsModule[nsModule[0]]) {
                this.__nsModule[nsModule[0]].push(name)
            }
            else {
                this.__nsModule[nsModule[0]] = [name];
            }

            return {
                ns: nsModule[0],
                name,
                type: type
            }
        }
        return {
            name,
            type: type
        };
    }

    private getComponentTemplateUrl(props: NodeObject[]): string[] {
        return this.getSymbolDeps(props, 'templateUrl');
    }

    private getComponentTemplate(props: NodeObject[]): string {
        let t = this.getSymbolDeps(props, 'template', true).pop()
        if(t) {
            t = detectIndent(t, 0);
            t = t.replace(/\n/, '');
            t = t.replace(/ +$/gm, '');
        }
        return t;
    }

    private getComponentStyleUrls(props: NodeObject[]): string[] {
        return this.sanitizeUrls(this.getSymbolDeps(props, 'styleUrls'));
    }

    private getComponentStyles(props: NodeObject[]): string[] {
        return this.getSymbolDeps(props, 'styles');
    }

    private getComponentModuleId(props: NodeObject[]): string {
        return this.getSymbolDeps(props, 'moduleId').pop();
    }

    private getComponentChangeDetection(props: NodeObject[]): string {
        return this.getSymbolDeps(props, 'changeDetection').pop();
    }

    private getComponentEncapsulation(props: NodeObject[]): string[] {
        return this.getSymbolDeps(props, 'encapsulation');
    }

    private sanitizeUrls(urls: string[]) {
        return urls.map(url => url.replace('./', ''));
    }

    private getSymbolDepsObject(props: NodeObject[], type: string, multiLine?: boolean): Object {
        let deps = props.filter((node: NodeObject) => {
            return node.name.text === type;
        });

        let parseProperties = (node: NodeObject): Object => {
            let obj = {};
            (node.initializer.properties || []).forEach((prop: NodeObject) => {
                obj[prop.name.text] = prop.initializer.text;
            });
            return obj;
        };

        return deps.map(parseProperties).pop();
    }

    private getSymbolDepsRaw(props: NodeObject[], type: string, multiLine?: boolean): any {
        let deps = props.filter((node: NodeObject) => {
            return node.name.text === type;
        });
        return deps || [];
    }

    private getSymbolDeps(props: NodeObject[], type: string, multiLine?: boolean): string[] {

        let deps = props.filter((node: NodeObject) => {
            return node.name.text === type;
        });

        let parseSymbolText = (text: string) => {
            return [
                text
            ];
        };

        let buildIdentifierName = (node: NodeObject, name = '') => {

            if (node.expression) {
                name = name ? `.${name}` : name;

                let nodeName = this.unknown;
                if (node.name) {
                    nodeName = node.name.text;
                }
                else if (node.text) {
                    nodeName = node.text;
                }
                else if (node.expression) {

                    if (node.expression.text) {
                        nodeName = node.expression.text;
                    }
                    else if(node.expression.elements) {

                        if (node.expression.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                            nodeName = node.expression.elements.map( el => el.text ).join(', ');
                            nodeName = `[${nodeName}]`;
                        }

                    }
                }

                if (node.kind ===  ts.SyntaxKind.SpreadElement) {
                    return `...${nodeName}`;
                }
                return `${buildIdentifierName(node.expression, nodeName)}${name}`
            }

            return `${node.text}.${name}`;
        }

        let parseProviderConfiguration = (o: NodeObject): string => {
            // parse expressions such as:
            // { provide: APP_BASE_HREF, useValue: '/' },
            // or
            // { provide: 'Date', useFactory: (d1, d2) => new Date(), deps: ['d1', 'd2'] }

            let _genProviderName: string[] = [];
            let _providerProps: string[] = [];

            (o.properties || []).forEach((prop: NodeObject) => {

                let identifier = prop.initializer.text;
                if (prop.initializer.kind === ts.SyntaxKind.StringLiteral) {
                    identifier = `'${identifier}'`;
                }

                // lambda function (i.e useFactory)
                if (prop.initializer.body) {
                    let params = (prop.initializer.parameters || <any>[]).map((params: NodeObject) => params.name.text);
                    identifier = `(${params.join(', ')}) => {}`;
                }

                // factory deps array
                else if (prop.initializer.elements) {
                    let elements = (prop.initializer.elements || []).map((n: NodeObject) => {

                        if (n.kind === ts.SyntaxKind.StringLiteral) {
                            return `'${n.text}'`;
                        }

                        return n.text;
                    });
                    identifier = `[${elements.join(', ')}]`;
                }

                _providerProps.push([

                    // i.e provide
                    prop.name.text,

                    // i.e OpaqueToken or 'StringToken'
                    identifier

                ].join(': '));

            });

            return `{ ${_providerProps.join(', ')} }`;
        }

        let parseSymbolElements = (o: NodeObject | any): string => {
            // parse expressions such as: AngularFireModule.initializeApp(firebaseConfig)
            if (o.arguments) {
                let className = buildIdentifierName(o.expression);

                // function arguments could be really complexe. There are so
                // many use cases that we can't handle. Just print "args" to indicate
                // that we have arguments.

                let functionArgs = o.arguments.length > 0 ? 'args' : '';
                let text = `${className}(${functionArgs})`;
                return text;
            }

            // parse expressions such as: Shared.Module
            else if (o.expression) {
                let identifier = buildIdentifierName(o);
                return identifier;
            }

            return o.text ? o.text : parseProviderConfiguration(o);
        };

        let parseSymbols = (node: NodeObject): string[] => {

            let text = node.initializer.text;
            if (text) {
                return parseSymbolText(text);
            }

            else if (node.initializer.expression) {
                let identifier = parseSymbolElements(node.initializer);
                return [
                    identifier
                ];
            }

            else if (node.initializer.elements) {
                return node.initializer.elements.map(parseSymbolElements);
            }

        };
        return deps.map(parseSymbols).pop() || [];
    }

    private findComponentSelectorByName(name: string) {
        return this.__cache[name];
    }

}
