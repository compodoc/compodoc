import * as _ from "lodash";

import { ts, SyntaxKind } from "ts-morph";

import {
    getNamesCompareFn,
    mergeTagsAndArgs,
    markedtags,
} from "../../../../../utils/utils";
import { kindToType } from "../../../../../utils/kind-to-type";
import { JsdocParserUtil } from "../../../../../utils/jsdoc-parser.util";
import { isCoverageIgnore, isIgnore } from "../../../../../utils";
import AngularVersionUtil from "../../../../..//utils/angular-version.util";
import BasicTypeUtil from "../../../../../utils/basic-type.util";
import { StringifyObjectLiteralExpression } from "../../../../../utils/object-literal-expression.util";

import DependenciesEngine from "../../../../engines/dependencies.engine";
import Configuration from "../../../../configuration";
import { StringifyArrowFunction } from "../../../../../utils/arrow-function.util";
import {
    getNodeDecorators,
    nodeHasDecorator,
} from "../../../../../utils/node.util";
import { markedAcl } from "../../../../../utils/marked.acl";

const crypto = require("crypto");

export class ClassHelper {
    private jsdocParserUtil = new JsdocParserUtil();

    constructor(private typeChecker: ts.TypeChecker) {}

    /**
     * HELPERS
     */

    public stringifyDefaultValue(node: ts.Node): string {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        if (node && (node as any).getText && node.getText()) {
            return node.getText();
        } else if (node && node.kind === SyntaxKind.FalseKeyword) {
            return "false";
        } else if (node && node.kind === SyntaxKind.TrueKeyword) {
            return "true";
        }
        return "";
    }

    private checkForDeprecation(
        tags: any[],
        result: { [key in string | number]: any },
    ) {
        _.forEach(tags, (tag) => {
            if (
                tag.tagName &&
                tag.tagName.text &&
                tag.tagName.text.indexOf("deprecated") > -1
            ) {
                result.deprecated = true;
                result.deprecationMessage =
                    this.jsdocParserUtil.parseJSDocNode(tag);
            }
        });
    }

    /**
     * Process JSDoc tags and apply them to a result object
     */
    private processJSDocTags(
        jsdoctags: any,
        result: any,
        includeTagsArray: boolean = true,
    ): void {
        if (jsdoctags && jsdoctags.length >= 1) {
            const jsdoc = jsdoctags[0];
            if (jsdoc && jsdoc.tags) {
                this.checkForDeprecation(
                    jsdoc.tags as unknown as any[],
                    result,
                );
                if (includeTagsArray) {
                    result.jsdoctags = markedtags(
                        jsdoc.tags as unknown as any[],
                    );
                }
            }
        }
    }

    /**
     * Extract and process JSDoc comment for a node
     */
    private extractAndProcessJSDocComment(
        node: any,
        sourceFile: ts.SourceFile,
        result: any,
    ): void {
        if (node.jsDoc) {
            const comment = this.jsdocParserUtil.getMainCommentOfNode(
                node,
                sourceFile,
            );
            if (typeof comment !== "undefined") {
                const cleanedDescription =
                    this.jsdocParserUtil.parseComment(comment);
                result.rawdescription = cleanedDescription;
                result.description = markedAcl(cleanedDescription);
            }
        }
    }

    /**
     * Initialize common fields for documented items
     */
    private initializeDocumentationFields(): {
        deprecated: boolean;
        deprecationMessage: string;
    } {
        return {
            deprecated: false,
            deprecationMessage: "",
        };
    }

    private getTypeOperatorKeyword(operator: SyntaxKind): string {
        switch (operator) {
            case SyntaxKind.KeyOfKeyword:
                return "keyof";
            case SyntaxKind.UniqueKeyword:
                return "unique";
            case SyntaxKind.ReadonlyKeyword:
                return "readonly";
            default:
                return kindToType(operator);
        }
    }

    private tryResolveTypeFromTypeChecker(
        node: ts.Node,
        enclosingDeclaration?: ts.Node,
    ): string | undefined {
        if (
            !this.typeChecker ||
            typeof this.typeChecker.getTypeAtLocation !== "function" ||
            typeof this.typeChecker.typeToString !== "function"
        ) {
            return undefined;
        }

        try {
            const resolvedType = this.typeChecker.getTypeAtLocation(node);
            const typeAsString = this.typeChecker.typeToString(
                resolvedType,
                enclosingDeclaration || node,
                ts.TypeFormatFlags.NoTruncation,
            );

            if (typeAsString && typeAsString !== "unknown") {
                return typeAsString;
            }
            // tslint:disable-next-line:no-empty
        } catch (error) {}

        return undefined;
    }

    /**
     * Extract and filter modifier kinds from a node
     */
    private extractModifierKinds(node: any): number[] | undefined {
        if (!node.modifiers || node.modifiers.length === 0) {
            return undefined;
        }
        let kinds = node.modifiers.map((modifier) => modifier.kind);
        if (
            _.indexOf(kinds, SyntaxKind.PublicKeyword) !== -1 &&
            _.indexOf(kinds, SyntaxKind.StaticKeyword) !== -1
        ) {
            kinds = kinds.filter((kind) => kind !== SyntaxKind.PublicKeyword);
        }
        return kinds;
    }

    /**
     * Ensure private keyword is added for ECMAScript private fields
     */
    private ensurePrivateKeyword(result: any, node: any): void {
        if (this.isPrivate(node)) {
            if (!result.modifierKind) {
                result.modifierKind = [];
            }
            const hasAlreadyPrivateKeyword = result.modifierKind.includes(
                SyntaxKind.PrivateKeyword,
            );
            if (!hasAlreadyPrivateKeyword) {
                result.modifierKind.push(SyntaxKind.PrivateKeyword);
            }
        }
    }

    /**
     * Set fallback description from jsDoc[0].comment if no description exists
     */
    private setFallbackDescription(result: any, node: any): void {
        if (!result.description && node.jsDoc && node.jsDoc.length > 0) {
            if (typeof node.jsDoc[0].comment !== "undefined") {
                const rawDescription = node.jsDoc[0].comment;
                result.rawdescription = rawDescription;
                result.description = markedAcl(rawDescription);
            }
        }
    }

    private getDecoratorOfType(node, decoratorType) {
        let decorators = getNodeDecorators(node) || [];
        let result = [];
        const len = decorators.length;

        if (len > 1) {
            for (let i = 0; i < decorators.length; i++) {
                const expr = decorators[i].expression as any;
                if (expr.expression) {
                    if (expr.expression.text === decoratorType) {
                        result.push(decorators[i]);
                    }
                }
            }
            if (result.length > 0) {
                return result;
            }
        } else {
            if (len === 1) {
                const expr = decorators[0].expression as any;
                if (expr && expr.expression) {
                    if (expr.expression.text === decoratorType) {
                        result.push(decorators[0]);
                        return result;
                    }
                }
            }
        }

        return undefined;
    }

    private formatDecorators(decorators) {
        let _decorators = [];

        _.forEach(decorators, (decorator: any) => {
            if (decorator.expression) {
                if (decorator.expression.text) {
                    _decorators.push({ name: decorator.expression.text });
                }
                if (decorator.expression.expression) {
                    let info: any = {
                        name: decorator.expression.expression.text,
                    };
                    if (decorator.expression.arguments) {
                        info.stringifiedArguments = this.stringifyArguments(
                            decorator.expression.arguments,
                        );
                    }
                    _decorators.push(info);
                }
            }
        });

        return _decorators;
    }

    private handleFunction(arg): string {
        if (arg.function.length === 0) {
            return `${arg.name}${this.getOptionalString(arg)}: () => void`;
        }

        let argums = arg.function.map((argu) => {
            let _result = DependenciesEngine.find(argu.type);
            if (_result) {
                if (_result.source === "internal") {
                    let path = _result.data.type;
                    if (_result.data.type === "class") {
                        path = "classe";
                    }
                    return `${argu.name}${this.getOptionalString(arg)}: <a href="../${path}s/${
                        _result.data.name
                    }.html">${argu.type}</a>`;
                } else {
                    let path = AngularVersionUtil.getApiLink(
                        _result.data,
                        Configuration.mainData.angularVersion,
                    );
                    return `${argu.name}${this.getOptionalString(
                        arg,
                    )}: <a href="${path}" target="_blank">${argu.type}</a>`;
                }
            } else if (BasicTypeUtil.isKnownType(argu.type)) {
                let path = BasicTypeUtil.getTypeUrl(argu.type);
                return `${argu.name}${this.getOptionalString(
                    arg,
                )}: <a href="${path}" target="_blank">${argu.type}</a>`;
            } else {
                if (argu.name && argu.type) {
                    return `${argu.name}${this.getOptionalString(arg)}: ${argu.type}`;
                } else {
                    if (argu.name) {
                        return `${argu.name.text}`;
                    } else {
                        return "";
                    }
                }
            }
        });
        return `${arg.name}${this.getOptionalString(arg)}: (${argums}) => void`;
    }

    private getOptionalString(arg): string {
        return arg.optional ? "?" : "";
    }

    private stringifyArguments(args) {
        let stringifyArgs = [];

        stringifyArgs = args
            .map((arg) => {
                const _result = DependenciesEngine.find(arg.type);
                if (_result) {
                    if (_result.source === "internal") {
                        let path = _result.data.type;
                        if (_result.data.type === "class") {
                            path = "classe";
                        }
                        return `${arg.name}${this.getOptionalString(arg)}: <a href="../${path}s/${
                            _result.data.name
                        }.html">${arg.type}</a>`;
                    } else {
                        let path = AngularVersionUtil.getApiLink(
                            _result.data,
                            Configuration.mainData.angularVersion,
                        );
                        return `${arg.name}${this.getOptionalString(
                            arg,
                        )}: <a href="${path}" target="_blank">${arg.type}</a>`;
                    }
                } else if (arg.dotDotDotToken) {
                    return `...${arg.name}: ${arg.type}`;
                } else if (arg.function) {
                    return this.handleFunction(arg);
                } else if (arg.expression && arg.name) {
                    return arg.expression.text + "." + arg.name.text;
                } else if (
                    arg.expression &&
                    arg.kind === SyntaxKind.NewExpression
                ) {
                    return "new " + arg.expression.text + "()";
                } else if (arg.kind && arg.kind === SyntaxKind.StringLiteral) {
                    return `'` + arg.text + `'`;
                } else if (
                    arg.kind &&
                    arg.kind === SyntaxKind.ArrayLiteralExpression &&
                    arg.elements &&
                    arg.elements.length > 0
                ) {
                    let i = 0,
                        len = arg.elements.length,
                        result = "[";
                    for (i; i < len; i++) {
                        result += `'` + arg.elements[i].text + `'`;
                        if (i < len - 1) {
                            result += ", ";
                        }
                    }
                    result += "]";
                    return result;
                } else if (
                    arg.kind &&
                    arg.kind === SyntaxKind.ArrowFunction &&
                    arg.parameters &&
                    arg.parameters.length > 0
                ) {
                    return StringifyArrowFunction(arg);
                } else if (
                    arg.kind &&
                    arg.kind === SyntaxKind.ObjectLiteralExpression
                ) {
                    return StringifyObjectLiteralExpression(arg);
                } else if (BasicTypeUtil.isKnownType(arg.type)) {
                    const path = BasicTypeUtil.getTypeUrl(arg.type);
                    return `${arg.name}${this.getOptionalString(
                        arg,
                    )}: <a href="${path}" target="_blank">${arg.type}</a>`;
                } else {
                    if (arg.type) {
                        let finalStringifiedArgument = "";
                        let separator = ":";
                        if (arg.name) {
                            finalStringifiedArgument += arg.name;
                        }
                        if (
                            arg.kind === SyntaxKind.AsExpression &&
                            arg.expression &&
                            arg.expression.text
                        ) {
                            finalStringifiedArgument += arg.expression.text;
                            separator = " as";
                        }
                        if (arg.optional) {
                            finalStringifiedArgument +=
                                this.getOptionalString(arg);
                        }
                        if (arg.type) {
                            finalStringifiedArgument +=
                                separator + " " + this.visitType(arg.type);
                        }
                        return finalStringifiedArgument;
                    } else if (arg.text) {
                        return `${arg.text}`;
                    } else {
                        return `${arg.name}${this.getOptionalString(arg)}`;
                    }
                }
            })
            .join(", ");

        return stringifyArgs;
    }

    private getPosition(
        node: ts.Node,
        sourceFile: ts.SourceFile,
    ): ts.LineAndCharacter {
        let position: ts.LineAndCharacter;
        if ((node as any).name && (node as any).name.end) {
            position = ts.getLineAndCharacterOfPosition(
                sourceFile,
                (node as any).name.end,
            );
        } else {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node.pos);
        }
        return position;
    }

    private addAccessor(accessors, nodeAccessor, sourceFile) {
        let nodeName = "";
        if (nodeAccessor.name) {
            nodeName = nodeAccessor.name.text;
            let jsdoctags = this.jsdocParserUtil.getJSDocs(nodeAccessor);

            if (!accessors[nodeName]) {
                accessors[nodeName] = {
                    name: nodeName,
                    setSignature: undefined,
                    getSignature: undefined,
                };
            }

            if (nodeAccessor.kind === SyntaxKind.SetAccessor) {
                let setSignature: any = {
                    name: nodeName,
                    type: "void",
                    ...this.initializeDocumentationFields(),
                    args: nodeAccessor.parameters.map((param) =>
                        this.visitArgument(param),
                    ),
                    returnType: nodeAccessor.type
                        ? this.visitType(nodeAccessor.type)
                        : "void",
                    line: this.getPosition(nodeAccessor, sourceFile).line + 1,
                };

                this.extractAndProcessJSDocComment(
                    nodeAccessor,
                    sourceFile,
                    setSignature,
                );
                this.processJSDocTags(jsdoctags, setSignature);

                if (
                    setSignature.jsdoctags &&
                    setSignature.jsdoctags.length > 0
                ) {
                    setSignature.jsdoctags = mergeTagsAndArgs(
                        setSignature.args,
                        setSignature.jsdoctags,
                    );
                } else if (setSignature.args && setSignature.args.length > 0) {
                    setSignature.jsdoctags = mergeTagsAndArgs(
                        setSignature.args,
                    );
                }

                accessors[nodeName].setSignature = setSignature;
            }
            if (nodeAccessor.kind === SyntaxKind.GetAccessor) {
                let getSignature: any = {
                    name: nodeName,
                    type: nodeAccessor.type
                        ? kindToType(nodeAccessor.type.kind)
                        : "",
                    returnType: nodeAccessor.type
                        ? this.visitType(nodeAccessor.type)
                        : "",
                    line: this.getPosition(nodeAccessor, sourceFile).line + 1,
                };

                this.extractAndProcessJSDocComment(
                    nodeAccessor,
                    sourceFile,
                    getSignature,
                );
                this.processJSDocTags(jsdoctags, getSignature);

                accessors[nodeName].getSignature = getSignature;
            }
        }
    }

    private hasDecoratorType(
        decorator: ts.Decorator,
        ...types: string[]
    ): boolean {
        if ((decorator.expression as any).expression) {
            const decoratorText = (decorator.expression as any).expression.text;
            return types.includes(decoratorText);
        }
        return false;
    }

    private isDirectiveDecorator(decorator: ts.Decorator): boolean {
        return this.hasDecoratorType(decorator, "Directive", "Component");
    }

    private isServiceDecorator(decorator) {
        return this.hasDecoratorType(decorator, "Injectable");
    }

    private isPrivate(member): boolean {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        if (member.modifiers) {
            const isPrivate: boolean = member.modifiers.some(
                (modifier) => modifier.kind === SyntaxKind.PrivateKeyword,
            );
            if (isPrivate) {
                return true;
            }
        }
        // Check for ECMAScript Private Fields
        if (member.name && member.name.escapedText) {
            const isPrivate: boolean =
                member.name.escapedText.indexOf("#") === 0;
            if (isPrivate) {
                return true;
            }
        }
        return this.isHiddenMember(member);
    }

    private isProtected(member): boolean {
        if (member.modifiers) {
            const isProtected: boolean = member.modifiers.some(
                (modifier) => modifier.kind === SyntaxKind.ProtectedKeyword,
            );
            if (isProtected) {
                return true;
            }
        }
        return this.isHiddenMember(member);
    }

    private isInternal(member): boolean {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        const internalTags: string[] = ["internal"];
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

    private isPublic(member): boolean {
        if (member.modifiers) {
            const isPublic: boolean = member.modifiers.some(
                (modifier) => modifier.kind === SyntaxKind.PublicKeyword,
            );
            if (isPublic) {
                return true;
            }
        }
        return this.isHiddenMember(member);
    }

    private isHiddenMember(member): boolean {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        const internalTags: string[] = ["hidden"];
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

    private isPipeDecorator(decorator) {
        return this.hasDecoratorType(decorator, "Pipe");
    }

    private isControllerDecorator(decorator) {
        return this.hasDecoratorType(decorator, "Controller");
    }

    private isModuleDecorator(decorator) {
        return this.hasDecoratorType(decorator, "NgModule", "Module");
    }

    /**
     * VISITERS
     */

    public visitClassDeclaration(
        fileName: string,
        classDeclaration: ts.ClassDeclaration | ts.InterfaceDeclaration,
        sourceFile?: ts.SourceFile,
        astFile?: ts.SourceFile,
    ): any {
        let symbol = this.typeChecker.getSymbolAtLocation(
            classDeclaration.name,
        );
        let rawdescription = "";
        let deprecation = this.initializeDocumentationFields();
        let description = "";
        let jsdoctags: any[] = [];

        if (symbol) {
            const comment = this.jsdocParserUtil.getMainCommentOfNode(
                classDeclaration,
                sourceFile,
            );
            rawdescription = this.jsdocParserUtil.parseComment(comment);
            description = markedAcl(rawdescription);
            if (symbol.valueDeclaration && isIgnore(symbol.valueDeclaration)) {
                return [{ ignore: true }];
            }
            if (symbol.declarations && symbol.declarations.length > 0) {
                let declarationsjsdoctags = this.jsdocParserUtil.getJSDocs(
                    symbol.declarations[0],
                );
                this.processJSDocTags(
                    declarationsjsdoctags,
                    deprecation,
                    false,
                );
                if (isIgnore(symbol.declarations[0])) {
                    return [{ ignore: true }];
                }
            }
            if (symbol.valueDeclaration) {
                jsdoctags = this.jsdocParserUtil.getJSDocs(
                    symbol.valueDeclaration,
                ) as unknown as any[];
                if (jsdoctags && jsdoctags.length >= 1) {
                    const jsdoc = jsdoctags[0] as any;
                    if (jsdoc && jsdoc.tags) {
                        const tempDeprecation =
                            this.initializeDocumentationFields();
                        this.checkForDeprecation(jsdoc.tags, tempDeprecation);
                        deprecation = tempDeprecation;
                        jsdoctags = markedtags(jsdoc.tags);
                    }
                }
            }
        }

        let className = classDeclaration.name.text;
        let members;
        let implementsElements = [];
        let extendsElements = [];
        const coverageIgnore = isCoverageIgnore(classDeclaration);

        if (
            typeof (ts as any).getEffectiveImplementsTypeNodes !== "undefined"
        ) {
            let implementedTypes = (ts as any).getEffectiveImplementsTypeNodes(
                classDeclaration,
            );
            if (implementedTypes) {
                let i = 0;
                let len = implementedTypes.length;
                for (i; i < len; i++) {
                    if (implementedTypes[i].expression) {
                        implementsElements.push(
                            implementedTypes[i].expression.text,
                        );
                    }
                }
            }
        }

        if (typeof (ts as any).getClassExtendsHeritageElement !== "undefined") {
            if (astFile) {
                let interfaceOrClassNode = (astFile as any).getInterface(
                    className,
                );
                if (!interfaceOrClassNode) {
                    interfaceOrClassNode = (astFile as any).getClass(className);
                }
                if (interfaceOrClassNode) {
                    const extendsListRaw = interfaceOrClassNode.getExtends();
                    let extendsList = [];
                    if (extendsListRaw) {
                        if (Array.isArray(extendsListRaw)) {
                            if (extendsListRaw.length > 0) {
                                extendsListRaw.forEach((extendElement) => {
                                    const extendElementExpression =
                                        extendElement.getExpression();
                                    if (extendElementExpression) {
                                        const text =
                                            extendElementExpression.getText();
                                        if (text) {
                                            extendsList.push(text);
                                        }
                                    }
                                });
                            }
                        } else {
                            const extendElementExpression =
                                extendsListRaw.getExpression();
                            if (extendElementExpression) {
                                const text = extendElementExpression.getText();
                                if (text) {
                                    extendsList.push(text);
                                }
                            }
                        }
                    }
                    extendsElements = extendsList;
                }
            }
        }
        members = this.visitMembers(classDeclaration.members, sourceFile);

        if (nodeHasDecorator(classDeclaration)) {
            const classDecorators = getNodeDecorators(classDeclaration);
            // Loop and search for official decorators at top-level :
            // Angular : @NgModule, @Component, @Directive, @Injectable, @Pipe
            // Nestjs : @Controller, @Module, @Injectable
            // Stencil : @Component
            let isDirective = false;
            let isService = false;
            let isPipe = false;
            let isModule = false;
            let isController = false;
            for (let a = 0; a < classDecorators.length; a++) {
                //console.log(classDeclaration.decorators[i].expression);

                // RETURN TOO EARLY FOR MANY DECORATORS !!!!
                // iterating through the decorators array we have to keep the flags `true` values from the previous loop iteration
                isDirective =
                    isDirective ||
                    this.isDirectiveDecorator(classDecorators[a]);
                isService =
                    isService || this.isServiceDecorator(classDecorators[a]);
                isPipe = isPipe || this.isPipeDecorator(classDecorators[a]);
                isModule =
                    isModule || this.isModuleDecorator(classDecorators[a]);
                isController =
                    isController ||
                    this.isControllerDecorator(classDecorators[a]);
            }
            if (isDirective) {
                return {
                    deprecated: deprecation.deprecated,
                    deprecationMessage: deprecation.deprecationMessage,
                    coverageIgnore,
                    description,
                    rawdescription: rawdescription,
                    inputs: members.inputs,
                    outputs: members.outputs,
                    hostBindings: members.hostBindings,
                    hostListeners: members.hostListeners,
                    properties: members.properties,
                    methods: members.methods,
                    indexSignatures: members.indexSignatures,
                    kind: members.kind,
                    constructor: members.constructor,
                    jsdoctags: jsdoctags,
                    extends: extendsElements,
                    implements: implementsElements,
                    accessors: members.accessors,
                };
            } else if (isService) {
                return [
                    {
                        fileName,
                        className,
                        deprecated: deprecation.deprecated,
                        deprecationMessage: deprecation.deprecationMessage,
                        coverageIgnore,
                        description,
                        rawdescription: rawdescription,
                        methods: members.methods,
                        indexSignatures: members.indexSignatures,
                        properties: members.properties,
                        kind: members.kind,
                        constructor: members.constructor,
                        jsdoctags: jsdoctags,
                        extends: extendsElements,
                        implements: implementsElements,
                        accessors: members.accessors,
                    },
                ];
            } else if (isPipe) {
                return [
                    {
                        fileName,
                        className,
                        deprecated: deprecation.deprecated,
                        deprecationMessage: deprecation.deprecationMessage,
                        coverageIgnore,
                        description,
                        rawdescription: rawdescription,
                        jsdoctags: jsdoctags,
                        properties: members.properties,
                        methods: members.methods,
                    },
                ];
            } else if (isModule) {
                return [
                    {
                        fileName,
                        className,
                        deprecated: deprecation.deprecated,
                        deprecationMessage: deprecation.deprecationMessage,
                        coverageIgnore,
                        description,
                        rawdescription: rawdescription,
                        jsdoctags: jsdoctags,
                        methods: members.methods,
                    },
                ];
            } else {
                return [
                    {
                        deprecated: deprecation.deprecated,
                        deprecationMessage: deprecation.deprecationMessage,
                        coverageIgnore,
                        description,
                        rawdescription: rawdescription,
                        methods: members.methods,
                        indexSignatures: members.indexSignatures,
                        properties: members.properties,
                        kind: members.kind,
                        constructor: members.constructor,
                        jsdoctags: jsdoctags,
                        extends: extendsElements,
                        implements: implementsElements,
                        accessors: members.accessors,
                    },
                ];
            }
        }
        if (description) {
            return [
                {
                    deprecated: deprecation.deprecated,
                    deprecationMessage: deprecation.deprecationMessage,
                    coverageIgnore,
                    description,
                    rawdescription: rawdescription,
                    inputs: members.inputs,
                    outputs: members.outputs,
                    hostBindings: members.hostBindings,
                    hostListeners: members.hostListeners,
                    methods: members.methods,
                    indexSignatures: members.indexSignatures,
                    properties: members.properties,
                    kind: members.kind,
                    constructor: members.constructor,
                    jsdoctags: jsdoctags,
                    extends: extendsElements,
                    implements: implementsElements,
                    accessors: members.accessors,
                },
            ];
        } else {
            return [
                {
                    deprecated: deprecation.deprecated,
                    deprecationMessage: deprecation.deprecationMessage,
                    coverageIgnore,
                    methods: members.methods,
                    inputs: members.inputs,
                    outputs: members.outputs,
                    hostBindings: members.hostBindings,
                    hostListeners: members.hostListeners,
                    indexSignatures: members.indexSignatures,
                    properties: members.properties,
                    kind: members.kind,
                    constructor: members.constructor,
                    jsdoctags: jsdoctags,
                    extends: extendsElements,
                    implements: implementsElements,
                    accessors: members.accessors,
                },
            ];
        }
    }

    private visitMembers(members: any, sourceFile: any) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        let inputs = [];
        let outputs = [];
        let methods = [];
        let properties = [];
        let indexSignatures = [];
        let kind;
        let inputDecorator;
        let hostBindings = [];
        let hostListeners = [];
        let constructor;
        let outputDecorator;
        let accessors = {};
        let result = {};

        for (let i = 0; i < members.length; i++) {
            // Allows typescript guess type when using ts.is*
            let member = members[i];

            inputDecorator = this.getDecoratorOfType(member, "Input");
            outputDecorator = this.getDecoratorOfType(member, "Output");
            const parsedHostBindings = this.getDecoratorOfType(
                member,
                "HostBinding",
            );
            const parsedHostListeners = this.getDecoratorOfType(
                member,
                "HostListener",
            );

            kind = member.kind;

            if (isIgnore(member)) {
                continue;
            }

            if (
                this.isInternal(member) &&
                Configuration.mainData.disableInternal
            ) {
                continue;
            }

            if (inputDecorator && inputDecorator.length > 0) {
                inputs.push(
                    this.visitInputAndHostBinding(
                        member,
                        inputDecorator[0],
                        sourceFile,
                    ),
                );
                if (ts.isSetAccessorDeclaration(member)) {
                    this.addAccessor(accessors, members[i], sourceFile);
                }
            } else if (outputDecorator && outputDecorator.length > 0) {
                outputs.push(
                    this.visitOutput(member, outputDecorator[0], sourceFile),
                );
            } else if (parsedHostBindings && parsedHostBindings.length > 0) {
                let k = 0;
                const lenHB = parsedHostBindings.length;
                for (k; k < lenHB; k++) {
                    hostBindings.push(
                        this.visitInputAndHostBinding(
                            member,
                            parsedHostBindings[k],
                            sourceFile,
                        ),
                    );
                }
            } else if (parsedHostListeners && parsedHostListeners.length > 0) {
                let l = 0;
                const lenHL = parsedHostListeners.length;
                for (l; l < lenHL; l++) {
                    hostListeners.push(
                        this.visitHostListener(
                            member,
                            parsedHostListeners[l],
                            sourceFile,
                        ),
                    );
                }
            }

            if (!this.isHiddenMember(member)) {
                if (
                    !(
                        this.isPrivate(member) &&
                        Configuration.mainData.disablePrivate
                    )
                ) {
                    if (
                        !(
                            this.isInternal(member) &&
                            Configuration.mainData.disableInternal
                        )
                    ) {
                        if (
                            !(
                                this.isProtected(member) &&
                                Configuration.mainData.disableProtected
                            )
                        ) {
                            if (
                                ts.isMethodDeclaration(member) ||
                                ts.isMethodSignature(member)
                            ) {
                                methods.push(
                                    this.visitMethodDeclaration(
                                        member,
                                        sourceFile,
                                    ),
                                );
                            } else if (
                                ts.isPropertyDeclaration(member) ||
                                ts.isPropertySignature(member)
                            ) {
                                if (!inputDecorator && !outputDecorator) {
                                    properties.push(
                                        this.visitProperty(member, sourceFile),
                                    );
                                }
                            } else if (ts.isCallSignatureDeclaration(member)) {
                                properties.push(
                                    this.visitCallDeclaration(
                                        member,
                                        sourceFile,
                                    ),
                                );
                            } else if (
                                ts.isGetAccessorDeclaration(member) ||
                                ts.isSetAccessorDeclaration(member)
                            ) {
                                this.addAccessor(
                                    accessors,
                                    members[i],
                                    sourceFile,
                                );
                            } else if (ts.isIndexSignatureDeclaration(member)) {
                                indexSignatures.push(
                                    this.visitIndexDeclaration(
                                        member,
                                        sourceFile,
                                    ),
                                );
                            } else if (ts.isConstructorDeclaration(member)) {
                                let _constructorProperties =
                                    this.visitConstructorProperties(
                                        member,
                                        sourceFile,
                                    );
                                let j = 0;
                                let len = _constructorProperties.length;
                                for (j; j < len; j++) {
                                    properties.push(_constructorProperties[j]);
                                }
                                constructor = this.visitConstructorDeclaration(
                                    member,
                                    sourceFile,
                                );
                            }
                        }
                    }
                }
            }
        }

        inputs.sort(getNamesCompareFn());
        outputs.sort(getNamesCompareFn());
        hostBindings.sort(getNamesCompareFn());
        hostListeners.sort(getNamesCompareFn());
        properties.sort(getNamesCompareFn());
        methods.sort(getNamesCompareFn());
        indexSignatures.sort(getNamesCompareFn());

        result = {
            inputs,
            outputs,
            hostBindings,
            hostListeners,
            methods,
            properties,
            indexSignatures,
            kind,
            constructor,
        };

        if (Object.keys(accessors).length) {
            result["accessors"] = accessors;
        }

        return result;
    }

    private visitTypeName(typeName: ts.Identifier) {
        if (typeName.escapedText) {
            return typeName.escapedText;
        }
        if (typeName.text) {
            return typeName.text;
        }
        if ((typeName as any).left && (typeName as any).right) {
            return (
                this.visitTypeName((typeName as any).left) +
                "." +
                this.visitTypeName((typeName as any).right)
            );
        }
        return "";
    }

    public visitTypeIndex(node): string {
        let _return = "";

        if (!node) {
            return _return;
        }

        if (
            node.type &&
            node.type.kind === SyntaxKind.IndexedAccessType &&
            node.type.indexType &&
            node.type.indexType.literal
        ) {
            return this.visitTypeName(node.type.indexType.literal);
        }

        return _return;
    }

    public visitType(node): string {
        let _return = "void";

        if (!node) {
            return _return;
        }

        if (node.typeName) {
            _return = this.visitTypeName(node.typeName);
        } else if (node.type) {
            if (ts.isTypeOperatorNode(node.type)) {
                const operator = this.getTypeOperatorKeyword(node.type.operator);
                const operand = this.visitType(node.type.type);
                _return = operand ? `${operator} ${operand}` : operator;
            }
            if (ts.isTypeQueryNode(node.type)) {
                _return = `typeof ${this.visitTypeName(node.type.exprName as any)}`;
            }
            if (
                node.type.kind &&
                !ts.isTypeOperatorNode(node.type) &&
                !ts.isTypeQueryNode(node.type) &&
                !ts.isUnionTypeNode(node.type) &&
                !ts.isTupleTypeNode(node.type) &&
                !ts.isIntersectionTypeNode(node.type)
            ) {
                _return = kindToType(node.type.kind);
            }
            if (node.type.typeName) {
                _return = this.visitTypeName(node.type.typeName);
            }
            if (node.type.typeArguments) {
                _return += "<";
                const typeArguments = [];
                for (const argument of node.type.typeArguments) {
                    typeArguments.push(this.visitType(argument));
                }
                _return += typeArguments.join(" | ");
                _return += ">";
            }
            if (node.type.elementType) {
                const _firstPart = this.visitType(node.type.elementType);
                _return = _firstPart + kindToType(node.type.kind);
                if (
                    node.type.elementType.kind === SyntaxKind.ParenthesizedType
                ) {
                    _return =
                        "(" + _firstPart + ")" + kindToType(node.type.kind);
                }
            }

            const parseTypesOrElements = (arr, separator) => {
                let i = 0;
                let len = arr.length;
                for (i; i < len; i++) {
                    let type = arr[i];

                    if (type.elementType) {
                        const _firstPart = this.visitType(type.elementType);
                        if (
                            type.elementType.kind ===
                            SyntaxKind.ParenthesizedType
                        ) {
                            _return +=
                                "(" + _firstPart + ")" + kindToType(type.kind);
                        } else {
                            _return += _firstPart + kindToType(type.kind);
                        }
                    } else {
                        if (ts.isLiteralTypeNode(type) && type.literal) {
                            if ((type.literal as any).text) {
                                _return +=
                                    '"' + (type.literal as any).text + '"';
                            } else {
                                _return += kindToType(type.literal.kind);
                            }
                        } else if ((type as any).typeName) {
                            _return += this.visitTypeName(
                                (type as any).typeName,
                            );
                        } else if (
                            type.kind === SyntaxKind.RestType &&
                            type.type
                        ) {
                            _return += "..." + this.visitType(type.type);
                        } else if (ts.isIntersectionTypeNode(type) && type.types) {
                            const parts: string[] = [];
                            for (const t of type.types) {
                                parts.push(this.visitType(t));
                            }
                            _return += parts.join(" & ");
                        } else {
                            _return += kindToType(type.kind);
                        }
                        if (type.typeArguments) {
                            _return += "<";
                            const typeArguments = [];
                            for (const argument of type.typeArguments) {
                                typeArguments.push(this.visitType(argument));
                            }
                            _return += typeArguments.join(separator);
                            _return += ">";
                        }
                    }
                    if (i < len - 1) {
                        _return += separator;
                    }
                }
            };

            if (node.type.elements && ts.isTupleTypeNode(node.type)) {
                _return = "[";
                parseTypesOrElements(node.type.elements, ", ");
                _return += "]";
            }
            if (node.type.types && ts.isUnionTypeNode(node.type)) {
                _return = "";
                parseTypesOrElements(node.type.types, " | ");
            }
            if (node.type.types && ts.isIntersectionTypeNode(node.type)) {
                _return = "";
                parseTypesOrElements(node.type.types, " & ");
            }
            if (node.type.elementTypes) {
                let elementTypes = node.type.elementTypes;
                let i = 0;
                let len = elementTypes.length;
                if (len > 0) {
                    _return = "[";

                    for (i; i < len; i++) {
                        let type = elementTypes[i];
                        if (
                            type.kind === SyntaxKind.ArrayType &&
                            type.elementType
                        ) {
                            _return += kindToType(type.elementType.kind);
                            _return += kindToType(type.kind);
                        } else if ((type as any).typeName) {
                            // For type references, use the type name directly instead of kindToType + typeName
                            _return += this.visitTypeName(
                                (type as any).typeName,
                            );
                        } else {
                            _return += kindToType(type.kind);
                        }
                        if (ts.isLiteralTypeNode(type) && type.literal) {
                            if ((type.literal as any).text) {
                                _return +=
                                    '"' + (type.literal as any).text + '"';
                            } else {
                                _return += kindToType(type.literal.kind);
                            }
                        }
                        if (type.kind === SyntaxKind.RestType && type.type) {
                            _return += "..." + this.visitType(type.type);
                        }

                        if (
                            type.kind === SyntaxKind.TypeReference &&
                            type.typeName &&
                            typeof type.typeName.escapedText !== "undefined" &&
                            type.typeName.escapedText === ""
                        ) {
                            continue;
                        }
                        if (i < len - 1) {
                            _return += ", ";
                        }
                    }
                    _return += "]";
                }
            }
            if (
                node.type &&
                node.type.kind === SyntaxKind.IndexedAccessType &&
                node.type.objectType &&
                node.type.objectType.typeName
            ) {
                _return = this.visitTypeName(node.type.objectType.typeName);
            }
        } else if (node.elementType) {
            _return = kindToType(node.elementType.kind) + kindToType(node.kind);
            if (node.elementType.typeName) {
                _return =
                    this.visitTypeName(node.elementType.typeName) +
                    kindToType(node.kind);
            }
        } else if (ts.isTypeOperatorNode(node)) {
            const operator = this.getTypeOperatorKeyword(node.operator);
            const operand = this.visitType(node.type);
            _return = operand ? `${operator} ${operand}` : operator;
        } else if (ts.isTypeQueryNode(node)) {
            _return = `typeof ${this.visitTypeName(node.exprName as any)}`;
        } else if (node.types && ts.isUnionTypeNode(node)) {
            _return = "";
            let i = 0;
            let len = node.types.length;
            for (i; i < len; i++) {
                let type = node.types[i];
                if (ts.isLiteralTypeNode(type) && type.literal) {
                    if ((type.literal as any).text) {
                        _return += '"' + (type.literal as any).text + '"';
                    } else {
                        _return += kindToType(type.literal.kind);
                    }
                } else if ((type as any).typeName) {
                    _return += this.visitTypeName((type as any).typeName);
                } else {
                    _return += kindToType(type.kind);
                }
                if (i < len - 1) {
                    _return += " | ";
                }
            }
        } else if (node.types && ts.isIntersectionTypeNode(node)) {
            _return = "";
            let i = 0;
            let len = node.types.length;
            for (i; i < len; i++) {
                let type = node.types[i];
                if (ts.isLiteralTypeNode(type) && type.literal) {
                    if ((type.literal as any).text) {
                        _return += '"' + (type.literal as any).text + '"';
                    } else {
                        _return += kindToType(type.literal.kind);
                    }
                } else if ((type as any).typeName) {
                    _return += this.visitTypeName((type as any).typeName);
                } else {
                    _return += this.visitType(type);
                }
                if (i < len - 1) {
                    _return += " & ";
                }
            }
        } else if (
            node.kind === SyntaxKind.IndexedAccessType &&
            node.objectType
        ) {
            let objectTypePart = "";
            if (node.objectType.typeName) {
                objectTypePart = this.visitTypeName(node.objectType.typeName);
            } else {
                objectTypePart = this.visitType(node.objectType);
            }
            let indexTypePart = "";
            if (
                node.indexType &&
                ts.isLiteralTypeNode(node.indexType) &&
                (node.indexType.literal as any).text
            ) {
                indexTypePart = (node.indexType.literal as any).text;
            } else if (node.indexType) {
                indexTypePart = this.visitType(node.indexType);
            }
            _return = `${objectTypePart}['${indexTypePart}']`;
        } else if (node.dotDotDotToken) {
            _return = "any[]";
        } else {
            _return = kindToType(node.kind);

            // Enhanced handling for TypeLiteral to show actual object structure
            if (node.kind === SyntaxKind.TypeLiteral && node.members) {
                _return = "{ ";
                const memberStrings: string[] = [];
                for (const member of node.members) {
                    if (
                        ts.isPropertySignature(member) &&
                        member.name &&
                        member.type
                    ) {
                        const memberName =
                            (member.name as any).text ||
                            (member.name as any).escapedText;
                        const memberType = this.visitType(member.type);
                        const optionalMarker = member.questionToken ? "?" : "";
                        memberStrings.push(
                            `${memberName}${optionalMarker}: ${memberType}`,
                        );
                    } else if (ts.isMethodSignature(member) && member.name) {
                        const memberName =
                            (member.name as any).text ||
                            (member.name as any).escapedText;
                        const returnType = member.type
                            ? this.visitType(member.type)
                            : "void";
                        let parameters = "";
                        if (member.parameters && member.parameters.length > 0) {
                            parameters = member.parameters
                                .map((param) => {
                                    const paramName = param.name
                                        ? (param.name as any).text ||
                                          (param.name as any).escapedText
                                        : "";
                                    const paramType = param.type
                                        ? this.visitType(param.type)
                                        : "any";
                                    const optionalMarker = param.questionToken
                                        ? "?"
                                        : "";
                                    return `${paramName}${optionalMarker}: ${paramType}`;
                                })
                                .join(", ");
                        }
                        memberStrings.push(
                            `${memberName}(${parameters}): ${returnType}`,
                        );
                    }
                }
                _return += memberStrings.join("; ");
                _return += " }";
            }

            if (
                (_return === "" || _return === "unknown") &&
                node.initializer &&
                node.initializer.kind &&
                (node.kind === SyntaxKind.PropertyDeclaration ||
                    node.kind === SyntaxKind.Parameter)
            ) {
                _return = kindToType(node.initializer.kind);
            }
            if (node.kind === SyntaxKind.TypeParameter) {
                _return = node.name.text;
            }
            if (node.kind === SyntaxKind.LiteralType) {
                _return = node.literal.text;
            }
        }
        if (node.typeArguments && node.typeArguments.length > 0) {
            _return += "<";
            let i = 0,
                len = node.typeArguments.length;
            for (i; i < len; i++) {
                let argument = node.typeArguments[i];
                _return += this.visitType(argument);
                if (i >= 0 && i < len - 1) {
                    _return += ", ";
                }
            }
            _return += ">";
        }
        return _return;
    }

    private visitCallDeclaration(
        method: ts.CallSignatureDeclaration,
        sourceFile: ts.SourceFile,
    ) {
        let sourceCode = sourceFile.getText();
        let hash = crypto.createHash("sha512").update(sourceCode).digest("hex");
        let result: any = {
            id: "call-declaration-" + hash,
            args: method.parameters
                ? method.parameters.map((prop) => this.visitArgument(prop))
                : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1,
            ...this.initializeDocumentationFields(),
        };
        this.extractAndProcessJSDocComment(method, sourceFile, result);
        const jsdoctags = this.jsdocParserUtil.getJSDocs(method);
        this.processJSDocTags(jsdoctags, result);
        return result;
    }

    private visitIndexDeclaration(
        method: ts.IndexSignatureDeclaration,
        sourceFile?: ts.SourceFile,
    ) {
        let sourceCode = sourceFile.getText();
        let hash = crypto.createHash("sha512").update(sourceCode).digest("hex");
        let result = {
            id: "index-declaration-" + hash,
            args: method.parameters
                ? method.parameters.map((prop) => this.visitArgument(prop))
                : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1,
            ...this.initializeDocumentationFields(),
        };
        this.extractAndProcessJSDocComment(method, sourceFile, result);
        const jsdoctags = this.jsdocParserUtil.getJSDocs(method);
        this.processJSDocTags(jsdoctags, result);
        return result;
    }

    private visitConstructorDeclaration(
        method: ts.ConstructorDeclaration,
        sourceFile?: ts.SourceFile,
    ) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        let result: any = {
            name: "constructor",
            description: "",
            ...this.initializeDocumentationFields(),
            args: method.parameters
                ? method.parameters.map((prop) => this.visitArgument(prop))
                : [],
            line: this.getPosition(method, sourceFile).line + 1,
        };
        this.extractAndProcessJSDocComment(method, sourceFile, result);

        const kinds = this.extractModifierKinds(method);
        if (kinds) {
            result.modifierKind = kinds;
        }

        const jsdoctags = this.jsdocParserUtil.getJSDocs(method);
        this.processJSDocTags(jsdoctags, result);

        if (result.jsdoctags && result.jsdoctags.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args, result.jsdoctags);
        } else if (result.args.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args);
        }

        // Thread @param descriptions back into result.args so that consumers
        // reading args directly (e.g. JSON export) see the per-parameter description.
        if (
            result.args.length > 0 &&
            result.jsdoctags &&
            result.jsdoctags.length > 0
        ) {
            const commentByName = new Map<string, any>();
            for (const tag of result.jsdoctags) {
                const tagName = tag.name?.text ?? tag.name;
                if (tagName && tag.comment) {
                    commentByName.set(String(tagName), tag.comment);
                }
            }
            for (const arg of result.args) {
                const comment = commentByName.get(arg.name);
                if (comment != null) {
                    arg.description = comment;
                }
            }
        }

        return result;
    }

    private visitProperty(
        property: ts.PropertyDeclaration | ts.PropertySignature,
        sourceFile,
    ) {
        // PropertySignature (interfaces) don't have initializer, PropertyDeclaration (classes) do
        const initializer = ts.isPropertyDeclaration(property)
            ? property.initializer
            : undefined;

        // Extract property name, handling different node types:
        // - Identifier: regular property names
        // - PrivateIdentifier: ECMAScript private fields like #privateField
        // - ComputedPropertyName: computed names like ['__allAnd']
        let propertyName = "";
        // Check for mock objects first (for testing)
        if ((property.name as any).text) {
            propertyName = (property.name as any).text;
        } else if (ts.isIdentifier(property.name)) {
            propertyName = property.name.text;
        } else if (ts.isPrivateIdentifier(property.name)) {
            propertyName = property.name.text; // includes the # prefix
        } else if (ts.isComputedPropertyName(property.name)) {
            // Handle computed property names like ['__allAnd']
            if (ts.isStringLiteral(property.name.expression)) {
                propertyName = property.name.expression.text;
            } else if (ts.isIdentifier(property.name.expression)) {
                propertyName = property.name.expression.text;
            }
        }

        const result: any = {
            name: propertyName,
            coverageIgnore: isCoverageIgnore(property),
            defaultValue: initializer
                ? this.stringifyDefaultValue(initializer)
                : undefined,
            ...this.initializeDocumentationFields(),
            type: this.visitType(property),
            indexKey: this.visitTypeIndex(property),
            optional: typeof property.questionToken !== "undefined",
            description: "",
            line: this.getPosition(property, sourceFile).line + 1,
        };

        if (initializer && initializer.kind === SyntaxKind.ArrowFunction) {
            result.defaultValue = "() => {...}";
        }

        if (
            typeof result.name === "undefined" &&
            (property.name as any).expression
        ) {
            result.name = (property.name as any).expression.text;
        }

        this.extractAndProcessJSDocComment(property, sourceFile, result);

        if (nodeHasDecorator(property)) {
            const propertyDecorators = getNodeDecorators(property);
            result.decorators = this.formatDecorators(propertyDecorators);
        }

        const kinds = this.extractModifierKinds(property);
        if (kinds) {
            result.modifierKind = kinds;
        }
        // Check for ECMAScript Private Fields
        this.ensurePrivateKeyword(result, property);

        const jsdoctags = this.jsdocParserUtil.getJSDocs(property);
        if (jsdoctags && jsdoctags.length >= 1) {
            const jsdoc = jsdoctags[0] as any;
            if (jsdoc && jsdoc.tags) {
                this.checkForDeprecation(jsdoc.tags, result);
                if ((property as any).jsDoc) {
                    result.jsdoctags = markedtags(jsdoc.tags);
                }
            }
        }

        return result;
    }

    private visitConstructorProperties(constr, sourceFile) {
        if (constr.parameters) {
            let _parameters = [];
            let i = 0;
            let len = constr.parameters.length;
            for (i; i < len; i++) {
                const parameterOfConstructor = constr.parameters[i];
                if (isIgnore(parameterOfConstructor)) {
                    continue;
                }
                if (
                    this.isInternal(parameterOfConstructor) &&
                    Configuration.mainData.disableInternal
                ) {
                    continue;
                }
                if (this.isPublic(parameterOfConstructor)) {
                    _parameters.push(
                        this.visitProperty(constr.parameters[i], sourceFile),
                    );
                }
            }
            /**
             * Merge JSDoc tags description from constructor with parameters
             */
            if (constr.jsDoc) {
                if (constr.jsDoc.length > 0) {
                    let constrTags = constr.jsDoc[0].tags;
                    if (constrTags && constrTags.length > 0) {
                        constrTags.forEach((tag) => {
                            _parameters.forEach((param) => {
                                if (
                                    tag.tagName &&
                                    tag.tagName.escapedText &&
                                    tag.tagName.escapedText === "param"
                                ) {
                                    if (
                                        tag.name &&
                                        tag.name.escapedText &&
                                        tag.name.escapedText === param.name
                                    ) {
                                        param.description = tag.comment;
                                    }
                                }
                            });
                        });
                    }
                }
            }
            return _parameters;
        } else {
            return [];
        }
    }

    private visitMethodDeclaration(
        method: ts.MethodDeclaration | ts.MethodSignature,
        sourceFile: ts.SourceFile,
    ) {
        let result: any = {
            name:
                (method.name as any).text ||
                (ts.isIdentifier(method.name) ? method.name.text : ""),
            coverageIgnore: isCoverageIgnore(method),
            args: method.parameters
                ? method.parameters.map((prop) => this.visitArgument(prop))
                : [],
            optional: typeof method.questionToken !== "undefined",
            returnType: this.visitType(method.type),
            typeParameters: [],
            line: this.getPosition(method, sourceFile).line + 1,
            ...this.initializeDocumentationFields(),
        };

        if (typeof method.type === "undefined") {
            // Try to get inferred type
            if ((method as any).symbol) {
                let symbol: ts.Symbol = (method as any).symbol;
                if (symbol.valueDeclaration) {
                    let symbolType = this.typeChecker.getTypeOfSymbolAtLocation(
                        symbol,
                        symbol.valueDeclaration,
                    );
                    if (symbolType) {
                        try {
                            const signature =
                                this.typeChecker.getSignatureFromDeclaration(
                                    method,
                                );
                            const returnType = signature.getReturnType();
                            result.returnType =
                                this.typeChecker.typeToString(returnType);
                            // tslint:disable-next-line:no-empty
                        } catch (error) {}
                    }
                }
            }
        }

        if (method.typeParameters && method.typeParameters.length > 0) {
            result.typeParameters = method.typeParameters.map((typeParameter) =>
                this.visitType(typeParameter),
            );
        }

        this.extractAndProcessJSDocComment(method, sourceFile, result);

        if (nodeHasDecorator(method)) {
            const methodDecorators = getNodeDecorators(method);
            result.decorators = this.formatDecorators(methodDecorators);
        }

        const kinds = this.extractModifierKinds(method);
        if (kinds) {
            result.modifierKind = kinds;
        }
        // Check for ECMAScript Private Fields
        this.ensurePrivateKeyword(result, method);

        const jsdoctags = this.jsdocParserUtil.getJSDocs(method);
        this.processJSDocTags(jsdoctags, result);

        if (result.jsdoctags && result.jsdoctags.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args, result.jsdoctags);
        } else if (result.args.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args);
        }
        return result;
    }

    private visitOutput(
        property: ts.PropertyDeclaration,
        outDecorator: ts.Decorator,
        sourceFile?: ts.SourceFile,
    ) {
        let inArgs = (outDecorator.expression as any).arguments;
        let _return: any = {
            name:
                inArgs.length > 0
                    ? (inArgs[0] as any).text
                    : (property.name as any).text ||
                      (ts.isIdentifier(property.name)
                          ? property.name.text
                          : ""),
            coverageIgnore: isCoverageIgnore(property),
            defaultValue: property.initializer
                ? this.stringifyDefaultValue(property.initializer)
                : undefined,
            ...this.initializeDocumentationFields(),
        };

        if ((property as any).jsDoc) {
            this.extractAndProcessJSDocComment(property, sourceFile, _return);
            const jsdoctags = this.jsdocParserUtil.getJSDocs(property);
            this.processJSDocTags(jsdoctags, _return);
        }

        this.setFallbackDescription(_return, property);
        _return.line = this.getPosition(property, sourceFile).line + 1;

        if (property.type) {
            _return.type = this.visitType(property);
        } else {
            // handle NewExpression
            if (property.initializer) {
                if (ts.isNewExpression(property.initializer)) {
                    if (property.initializer.expression) {
                        _return.type = (
                            property.initializer.expression as any
                        ).text;
                    }
                }
            }
        }
        return _return;
    }

    private visitArgument(arg: ts.ParameterDeclaration) {
        let _result: any = {
            name:
                (arg.name as any).text ||
                (ts.isIdentifier(arg.name) ? arg.name.text : ""),
            type: this.visitType(arg),
            optional: !!arg.questionToken,
            dotDotDotToken: !!arg.dotDotDotToken,
            ...this.initializeDocumentationFields(),
        };

        if (arg.type && ts.isTypeOperatorNode(arg.type)) {
            const resolvedType = this.tryResolveTypeFromTypeChecker(
                arg.type,
                arg,
            );
            if (resolvedType) {
                _result.type = resolvedType;
            }
        }

        if (arg.type && arg.type.kind && ts.isFunctionTypeNode(arg.type)) {
            _result.function = arg.type.parameters
                ? arg.type.parameters.map((prop) => this.visitArgument(prop))
                : [];
        }
        if (arg.initializer) {
            _result.defaultValue = this.stringifyDefaultValue(arg.initializer);
        }
        const jsdoctags = this.jsdocParserUtil.getJSDocs(arg);
        this.processJSDocTags(jsdoctags, _result, false);
        return _result;
    }

    private visitInputAndHostBinding(property, inDecorator, sourceFile?) {
        const inArgs = inDecorator.expression.arguments;

        let _return: any = {
            coverageIgnore: isCoverageIgnore(property),
        };

        let isInputConfigStringLiteral = false;
        let isInputConfigObjectLiteralExpression = false;
        let hasRequiredField = false;
        let hasAlias = false;

        const getRequiredField = () =>
            inArgs[0].properties.find(
                (property) => property.name.escapedText === "required",
            );
        const getAliasProperty = () =>
            inArgs[0].properties.find(
                (property) => property.name.escapedText === "alias",
            );

        if (inArgs.length > 0) {
            isInputConfigStringLiteral =
                inArgs[0] && ts.isStringLiteral(inArgs[0]);

            isInputConfigObjectLiteralExpression =
                inArgs[0] && ts.isObjectLiteralExpression(inArgs[0]);

            if (isInputConfigObjectLiteralExpression && inArgs[0].properties) {
                hasRequiredField =
                    isInputConfigObjectLiteralExpression &&
                    !!getRequiredField();
                hasAlias = isInputConfigObjectLiteralExpression
                    ? !!getAliasProperty()
                    : false;

                _return.required = !!getRequiredField();
            }

            if (isInputConfigStringLiteral) {
                _return.name = inArgs[0].text;
                _return.actualName = property.name.text;
            } else if (hasAlias) {
                _return.name = getAliasProperty().initializer.text;
                _return.actualName = property.name.text;
            } else {
                _return.name = property.name.text;
            }
        } else {
            _return.name = property.name.text;
        }

        _return.defaultValue = property.initializer
            ? this.stringifyDefaultValue(property.initializer)
            : undefined;
        Object.assign(_return, this.initializeDocumentationFields());

        if (inArgs.length > 0 && inArgs[0].properties && hasRequiredField) {
            _return.optional =
                getRequiredField().initializer.kind !== SyntaxKind.TrueKeyword;
        }

        if (
            !_return.description &&
            property.jsDoc &&
            property.jsDoc.length > 0
        ) {
            const jsdoctags = this.jsdocParserUtil.getJSDocs(property);
            this.processJSDocTags(jsdoctags, _return);
            this.extractAndProcessJSDocComment(property, sourceFile, _return);
        }
        _return.line = this.getPosition(property, sourceFile).line + 1;
        if (property.type) {
            _return.type = this.visitType(property);
            if (ts.isTypeOperatorNode(property.type)) {
                const resolvedType = this.tryResolveTypeFromTypeChecker(
                    property.type,
                    property,
                );
                if (resolvedType) {
                    _return.type = resolvedType;
                }
            }
        } else {
            // handle NewExpression
            if (property.initializer) {
                if (ts.isNewExpression(property.initializer)) {
                    if (property.initializer.expression) {
                        _return.type = property.initializer.expression.text;
                    }
                }
            }
            // Try to get inferred type
            if (property.symbol) {
                const symbol: ts.Symbol = property.symbol;
                if (symbol.valueDeclaration) {
                    const symbolType =
                        this.typeChecker.getTypeOfSymbolAtLocation(
                            symbol,
                            symbol.valueDeclaration,
                        );
                    if (symbolType) {
                        _return.type =
                            this.typeChecker.typeToString(symbolType);
                    }
                }
            }
        }
        if (property.kind === SyntaxKind.SetAccessor) {
            // For setter accessor, find type in first parameter
            if (property.parameters && property.parameters.length === 1) {
                if (property.parameters[0].type) {
                    _return.type = this.visitType(property.parameters[0].type);
                }
            }
        }

        if (nodeHasDecorator(property)) {
            const propertyDecorators = getNodeDecorators(property);
            _return.decorators = this.formatDecorators(
                propertyDecorators,
            ).filter(
                (item) => item.name !== "Input" && item.name !== "HostBinding",
            );
        }
        return _return;
    }

    private visitHostListener(property, hostListenerDecorator, sourceFile?) {
        let inArgs = hostListenerDecorator.expression.arguments;
        let _return: any = {
            coverageIgnore: isCoverageIgnore(property),
        };
        _return.name = inArgs.length > 0 ? inArgs[0].text : property.name.text;
        _return.args = property.parameters
            ? property.parameters.map((prop) => this.visitArgument(prop))
            : [];
        _return.argsDecorator =
            inArgs.length > 1
                ? inArgs[1].elements.map((prop) => {
                      return prop.text;
                  })
                : [];
        Object.assign(_return, this.initializeDocumentationFields());

        if (property.jsDoc) {
            this.extractAndProcessJSDocComment(property, sourceFile, _return);
            const jsdoctags = this.jsdocParserUtil.getJSDocs(property);
            this.processJSDocTags(jsdoctags, _return);
        }

        this.setFallbackDescription(_return, property);
        _return.line = this.getPosition(property, sourceFile).line + 1;
        return _return;
    }
}
