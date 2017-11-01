import * as ts from 'typescript';
import { TsPrinterUtil } from '../../../../utils/ts-printer.util';

export class SymbolHelper {
    private readonly unknown = '???';

    public parseDeepIndentifier(name: string): IParseDeepIdentifierResult {
        let nsModule = name.split('.');
        let type = this.getType(name);

        if (nsModule.length > 1) {
            return {
                ns: nsModule[0],
                name: name,
                type: type
            };
        }
        return {
            name: name,
            type: type
        };
    }

    public getType(name: string): string {
        let type;
        if (name.toLowerCase().indexOf('component') !== -1) {
            type = 'component';
        } else if (name.toLowerCase().indexOf('pipe') !== -1) {
            type = 'pipe';
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
    public buildIdentifierName(node: ts.Identifier | ts.PropertyAccessExpression | ts.SpreadElement, name) {
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
        return new TsPrinterUtil().print(node);
    }

    /**
     * Kind
     *  181 CallExpression => "RouterModule.forRoot(args)"
     *   71 Identifier     => "RouterModule" "TodoStore"
     *    9 StringLiteral  => "./app.component.css" "./tab.scss"
     */
    public parseSymbolElements(node: ts.CallExpression | ts.Identifier | ts.StringLiteral | ts.PropertyAccessExpression): string {
        // parse expressions such as: AngularFireModule.initializeApp(firebaseConfig)
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
            let className = this.buildIdentifierName(node.expression);

            // function arguments could be really complex. There are so
            // many use cases that we can't handle. Just print "args" to indicate
            // that we have arguments.

            let functionArgs = node.arguments.length > 0 ? 'args' : '';
            let text = `${className}(${functionArgs})`;
            return text;
        } else if (ts.isPropertyAccessExpression(node)) { // parse expressions such as: Shared.Module
            return this.buildIdentifierName(node);
        }

        return node.text ? node.text : this.parseProviderConfiguration(node);
    }

    /**
     * Kind
     *  177 ArrayLiteralExpression
     *  122 BooleanKeyword
     *    9 StringLiteral
     */
    private parseSymbols(node: ts.PropertyAssignment): Array<string> {
        if (ts.isStringLiteral(node.initializer)) {
            return [node.initializer.text];
        } else if (node.initializer.kind && (node.initializer.kind === ts.SyntaxKind.TrueKeyword || node.initializer.kind === ts.SyntaxKind.FalseKeyword)) {
            return [(node.initializer.kind === ts.SyntaxKind.TrueKeyword) ? 'true' : 'false'];
        } else if (ts.isPropertyAccessExpression(node.initializer)) {
            let identifier = this.parseSymbolElements(node.initializer);
            return [
                identifier
            ];
        } else if (ts.isArrayLiteralExpression(node.initializer)) {
            return node.initializer.elements.map(x => this.parseSymbolElements(x));
        }
    }

    public getSymbolDeps(props: ReadonlyArray<ts.ObjectLiteralElementLike>, type: string, multiLine?: boolean): Array<string> {
        if (props.length === 0) { return []; }

        let deps = props.filter(node => {
            return node.name.text === type;
        });
        return deps.map(x => this.parseSymbols(x)).pop() || [];
    }

    public getSymbolDepsRaw(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        type: string,
        multiLine?: boolean): Array<ts.ObjectLiteralElementLike> {
        return props.filter(node => node.name.text === type);
    }
}

export interface IParseDeepIdentifierResult {
    ns?: any;
    name: string;
    type: string | undefined;
}
