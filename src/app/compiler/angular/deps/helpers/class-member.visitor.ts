import { ts, SyntaxKind } from 'ts-morph';

import { getNamesCompareFn, mergeTagsAndArgs, markedtags } from '../../../../../utils/utils';
import { kindToType } from '../../../../../utils/kind-to-type';
import { isCoverageIgnore, isIgnore } from '../../../../../utils';
import Configuration from '../../../../configuration';
import { getNodeDecorators, nodeHasDecorator } from '../../../../../utils/node.util';
import { markedAcl } from '../../../../../utils/marked.acl';
import type { JsdocParserUtil } from '../../../../../utils/jsdoc-parser.util';
import { DecoratorResolver } from './decorator-resolver';
import { MemberVisibilityPolicy } from './member-visibility-policy';

const crypto = require('crypto');

export interface ClassMemberVisitorContext {
    typeChecker: ts.TypeChecker;
    jsdocParserUtil: JsdocParserUtil;
    decoratorResolver: DecoratorResolver;
    memberVisibility: MemberVisibilityPolicy;
    stringifyDefaultValue: (node: ts.Node) => string;
    initializeDocumentationFields: () => { deprecated: boolean; deprecationMessage: string };
    visitType: (node: any) => string;
    visitTypeIndex: (node: any) => string;
    shouldResolveTypeWithTypeChecker: (typeNode: ts.TypeNode) => boolean;
    tryResolveTypeFromTypeChecker: (node: ts.Node, enclosingDeclaration?: ts.Node) => string | undefined;
    extractAndProcessJSDocComment: (node: any, sourceFile: ts.SourceFile, result: any) => void;
    processJSDocTags: (jsdoctags: any, result: any, includeTagsArray?: boolean) => void;
    checkForDeprecation: (tags: any[], result: { [key in string | number]: any }) => void;
}

export class ClassMemberVisitor {
    constructor(private readonly context: ClassMemberVisitorContext) {}

    public visitMembers(members: any, sourceFile: any): any {
        return this.visitMembersInternal(members, sourceFile);
    }

    private visitType(node: any): string {
        return this.context.visitType(node);
    }

    private visitTypeIndex(node: any): string {
        return this.context.visitTypeIndex(node);
    }

    private shouldResolveTypeWithTypeChecker(typeNode: ts.TypeNode): boolean {
        return this.context.shouldResolveTypeWithTypeChecker(typeNode);
    }

    private tryResolveTypeFromTypeChecker(
        node: ts.Node,
        enclosingDeclaration?: ts.Node
    ): string | undefined {
        return this.context.tryResolveTypeFromTypeChecker(node, enclosingDeclaration);
    }

    private setFallbackDescription(result: any, node: any): void {
        if (!result.description && node.jsDoc && node.jsDoc.length > 0) {
            const lastJsDoc = node.jsDoc[node.jsDoc.length - 1];
            if (typeof lastJsDoc.comment !== 'undefined') {
                const rawDescription = lastJsDoc.comment;
                result.rawdescription = rawDescription;
                result.description = markedAcl(rawDescription);
            }
        }
    }

    private getPosition(node: ts.Node, sourceFile: ts.SourceFile): ts.LineAndCharacter {
        let position: ts.LineAndCharacter;
        if ((node as any).name && (node as any).name.end) {
            position = ts.getLineAndCharacterOfPosition(sourceFile, (node as any).name.end);
        } else {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node.pos);
        }
        return position;
    }

    private addAccessor(accessors: any, nodeAccessor: any, sourceFile: any) {
        let nodeName = '';
        if (nodeAccessor.name) {
            nodeName = nodeAccessor.name.text;
            let jsdoctags = this.context.jsdocParserUtil.getJSDocs(nodeAccessor);

            if (!accessors[nodeName]) {
                accessors[nodeName] = {
                    name: nodeName,
                    setSignature: undefined,
                    getSignature: undefined
                };
            }

            if (nodeAccessor.kind === SyntaxKind.SetAccessor) {
                let setSignature: any = {
                    name: nodeName,
                    type: 'void',
                    ...this.context.initializeDocumentationFields(),
                    args: nodeAccessor.parameters.map((param: any) => this.visitArgument(param)),
                    returnType: nodeAccessor.type ? this.visitType(nodeAccessor.type) : 'void',
                    line: this.getPosition(nodeAccessor, sourceFile).line + 1
                };

                this.context.extractAndProcessJSDocComment(nodeAccessor, sourceFile, setSignature);
                this.context.processJSDocTags(jsdoctags, setSignature);

                if (setSignature.jsdoctags && setSignature.jsdoctags.length > 0) {
                    setSignature.jsdoctags = mergeTagsAndArgs(
                        setSignature.args,
                        setSignature.jsdoctags
                    );
                } else if (setSignature.args && setSignature.args.length > 0) {
                    setSignature.jsdoctags = mergeTagsAndArgs(setSignature.args);
                }

                accessors[nodeName].setSignature = setSignature;
            }
            if (nodeAccessor.kind === SyntaxKind.GetAccessor) {
                let getSignature: any = {
                    name: nodeName,
                    type: nodeAccessor.type ? kindToType(nodeAccessor.type.kind) : '',
                    returnType: nodeAccessor.type ? this.visitType(nodeAccessor.type) : '',
                    line: this.getPosition(nodeAccessor, sourceFile).line + 1
                };

                this.context.extractAndProcessJSDocComment(nodeAccessor, sourceFile, getSignature);
                this.context.processJSDocTags(jsdoctags, getSignature);

                accessors[nodeName].getSignature = getSignature;
            }
        }
    }

    /**
     * VISITERS
     */

    private visitMembersInternal(members: any, sourceFile: any) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        let inputs: any[] = [];
        let outputs: any[] = [];
        let methods: any[] = [];
        let properties: any[] = [];
        let indexSignatures: any[] = [];
        let kind;
        let inputDecorator;
        let hostBindings: any[] = [];
        let hostListeners: any[] = [];
        let constructor;
        let outputDecorator;
        let accessors: any = {};
        let result: any = {};

        for (let i = 0; i < members.length; i++) {
            // Allows typescript guess type when using ts.is*
            let member = members[i];

            inputDecorator = this.context.decoratorResolver.getDecoratorOfType(member, 'Input');
            outputDecorator = this.context.decoratorResolver.getDecoratorOfType(member, 'Output');
            const parsedHostBindings = this.context.decoratorResolver.getDecoratorOfType(
                member,
                'HostBinding'
            );
            const parsedHostListeners = this.context.decoratorResolver.getDecoratorOfType(
                member,
                'HostListener'
            );

            kind = member.kind;

            if (isIgnore(member)) {
                continue;
            }

            if (this.context.memberVisibility.isInternal(member) && Configuration.mainData.disableInternal) {
                continue;
            }

            if (inputDecorator && inputDecorator.length > 0) {
                inputs.push(this.visitInputAndHostBinding(member, inputDecorator[0], sourceFile));
                if (ts.isSetAccessorDeclaration(member)) {
                    this.addAccessor(accessors, members[i], sourceFile);
                }
            } else if (outputDecorator && outputDecorator.length > 0) {
                outputs.push(this.visitOutput(member, outputDecorator[0], sourceFile));
            } else if (parsedHostBindings && parsedHostBindings.length > 0) {
                let k = 0;
                const lenHB = parsedHostBindings.length;
                for (k; k < lenHB; k++) {
                    hostBindings.push(
                        this.visitInputAndHostBinding(member, parsedHostBindings[k], sourceFile)
                    );
                }
            } else if (parsedHostListeners && parsedHostListeners.length > 0) {
                let l = 0;
                const lenHL = parsedHostListeners.length;
                for (l; l < lenHL; l++) {
                    hostListeners.push(
                        this.visitHostListener(member, parsedHostListeners[l], sourceFile)
                    );
                }
            }

            if (!this.context.memberVisibility.isHiddenMember(member)) {
                if (!(this.context.memberVisibility.isPrivate(member) && Configuration.mainData.disablePrivate)) {
                    if (!(this.context.memberVisibility.isInternal(member) && Configuration.mainData.disableInternal)) {
                        if (
                            !(this.context.memberVisibility.isProtected(member) && Configuration.mainData.disableProtected)
                        ) {
                            if (ts.isMethodDeclaration(member) || ts.isMethodSignature(member)) {
                                methods.push(this.visitMethodDeclaration(member, sourceFile));
                            } else if (
                                ts.isPropertyDeclaration(member) ||
                                ts.isPropertySignature(member)
                            ) {
                                if (!inputDecorator && !outputDecorator) {
                                    properties.push(this.visitProperty(member, sourceFile));
                                }
                            } else if (ts.isCallSignatureDeclaration(member)) {
                                properties.push(this.visitCallDeclaration(member, sourceFile));
                            } else if (
                                ts.isGetAccessorDeclaration(member) ||
                                ts.isSetAccessorDeclaration(member)
                            ) {
                                this.addAccessor(accessors, members[i], sourceFile);
                            } else if (ts.isIndexSignatureDeclaration(member)) {
                                indexSignatures.push(
                                    this.visitIndexDeclaration(member, sourceFile)
                                );
                            } else if (ts.isConstructorDeclaration(member)) {
                                let _constructorProperties = this.visitConstructorProperties(
                                    member,
                                    sourceFile
                                );
                                let j = 0;
                                let len = _constructorProperties.length;
                                for (j; j < len; j++) {
                                    properties.push(_constructorProperties[j]);
                                }
                                constructor = this.visitConstructorDeclaration(member, sourceFile);
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
            constructor
        };

        if (Object.keys(accessors).length) {
            result['accessors'] = accessors;
        }

        return result;
    }

    private extractTypeLiteralProperties(typeNode: ts.TypeNode, sourceFile: ts.SourceFile): any[] {
        if (!ts.isTypeLiteralNode(typeNode) || !typeNode.members) {
            return [];
        }

        const subProperties: any[] = [];
        for (const member of typeNode.members) {
            if (!ts.isPropertySignature(member) || !member.name || !member.type) {
                continue;
            }

            const memberName = (member.name as any).text || (member.name as any).escapedText;
            if (!memberName) {
                continue;
            }

            const subProperty: any = {
                name: memberName,
                type: this.visitType(member.type),
                optional: typeof member.questionToken !== 'undefined',
                description: ''
            };

            this.context.extractAndProcessJSDocComment(member, sourceFile, subProperty);

            const nestedSubProperties = this.extractTypeLiteralProperties(member.type, sourceFile);
            if (nestedSubProperties.length > 0) {
                subProperty.subProperties = nestedSubProperties;
            }

            subProperties.push(subProperty);
        }

        return subProperties;
    }

    private visitCallDeclaration(method: ts.CallSignatureDeclaration, sourceFile: ts.SourceFile) {
        let sourceCode = sourceFile.getText();
        let hash = crypto.createHash('sha512').update(sourceCode).digest('hex');
        let result: any = {
            id: 'call-declaration-' + hash,
            args: method.parameters ? method.parameters.map(prop => this.visitArgument(prop)) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1,
            ...this.context.initializeDocumentationFields()
        };
        this.context.extractAndProcessJSDocComment(method, sourceFile, result);
        const jsdoctags = this.context.jsdocParserUtil.getJSDocs(method);
        this.context.processJSDocTags(jsdoctags, result);
        return result;
    }

    private visitIndexDeclaration(method: ts.IndexSignatureDeclaration, sourceFile: ts.SourceFile) {
        let sourceCode = sourceFile.getText();
        let hash = crypto.createHash('sha512').update(sourceCode).digest('hex');
        let result = {
            id: 'index-declaration-' + hash,
            args: method.parameters ? method.parameters.map(prop => this.visitArgument(prop)) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1,
            ...this.context.initializeDocumentationFields()
        };
        this.context.extractAndProcessJSDocComment(method, sourceFile, result);
        const jsdoctags = this.context.jsdocParserUtil.getJSDocs(method);
        this.context.processJSDocTags(jsdoctags, result);
        return result;
    }

    private visitConstructorDeclaration(
        method: ts.ConstructorDeclaration,
        sourceFile: ts.SourceFile
    ) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        let result: any = {
            name: 'constructor',
            description: '',
            ...this.context.initializeDocumentationFields(),
            args: method.parameters ? method.parameters.map(prop => this.visitArgument(prop)) : [],
            line: this.getPosition(method, sourceFile).line + 1
        };
        this.context.extractAndProcessJSDocComment(method, sourceFile, result);

        const kinds = this.context.memberVisibility.extractModifierKinds(method);
        if (kinds) {
            result.modifierKind = kinds;
        }

        const jsdoctags = this.context.jsdocParserUtil.getJSDocs(method);
        this.context.processJSDocTags(jsdoctags, result);

        if (result.jsdoctags && result.jsdoctags.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args, result.jsdoctags);
        } else if (result.args.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args);
        }

        // Thread @param descriptions back into result.args so that consumers
        // reading args directly (e.g. JSON export) see the per-parameter description.
        if (result.args.length > 0 && result.jsdoctags && result.jsdoctags.length > 0) {
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
        sourceFile: ts.SourceFile
    ) {
        // PropertySignature (interfaces) don't have initializer, PropertyDeclaration (classes) do
        const initializer = ts.isPropertyDeclaration(property) ? property.initializer : undefined;

        // Extract property name, handling different node types:
        // - Identifier: regular property names
        // - PrivateIdentifier: ECMAScript private fields like #privateField
        // - ComputedPropertyName: computed names like ['__allAnd']
        let propertyName = '';
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
            defaultValue: initializer ? this.context.stringifyDefaultValue(initializer) : undefined,
            ...this.context.initializeDocumentationFields(),
            type: this.visitType(property),
            indexKey: this.visitTypeIndex(property),
            optional: typeof property.questionToken !== 'undefined',
            description: '',
            line: this.getPosition(property, sourceFile).line + 1
        };

        if (property.type && this.shouldResolveTypeWithTypeChecker(property.type)) {
            const resolvedType = this.tryResolveTypeFromTypeChecker(property.type, property);
            if (resolvedType) {
                result.type = resolvedType;
            }
        }

        if (property.type && ts.isTypeLiteralNode(property.type)) {
            result.subProperties = this.extractTypeLiteralProperties(property.type, sourceFile);
        }

        if (initializer && initializer.kind === SyntaxKind.ArrowFunction) {
            result.defaultValue = '() => {...}';
        }

        if (typeof result.name === 'undefined' && (property.name as any).expression) {
            result.name = (property.name as any).expression.text;
        }

        this.context.extractAndProcessJSDocComment(property, sourceFile, result);

        if (nodeHasDecorator(property)) {
            const propertyDecorators = getNodeDecorators(property);
            result.decorators = this.context.decoratorResolver.formatDecorators(propertyDecorators);
        }

        const kinds = this.context.memberVisibility.extractModifierKinds(property);
        if (kinds) {
            result.modifierKind = kinds;
        }
        // Check for ECMAScript Private Fields
        this.context.memberVisibility.ensurePrivateKeyword(result, property);

        const jsdoctags = this.context.jsdocParserUtil.getJSDocs(property);
        if (jsdoctags && jsdoctags.length >= 1) {
            const jsdoc = jsdoctags[0] as any;
            if (jsdoc && jsdoc.tags) {
                this.context.checkForDeprecation(jsdoc.tags, result);
                if ((property as any).jsDoc) {
                    result.jsdoctags = markedtags(jsdoc.tags);
                }
            }
        }

        return result;
    }

    private visitConstructorProperties(constr: any, sourceFile: ts.SourceFile) {
        if (constr.parameters) {
            let _parameters: any[] = [];
            let i = 0;
            let len = constr.parameters.length;
            for (i; i < len; i++) {
                const parameterOfConstructor = constr.parameters[i];
                if (isIgnore(parameterOfConstructor)) {
                    continue;
                }
                if (
                    this.context.memberVisibility.isInternal(parameterOfConstructor) &&
                    Configuration.mainData.disableInternal
                ) {
                    continue;
                }
                if (this.context.memberVisibility.isPublic(parameterOfConstructor)) {
                    _parameters.push(this.visitProperty(constr.parameters[i], sourceFile));
                }
            }
            /**
             * Merge JSDoc tags description from constructor with parameters
             */
            if (constr.jsDoc) {
                if (constr.jsDoc.length > 0) {
                    let constrTags = constr.jsDoc[0].tags;
                    if (constrTags && constrTags.length > 0) {
                        constrTags.forEach((tag: any) => {
                            _parameters.forEach((param: any) => {
                                if (
                                    tag.tagName &&
                                    tag.tagName.escapedText &&
                                    tag.tagName.escapedText === 'param'
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
        sourceFile: ts.SourceFile
    ) {
        let result: any = {
            name:
                (method.name as any).text || (ts.isIdentifier(method.name) ? method.name.text : ''),
            coverageIgnore: isCoverageIgnore(method),
            args: method.parameters ? method.parameters.map(prop => this.visitArgument(prop)) : [],
            optional: typeof method.questionToken !== 'undefined',
            returnType: this.visitType(method.type),
            typeParameters: [],
            line: this.getPosition(method, sourceFile).line + 1,
            ...this.context.initializeDocumentationFields()
        };

        if (typeof method.type === 'undefined') {
            // Try to get inferred type
            if ((method as any).symbol) {
                let symbol: ts.Symbol = (method as any).symbol;
                if (symbol.valueDeclaration) {
                    let symbolType = this.context.typeChecker.getTypeOfSymbolAtLocation(
                        symbol,
                        symbol.valueDeclaration
                    );
                    if (symbolType) {
                        try {
                            const signature = this.context.typeChecker.getSignatureFromDeclaration(method);
                            const returnType = signature?.getReturnType();
                            if (returnType) {
                                result.returnType = this.context.typeChecker.typeToString(returnType);
                            }
                            // tslint:disable-next-line:no-empty
                        } catch (error) {}
                    }
                }
            }
        }

        if (method.typeParameters && method.typeParameters.length > 0) {
            result.typeParameters = method.typeParameters.map(typeParameter =>
                this.visitType(typeParameter)
            );
        }

        this.context.extractAndProcessJSDocComment(method, sourceFile, result);

        if (nodeHasDecorator(method)) {
            const methodDecorators = getNodeDecorators(method);
            result.decorators = this.context.decoratorResolver.formatDecorators(methodDecorators);
        }

        const kinds = this.context.memberVisibility.extractModifierKinds(method);
        if (kinds) {
            result.modifierKind = kinds;
        }
        // Check for ECMAScript Private Fields
        this.context.memberVisibility.ensurePrivateKeyword(result, method);

        const jsdoctags = this.context.jsdocParserUtil.getJSDocs(method);
        this.context.processJSDocTags(jsdoctags, result);

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
        sourceFile: ts.SourceFile
    ) {
        let inArgs = (outDecorator.expression as any).arguments;
        let _return: any = {
            name:
                inArgs.length > 0
                    ? (inArgs[0] as any).text
                    : (property.name as any).text ||
                      (ts.isIdentifier(property.name) ? property.name.text : ''),
            coverageIgnore: isCoverageIgnore(property),
            defaultValue: property.initializer
                ? this.context.stringifyDefaultValue(property.initializer)
                : undefined,
            ...this.context.initializeDocumentationFields()
        };

        if ((property as any).jsDoc) {
            this.context.extractAndProcessJSDocComment(property, sourceFile, _return);
            const jsdoctags = this.context.jsdocParserUtil.getJSDocs(property);
            this.context.processJSDocTags(jsdoctags, _return);
        }

        this.setFallbackDescription(_return, property);
        _return.line = this.getPosition(property, sourceFile).line + 1;

        if (property.type) {
            _return.type = this.visitType(property);
            if (this.shouldResolveTypeWithTypeChecker(property.type)) {
                const resolvedType = this.tryResolveTypeFromTypeChecker(property.type, property);
                if (resolvedType) {
                    _return.type = resolvedType;
                }
            }
        } else {
            // handle NewExpression
            if (property.initializer) {
                if (ts.isNewExpression(property.initializer)) {
                    if (property.initializer.expression) {
                        _return.type = (property.initializer.expression as any).text;
                    }
                }
            }
        }
        return _return;
    }

    private visitArgument(arg: ts.ParameterDeclaration) {
        let _result: any = {
            name: (arg.name as any).text || (ts.isIdentifier(arg.name) ? arg.name.text : ''),
            type: this.visitType(arg),
            optional: !!arg.questionToken,
            dotDotDotToken: !!arg.dotDotDotToken,
            ...this.context.initializeDocumentationFields()
        };

        if (arg.type && this.shouldResolveTypeWithTypeChecker(arg.type)) {
            const resolvedType = this.tryResolveTypeFromTypeChecker(arg.type, arg);
            if (resolvedType) {
                _result.type = resolvedType;
            }
        }

        if (arg.type && arg.type.kind && ts.isFunctionTypeNode(arg.type)) {
            _result.function = arg.type.parameters
                ? arg.type.parameters.map(prop => this.visitArgument(prop))
                : [];
        }
        if (arg.initializer) {
            _result.defaultValue = this.context.stringifyDefaultValue(arg.initializer);
        }
        const jsdoctags = this.context.jsdocParserUtil.getJSDocs(arg);
        this.context.processJSDocTags(jsdoctags, _result, false);
        return _result;
    }

    private visitInputAndHostBinding(property: any, inDecorator: any, sourceFile: ts.SourceFile) {
        const inArgs = inDecorator.expression.arguments;

        let _return: any = {
            coverageIgnore: isCoverageIgnore(property)
        };

        let isInputConfigStringLiteral = false;
        let isInputConfigObjectLiteralExpression = false;
        let hasRequiredField = false;
        let hasAlias = false;

        const getRequiredField = () =>
            inArgs[0].properties.find((property: any) => property.name.escapedText === 'required');
        const getAliasProperty = () =>
            inArgs[0].properties.find((property: any) => property.name.escapedText === 'alias');

        if (inArgs.length > 0) {
            isInputConfigStringLiteral = inArgs[0] && ts.isStringLiteral(inArgs[0]);

            isInputConfigObjectLiteralExpression =
                inArgs[0] && ts.isObjectLiteralExpression(inArgs[0]);

            if (isInputConfigObjectLiteralExpression && inArgs[0].properties) {
                hasRequiredField = isInputConfigObjectLiteralExpression && !!getRequiredField();
                hasAlias = isInputConfigObjectLiteralExpression ? !!getAliasProperty() : false;

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
            ? this.context.stringifyDefaultValue(property.initializer)
            : undefined;
        Object.assign(_return, this.context.initializeDocumentationFields());

        if (inArgs.length > 0 && inArgs[0].properties && hasRequiredField) {
            _return.optional = getRequiredField().initializer.kind !== SyntaxKind.TrueKeyword;
        }

        if (!_return.description) {
            const jsdoctags = this.context.jsdocParserUtil.getJSDocs(property);
            this.context.processJSDocTags(jsdoctags, _return);
            this.context.extractAndProcessJSDocComment(property, sourceFile, _return);
        }
        _return.line = this.getPosition(property, sourceFile).line + 1;
        if (property.type) {
            _return.type = this.visitType(property);
            if (this.shouldResolveTypeWithTypeChecker(property.type)) {
                const resolvedType = this.tryResolveTypeFromTypeChecker(property.type, property);
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
                    const symbolType = this.context.typeChecker.getTypeOfSymbolAtLocation(
                        symbol,
                        symbol.valueDeclaration
                    );
                    if (symbolType) {
                        _return.type = this.context.typeChecker.typeToString(symbolType);
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
            _return.decorators = this.context.decoratorResolver.formatDecorators(propertyDecorators).filter(
                (item: any) => item.name !== 'Input' && item.name !== 'HostBinding'
            );
        }
        return _return;
    }

    private visitHostListener(
        property: any,
        hostListenerDecorator: any,
        sourceFile: ts.SourceFile
    ) {
        let inArgs = hostListenerDecorator.expression.arguments;
        let _return: any = {
            coverageIgnore: isCoverageIgnore(property)
        };
        _return.name = inArgs.length > 0 ? inArgs[0].text : property.name.text;
        _return.args = property.parameters
            ? property.parameters.map((prop: any) => this.visitArgument(prop))
            : [];
        _return.argsDecorator =
            inArgs.length > 1
                ? inArgs[1].elements.map((prop: any) => {
                      return prop.text;
                  })
                : [];
        Object.assign(_return, this.context.initializeDocumentationFields());

        if (property.jsDoc) {
            this.context.extractAndProcessJSDocComment(property, sourceFile, _return);
            const jsdoctags = this.context.jsdocParserUtil.getJSDocs(property);
            this.context.processJSDocTags(jsdoctags, _return);
        }

        this.setFallbackDescription(_return, property);
        _return.line = this.getPosition(property, sourceFile).line + 1;
        return _return;
    }
}
