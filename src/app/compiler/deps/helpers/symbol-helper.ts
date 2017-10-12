import { NodeObject } from '../../node-object.interface';
import * as ts from 'typescript';

export class NsModuleCache {
    private cache: Map<string, Array<string>> = new Map();

    public setOrAdd(key: string, toSetOrAdd: string) {
        const result = this.cache.get(key);

        if (result) {
            result.push(toSetOrAdd);
        } else {
            this.cache.set(key, [toSetOrAdd]);
        }
    }
}

export class SymbolHelper {
    private readonly unknown = '???';


    public parseDeepIndentifier(name: string, cache: NsModuleCache): any {
        let nsModule = name.split('.');
        let type = this.getType(name);
        if (nsModule.length > 1) {

            // cache deps with the same namespace (i.e Shared.*)
            cache.setOrAdd(nsModule[0], name);
            return {
                ns: nsModule[0],
                name,
                type: type
            };
        }
        return {
            name,
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

    public getSymbolDeps(props: ts.Node[], type: string, multiLine?: boolean): string[] {

        if (props.length === 0) { return []; }

        let deps = props.filter((node: ts.Node) => {
            return node.name.text === type;
        });

        let parseSymbolText = (text: string) => {
            return [
                text
            ];
        };

        let buildIdentifierName = (node: ts.Node, name = '') => {

            if (node.expression) {
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
                return `${buildIdentifierName(node.expression, nodeName)}${name}`;
            }

            return `${node.text}.${name}`;
        };

        let parseProviderConfiguration = (o: ts.Node): string => {
            // parse expressions such as:
            // { provide: APP_BASE_HREF, useValue: '/' },
            // or
            // { provide: 'Date', useFactory: (d1, d2) => new Date(), deps: ['d1', 'd2'] }

            let _genProviderName: string[] = [];
            let _providerProps: string[] = [];

            (o.properties || []).forEach((prop: ts.Node) => {

                let identifier = '';
                if (prop.initializer) {
                    identifier = prop.initializer.text;
                    if (ts.isStringLiteral(prop.initializer)) {
                        identifier = `'${identifier}'`;
                    }

                    // lambda function (i.e useFactory)
                    if (prop.initializer.body) {
                        let params = (prop.initializer.parameters || [] as any)
                            .map((params1: ts.Node) => params1.name.text);
                        identifier = `(${params.join(', ')}) => {}`;
                    } else if (prop.initializer.elements) { // factory deps array
                        let elements = (prop.initializer.elements || []).map((n: ts.Node) => {

                            if (ts.isStringLiteral(n)) {
                                return `'${n.text}'`;
                            }

                            return n.text;
                        });
                        identifier = `[${elements.join(', ')}]`;
                    }
                }

                _providerProps.push([

                    // i.e provide
                    prop.name.text,

                    // i.e OpaqueToken or 'StringToken'
                    identifier

                ].join(': '));

            });

            return `{ ${_providerProps.join(', ')} }`;
        };

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
            } else if (o.expression) { // parse expressions such as: Shared.Module
                let identifier = buildIdentifierName(o);
                return identifier;
            }

            return o.text ? o.text : parseProviderConfiguration(o);
        };

        let parseSymbols = (node: NodeObject): string[] => {

            let text = node.initializer.text;
            if (text) {
                return parseSymbolText(text);
            } else if (node.initializer.expression) {
                let identifier = parseSymbolElements(node.initializer);
                return [
                    identifier
                ];
            } else if (node.initializer.elements) {
                return node.initializer.elements.map(parseSymbolElements);
            }

        };
        return deps.map(parseSymbols).pop() || [];
    }

    public getSymbolDepsRaw(props: NodeObject[], type: string, multiLine?: boolean): any {
        let deps = props.filter((node: NodeObject) => {
            return node.name.text === type;
        });
        return deps || [];
    }
}