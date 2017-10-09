const ts = require('typescript');
import { SymbolHelper, NsModuleCache } from './symbol-helper';
import { NodeObject } from '../../node-object.interface';
import { detectIndent } from '../../../../utilities';
import { IDep, Deps } from '../../dependencies.interfaces';
import { ClassHelper } from './class-helper';


export class ComponentHelper {
    constructor(
        private moduleCache: NsModuleCache,
        private classHelper: ClassHelper,
        private symbolHelper: SymbolHelper = new SymbolHelper()) {

    }

    public getComponentChangeDetection(props: NodeObject[]): string {
        return this.symbolHelper.getSymbolDeps(props, 'changeDetection').pop();
    }

    public getComponentEncapsulation(props: NodeObject[]): string[] {
        return this.symbolHelper.getSymbolDeps(props, 'encapsulation');
    }

    public getComponentExportAs(props: NodeObject[]): string {
        return this.symbolHelper.getSymbolDeps(props, 'exportAs').pop();
    }

    public getComponentHost(props: NodeObject[]): Object {
        return this.getSymbolDepsObject(props, 'host');
    }

    public getComponentInputsMetadata(props: NodeObject[]): string[] {
        return this.symbolHelper.getSymbolDeps(props, 'inputs');
    }

    public getComponentTemplate(props: NodeObject[]): string {
        let t = this.symbolHelper.getSymbolDeps(props, 'template', true).pop();
        if (t) {
            t = detectIndent(t, 0);
            t = t.replace(/\n/, '');
            t = t.replace(/ +$/gm, '');
        }
        return t;
    }

    public getComponentStyleUrls(props: NodeObject[]): string[] {
        return this.sanitizeUrls(this.symbolHelper.getSymbolDeps(props, 'styleUrls'));
    }

    public getComponentStyles(props: NodeObject[]): string[] {
        return this.symbolHelper.getSymbolDeps(props, 'styles');
    }

    public getComponentModuleId(props: NodeObject[]): string {
        return this.symbolHelper.getSymbolDeps(props, 'moduleId').pop();
    }


    public getComponentOutputs(props: NodeObject[]): string[] {
        return this.symbolHelper.getSymbolDeps(props, 'outputs');
    }

    public getComponentProviders(props: NodeObject[]): Deps[] {
        return this.symbolHelper
            .getSymbolDeps(props, 'providers')
            .map((name) => this.symbolHelper.parseDeepIndentifier(name, this.moduleCache));
    }

    public getComponentViewProviders(props: NodeObject[]): Deps[] {
        return this.symbolHelper
            .getSymbolDeps(props, 'viewProviders')
            .map((name) => this.symbolHelper.parseDeepIndentifier(name, this.moduleCache));
    }

    public getComponentTemplateUrl(props: Array<NodeObject>): Array<string> {
        return this.symbolHelper.getSymbolDeps(props, 'templateUrl');
    }
    public getComponentExampleUrls(text: string): Array<string> | undefined {
        let exampleUrlsMatches = text.match(/<example-url>(.*?)<\/example-url>/g);
        let exampleUrls = undefined;
        if (exampleUrlsMatches && exampleUrlsMatches.length) {
            exampleUrls = exampleUrlsMatches.map(function (val) {
                return val.replace(/<\/?example-url>/g, '');
            });
        }
        return exampleUrls;
    }

    public getComponentSelector(props: NodeObject[]): string {
        return this.symbolHelper.getSymbolDeps(props, 'selector').pop();
    }

    public getSymbolDepsObject(props: NodeObject[], type: string, multiLine?: boolean): Object {
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

    public getComponentIO(filename: string, sourceFile: ts.SourceFile, node: ts.Node): any {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        let res = sourceFile.statements.reduce((directive, statement) => {

            if (statement.kind === ts.SyntaxKind.ClassDeclaration) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(this.classHelper.visitClassDeclaration(filename, statement as ts.ClassDeclaration, sourceFile));
                }
            }

            return directive;
        },                                     []);

        return res[0] || {};
    }

    private sanitizeUrls(urls: Array<string>): Array<string> {
        return urls.map(url => url.replace('./', ''));
    }
}

export class ComponentCache {
    private cache: Map<string, any> = new Map();

    public get(key: string): any {
        return this.cache.get(key);
    }

    public set(key: string, value: any): void {
        this.cache.set(key, value);
    }
}