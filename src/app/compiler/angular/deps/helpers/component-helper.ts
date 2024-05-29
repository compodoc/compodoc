import { SyntaxKind, ts } from 'ts-morph';
import { detectIndent } from '../../../../../utils';
import { ClassHelper } from './class-helper';
import { IParseDeepIdentifierResult, SymbolHelper } from './symbol-helper';

export class ComponentHelper {
    constructor(
        private classHelper: ClassHelper,
        private symbolHelper: SymbolHelper = new SymbolHelper()
    ) {}

    public getComponentChangeDetection(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string {
        return this.symbolHelper.getSymbolDeps(props, 'changeDetection', srcFile).pop();
    }

    public getComponentEncapsulation(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Array<string> {
        return this.symbolHelper.getSymbolDeps(props, 'encapsulation', srcFile);
    }

    public getComponentPure(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string {
        return this.symbolHelper.getSymbolDeps(props, 'pure', srcFile).pop();
    }

    public getComponentName(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string {
        return this.symbolHelper.getSymbolDeps(props, 'name', srcFile).pop();
    }

    public getComponentExportAs(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string {
        return this.symbolHelper.getSymbolDeps(props, 'exportAs', srcFile).pop();
    }

    public getComponentHostDirectives(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>
    ): Array<any> {
        const hostDirectiveSymbolParsed = this.symbolHelper.getSymbolDepsRaw(
            props,
            'hostDirectives'
        );
        let hostDirectiveSymbol = null;

        if (hostDirectiveSymbolParsed.length > 0) {
            hostDirectiveSymbol = hostDirectiveSymbolParsed.pop();
        }

        const result = [];

        if (
            hostDirectiveSymbol &&
            hostDirectiveSymbol.initializer &&
            hostDirectiveSymbol.initializer.elements &&
            hostDirectiveSymbol.initializer.elements.length > 0
        ) {
            hostDirectiveSymbol.initializer.elements.forEach(element => {
                if (element.kind === SyntaxKind.Identifier) {
                    result.push({
                        name: element.escapedText
                    });
                } else if (
                    element.kind === SyntaxKind.ObjectLiteralExpression &&
                    element.properties &&
                    element.properties.length > 0
                ) {
                    const parsedDirective: any = {
                        name: '',
                        inputs: [],
                        outputs: []
                    };

                    element.properties.forEach(property => {
                        if (property.name.escapedText === 'directive') {
                            parsedDirective.name = property.initializer.escapedText;
                        } else if (property.name.escapedText === 'inputs') {
                            if (
                                property.initializer &&
                                property.initializer.elements &&
                                property.initializer.elements.length > 0
                            ) {
                                property.initializer.elements.forEach(propertyElement => {
                                    parsedDirective.inputs.push(propertyElement.text);
                                });
                            }
                        } else if (property.name.escapedText === 'outputs') {
                            if (
                                property.initializer &&
                                property.initializer.elements &&
                                property.initializer.elements.length > 0
                            ) {
                                property.initializer.elements.forEach(propertyElement => {
                                    parsedDirective.outputs.push(propertyElement.text);
                                });
                            }
                        }
                    });

                    result.push(parsedDirective);
                }
            });
        }

        return result;
    }

    public getComponentHost(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>
    ): Map<string, string> {
        return this.getSymbolDepsObject(props, 'host');
    }

    public getComponentTag(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string {
        return this.symbolHelper.getSymbolDeps(props, 'tag', srcFile).pop();
    }

    public getComponentInputsMetadata(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Array<string> {
        return this.symbolHelper.getSymbolDeps(props, 'inputs', srcFile);
    }

    public getInputSignals(props) {
        let inputSignals = [];
        props?.forEach((prop, i) => {
            const regexpInput = /input(?:\.(required))?(?:<([\w-]+)>)?\(([\w-]+)?\)/;
            const resInput = regexpInput.exec(prop.defaultValue);
            if (resInput) {
                const newInput = prop;
                newInput.defaultValue = resInput[resInput.length - 1];
                newInput.required = resInput[0]?.includes('.required') ?? false;
                inputSignals.push(newInput);
            } else {
                const regexpModel = /model(?:\.(required))?(?:<([\w-]+)>)?\(([\w-]+)?\)/;
                const resModel = regexpModel.exec(prop.defaultValue);
                if (resModel) {
                    const newInput = prop;
                    newInput.defaultValue = resModel[resModel.length - 1];
                    newInput.required = resModel[0]?.includes('.required') ?? false;
                    inputSignals.push(newInput);
                }
            }
        });
        return inputSignals;
    }

    public getOutputSignals(props) {
        let outputSignals = [];
        props?.forEach((prop, i) => {
            const regexp = /output(?:\.(required))?(?:<([\w-]+)>)?\(([\w-]+)?\)/;
            const res = regexp.exec(prop.defaultValue);
            if (res) {
                const newOutput = prop;
                newOutput.defaultValue = res[res.length - 1];
                newOutput.required = res[0]?.includes('.required') ?? false;
                outputSignals.push(newOutput);
            }
        });
        return outputSignals;
    }

    public getComponentStandalone(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): boolean {
        let result = null;
        const parsedData = this.symbolHelper.getSymbolDeps(props, 'standalone', srcFile);
        if (parsedData.length === 1) {
            result = JSON.parse(parsedData[0]);
        }

        return result;
    }

    public getComponentTemplate(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string {
        let t = this.symbolHelper.getSymbolDeps(props, 'template', srcFile, true).pop();
        if (t) {
            t = detectIndent(t, 0);
            t = t.replace(/\n/, '');
            t = t.replace(/ +$/gm, '');
        }
        return t;
    }

    public getComponentStyleUrls(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string[] {
        return this.symbolHelper.getSymbolDeps(props, 'styleUrls', srcFile);
    }

    public getComponentStyleUrl(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string {
        return this.symbolHelper.getSymbolDeps(props, 'styleUrl', srcFile).pop();
    }

    public getComponentShadow(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string {
        return this.symbolHelper.getSymbolDeps(props, 'shadow', srcFile).pop();
    }

    public getComponentScoped(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string {
        return this.symbolHelper.getSymbolDeps(props, 'scoped', srcFile).pop();
    }

    public getComponentAssetsDir(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string {
        return this.symbolHelper.getSymbolDeps(props, 'assetsDir', srcFile).pop();
    }

    public getComponentAssetsDirs(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string[] {
        return this.sanitizeUrls(this.symbolHelper.getSymbolDeps(props, 'assetsDir', srcFile));
    }

    public getComponentStyles(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string[] {
        return this.symbolHelper.getSymbolDeps(props, 'styles', srcFile);
    }

    public getComponentModuleId(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string {
        return this.symbolHelper.getSymbolDeps(props, 'moduleId', srcFile).pop();
    }

    public getComponentOutputs(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string[] {
        return this.symbolHelper.getSymbolDeps(props, 'outputs', srcFile);
    }

    public getComponentProviders(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'providers', srcFile)
            .map(name => this.symbolHelper.parseDeepIndentifier(name));
    }

    public getComponentImports(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'imports', srcFile)
            .map(name => this.symbolHelper.parseDeepIndentifier(name));
    }

    public getComponentEntryComponents(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'entryComponents', srcFile)
            .map(name => this.symbolHelper.parseDeepIndentifier(name));
    }

    public getComponentViewProviders(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'viewProviders', srcFile)
            .map(name => this.symbolHelper.parseDeepIndentifier(name));
    }

    public getComponentTemplateUrl(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Array<string> {
        return this.symbolHelper.getSymbolDeps(props, 'templateUrl', srcFile);
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

    public getComponentPreserveWhitespaces(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string {
        return this.symbolHelper.getSymbolDeps(props, 'preserveWhitespaces', srcFile).pop();
    }

    public getComponentSelector(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string {
        return this.symbolHelper.getSymbolDeps(props, 'selector', srcFile).pop();
    }

    private parseProperties(node: ReadonlyArray<ts.ObjectLiteralElementLike>): Map<string, string> {
        let obj = new Map<string, string>();
        let properties = node.initializer.properties || [];
        properties.forEach(prop => {
            obj.set(prop.name.text, prop.initializer.text);
        });
        return obj;
    }

    public getSymbolDepsObject(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        type: string,
        multiLine?: boolean
    ): Map<string, string> {
        let i = 0,
            len = props.length,
            filteredProps = [];

        for (i; i < len; i++) {
            if (props[i].name && props[i].name.text === type) {
                filteredProps.push(props[i]);
            }
        }
        return filteredProps.map(x => this.parseProperties(x)).pop();
    }

    public getComponentIO(
        filename: string,
        sourceFile: ts.SourceFile,
        node: ts.Node,
        fileBody,
        astFile: ts.SourceFile
    ): any {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        let reducedSource = fileBody ? fileBody.statements : sourceFile.statements;
        let res = reducedSource.reduce((directive, statement) => {
            if (ts.isClassDeclaration(statement)) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(
                        this.classHelper.visitClassDeclaration(
                            filename,
                            statement,
                            sourceFile,
                            astFile
                        )
                    );
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
