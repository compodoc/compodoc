import * as semver from 'semver';
import { SyntaxKind, ts } from 'ts-morph';
import Configuration from '../../../../configuration';
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

    public getInputOutputSignals(props) {
        const inputSignals = [];
        const outputSignals = [];
        const properties = [];

        props.forEach(prop => {
            const inputSignal = this.getInputSignal(prop);
            if (inputSignal) {
                inputSignals.push(inputSignal);
            }

            const outputSignal = this.getOutputSignal(prop);
            if (outputSignal) {
                outputSignals.push(outputSignal);
            }

            if (!inputSignal && !outputSignal) {
                properties.push(prop);
            }
        });

        return { inputSignals, outputSignals, properties };
    }

    public getInputSignal(prop) {
        const config =
            this.getSignalConfig('input', prop.defaultValue) ??
            this.getSignalConfig('model', prop.defaultValue);

        if (config) {
            return {
                ...prop,
                ...config
            };
        }

        return undefined;
    }

    public getOutputSignal(prop) {
        const config =
            this.getSignalConfig('output', prop.defaultValue) ??
            this.getSignalConfig('model', prop.defaultValue);

        if (config) {
            return {
                ...prop,
                ...config
            };
        }

        return undefined;
    }

    private getSignalConfig(type: 'input' | 'output' | 'model', defaultValue: string) {
        if (!defaultValue) return undefined;

        const normalized = defaultValue.replace(/\n/g, '');

        // Check the signal type prefix (e.g. "input", "input.required")
        const prefixRegExp = new RegExp(`^${type}(\\.required)?`);
        const prefixMatch = prefixRegExp.exec(normalized);
        if (!prefixMatch) return undefined;

        const required = !!prefixMatch[1];
        let pos = prefixMatch[0].length;

        // Extract generic type parameters <...> using bracket matching to avoid
        // catastrophic backtracking on complex types like
        // input.required<string[], string | string[]>(...)  (issue #1654)
        let signalType: string | undefined;
        if (normalized[pos] === '<') {
            const typeEnd = this.findMatchingBracket(normalized, pos, '<', '>');
            if (typeEnd === -1) return undefined;
            signalType = normalized.slice(pos + 1, typeEnd);
            pos = typeEnd + 1;
        }

        // Expect opening paren for the arguments
        if (normalized[pos] !== '(') return undefined;
        const argsEnd = this.findMatchingBracket(normalized, pos, '(', ')');
        if (argsEnd === -1) return undefined;

        // Extract only the first argument as defaultValue, ignoring the options
        // object (second argument). For example, given:
        //   input(false, { transform: booleanAttribute })
        // argsStr would be "false, { transform: booleanAttribute }" and we only
        // want "false" as the default value.
        const fullArgs = normalized.slice(pos + 1, argsEnd).trim();
        const firstArg = this.extractFirstSignalArg(fullArgs) || undefined;
        const secondArg = this.extractSignalOptions(fullArgs);

        // When there is no second argument but the sole argument starts with '{',
        // it is the options object — not a default value.
        // e.g. output({ alias: 'x' }) or input.required<T>({ alias: 'x' })
        const isSoleArgOptions = !secondArg && !!firstArg?.trimStart().startsWith('{');
        let signalDefaultValue = isSoleArgOptions ? undefined : firstArg;

        // Normalize arrow function defaults with block bodies to '() => {...}' (issue #1652).
        // This is consistent with how class-helper.ts handles ArrowFunction initializers directly,
        // and avoids exposing implementation details in the generated documentation.
        if (signalDefaultValue && /\)\s*=>\s*\{/.test(signalDefaultValue)) {
            signalDefaultValue = '() => {...}';
        }

        // Extract the alias from the options object (second argument), if present.
        // Valid HTML attribute names allow any characters except ASCII control chars,
        // space, and "'>/=, so we use a broad character class instead of \w.
        const optionsStr = isSoleArgOptions ? firstArg : secondArg;
        const aliasRegExp = /alias:\s*['"\`]([^\u0000-\u001F\u007F\u0080-\u009F '"\`>/=]+)['"\`]/;
        const alias = optionsStr?.match(aliasRegExp)?.[1];

        const result = {
            required,
            type: this.parseSignalType(signalType),
            defaultValue: signalDefaultValue
        };

        return alias ? { ...result, name: alias } : result;
    }

    /**
     * Extracts the options object string (second argument) from a signal's
     * argument string. Returns undefined if there is no second argument.
     * For example:
     *   "'hello', { alias: 'my-alias' }" → "{ alias: 'my-alias' }"
     *   "'hello'"                        → undefined
     */
    private extractSignalOptions(argsStr: string): string | undefined {
        if (!argsStr) return undefined;

        let depth = 0;
        for (let i = 0; i < argsStr.length; i++) {
            const ch = argsStr[i];
            if (ch === '"' || ch === "'" || ch === '`') {
                const quote = ch;
                i++;
                while (i < argsStr.length && argsStr[i] !== quote) {
                    if (argsStr[i] === '\\') i++;
                    i++;
                }
            } else if (ch === '(' || ch === '[' || ch === '{') {
                depth++;
            } else if (ch === ')' || ch === ']' || ch === '}') {
                depth--;
            } else if (ch === ',' && depth === 0) {
                return argsStr.slice(i + 1).trim();
            }
        }

        return undefined;
    }

    /**
     * Extracts the first argument from a comma-separated argument string,
     * correctly handling nested brackets, braces, parens, and string literals.
     * For example:
     *   "false, { transform: booleanAttribute }" → "false"
     *   "0, { alias: 'x' }"                     → "0"
     *   "[1, 2], { alias: 'x' }"                → "[1, 2]"
     *   "'hello'"                                → "'hello'"
     */
    private extractFirstSignalArg(argsStr: string): string {
        if (!argsStr) return '';

        let depth = 0;
        for (let i = 0; i < argsStr.length; i++) {
            const ch = argsStr[i];
            if (ch === '"' || ch === "'" || ch === '`') {
                // Skip over string literals to avoid treating commas inside them as separators
                const quote = ch;
                i++;
                while (i < argsStr.length && argsStr[i] !== quote) {
                    if (argsStr[i] === '\\') i++; // skip escaped character
                    i++;
                }
            } else if (ch === '(' || ch === '[' || ch === '{') {
                depth++;
            } else if (ch === ')' || ch === ']' || ch === '}') {
                depth--;
            } else if (ch === ',' && depth === 0) {
                return argsStr.slice(0, i).trim();
            }
        }

        return argsStr.trim();
    }

    /**
     * Finds the position of the matching closing bracket for the opening bracket
     * at startPos. Handles nested brackets of the same type.
     * For angle brackets, skips '>' that is part of '=>' (arrow function syntax).
     */
    private findMatchingBracket(
        str: string,
        startPos: number,
        open: string,
        close: string
    ): number {
        let depth = 0;
        for (let i = startPos; i < str.length; i++) {
            if (str[i] === open) depth++;
            else if (str[i] === close) {
                // For angle brackets, skip '>' that is part of '=>' (arrow functions)
                if (close === '>' && i > 0 && str[i - 1] === '=') continue;
                depth--;
                if (depth === 0) return i;
            }
        }
        return -1;
    }

    public parseSignalType(type: string) {
        if (!type) {
            return type;
        }

        // adjust union string expression like: 'foo' | 'bar' | 'test'
        // which should be outputed as: "foo" | "bar" | "test"

        const unionTypeRegex = /^'([\w-]+)'\s?\|\s?('([\w-]+)'|.*)$/;
        let typeRest = type;
        let newType = '';
        let typeMatch: RegExpMatchArray;
        while ((typeMatch = typeRest.match(unionTypeRegex))) {
            const [, first, rest, second] = typeMatch;
            if (second) {
                newType += `"${first}" | "${second}"`;
                type = newType;
                break;
            }
            newType += `"${first}" | `;
            typeRest = rest;
        }

        return type;
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

        if (result === null) {
            const angularVersion = Configuration.mainData.angularVersion;
            const coerced = angularVersion ? semver.coerce(angularVersion) : null;
            if (coerced && semver.valid(coerced) && semver.gte(coerced.version, '19.0.0')) {
                result = true;
            }
        }

        return result;
    }

    public getComponentTemplate(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): string {
        let t = this.symbolHelper.getSymbolDeps(props, 'template', srcFile, true).pop();
        if (t && typeof t === 'string') {
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

    private parseProperties(node: ts.ObjectLiteralElementLike): Map<string, string> {
        let obj = new Map<string, string>();
        const element = node as any;
        let properties = element.initializer?.properties || [];
        properties.forEach((prop: any) => {
            obj.set(prop.name?.text, prop.initializer?.text);
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
            if (props[i].name && (props[i].name as any).text === type) {
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
