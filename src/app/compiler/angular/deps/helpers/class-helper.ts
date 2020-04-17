import * as _ from 'lodash';
import * as util from 'util';
import * as path from 'path';

import { ts, SyntaxKind } from 'ts-simple-ast';

import { getNamesCompareFn, mergeTagsAndArgs, markedtags } from '../../../../../utils/utils';
import { kindToType } from '../../../../../utils/kind-to-type';
import { JsdocParserUtil } from '../../../../../utils/jsdoc-parser.util';
import { isIgnore } from '../../../../../utils';
import AngularVersionUtil from '../../../../..//utils/angular-version.util';
import BasicTypeUtil from '../../../../../utils/basic-type.util';
import { StringifyObjectLiteralExpression } from '../../../../../utils/object-literal-expression.util';

import DependenciesEngine from '../../../../engines/dependencies.engine';
import Configuration from '../../../../configuration';

const crypto = require('crypto');
const marked = require('marked');

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
        if (node.getText()) {
            return node.getText();
        } else if (node.kind === SyntaxKind.FalseKeyword) {
            return 'false';
        } else if (node.kind === SyntaxKind.TrueKeyword) {
            return 'true';
        }
    }

    private getDecoratorOfType(node, decoratorType) {
        let decorators = node.decorators || [];

        for (let i = 0; i < decorators.length; i++) {
            if (decorators[i].expression.expression) {
                if (decorators[i].expression.expression.text === decoratorType) {
                    return decorators[i];
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
                    let info: any = { name: decorator.expression.expression.text };
                    if (decorator.expression.arguments) {
                        info.stringifiedArguments = this.stringifyArguments(
                            decorator.expression.arguments
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

        let argums = arg.function.map(argu => {
            let _result = DependenciesEngine.find(argu.type);
            if (_result) {
                if (_result.source === 'internal') {
                    let path = _result.data.type;
                    if (_result.data.type === 'class') {
                        path = 'classe';
                    }
                    return `${argu.name}${this.getOptionalString(arg)}: <a href="../${path}s/${
                        _result.data.name
                    }.html">${argu.type}</a>`;
                } else {
                    let path = AngularVersionUtil.getApiLink(
                        _result.data,
                        Configuration.mainData.angularVersion
                    );
                    return `${argu.name}${this.getOptionalString(
                        arg
                    )}: <a href="${path}" target="_blank">${argu.type}</a>`;
                }
            } else if (BasicTypeUtil.isKnownType(argu.type)) {
                let path = BasicTypeUtil.getTypeUrl(argu.type);
                return `${argu.name}${this.getOptionalString(
                    arg
                )}: <a href="${path}" target="_blank">${argu.type}</a>`;
            } else {
                if (argu.name && argu.type) {
                    return `${argu.name}${this.getOptionalString(arg)}: ${argu.type}`;
                } else {
                    if (argu.name) {
                        return `${argu.name.text}`;
                    } else {
                        return '';
                    }
                }
            }
        });
        return `${arg.name}${this.getOptionalString(arg)}: (${argums}) => void`;
    }

    private getOptionalString(arg): string {
        return arg.optional ? '?' : '';
    }

    private stringifyArguments(args) {
        let stringifyArgs = [];

        stringifyArgs = args
            .map(arg => {
                let _result = DependenciesEngine.find(arg.type);
                if (_result) {
                    if (_result.source === 'internal') {
                        let path = _result.data.type;
                        if (_result.data.type === 'class') {
                            path = 'classe';
                        }
                        return `${arg.name}${this.getOptionalString(arg)}: <a href="../${path}s/${
                            _result.data.name
                        }.html">${arg.type}</a>`;
                    } else {
                        let path = AngularVersionUtil.getApiLink(
                            _result.data,
                            Configuration.mainData.angularVersion
                        );
                        return `${arg.name}${this.getOptionalString(
                            arg
                        )}: <a href="${path}" target="_blank">${arg.type}</a>`;
                    }
                } else if (arg.dotDotDotToken) {
                    return `...${arg.name}: ${arg.type}`;
                } else if (arg.function) {
                    return this.handleFunction(arg);
                } else if (arg.expression && arg.name) {
                    return arg.expression.text + '.' + arg.name.text;
                } else if (arg.expression && arg.kind === SyntaxKind.NewExpression) {
                    return 'new ' + arg.expression.text + '()';
                } else if (arg.kind && arg.kind === SyntaxKind.StringLiteral) {
                    return `'` + arg.text + `'`;
                } else if (arg.kind && arg.kind === SyntaxKind.ObjectLiteralExpression) {
                    return StringifyObjectLiteralExpression(arg);
                } else if (BasicTypeUtil.isKnownType(arg.type)) {
                    let path = BasicTypeUtil.getTypeUrl(arg.type);
                    return `${arg.name}${this.getOptionalString(
                        arg
                    )}: <a href="${path}" target="_blank">${arg.type}</a>`;
                } else {
                    if (arg.type) {
                        let finalStringifiedArgument = '';
                        let separator = ':';
                        if (arg.name) {
                            finalStringifiedArgument += arg.name;
                        }
                        if (
                            arg.kind === SyntaxKind.AsExpression &&
                            arg.expression &&
                            arg.expression.text
                        ) {
                            finalStringifiedArgument += arg.expression.text;
                            separator = ' as';
                        }
                        if (arg.optional) {
                            finalStringifiedArgument += this.getOptionalString(arg);
                        }
                        if (arg.type) {
                            finalStringifiedArgument += separator + ' ' + this.visitType(arg.type);
                        }
                        return finalStringifiedArgument;
                    } else if (arg.text) {
                        return `${arg.text}`;
                    } else {
                        return `${arg.name}${this.getOptionalString(arg)}`;
                    }
                }
            })
            .join(', ');

        return stringifyArgs;
    }

    private getPosition(node: ts.Node, sourceFile: ts.SourceFile): ts.LineAndCharacter {
        let position: ts.LineAndCharacter;
        if (node.name && node.name.end) {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node.name.end);
        } else {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node.pos);
        }
        return position;
    }

    private addAccessor(accessors, nodeAccessor, sourceFile) {
        let nodeName = '';
        if (nodeAccessor.name) {
            nodeName = nodeAccessor.name.text;
            let jsdoctags = this.jsdocParserUtil.getJSDocs(nodeAccessor);

            if (!accessors[nodeName]) {
                accessors[nodeName] = {
                    name: nodeName,
                    setSignature: undefined,
                    getSignature: undefined
                };
            }

            if (nodeAccessor.kind === SyntaxKind.SetAccessor) {
                let setSignature = {
                    name: nodeName,
                    type: 'void',
                    args: nodeAccessor.parameters.map(param => {
                        return {
                            name: param.name.text,
                            type: param.type ? kindToType(param.type.kind) : ''
                        };
                    }),
                    returnType: nodeAccessor.type ? this.visitType(nodeAccessor.type) : 'void',
                    line: this.getPosition(nodeAccessor, sourceFile).line + 1
                };

                if (nodeAccessor.jsDoc && nodeAccessor.jsDoc.length >= 1) {
                    let comment = nodeAccessor.jsDoc[0].comment;
                    if (typeof comment !== 'undefined') {
                        setSignature.description = marked(comment);
                    }
                }

                if (jsdoctags && jsdoctags.length >= 1) {
                    if (jsdoctags[0].tags) {
                        setSignature.jsdoctags = markedtags(jsdoctags[0].tags);
                    }
                }
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
                let getSignature = {
                    name: nodeName,
                    type: nodeAccessor.type ? kindToType(nodeAccessor.type.kind) : '',
                    returnType: nodeAccessor.type ? this.visitType(nodeAccessor.type) : '',
                    line: this.getPosition(nodeAccessor, sourceFile).line + 1
                };

                if (nodeAccessor.jsDoc && nodeAccessor.jsDoc.length >= 1) {
                    let comment = nodeAccessor.jsDoc[0].comment;
                    if (typeof comment !== 'undefined') {
                        getSignature.description = marked(comment);
                    }
                }

                if (jsdoctags && jsdoctags.length >= 1) {
                    if (jsdoctags[0].tags) {
                        getSignature.jsdoctags = markedtags(jsdoctags[0].tags);
                    }
                }

                accessors[nodeName].getSignature = getSignature;
            }
        }
    }

    private isDirectiveDecorator(decorator: ts.Decorator): boolean {
        if (decorator.expression.expression) {
            let decoratorIdentifierText = decorator.expression.expression.text;
            return (
                decoratorIdentifierText === 'Directive' || decoratorIdentifierText === 'Component'
            );
        } else {
            return false;
        }
    }

    private isServiceDecorator(decorator) {
        return decorator.expression.expression
            ? decorator.expression.expression.text === 'Injectable'
            : false;
    }

    private isPrivate(member): boolean {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        if (member.modifiers) {
            const isPrivate: boolean = member.modifiers.some(
                modifier => modifier.kind === SyntaxKind.PrivateKeyword
            );
            if (isPrivate) {
                return true;
            }
        }
        return this.isHiddenMember(member);
    }

    private isProtected(member): boolean {
        if (member.modifiers) {
            const isProtected: boolean = member.modifiers.some(
                modifier => modifier.kind === SyntaxKind.ProtectedKeyword
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
        const internalTags: string[] = ['internal'];
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
                modifier => modifier.kind === SyntaxKind.PublicKeyword
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
        const internalTags: string[] = ['hidden'];
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
        return decorator.expression.expression
            ? decorator.expression.expression.text === 'Pipe'
            : false;
    }

    private isModuleDecorator(decorator) {
        return decorator.expression.expression
            ? decorator.expression.expression.text === 'NgModule'
            : false;
    }

    /**
     * VISITERS
     */

    public visitClassDeclaration(
        fileName: string,
        classDeclaration: ts.ClassDeclaration | ts.InterfaceDeclaration,
        sourceFile?: ts.SourceFile
    ): any {
        let symbol = this.typeChecker.getSymbolAtLocation(classDeclaration.name);
        let rawdescription = '';
        let description = '';
        if (symbol) {
            rawdescription = this.jsdocParserUtil.getMainCommentOfNode(classDeclaration);
            description = marked(this.jsdocParserUtil.getMainCommentOfNode(classDeclaration));
            if (symbol.valueDeclaration && isIgnore(symbol.valueDeclaration)) {
                return [{ ignore: true }];
            }
            if (symbol.declarations && symbol.declarations.length > 0) {
                if (isIgnore(symbol.declarations[0])) {
                    return [{ ignore: true }];
                }
            }
        }
        let className = classDeclaration.name.text;
        let members;
        let implementsElements = [];
        let extendsElement;
        let jsdoctags = [];

        if (typeof ts.getClassImplementsHeritageClauseElements !== 'undefined') {
            let implementedTypes = ts.getClassImplementsHeritageClauseElements(classDeclaration);
            if (implementedTypes) {
                let i = 0;
                let len = implementedTypes.length;
                for (i; i < len; i++) {
                    if (implementedTypes[i].expression) {
                        implementsElements.push(implementedTypes[i].expression.text);
                    }
                }
            }
        }

        if (typeof ts.getClassExtendsHeritageClauseElement !== 'undefined') {
            let extendsTypes = ts.getClassExtendsHeritageClauseElement(classDeclaration);
            if (extendsTypes) {
                if (extendsTypes.expression) {
                    extendsElement = extendsTypes.expression.text;
                }
            }
        }

        if (symbol) {
            if (symbol.valueDeclaration) {
                jsdoctags = this.jsdocParserUtil.getJSDocs(symbol.valueDeclaration);
            }
        }

        members = this.visitMembers(classDeclaration.members, sourceFile);

        if (classDeclaration.decorators) {
            for (let i = 0; i < classDeclaration.decorators.length; i++) {
                if (this.isDirectiveDecorator(classDeclaration.decorators[i])) {
                    return {
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
                        extends: extendsElement,
                        implements: implementsElements,
                        accessors: members.accessors
                    };
                } else if (this.isServiceDecorator(classDeclaration.decorators[i])) {
                    return [
                        {
                            fileName,
                            className,
                            description,
                            rawdescription: rawdescription,
                            methods: members.methods,
                            indexSignatures: members.indexSignatures,
                            properties: members.properties,
                            kind: members.kind,
                            constructor: members.constructor,
                            jsdoctags: jsdoctags,
                            extends: extendsElement,
                            implements: implementsElements,
                            accessors: members.accessors
                        }
                    ];
                } else if (this.isPipeDecorator(classDeclaration.decorators[i])) {
                    return [
                        {
                            fileName,
                            className,
                            description,
                            rawdescription: rawdescription,
                            jsdoctags: jsdoctags,
                            properties: members.properties,
                            methods: members.methods
                        }
                    ];
                } else if (this.isModuleDecorator(classDeclaration.decorators[i])) {
                    return [
                        {
                            fileName,
                            className,
                            description,
                            rawdescription: rawdescription,
                            jsdoctags: jsdoctags,
                            methods: members.methods
                        }
                    ];
                } else {
                    return [
                        {
                            description,
                            rawdescription: rawdescription,
                            methods: members.methods,
                            indexSignatures: members.indexSignatures,
                            properties: members.properties,
                            kind: members.kind,
                            constructor: members.constructor,
                            jsdoctags: jsdoctags,
                            extends: extendsElement,
                            implements: implementsElements,
                            accessors: members.accessors
                        }
                    ];
                }
            }
        } else if (description) {
            return [
                {
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
                    extends: extendsElement,
                    implements: implementsElements,
                    accessors: members.accessors
                }
            ];
        } else {
            return [
                {
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
                    extends: extendsElement,
                    implements: implementsElements,
                    accessors: members.accessors
                }
            ];
        }

        return [];
    }

    private visitMembers(members, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        let inputs = [];
        let outputs = [];
        let hostBindings = [];
        let hostListeners = [];
        let methods = [];
        let properties = [];
        let indexSignatures = [];
        let kind;
        let inputDecorator;
        let hostBinding;
        let hostListener;
        let constructor;
        let outDecorator;
        let accessors = {};
        let result = {};

        for (let i = 0; i < members.length; i++) {
            // Allows typescript guess type when using ts.is*
            let member = members[i];

            inputDecorator = this.getDecoratorOfType(member, 'Input');
            outDecorator = this.getDecoratorOfType(member, 'Output');
            hostBinding = this.getDecoratorOfType(member, 'HostBinding');
            hostListener = this.getDecoratorOfType(member, 'HostListener');

            kind = member.kind;

            if (isIgnore(member)) {
                continue;
            }

            if (inputDecorator) {
                inputs.push(this.visitInputAndHostBinding(member, inputDecorator, sourceFile));
                if (ts.isSetAccessorDeclaration(member)) {
                    this.addAccessor(accessors, members[i], sourceFile);
                }
            } else if (outDecorator) {
                outputs.push(this.visitOutput(member, outDecorator, sourceFile));
            } else if (hostBinding) {
                hostBindings.push(this.visitInputAndHostBinding(member, hostBinding, sourceFile));
            } else if (hostListener) {
                hostListeners.push(this.visitHostListener(member, hostListener, sourceFile));
            } else if (!this.isHiddenMember(member)) {
                if (!(this.isPrivate(member) && Configuration.mainData.disablePrivate)) {
                    if (!(this.isInternal(member) && Configuration.mainData.disableInternal)) {
                        if (
                            !(this.isProtected(member) && Configuration.mainData.disableProtected)
                        ) {
                            if (ts.isMethodDeclaration(member) || ts.isMethodSignature(member)) {
                                methods.push(this.visitMethodDeclaration(member, sourceFile));
                            } else if (
                                ts.isPropertyDeclaration(member) ||
                                ts.isPropertySignature(member)
                            ) {
                                properties.push(this.visitProperty(member, sourceFile));
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

    private visitTypeName(typeName: ts.Identifier) {
        if (typeName.text) {
            return typeName.text;
        }
        return `${this.visitTypeName(typeName.left)}.${this.visitTypeName(typeName.right)}`;
    }

    public visitType(node): string {
        let _return = 'void';

        if (!node) {
            return _return;
        }

        if (node.typeName) {
            _return = this.visitTypeName(node.typeName);
        } else if (node.type) {
            if (node.type.kind) {
                _return = kindToType(node.type.kind);
            }
            if (node.type.typeName) {
                _return = this.visitTypeName(node.type.typeName);
            }
            if (node.type.typeArguments) {
                _return += '<';
                const typeArguments = [];
                for (const argument of node.type.typeArguments) {
                    typeArguments.push(this.visitType(argument));
                }
                _return += typeArguments.join(' | ');
                _return += '>';
            }
            if (node.type.elementType) {
                const _firstPart = this.visitType(node.type.elementType);
                _return = _firstPart + kindToType(node.type.kind);
                if (node.type.elementType.kind === SyntaxKind.ParenthesizedType) {
                    _return = '(' + _firstPart + ')' + kindToType(node.type.kind);
                }
            }
            if (node.type.types && ts.isUnionTypeNode(node.type)) {
                _return = '';
                let i = 0;
                let len = node.type.types.length;
                for (i; i < len; i++) {
                    let type = node.type.types[i];

                    if (type.elementType) {
                        const _firstPart = this.visitType(type.elementType);
                        if (type.elementType.kind === SyntaxKind.ParenthesizedType) {
                            _return += '(' + _firstPart + ')' + kindToType(type.kind);
                        } else {
                            _return += _firstPart + kindToType(type.kind);
                        }
                    } else {
                        _return += kindToType(type.kind);
                        if (ts.isLiteralTypeNode(type) && type.literal) {
                            _return += '"' + type.literal.text + '"';
                        }
                        if (type.typeName) {
                            _return += this.visitTypeName(type.typeName);
                        }
                        if (type.typeArguments) {
                            _return += '<';
                            const typeArguments = [];
                            for (const argument of type.typeArguments) {
                                typeArguments.push(this.visitType(argument));
                            }
                            _return += typeArguments.join(' | ');
                            _return += '>';
                        }
                    }
                    if (i < len - 1) {
                        _return += ' | ';
                    }
                }
            }
            if (node.type.elementTypes) {
                let elementTypes = node.type.elementTypes;
                let i = 0;
                let len = elementTypes.length;
                if (len > 0) {
                    _return = '[';
                    for (i; i < len; i++) {
                        let type = elementTypes[i];
                        _return += kindToType(type.kind);
                        if (ts.isLiteralTypeNode(type) && type.literal) {
                            _return += '"' + type.literal.text + '"';
                        }
                        if (type.typeName) {
                            _return += this.visitTypeName(type.typeName);
                        }
                        if (i < len - 1) {
                            _return += ', ';
                        }
                    }
                    _return += ']';
                }
            }
        } else if (node.elementType) {
            _return = kindToType(node.elementType.kind) + kindToType(node.kind);
            if (node.elementType.typeName) {
                _return = this.visitTypeName(node.elementType.typeName) + kindToType(node.kind);
            }
        } else if (node.types && ts.isUnionTypeNode(node)) {
            _return = '';
            let i = 0;
            let len = node.types.length;
            for (i; i < len; i++) {
                let type = node.types[i];
                _return += kindToType(type.kind);
                if (ts.isLiteralTypeNode(type) && type.literal) {
                    _return += '"' + type.literal.text + '"';
                }
                if (type.typeName) {
                    _return += this.visitTypeName(type.typeName);
                }
                if (i < len - 1) {
                    _return += ' | ';
                }
            }
        } else if (node.dotDotDotToken) {
            _return = 'any[]';
        } else {
            _return = kindToType(node.kind);
            if (
                _return === '' &&
                node.initializer &&
                node.initializer.kind &&
                (node.kind === SyntaxKind.PropertyDeclaration || node.kind === SyntaxKind.Parameter)
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
            _return += '<';
            let i = 0,
                len = node.typeArguments.length;
            for (i; i < len; i++) {
                let argument = node.typeArguments[i];
                _return += this.visitType(argument);
                if (i >= 0 && i < len - 1) {
                    _return += ', ';
                }
            }
            _return += '>';
        }
        return _return;
    }

    private visitCallDeclaration(method: ts.CallSignatureDeclaration, sourceFile: ts.SourceFile) {
        let sourceCode = sourceFile.getText();
        let hash = crypto
            .createHash('md5')
            .update(sourceCode)
            .digest('hex');
        let result: any = {
            id: 'call-declaration-' + hash,
            args: method.parameters ? method.parameters.map(prop => this.visitArgument(prop)) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        };
        if (method.jsDoc) {
            result.description = marked(marked(this.jsdocParserUtil.getMainCommentOfNode(method)));
        }
        let jsdoctags = this.jsdocParserUtil.getJSDocs(method);
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    }

    private visitIndexDeclaration(
        method: ts.IndexSignatureDeclaration,
        sourceFile?: ts.SourceFile
    ) {
        let sourceCode = sourceFile.getText();
        let hash = crypto
            .createHash('md5')
            .update(sourceCode)
            .digest('hex');
        let result = {
            id: 'index-declaration-' + hash,
            args: method.parameters ? method.parameters.map(prop => this.visitArgument(prop)) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        };
        if (method.jsDoc) {
            result.description = marked(this.jsdocParserUtil.getMainCommentOfNode(method));
        }
        return result;
    }

    private visitConstructorDeclaration(
        method: ts.ConstructorDeclaration,
        sourceFile?: ts.SourceFile
    ) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        let result: any = {
            name: 'constructor',
            description: '',
            args: method.parameters ? method.parameters.map(prop => this.visitArgument(prop)) : [],
            line: this.getPosition(method, sourceFile).line + 1
        };
        let jsdoctags = this.jsdocParserUtil.getJSDocs(method);

        if (method.jsDoc) {
            result.description = marked(this.jsdocParserUtil.getMainCommentOfNode(method));
        }

        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                let kinds = method.modifiers.map(modifier => {
                    return modifier.kind;
                });
                if (
                    _.indexOf(kinds, SyntaxKind.PublicKeyword) !== -1 &&
                    _.indexOf(kinds, SyntaxKind.StaticKeyword) !== -1
                ) {
                    kinds = kinds.filter(kind => kind !== SyntaxKind.PublicKeyword);
                }
                result.modifierKind = kinds;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        if (result.jsdoctags && result.jsdoctags.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args, result.jsdoctags);
        } else if (result.args.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args);
        }
        return result;
    }

    private visitProperty(property: ts.PropertyDeclaration, sourceFile) {
        let result: any = {
            name: property.name.text,
            defaultValue: property.initializer
                ? this.stringifyDefaultValue(property.initializer)
                : undefined,
            type: this.visitType(property),
            optional: typeof property.questionToken !== 'undefined',
            description: '',
            line: this.getPosition(property, sourceFile).line + 1
        };
        let jsdoctags;

        if (property.initializer && property.initializer.kind === SyntaxKind.ArrowFunction) {
            result.defaultValue = '() => {...}';
        }

        if (typeof result.name === 'undefined' && typeof property.name.expression !== 'undefined') {
            result.name = property.name.expression.text;
        }

        if (property.jsDoc) {
            jsdoctags = this.jsdocParserUtil.getJSDocs(property);
            result.description = marked(this.jsdocParserUtil.getMainCommentOfNode(property));
        }

        if (property.decorators) {
            result.decorators = this.formatDecorators(property.decorators);
        }

        if (property.modifiers) {
            if (property.modifiers.length > 0) {
                let kinds = property.modifiers.map(modifier => {
                    return modifier.kind;
                });
                if (
                    _.indexOf(kinds, SyntaxKind.PublicKeyword) !== -1 &&
                    _.indexOf(kinds, SyntaxKind.StaticKeyword) !== -1
                ) {
                    kinds = kinds.filter(kind => kind !== SyntaxKind.PublicKeyword);
                }
                result.modifierKind = kinds;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
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
                if (this.isPublic(constr.parameters[i])) {
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
                        constrTags.forEach(tag => {
                            _parameters.forEach(param => {
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

    private visitInputAndHostBinding(property, inDecorator, sourceFile?) {
        let inArgs = inDecorator.expression.arguments;
        let _return: any = {};
        _return.name = inArgs.length > 0 ? inArgs[0].text : property.name.text;
        _return.defaultValue = property.initializer
            ? this.stringifyDefaultValue(property.initializer)
            : undefined;
        if (!_return.description) {
            if (property.jsDoc) {
                if (property.jsDoc.length > 0) {
                    if (typeof property.jsDoc[0].comment !== 'undefined') {
                        _return.description = marked(property.jsDoc[0].comment);
                    }
                }
            }
        }
        _return.line = this.getPosition(property, sourceFile).line + 1;
        if (property.type) {
            _return.type = this.visitType(property);
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
                let symbol: ts.Symbol = property.symbol;
                if (symbol.valueDeclaration) {
                    let symbolType = this.typeChecker.getTypeOfSymbolAtLocation(
                        symbol,
                        symbol.valueDeclaration
                    );
                    if (symbolType) {
                        _return.type = this.typeChecker.typeToString(symbolType);
                    }
                }
            }
        }
        if (property.kind === SyntaxKind.SetAccessor) {
            // For setter accessor, find type in first parameter
            if (property.parameters && property.parameters.length === 1) {
                if (property.parameters[0].type) {
                    _return.type = kindToType(property.parameters[0].type.kind);
                }
            }
        }
        return _return;
    }

    private visitMethodDeclaration(method: ts.MethodDeclaration, sourceFile: ts.SourceFile) {
        let result: any = {
            name: method.name.text,
            args: method.parameters ? method.parameters.map(prop => this.visitArgument(prop)) : [],
            optional: typeof method.questionToken !== 'undefined',
            returnType: this.visitType(method.type),
            typeParameters: [],
            line: this.getPosition(method, sourceFile).line + 1
        };
        let jsdoctags = this.jsdocParserUtil.getJSDocs(method);

        if (typeof method.type === 'undefined') {
            // Try to get inferred type
            if (method.symbol) {
                let symbol: ts.Symbol = method.symbol;
                if (symbol.valueDeclaration) {
                    let symbolType = this.typeChecker.getTypeOfSymbolAtLocation(
                        symbol,
                        symbol.valueDeclaration
                    );
                    if (symbolType) {
                        try {
                            const signature = this.typeChecker.getSignatureFromDeclaration(method);
                            const returnType = signature.getReturnType();
                            result.returnType = this.typeChecker.typeToString(returnType);
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

        if (method.jsDoc) {
            result.description = marked(this.jsdocParserUtil.getMainCommentOfNode(method));
        }

        if (method.decorators) {
            result.decorators = this.formatDecorators(method.decorators);
        }

        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                let kinds = method.modifiers.map(modifier => {
                    return modifier.kind;
                });
                if (
                    _.indexOf(kinds, SyntaxKind.PublicKeyword) !== -1 &&
                    _.indexOf(kinds, SyntaxKind.StaticKeyword) !== -1
                ) {
                    kinds = kinds.filter(kind => kind !== SyntaxKind.PublicKeyword);
                }
                result.modifierKind = kinds;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
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
        sourceFile?: ts.SourceFile
    ) {
        let inArgs = outDecorator.expression.arguments;
        let _return: any = {
            name: inArgs.length > 0 ? inArgs[0].text : property.name.text,
            defaultValue: property.initializer
                ? this.stringifyDefaultValue(property.initializer)
                : undefined
        };
        if (property.jsDoc) {
            _return.description = marked(
                marked(this.jsdocParserUtil.getMainCommentOfNode(property))
            );
        }
        if (!_return.description) {
            if (property.jsDoc && property.jsDoc.length > 0) {
                if (typeof property.jsDoc[0].comment !== 'undefined') {
                    _return.description = marked(property.jsDoc[0].comment);
                }
            }
        }
        _return.line = this.getPosition(property, sourceFile).line + 1;

        if (property.type) {
            _return.type = this.visitType(property);
        } else {
            // handle NewExpression
            if (property.initializer) {
                if (ts.isNewExpression(property.initializer)) {
                    if (property.initializer.expression) {
                        _return.type = property.initializer.expression.text;
                    }
                }
            }
        }
        return _return;
    }

    private visitArgument(arg: ts.ParameterDeclaration) {
        let _result: any = { name: arg.name.text, type: this.visitType(arg) };
        if (arg.dotDotDotToken) {
            _result.dotDotDotToken = true;
        }
        if (arg.questionToken) {
            _result.optional = true;
        }
        if (arg.type) {
            if (arg.type.kind) {
                if (ts.isFunctionTypeNode(arg.type)) {
                    _result.function = arg.type.parameters
                        ? arg.type.parameters.map(prop => this.visitArgument(prop))
                        : [];
                }
            }
        }
        if (arg.initializer) {
            _result.defaultValue = this.stringifyDefaultValue(arg.initializer);
        }
        return _result;
    }

    private visitHostListener(property, hostListenerDecorator, sourceFile?) {
        let inArgs = hostListenerDecorator.expression.arguments;
        let _return: any = {};
        _return.name = inArgs.length > 0 ? inArgs[0].text : property.name.text;
        _return.args = property.parameters
            ? property.parameters.map(prop => this.visitArgument(prop))
            : [];
        _return.argsDecorator =
            inArgs.length > 1
                ? inArgs[1].elements.map(prop => {
                      return prop.text;
                  })
                : [];
        if (property.jsDoc) {
            _return.description = marked(this.jsdocParserUtil.getMainCommentOfNode(property));
        }
        if (!_return.description) {
            if (property.jsDoc) {
                if (property.jsDoc.length > 0) {
                    if (typeof property.jsDoc[0].comment !== 'undefined') {
                        _return.description = marked(property.jsDoc[0].comment);
                    }
                }
            }
        }
        _return.line = this.getPosition(property, sourceFile).line + 1;
        return _return;
    }
}
