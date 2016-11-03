import * as path from 'path';
import * as util from 'util';
import * as ts from 'typescript';
import { getNewLineCharacter, compilerHost, d } from '../../utilities';
import { logger } from '../../logger';

let q = require('q');

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
    selector?: string;
    changeDetection?: string;
    encapsulation?: string;
    moduleId?: string;
    styles?: string[];
    label?: string;
    file?: string;
    templateUrl?: string[];
    template?: string;
    styleUrls?: string[];
    providers?: Deps[];
    imports?: Deps[];
    exports?: Deps[];
    exportAs?: string;
    declarations?: Deps[];
    bootstrap?: Deps[];
    __raw?: any
}

interface SymbolDeps {
    full: string;
    alias: string;
}

export class Dependencies {

    private files: string[];
    private program: ts.Program;
    private engine: any;
    private __cache: any = {};
    private __nsModule: any = {};
    private unknown = '???';

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
            'routes': []
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
                        logger.trace(e, file.fileName);
                    }
                }

            }

            return deps;

        });

        return deps;
    }


    private getSourceFileDecorators(srcFile: ts.SourceFile, outputSymbols: Object): void {

        ts.forEachChild(srcFile, (node: ts.Node) => {


            if (node.decorators) {

                let visitNode = (visitedNode, index) => {

                    let name = this.getSymboleName(node);

                    let deps: Deps = <Deps>{};

                    let metadata = node.decorators.pop();

                    let props = this.findProps(visitedNode);

                    let file = srcFile.fileName.replace(process.cwd() + path.sep, '')

                    if (this.isModule(metadata)) {
                        deps = {
                            name,
                            file: file,
                            providers: this.getModuleProviders(props),
                            declarations: this.getModuleDeclations(props),
                            imports: this.getModuleImports(props),
                            exports: this.getModuleExports(props),
                            bootstrap: this.getModuleBootstrap(props),
                            type: 'module'
                        };
                        outputSymbols['modules'].push(deps);
                        outputSymbols['routes'] = [...outputSymbols['routes'], ...this.findRoutes(deps.imports)];
                    }
                    else if (this.isComponent(metadata)) {
                        //console.log(util.inspect(props, { showHidden: true, depth: 10 }));
                        deps = {
                            name,
                            file: file,
                            selector: this.getComponentSelector(props),
                            exportAs: this.getComponentExportAs(props),
                            providers: this.getComponentProviders(props),
                            templateUrl: this.getComponentTemplateUrl(props),
                            template: this.getComponentTemplate(props),
                            styleUrls: this.getComponentStyleUrls(props),
                            styles: this.getComponentStyles(props),
                            encapsulation: this.getComponentEncapsulation(props),
                            type: 'component'
                        };
                        outputSymbols['components'].push(deps);
                    }
                    else if (this.isInjectable(metadata)) {
                        deps = {
                            name,
                            file: file,
                            type: 'injectable'
                        };
                        outputSymbols['injectables'].push(deps);
                    }
                    else if (this.isPipe(metadata)) {
                        deps = {
                            name,
                            file: file,
                            type: 'pipe'
                        };
                        outputSymbols['pipes'].push(deps);
                    }
                    else if (this.isDirective(metadata)) {
                        deps = {
                            name,
                            file: file,
                            type: 'directive'
                        };
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
            else {
                // process.stdout.write('.');
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

    private findRoutes(props: NodeObject[]): Object[] {
        let i = 0,
            len = props.length,
            result = [];
        for(i; i < len; i++) {
            if(props[i].ns && props[i].ns === 'RouterModule') {
                result.push(props[i].name);
            }
        }
        return result;
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

    private getModuleBootstrap(props: NodeObject[]): Deps[] {
        return this.getSymbolDeps(props, 'bootstrap').map((name) => {
            return this.parseDeepIndentifier(name);
        });
    }

    private getComponentProviders(props: NodeObject[]): Deps[] {
        return this.getSymbolDeps(props, 'providers').map((name) => {
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
            t = t.replace(/\n/, '');
        }
        return t;
    }

    private getComponentStyleUrls(props: NodeObject[]): string[] {
        return this.sanitizeUrls(this.getSymbolDeps(props, 'styleUrls'));
    }

    private getComponentStyles(props: NodeObject[]): string[] {
        return this.getSymbolDeps(props, 'styles');
    }

    private getComponentEncapsulation(props: NodeObject[]): string[] {
        return this.getSymbolDeps(props, 'encapsulation');
    }

    private sanitizeUrls(urls: string[]) {
        return urls.map(url => url.replace('./', ''));
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

                if (node.kind ===  ts.SyntaxKind.SpreadElementExpression) {
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
