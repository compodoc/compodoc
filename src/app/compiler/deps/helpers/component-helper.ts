import * as ts from 'typescript';
import { SymbolHelper, IParseDeepIdentifierResult } from './symbol-helper';
import { detectIndent } from '../../../../utilities';
import { IDep, Deps } from '../../dependencies.interfaces';
import { ClassHelper } from './class-helper';


export class ComponentHelper {
    constructor(
        private classHelper: ClassHelper,
        private symbolHelper: SymbolHelper = new SymbolHelper()) {

    }

    public getComponentChangeDetection(props: ReadonlyArray<ts.ObjectLiteralElementLike>): string {
        return this.symbolHelper.getSymbolDeps(props, 'changeDetection').pop();
    }

    public getComponentEncapsulation(props: ReadonlyArray<ts.ObjectLiteralElementLike>): Array<string> {
        return this.symbolHelper.getSymbolDeps(props, 'encapsulation');
    }

    public getComponentPure(props: ReadonlyArray<ts.ObjectLiteralElementLike>): string {
        return this.symbolHelper.getSymbolDeps(props, 'pure').pop();
    }

    public getComponentName(props: ReadonlyArray<ts.ObjectLiteralElementLike>): string {
        return this.symbolHelper.getSymbolDeps(props, 'name').pop();
    }

    public getComponentExportAs(props: ReadonlyArray<ts.ObjectLiteralElementLike>): string {
        return this.symbolHelper.getSymbolDeps(props, 'exportAs').pop();
    }

    public getComponentHost(props: ReadonlyArray<ts.ObjectLiteralElementLike>): Map<string, string> {
        return this.getSymbolDepsObject(props, 'host');
    }

    public getComponentInputsMetadata(props: ReadonlyArray<ts.ObjectLiteralElementLike>): Array<string> {
        return this.symbolHelper.getSymbolDeps(props, 'inputs');
    }

    public getComponentTemplate(props: ReadonlyArray<ts.ObjectLiteralElementLike>): string {
        let t = this.symbolHelper.getSymbolDeps(props, 'template', true).pop();
        if (t) {
            t = detectIndent(t, 0);
            t = t.replace(/\n/, '');
            t = t.replace(/ +$/gm, '');
        }
        return t;
    }

    public getComponentStyleUrls(props: ReadonlyArray<ts.ObjectLiteralElementLike>): string[] {
        return this.sanitizeUrls(this.symbolHelper.getSymbolDeps(props, 'styleUrls'));
    }

    public getComponentStyles(props: ReadonlyArray<ts.ObjectLiteralElementLike>): string[] {
        return this.symbolHelper.getSymbolDeps(props, 'styles');
    }

    public getComponentModuleId(props: ReadonlyArray<ts.ObjectLiteralElementLike>): string {
        return this.symbolHelper.getSymbolDeps(props, 'moduleId').pop();
    }


    public getComponentOutputs(props: ReadonlyArray<ts.ObjectLiteralElementLike>): string[] {
        return this.symbolHelper.getSymbolDeps(props, 'outputs');
    }

    public getComponentProviders(props: ReadonlyArray<ts.ObjectLiteralElementLike>): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'providers')
            .map((name) => this.symbolHelper.parseDeepIndentifier(name));
    }

    public getComponentViewProviders(props: ReadonlyArray<ts.ObjectLiteralElementLike>): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'viewProviders')
            .map((name) => this.symbolHelper.parseDeepIndentifier(name));
    }

    public getComponentTemplateUrl(props: ReadonlyArray<ts.ObjectLiteralElementLike>): Array<string> {
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

    public getComponentSelector(props: ReadonlyArray<ts.ObjectLiteralElementLike>): string {
        return this.symbolHelper.getSymbolDeps(props, 'selector').pop();
    }

    private parseProperties(node: ReadonlyArray<ts.ObjectLiteralElementLike>): Map<string, string> {
        let obj = new Map<string, string>();
        let properties = node.initializer.properties || [];
        properties.forEach((prop) => {
            obj.set(prop.name.text, prop.initializer.text);
        });
        return obj;
    }

    public getSymbolDepsObject(props: ReadonlyArray<ts.ObjectLiteralElementLike>, type: string, multiLine?: boolean): Map<string, string> {
        let deps = props.filter(node => node.name.text === type);
        return deps.map(x => this.parseProperties(x)).pop();
    }

    public getComponentIO(filename: string, sourceFile: ts.SourceFile, node: ts.Node, fileBody): any {
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
