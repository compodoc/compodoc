import * as _ from 'lodash';

import { ts, SyntaxKind } from 'ts-simple-ast';

import { TsPrinterUtil } from '../../../../../utils/ts-printer.util';

import ImportsUtil from '../../../../../utils/imports.util';

export class SymbolHelper {
    private readonly unknown = '???';

    public parseDeepIndentifier(name: string, srcFile?: ts.SourceFile): IParseDeepIdentifierResult {
        let result = {
            name: '',
            type: ''
        };

        if (typeof name === 'undefined') {
            return result;
        }
        let nsModule = name.split('.');
        let type = this.getType(name);

        if (nsModule.length > 1) {
            result.ns = nsModule[0];
            result.name = name;
            result.type = type;
            return result;
        }
        if (typeof srcFile !== 'undefined') {
            result.file = ImportsUtil.getFileNameOfImport(name, srcFile);
        }
        result.name = name;
        result.type = type;
        return result;
    }

    public getType(name: string): string {
        let type;
        if (name.toLowerCase().indexOf('component') !== -1) {
            type = 'component';
        } else if (name.toLowerCase().indexOf('pipe') !== -1) {
            type = 'pipe';
        } else if (name.toLowerCase().indexOf('controller') !== -1) {
            type = 'controller';
        } else if (name.toLowerCase().indexOf('module') !== -1) {
            type = 'module';
        } else if (name.toLowerCase().indexOf('directive') !== -1) {
            type = 'directive';
        }
        return type;
    }

    /**
     * Output
     * RouterModule.forRoot 179
     */
    public buildIdentifierName(
        node: ts.Identifier | ts.PropertyAccessExpression | ts.SpreadElement,
        name
    ) {
        if (ts.isIdentifier(node) && !ts.isPropertyAccessExpression(node)) {
            return `${node.text}.${name}`;
        }

        name = name ? `.${name}` : '';

        let nodeName = this.unknown;
        if (node.name) {
            nodeName = node.name.text;
        } else if (node.text) {
            nodeName = node.text;
        } else if (node.expression) {
            if (node.expression.text) {
                nodeName = node.expression.text;
            } else if (node.expression.elements) {
                if (ts.isArrayLiteralExpression(node.expression)) {
                    nodeName = node.expression.elements.map(el => el.text).join(', ');
                    nodeName = `[${nodeName}]`;
                }
            }
        }

        if (ts.isSpreadElement(node)) {
            return `...${nodeName}`;
        }
        return `${this.buildIdentifierName(node.expression, nodeName)}${name}`;
    }

    /**
     * parse expressions such as:
     * { provide: APP_BASE_HREF, useValue: '/' }
     * { provide: 'Date', useFactory: (d1, d2) => new Date(), deps: ['d1', 'd2'] }
     */
    public parseProviderConfiguration(node: ts.ObjectLiteralExpression): string {
        if (node.kind && node.kind === SyntaxKind.ObjectLiteralExpression) {
            // Search for provide: HTTP_INTERCEPTORS
            // and if true, return type: 'interceptor' + name
            let interceptorName, hasInterceptor;
            if (node.properties) {
                if (node.properties.length > 0) {
                    _.forEach(node.properties, property => {
                        if (property.kind && property.kind === SyntaxKind.PropertyAssignment) {
                            if (property.name.text === 'provide') {
                                if (property.initializer.text === 'HTTP_INTERCEPTORS') {
                                    hasInterceptor = true;
                                }
                            }
                            if (
                                property.name.text === 'useClass' ||
                                property.name.text === 'useExisting'
                            ) {
                                interceptorName = property.initializer.text;
                            }
                        }
                    });
                }
            }
            if (hasInterceptor) {
                return interceptorName;
            } else {
                return new TsPrinterUtil().print(node);
            }
        } else {
            return new TsPrinterUtil().print(node);
        }
    }

    /**
     * Kind
     *  181 CallExpression => "RouterModule.forRoot(args)"
     *   71 Identifier     => "RouterModule" "TodoStore"
     *    9 StringLiteral  => "./app.component.css" "./tab.scss"
     */
    public parseSymbolElements(
        node:
            | ts.CallExpression
            | ts.Identifier
            | ts.StringLiteral
            | ts.PropertyAccessExpression
            | ts.SpreadElement
    ): string {
        // parse expressions such as: AngularFireModule.initializeApp(firebaseConfig)
        // if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
        if (
            (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) ||
            (ts.isNewExpression(node) && ts.isElementAccessExpression(node.expression))
        ) {
            let className = this.buildIdentifierName(node.expression);

            // function arguments could be really complex. There are so
            // many use cases that we can't handle. Just print "args" to indicate
            // that we have arguments.

            let functionArgs = node.arguments.length > 0 ? 'args' : '';
            let text = `${className}(${functionArgs})`;
            return text;
        } else if (ts.isPropertyAccessExpression(node)) {
            // parse expressions such as: Shared.Module
            return this.buildIdentifierName(node);
        } else if (ts.isIdentifier(node)) {
            // parse expressions such as: MyComponent
            if (node.text) {
                return node.text;
            }
            if (node.escapedText) {
                return node.escapedText;
            }
        } else if (ts.isSpreadElement(node)) {
            // parse expressions such as: ...MYARRAY
            // Resolve MYARRAY in imports or local file variables after full scan, just return the name of the variable
            if (node.expression && node.expression.text) {
                return node.expression.text;
            }
        }

        return node.text ? node.text : this.parseProviderConfiguration(node);
    }

    /**
     * Kind
     *  177 ArrayLiteralExpression
     *  122 BooleanKeyword
     *    9 StringLiteral
     */
    private parseSymbols(
        node: ts.ObjectLiteralElement,
        srcFile: ts.SourceFile
    ): Array<string | boolean> {
        let localNode = node;

        if (ts.isShorthandPropertyAssignment(localNode)) {
            localNode = ImportsUtil.findValueInImportOrLocalVariables(node.name.text, srcFile);
        }

        if (ts.isArrayLiteralExpression(localNode.initializer)) {
            return localNode.initializer.elements.map(x => this.parseSymbolElements(x));
        } else if (
            ts.isStringLiteral(localNode.initializer) ||
            ts.isTemplateLiteral(localNode.initializer) ||
            (ts.isPropertyAssignment(localNode) && localNode.initializer.text)
        ) {
            return [localNode.initializer.text];
        } else if (
            localNode.initializer.kind &&
            (localNode.initializer.kind === SyntaxKind.TrueKeyword ||
                localNode.initializer.kind === SyntaxKind.FalseKeyword)
        ) {
            return [localNode.initializer.kind === SyntaxKind.TrueKeyword ? true : false];
        } else if (ts.isPropertyAccessExpression(localNode.initializer)) {
            let identifier = this.parseSymbolElements(localNode.initializer);
            return [identifier];
        } else if (
            localNode.initializer &&
            localNode.initializer.elements &&
            localNode.initializer.elements.length > 0
        ) {
            // Node replaced by ts-simple-ast & kind = 265
            return localNode.initializer.elements.map(x => this.parseSymbolElements(x));
        }
    }

    public getSymbolDeps(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        type: string,
        srcFile: ts.SourceFile,
        multiLine?: boolean
    ): Array<string> {
        if (props.length === 0) {
            return [];
        }

        let i = 0,
            len = props.length,
            filteredProps = [];

        for (i; i < len; i++) {
            if (props[i].name && props[i].name.text === type) {
                filteredProps.push(props[i]);
            }
        }

        return filteredProps.map(x => this.parseSymbols(x, srcFile)).pop() || [];
    }

    public getSymbolDepsRaw(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        type: string,
        multiLine?: boolean
    ): Array<ts.ObjectLiteralElementLike> {
        return props.filter(node => node.name.text === type);
    }
}

export interface IParseDeepIdentifierResult {
    ns?: any;
    name: string;
    file?: string;
    type: string | undefined;
}
