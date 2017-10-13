import { getNamesCompareFn, mergeTagsAndArgs, markedtags } from '../../../../utils/utils';
import { kindToType } from '../../../../utils/kind-to-type';

import * as _ from 'lodash';
import * as ts from 'typescript';
import { JsdocParserUtil } from '../../../../utils';
import { ConfigurationInterface } from '../../../interfaces/configuration.interface';

const marked = require('marked');

export class ClassHelper {
    private jsdocParserUtil = new JsdocParserUtil();

    constructor(
        private typeChecker,
        private configuration: ConfigurationInterface) {

    }

    public stringifyDefaultValue(node) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        if (node.text) {
            return node.text;
        } else if (node.kind === ts.SyntaxKind.FalseKeyword) {
            return 'false';
        } else if (node.kind === ts.SyntaxKind.TrueKeyword) {
            return 'true';
        }
    }

    public visitType(node): string {
        let _return = 'void';
        if (node) {
            if (node.typeName) {
                _return = node.typeName.text;
            } else if (node.type) {
                if (node.type.kind) {
                    _return = kindToType(node.type.kind);
                }
                if (node.type.typeName) {
                    _return = node.type.typeName.text;
                }
                if (node.type.typeArguments) {
                    _return += '<';
                    for (const argument of node.type.typeArguments) {
                        if (argument.kind) {
                            _return += kindToType(argument.kind);
                        }
                        if (argument.typeName) {
                            _return += argument.typeName.text;
                        }
                    }
                    _return += '>';
                }
                if (node.type.elementType) {
                    let _firstPart = kindToType(node.type.elementType.kind);
                    if (typeof node.type.elementType.typeName !== 'undefined') {
                        if (typeof node.type.elementType.typeName.escapedText !== 'undefined') {
                            _firstPart = node.type.elementType.typeName.escapedText;
                        }
                    }
                    _return = _firstPart + kindToType(node.type.kind);
                }
                if (node.type.types && node.type.kind === ts.SyntaxKind.UnionType) {
                    _return = '';
                    let i = 0;
                    let len = node.type.types.length;
                    for (i; i < len; i++) {
                        _return += kindToType(node.type.types[i].kind);
                        if (node.type.types[i].kind === ts.SyntaxKind.LiteralType && node.type.types[i].literal) {
                            _return += '"' + node.type.types[i].literal.text + '"';
                        }

                        if (typeof node.type.types[i].typeName !== 'undefined') {
                            if (typeof node.type.types[i].typeName.escapedText !== 'undefined') {
                                _return += node.type.types[i].typeName.escapedText;
                            }
                        }

                        if (i < len - 1) {
                            _return += ' | ';
                        }
                    }
                }
            } else if (node.elementType) {
                _return = kindToType(node.elementType.kind) + kindToType(node.kind);
            } else if (node.types && node.kind === ts.SyntaxKind.UnionType) {
                _return = '';
                let i = 0;
                let len = node.types.length;
                for (i; i < len; i++) {
                    _return += kindToType(node.types[i].kind);
                    if (node.types[i].kind === ts.SyntaxKind.LiteralType && node.types[i].literal) {
                        _return += '"' + node.types[i].literal.text + '"';
                    }
                    if (i < len - 1) {
                        _return += ' | ';
                    }
                }
            } else if (node.dotDotDotToken) {
                _return = 'any[]';
            } else {
                _return = kindToType(node.kind);
            }
            if (node.typeArguments && node.typeArguments.length > 0) {
                _return += '<';
                for (const argument of node.typeArguments) {
                    _return += kindToType(argument.kind);
                }
                _return += '>';
            }
        }
        return _return;
    }

    public visitClassDeclaration(fileName: string, classDeclaration: ts.ClassDeclaration, sourceFile?: ts.SourceFile): any {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        let symbol = this.typeChecker.getSymbolAtLocation(classDeclaration.name);
        let description = '';
        if (symbol) {
            description = marked(ts.displayPartsToString(symbol.getDocumentationComment()));
        }
        let className = classDeclaration.name.text;
        let directiveInfo;
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

        if (classDeclaration.decorators) {
            for (let i = 0; i < classDeclaration.decorators.length; i++) {
                if (this.isDirectiveDecorator(classDeclaration.decorators[i])) {
                    directiveInfo = this.visitDirectiveDecorator(classDeclaration.decorators[i]);
                    members = this.visitMembers(classDeclaration.members, sourceFile);
                    return {
                        description,
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
                        implements: implementsElements
                    };
                } else if (this.isServiceDecorator(classDeclaration.decorators[i])) {
                    members = this.visitMembers(classDeclaration.members, sourceFile);
                    return [{
                        fileName,
                        className,
                        description,
                        methods: members.methods,
                        indexSignatures: members.indexSignatures,
                        properties: members.properties,
                        kind: members.kind,
                        constructor: members.constructor,
                        jsdoctags: jsdoctags,
                        extends: extendsElement,
                        implements: implementsElements
                    }];
                } else if (this.isPipeDecorator(classDeclaration.decorators[i]) || this.isModuleDecorator(classDeclaration.decorators[i])) {
                    return [{
                        fileName,
                        className,
                        description,
                        jsdoctags: jsdoctags
                    }];
                } else {
                    members = this.visitMembers(classDeclaration.members, sourceFile);

                    return [{
                        description,
                        methods: members.methods,
                        indexSignatures: members.indexSignatures,
                        properties: members.properties,
                        kind: members.kind,
                        constructor: members.constructor,
                        jsdoctags: jsdoctags,
                        extends: extendsElement,
                        implements: implementsElements
                    }];
                }
            }
        } else if (description) {
            members = this.visitMembers(classDeclaration.members, sourceFile);

            return [{
                description,
                methods: members.methods,
                indexSignatures: members.indexSignatures,
                properties: members.properties,
                kind: members.kind,
                constructor: members.constructor,
                jsdoctags: jsdoctags,
                extends: extendsElement,
                implements: implementsElements,
                accessors: members.accessors
            }];
        } else {
            members = this.visitMembers(classDeclaration.members, sourceFile);

            return [{
                methods: members.methods,
                indexSignatures: members.indexSignatures,
                properties: members.properties,
                kind: members.kind,
                constructor: members.constructor,
                jsdoctags: jsdoctags,
                extends: extendsElement,
                implements: implementsElements
            }];
        }

        return [];
    }

    private visitDirectiveDecorator(decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        let selector;
        let exportAs;
        let properties;

        if (decorator.expression.arguments.length > 0) {
            properties = decorator.expression.arguments[0].properties;

            for (let i = 0; i < properties.length; i++) {
                if (properties[i].name.text === 'selector') {
                    // TODO: this will only work if selector is initialized as a string literal
                    selector = properties[i].initializer.text;
                }
                if (properties[i].name.text === 'exportAs') {
                    // TODO: this will only work if selector is initialized as a string literal
                    exportAs = properties[i].initializer.text;
                }
            }
        }

        return {
            selector,
            exportAs
        };
    }

    private isDirectiveDecorator(decorator) {
        if (decorator.expression.expression) {
            let decoratorIdentifierText = decorator.expression.expression.text;
            return decoratorIdentifierText === 'Directive' || decoratorIdentifierText === 'Component';
        } else {
            return false;
        }
    }

    private isServiceDecorator(decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'Injectable' : false;
    }

    private addAccessor(accessors, nodeAccessor) {
        let nodeName = '';
        if (nodeAccessor.name) {
            nodeName = nodeAccessor.name.escapedText;

            if (!accessors[nodeName]) {
                accessors[nodeName] = {
                    'name': nodeName,
                    'setSignature': [],
                    'getSignature': []
                }
            }

            if (nodeAccessor.kind === ts.SyntaxKind.SetAccessor) {
                let setSignature = {
                    'name': '__set',
                    'type': 'void',
                    'parameters': nodeAccessor.parameters.map((param) => {
                        return {
                            'name': param.name.escapedText,
                            'type': kindToType(param.type.kind)
                        }
                    })
                }
                accessors[nodeName].setSignature.push(
                    setSignature
                )
            }
            if (nodeAccessor.kind === ts.SyntaxKind.GetAccessor) {
                let getSignature = {
                    'name': '__get',
                    'type': kindToType(nodeAccessor.type.kind)
                }
                accessors[nodeName].getSignature.push(
                    getSignature
                )
            }
        }
        //console.log(' ', accessors);
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

        for (let i = 0; i < members.length; i++) {
            inputDecorator = this.getDecoratorOfType(members[i], 'Input');
            outDecorator = this.getDecoratorOfType(members[i], 'Output');
            hostBinding = this.getDecoratorOfType(members[i], 'HostBinding');
            hostListener = this.getDecoratorOfType(members[i], 'HostListener');

            kind = members[i].kind;

            if (inputDecorator) {
                inputs.push(this.visitInputAndHostBinding(members[i], inputDecorator, sourceFile));
            } else if (outDecorator) {
                outputs.push(this.visitOutput(members[i], outDecorator, sourceFile));
            } else if (hostBinding) {
                hostBindings.push(this.visitInputAndHostBinding(members[i], hostBinding, sourceFile));
            } else if (hostListener) {
                hostListeners.push(this.visitHostListener(members[i], hostListener, sourceFile));
            } else if (!this.isHiddenMember(members[i])) {

                if (!((this.isPrivate(members[i]) || this.isInternal(members[i])) &&
                    this.configuration.mainData.disablePrivateOrInternalSupport)) {
                    if ((members[i].kind === ts.SyntaxKind.MethodDeclaration ||
                        members[i].kind === ts.SyntaxKind.MethodSignature)) {
                        methods.push(this.visitMethodDeclaration(members[i], sourceFile));
                    } else if (
                        members[i].kind === ts.SyntaxKind.PropertyDeclaration ||
                        members[i].kind === ts.SyntaxKind.PropertySignature) {
                        properties.push(this.visitProperty(members[i], sourceFile));
                    } else if (members[i].kind === ts.SyntaxKind.CallSignature) {
                        properties.push(this.visitCallDeclaration(members[i], sourceFile));
                    } else if (members[i].kind === ts.SyntaxKind.SetAccessor || members[i].kind === ts.SyntaxKind.GetAccessor) {
                        this.addAccessor(accessors, members[i]);
                    } else if (members[i].kind === ts.SyntaxKind.IndexSignature) {
                        indexSignatures.push(this.visitIndexDeclaration(members[i], sourceFile));
                    } else if (members[i].kind === ts.SyntaxKind.Constructor) {
                        let _constructorProperties = this.visitConstructorProperties(members[i], sourceFile);
                        let j = 0;
                        let len = _constructorProperties.length;
                        for (j; j < len; j++) {
                            properties.push(_constructorProperties[j]);
                        }
                        constructor = this.visitConstructorDeclaration(members[i], sourceFile);
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

        return {
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
    }

    private visitCallDeclaration(method, sourceFile) {
        let result: any = {
            id: 'call-declaration-' + Date.now(),
            description: marked(ts.displayPartsToString(method.symbol.getDocumentationComment())),
            args: method.parameters ? method.parameters.map((prop) => this.visitArgument(prop)) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        };
        let jsdoctags = this.jsdocParserUtil.getJSDocs(method);
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    }

    private visitIndexDeclaration(method, sourceFile?) {
        return {
            id: 'index-declaration-' + Date.now(),
            description: marked(ts.displayPartsToString(method.symbol.getDocumentationComment())),
            args: method.parameters ? method.parameters.map((prop) => this.visitArgument(prop)) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        };
    }

    private isPrivate(member): boolean {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        if (member.modifiers) {
            const isPrivate: boolean = member.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.PrivateKeyword);
            if (isPrivate) {
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


    private visitConstructorDeclaration(method, sourceFile?) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        let result: any = {
            name: 'constructor',
            description: '',
            args: method.parameters ? method.parameters.map((prop) => this.visitArgument(prop)) : [],
            line: this.getPosition(method, sourceFile).line + 1
        };
        let jsdoctags = this.jsdocParserUtil.getJSDocs(method);

        if (method.symbol) {
            result.description = marked(ts.displayPartsToString(method.symbol.getDocumentationComment()));
        }

        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                result.modifierKind = method.modifiers[0].kind;
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

    private visitProperty(property, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        let result: any = {
            name: property.name.text,
            defaultValue: property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined,
            type: this.visitType(property),
            description: '',
            line: this.getPosition(property, sourceFile).line + 1
        };
        let jsdoctags;

        if (property.jsDoc) {
            jsdoctags = this.jsdocParserUtil.getJSDocs(property);
        }

        if (property.symbol) {
            result.description = marked(ts.displayPartsToString(property.symbol.getDocumentationComment()));
        }

        if (property.decorators) {
            result.decorators = this.formatDecorators(property.decorators);
        }

        if (property.modifiers) {
            if (property.modifiers.length > 0) {
                result.modifierKind = property.modifiers[0].kind;
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
        let that = this;
        if (constr.parameters) {
            let _parameters = [];
            let i = 0;
            let len = constr.parameters.length;
            for (i; i < len; i++) {
                if (this.isPublic(constr.parameters[i])) {
                    _parameters.push(this.visitProperty(constr.parameters[i], sourceFile));
                }
            }
            return _parameters;
        } else {
            return [];
        }
    }

    private isPublic(member): boolean {
        if (member.modifiers) {
            const isPublic: boolean = member.modifiers.some(function (modifier) {
                return modifier.kind === ts.SyntaxKind.PublicKeyword;
            });
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

    private visitInputAndHostBinding(property, inDecorator, sourceFile?) {
        let inArgs = inDecorator.expression.arguments;
        let _return: any = {};
        _return.name = (inArgs.length > 0) ? inArgs[0].text : property.name.text;
        _return.defaultValue = property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined;
        if (property.symbol) {
            _return.description = marked(ts.displayPartsToString(property.symbol.getDocumentationComment()));
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
        if (property.type) {
            _return.type = this.visitType(property);
        } else {
            // handle NewExpression
            if (property.initializer) {
                if (property.initializer.kind === ts.SyntaxKind.NewExpression) {
                    if (property.initializer.expression) {
                        _return.type = property.initializer.expression.text;
                    }
                }
            }
        }
        return _return;
    }


    private formatDecorators(decorators) {
        let _decorators = [];

        _.forEach(decorators, (decorator: any) => {
            if (decorator.expression) {
                if (decorator.expression.text) {
                    _decorators.push({
                        name: decorator.expression.text
                    });
                }
                if (decorator.expression.expression) {
                    let info: any = {
                        name: decorator.expression.expression.text
                    };
                    if (decorator.expression.expression.arguments) {
                        if (decorator.expression.expression.arguments.length > 0) {
                            info.args = decorator.expression.expression.arguments;
                        }
                    }
                    _decorators.push(info);
                }
            }
        });

        return _decorators;
    }

    private visitMethodDeclaration(method, sourceFile) {
        let result: any = {
            name: method.name.text,
            args: method.parameters ? method.parameters.map((prop) => this.visitArgument(prop)) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        };
        let jsdoctags = this.jsdocParserUtil.getJSDocs(method);

        if (typeof method.type === 'undefined') {
            // Try to get inferred type
            if (method.symbol) {
                let symbol: ts.Symbol = method.symbol;
                if (symbol.valueDeclaration) {
                    let symbolType = this.typeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
                    if (symbolType) {
                        try {
                            const signature = this.typeChecker.getSignatureFromDeclaration(method);
                            const returnType = signature.getReturnType();
                            result.returnType = this.typeChecker.typeToString(returnType);
                            // tslint:disable-next-line:no-empty
                        } catch (error) { }
                    }
                }
            }
        }

        if (method.symbol) {
            result.description = marked(ts.displayPartsToString(method.symbol.getDocumentationComment()));
        }

        if (method.decorators) {
            result.decorators = this.formatDecorators(method.decorators);
        }

        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                result.modifierKind = method.modifiers[0].kind;
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

    private isPipeDecorator(decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'Pipe' : false;
    }

    private isModuleDecorator(decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'NgModule' : false;
    }


    private visitOutput(property, outDecorator, sourceFile?) {
        let inArgs = outDecorator.expression.arguments;
        let _return: any = {
            name: (inArgs.length > 0) ? inArgs[0].text : property.name.text,
            defaultValue: property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined
        };
        if (property.symbol) {
            _return.description = marked(ts.displayPartsToString(property.symbol.getDocumentationComment()));
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

        if (property.type) {
            _return.type = this.visitType(property);
        } else {
            // handle NewExpression
            if (property.initializer) {
                if (property.initializer.kind === ts.SyntaxKind.NewExpression) {
                    if (property.initializer.expression) {
                        _return.type = property.initializer.expression.text;
                    }
                }
            }
        }
        return _return;
    }


    private visitArgument(arg) {
        let _result: any = {
            name: arg.name.text,
            type: this.visitType(arg)
        };
        if (arg.dotDotDotToken) {
            _result.dotDotDotToken = true;
        }
        if (arg.questionToken) {
            _result.optional = true;
        }
        if (arg.type) {
            if (arg.type.kind) {
                if (arg.type.kind === ts.SyntaxKind.FunctionType) {
                    _result.function = arg.type.parameters ? arg.type.parameters.map((prop) => this.visitArgument(prop)) : [];
                }
            }
        }
        return _result;
    }

    private getPosition(node, sourceFile): ts.LineAndCharacter {
        let position: ts.LineAndCharacter;
        if (node.name && node.name.end) {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node.name.end);
        } else {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node.pos);
        }
        return position;
    }

    private visitHostListener(property, hostListenerDecorator, sourceFile?) {
        let inArgs = hostListenerDecorator.expression.arguments;
        let _return: any = {};
        _return.name = (inArgs.length > 0) ? inArgs[0].text : property.name.text;
        _return.args = property.parameters ? property.parameters.map((prop) => this.visitArgument(prop)) : [];
        _return.argsDecorator = (inArgs.length > 1) ? inArgs[1].elements.map((prop) => {
            return prop.text;
        }) : [];
        if (property.symbol) {
            _return.description = marked(ts.displayPartsToString(property.symbol.getDocumentationComment()));
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
