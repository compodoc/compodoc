import * as ts from 'typescript';
import { TsPrinterUtil } from '../../../../utils/ts-printer.util';

export class SymbolHelper {
    private readonly unknown = '???';


    public parseDeepIndentifier(name: string): ParseDeepIdentifierResult {
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
    public buildIdentifierName(node: ts.Identifier | ts.PropertyAccessExpression, name = '') {
        if (ts.isIdentifier(node) && !ts.isPropertyAccessExpression(node)) {
            return `${node.text}.${name}`;
        }

        name = name ? `.${name}` : name;

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
     * 181 CallExpression "RouterModule.forRoot(args)"
     * 71 Identifier "RouterModule" "TodoStore"
     * 9 StringLiteral "./app.component.css" "./tab.scss"
     *
     *
     *
     *
     */
    private parseSymbolElements(node: ts.CallExpression | ts.Identifier | ts.StringLiteral): string {
        // parse expressions such as: AngularFireModule.initializeApp(firebaseConfig)
        if (ts.isCallExpression(node)) {
            let className = this.buildIdentifierName(node.expression);

            // function arguments could be really complexe. There are so
            // many use cases that we can't handle. Just print "args" to indicate
            // that we have arguments.

            let functionArgs = node.arguments.length > 0 ? 'args' : '';
            let text = `${className}(${functionArgs})`;
            return text;
        } else if (node.expression) { // parse expressions such as: Shared.Module
            let identifier = this.buildIdentifierName(node);
            return identifier;
        }

        return node.text ? node.text : this.parseProviderConfiguration(node);
    }

    private parseSymbols(node: ts.PropertyAssignment): Array<string> {
        let text = node.initializer.text;
        console.log(node.initializer.kind);
        // 177 ArrayLiteralExpression
        // 9  StringLiteral
        if (ts.isStringLiteral(node.initializer)) {
            return [text];
        } else if (node.initializer.expression) {
            let identifier = this.parseSymbolElements(node.initializer);
            return [
                identifier
            ];
        } else if (ts.isArrayLiteralExpression(node.initializer)) {
            return node.initializer.elements.map(x => this.parseSymbolElements(x));
        }

    }

    public getSymbolDeps(props: Array<ts.Node>, type: string, multiLine?: boolean): Array<string> {

        if (props.length === 0) { return []; }

        let deps = props.filter(node => node.name.text === type);
        return deps.map(x => this.parseSymbols(x)).pop() || [];
    }

    public getSymbolDepsRaw(props: Array<ts.Node>, type: string, multiLine?: boolean): any {
        let deps = props.filter(node => node.name.text === type);
        return deps || [];
    }
}

export interface ParseDeepIdentifierResult {
    ns?: any;
    name: string;
    type: string | undefined;
}
