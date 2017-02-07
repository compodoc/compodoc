import * as _ from 'lodash';
import * as path from 'path';
import * as util from 'util';
import * as ts from 'typescript';
import * as _ts from '../../utils/ts-internal';
import marked from 'marked';
import { compilerHost, detectIndent } from '../../utilities';
import { logger } from '../../logger';
import { RouterParser } from '../../utils/router.parser';
import { LinkParser } from '../../utils/link-parser';
import { generate } from './codegen';
import { Configuration, IConfiguration } from '../configuration';

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
    Component?: String;
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

    inputsClass?: Object[];

    //common
    providers?: Deps[];

    //module
    declarations?: Deps[];
    bootstrap?: Deps[];

    imports?: Deps[];
    exports?: Deps[];
}

interface SymbolDeps {
    full: string;
    alias: string;
}

export class Dependencies {

    private files: string[];
    private program: ts.Program;
    private programComponent: ts.Program;
    private typeChecker: ts.TypeChecker;
    private typeCheckerComponent: ts.TypeChecker;
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
    }

    getDependencies() {
        let deps: Object = {
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
                enumerations: []
            }
        };
        let sourceFiles = this.program.getSourceFiles() || [];

        sourceFiles.map((file: ts.SourceFile) => {

            let filePath = file.fileName;

            if (path.extname(filePath) === '.ts') {

                if (filePath.lastIndexOf('.d.ts') === -1 && filePath.lastIndexOf('spec.ts') === -1) {
                    logger.info('parsing', filePath);

                    try {
                        this.getSourceFileDecorators(file, deps);
                    }
                    catch (e) {
                        logger.error(e, file.fileName);
                    }
                }

            }

            return deps;

        });

        /*RouterParser.printModulesRoutes();
        RouterParser.printRoutes();

        RouterParser.linkModulesAndRoutes();
        RouterParser.constructModulesTree();
        RouterParser.constructRoutesTree();*/

        return deps;
    }


    private getSourceFileDecorators(srcFile: ts.SourceFile, outputSymbols: Object): void {

        let cleaner = (process.cwd() + path.sep).replace(/\\/g, '/');
        let file = srcFile.fileName.replace(cleaner, '');

        this.programComponent = ts.createProgram([file], {});
        let sourceFile = this.programComponent.getSourceFile(file);
        this.typeCheckerComponent = this.programComponent.getTypeChecker(true);

        ts.forEachChild(srcFile, (node: ts.Node) => {

            let deps: Deps = <Deps>{};
            if (node.decorators) {
                let visitNode = (visitedNode, index) => {

                    let metadata = node.decorators.pop();
                    let name = this.getSymboleName(node);
                    let props = this.findProps(visitedNode);
                    let IO = this.getComponentIO(file, sourceFile);

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
                            sourceCode: sourceFile.getText()
                        };
                        if (RouterParser.hasRouterModuleInImports(deps.imports)) {
                            RouterParser.addModuleWithRoutes(name, this.getModuleImportsRaw(props));
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
                            sourceCode: sourceFile.getText()
                        };
                        if(IO.constructor) {
                            deps.constructorObj = IO.constructor;
                        }
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
                            sourceCode: sourceFile.getText()
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
                            sourceCode: sourceFile.getText()
                        };
                        outputSymbols['pipes'].push(deps);
                    }
                    else if (this.isDirective(metadata)) {
                        if(props.length === 0) return;
                        deps = {
                            name,
                            file: file,
                            type: 'directive',
                            description: IO.description,
                            sourceCode: sourceFile.getText(),
                            selector: this.getComponentSelector(props),
                            providers: this.getComponentProviders(props),

                            inputsClass: IO.inputs,
                            outputsClass: IO.outputs,

                            propertiesClass: IO.properties,
                            methodsClass: IO.methods
                        };
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
                    let IO = this.getComponentIO(file, sourceFile);
                    deps = {
                        name,
                        file: file,
                        type: 'class',
                        sourceCode: sourceFile.getText()
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
                    this.debug(deps);
                    outputSymbols['classes'].push(deps);
                } else if(node.symbol.flags === ts.SymbolFlags.Interface) {
                    let name = this.getSymboleName(node);
                    let IO = this.getInterfaceIO(file, sourceFile, node);
                    deps = {
                        name,
                        file: file,
                        type: 'interface',
                        sourceCode: sourceFile.getText()
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
                }
            } else {
                let IO = this.getRouteIO(file, sourceFile);
                if(IO.routes) {
                    let newRoutes;
                    try {
                        newRoutes = JSON.parse(IO.routes.replace(/ /gm, ''));
                    } catch (e) {
                        logger.error('Routes parsing error, maybe a trailing comma or an external variable ?');
                        return true;
                    }
                    outputSymbols['routes'] = [...outputSymbols['routes'], ...newRoutes];
                }
                if (node.kind === ts.SyntaxKind.ClassDeclaration) {
                    let name = this.getSymboleName(node);
                    let IO = this.getComponentIO(file, sourceFile);
                    deps = {
                        name,
                        file: file,
                        type: 'class',
                        sourceCode: sourceFile.getText()
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
                    this.debug(deps);
                    outputSymbols['classes'].push(deps);
                }
                if (node.kind === ts.SyntaxKind.ExpressionStatement) {
                    //Find the root module with bootstrapModule call
                    //Find recusively in expression nodes one with name 'bootstrapModule'
                    let rootModule,
                        resultNode = this.findExpressionByName(node, 'bootstrapModule');
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
                    if (node.jsDoc && node.jsDoc.length > 0) {
                        deps.description = marked(node.jsDoc[0].comment);
                    }
                    outputSymbols['miscellaneous'].variables.push(deps);
                }
                if (node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
                    //console.log('TypeAliasDeclaration');
                }
                if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
                    let deps = this.visitFunctionDeclaration(node)
                    outputSymbols['miscellaneous'].functions.push(deps);
                }
                if (node.kind === ts.SyntaxKind.EnumDeclaration) {
                    //console.log('EnumDeclaration');
                }
            }
        });

    }
    private debug(deps: Deps) {
        logger.debug('debug', `${deps.name}:`);
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

    private findExpressionByName(entryNode, name) {
        let result,
            loop = function(node, name) {
                if(node.expression && !node.expression.name) {
                    loop(node.expression, name);
                }
                if(node.expression && node.expression.name) {
                    if(node.expression.name.text === name) {
                        result = node;
                    }
                }
            }
        loop(entryNode, name);
        return result;
    }

    private isComponent(metadata) {
        return metadata.expression.expression.text === 'Component';
    }

    private isPipe(metadata) {
        return metadata.expression.expression.text === 'Pipe';
    }

    private isDirective(metadata) {
        return metadata.expression.expression.text === 'Directive';
    }

    private isInjectable(metadata) {
        return metadata.expression.expression.text === 'Injectable';
    }

    private isModule(metadata) {
        return metadata.expression.expression.text === 'NgModule';
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
        if (decorators[i].expression.expression.text === decoratorType) {
          return decorators[i];
        }
      }

      return null;
    }

    private visitInput(property, inDecorator) {
        var inArgs = inDecorator.expression.arguments,
        _return = {
            name: inArgs.length ? inArgs[0].text : property.name.text,
            defaultValue: property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined,
            description: marked(LinkParser.resolveLinks(ts.displayPartsToString(property.symbol.getDocumentationComment())))
        };
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
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return node ? this.typeCheckerComponent.typeToString(this.typeCheckerComponent.getTypeAtLocation(node)) : 'void';
    }

    private visitOutput(property, outDecorator) {
        var outArgs = outDecorator.expression.arguments,
        _return = {
            name: outArgs.length ? outArgs[0].text : property.name.text,
            description: marked(LinkParser.resolveLinks(ts.displayPartsToString(property.symbol.getDocumentationComment())))
        };
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

    private visitConstructorDeclaration(method) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var result = {
            name: 'constructor',
            description: marked(LinkParser.resolveLinks(ts.displayPartsToString(method.symbol.getDocumentationComment()))),
            args: method.parameters ? method.parameters.map((prop) => this.visitArgument(prop)) : []
        },
            jsdoctags = _ts.getJSDocs(method),

            markedtags = function(tags) {
                var mtags = tags;
                _.forEach(mtags, (tag) => {
                    tag.comment = marked(LinkParser.resolveLinks(tag.comment));
                });
                return mtags;
            };

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

    private visitCallDeclaration(method) {
        return {
            description: marked(LinkParser.resolveLinks(ts.displayPartsToString(method.symbol.getDocumentationComment()))),
            args: method.parameters ? method.parameters.map((prop) => this.visitArgument(prop)) : [],
            returnType: this.visitType(method.type)
        }
    }

    private visitIndexDeclaration(method) {
        return {
            description: marked(LinkParser.resolveLinks(ts.displayPartsToString(method.symbol.getDocumentationComment()))),
            args: method.parameters ? method.parameters.map((prop) => this.visitArgument(prop)) : [],
            returnType: this.visitType(method.type)
        }
    }

    private visitMethodDeclaration(method) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var result = {
            name: method.name.text,
            args: method.parameters ? method.parameters.map((prop) => this.visitArgument(prop)) : [],
            returnType: this.visitType(method.type)
        },
            jsdoctags = _ts.getJSDocs(method),

            markedtags = function(tags) {
                var mtags = tags;
                _.forEach(mtags, (tag) => {
                    tag.comment = marked(LinkParser.resolveLinks(tag.comment));
                });
                return mtags;
            };

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

    private visitArgument(arg) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return {
            name: arg.name.text,
            type: this.visitType(arg)
        }
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

    private visitProperty(property) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
         var result = {
             name: property.name.text,
             defaultValue: property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined,
             type: this.visitType(property),
             description: marked(LinkParser.resolveLinks(ts.displayPartsToString(property.symbol.getDocumentationComment())))
         }
         if (property.modifiers) {
             if (property.modifiers.length > 0) {
                 result.modifierKind = property.modifiers[0].kind;
             }
         }
        return result;
    }

    private visitMembers(members) {
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
                inputs.push(this.visitInput(members[i], inputDecorator));
            } else if (outDecorator) {
                outputs.push(this.visitOutput(members[i], outDecorator));
            } else if (!this.isHiddenMember(members[i])) {

                if ( (this.isPrivate(members[i]) || this.isInternal(members[i])) && this.configuration.mainData.disablePrivateOrInternalSupport) {} else {
                    if ((members[i].kind === ts.SyntaxKind.MethodDeclaration ||
                        members[i].kind === ts.SyntaxKind.MethodSignature) &&
                        !this.isAngularLifecycleHook(members[i].name.text)) {
                        methods.push(this.visitMethodDeclaration(members[i]));
                    } else if (
                        members[i].kind === ts.SyntaxKind.PropertyDeclaration ||
                        members[i].kind === ts.SyntaxKind.PropertySignature || members[i].kind === ts.SyntaxKind.GetAccessor) {
                        properties.push(this.visitProperty(members[i]));
                    } else if (members[i].kind === ts.SyntaxKind.CallSignature) {
                        properties.push(this.visitCallDeclaration(members[i]));
                    } else if (members[i].kind === ts.SyntaxKind.IndexSignature) {
                        indexSignatures.push(this.visitIndexDeclaration(members[i]));
                    } else if (members[i].kind === ts.SyntaxKind.Constructor) {
                        let _constructorProperties = this.visitConstructorProperties(members[i]),
                            j = 0,
                            len = _constructorProperties.length;
                        for(j; j<len; j++) {
                            properties.push(_constructorProperties[j]);
                        }
                        constructor = this.visitConstructorDeclaration(members[i]);
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
        var properties = decorator.expression.arguments[0].properties;

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

        return {
            selector,
            exportAs
        };
    }

    private isPipeDecorator(decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
         return decorator.expression.expression.text === 'Pipe';
    }

    private isModuleDecorator(decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
         return decorator.expression.expression.text === 'NgModule';
    }

    private isDirectiveDecorator(decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var decoratorIdentifierText = decorator.expression.expression.text;
        return decoratorIdentifierText === 'Directive' || decoratorIdentifierText === 'Component';
    }

    private isServiceDecorator(decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
         return decorator.expression.expression.text === 'Injectable';
    }

    private visitClassDeclaration(fileName, classDeclaration) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var symbol = this.program.getTypeChecker().getSymbolAtLocation(classDeclaration.name);
        var description = marked(LinkParser.resolveLinks(ts.displayPartsToString(symbol.getDocumentationComment())));
        var className = classDeclaration.name.text;
        var directiveInfo;
        var members;

        if (classDeclaration.decorators) {
            for (var i = 0; i < classDeclaration.decorators.length; i++) {
                if (this.isDirectiveDecorator(classDeclaration.decorators[i])) {
                    directiveInfo = this.visitDirectiveDecorator(classDeclaration.decorators[i]);
                    members = this.visitMembers(classDeclaration.members);
                    return {
                        description,
                        inputs: members.inputs,
                        outputs: members.outputs,
                        properties: members.properties,
                        methods: members.methods,
                        indexSignatures: members.indexSignatures,
                        kind: members.kind,
                        constructor: members.constructor
                    };
                } else if (this.isServiceDecorator(classDeclaration.decorators[i])) {
                  members = this.visitMembers(classDeclaration.members);
                  return [{
                    fileName,
                    className,
                    description,
                    methods: members.methods,
                    indexSignatures: members.indexSignatures,
                    properties: members.properties,
                    kind: members.kind,
                    constructor: members.constructor
                  }];
              } else if (this.isPipeDecorator(classDeclaration.decorators[i]) || this.isModuleDecorator(classDeclaration.decorators[i])) {
                  return [{
                    fileName,
                    className,
                    description
                  }];
                }
            }
        } else if (description) {
            members = this.visitMembers(classDeclaration.members);

            return [{
                description,
                methods: members.methods,
                indexSignatures: members.indexSignatures,
                properties: members.properties,
                kind: members.kind,
                constructor: members.constructor
            }];
        } else {
            members = this.visitMembers(classDeclaration.members);

            return [{
                methods: members.methods,
                indexSignatures: members.indexSignatures,
                properties: members.properties,
                kind: members.kind,
                constructor: members.constructor
            }];
        }

        return [];
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
            var result = {
                name: arg.name.text,
                type: mapTypes(arg.type.kind)
            };
            if (arg.type.kind === 157) {
                //try replace TypeReference with typeName
                if (arg.type.typeName) {
                    result.type = arg.type.typeName.text;
                }
            }
            return result;
        }
        var result = {
            name: method.name.text,
            args: method.parameters ? method.parameters.map((prop) => visitArgument(prop)) : [],
            returnType: this.visitType(method.type)
        },
            jsdoctags = _ts.getJSDocs(method),

            markedtags = function(tags) {
                var mtags = tags;
                _.forEach(mtags, (tag) => {
                    tag.comment = marked(LinkParser.resolveLinks(tag.comment));
                });
                return mtags;
            };

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
                if(node.declarationList.declarations[i].type) {
                    result.type = this.visitType(node.declarationList.declarations[i].type);
                }
                return result;
            }
        }
    }

    private visitEnumDeclaration(fileName, node) {
        if( node.declarationList.declarations ) {
            let i = 0,
                len = node.declarationList.declarations.length;
            for(i; i<len; i++) {
                if(node.declarationList.declarations[i].type) {
                    if(node.declarationList.declarations[i].type.typeName && node.declarationList.declarations[i].type.typeName.text === 'Routes') {
                        RouterParser.addRoute({
                            name: node.declarationList.declarations[i].name.text,
                            data: generate(node.declarationList.declarations[i].initializer)
                        });
                        return [{
                            routes: generate(node.declarationList.declarations[i].initializer)
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
                return directive.concat(this.visitEnumDeclaration(filename, statement));
            }

            return directive;
        }, [])

        return res[0] || {};
    }

    private getComponentIO(filename: string, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce((directive, statement) => {

            if (statement.kind === ts.SyntaxKind.ClassDeclaration) {
                return directive.concat(this.visitClassDeclaration(filename, statement));
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
                    return directive.concat(this.visitClassDeclaration(filename, statement));
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
        return this.sanitizeUrls(this.getSymbolDeps(props, 'templateUrl'));
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
            if (text.indexOf('/') !== -1 && !multiLine) {
                text = text.split('/').pop();
            }
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
