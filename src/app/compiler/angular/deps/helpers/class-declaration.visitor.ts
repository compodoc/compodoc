import { ts } from 'ts-morph';

import { markedtags } from '../../../../../utils/utils';
import { isCoverageIgnore, isIgnore } from '../../../../../utils';
import { getNodeDecorators, nodeHasDecorator } from '../../../../../utils/node.util';
import { markedAcl } from '../../../../../utils/marked.acl';
import type { ClassMemberVisitorContext } from './class-member.visitor';

export class ClassDeclarationVisitor {
    constructor(
        private readonly context: ClassMemberVisitorContext,
        private readonly visitMembers: (members: any, sourceFile: any) => any
    ) {}

    public visitClassDeclaration(
        fileName: string,
        classDeclaration: ts.ClassDeclaration | ts.InterfaceDeclaration,
        sourceFile?: ts.SourceFile,
        astFile?: ts.SourceFile
    ): any {
        const symbol = classDeclaration.name
            ? this.context.typeChecker.getSymbolAtLocation(classDeclaration.name)
            : undefined;
        let rawdescription = '';
        let deprecation = this.context.initializeDocumentationFields();
        let description = '';
        let jsdoctags: any[] = [];

        if (symbol) {
            const comment = this.context.getJsdocParserUtil().getMainCommentOfNode(
                classDeclaration,
                sourceFile
            );
            rawdescription = this.context.getJsdocParserUtil().parseComment(comment);
            description = markedAcl(rawdescription);
            if (symbol.valueDeclaration && isIgnore(symbol.valueDeclaration)) {
                return [{ ignore: true }];
            }
            if (symbol.declarations && symbol.declarations.length > 0) {
                const declarationsjsdoctags = this.context.getJsdocParserUtil().getJSDocs(
                    symbol.declarations[0]
                );
                this.context.processJSDocTags(declarationsjsdoctags, deprecation, false);
                if (isIgnore(symbol.declarations[0])) {
                    return [{ ignore: true }];
                }
            }
            if (symbol.valueDeclaration) {
                jsdoctags = this.context.getJsdocParserUtil().getJSDocs(
                    symbol.valueDeclaration
                ) as unknown as any[];
                if (jsdoctags && jsdoctags.length >= 1) {
                    const jsdoc = jsdoctags[0] as any;
                    if (jsdoc && jsdoc.tags) {
                        const tempDeprecation = this.context.initializeDocumentationFields();
                        this.context.checkForDeprecation(jsdoc.tags, tempDeprecation);
                        deprecation = tempDeprecation;
                        jsdoctags = markedtags(jsdoc.tags);
                    }
                }
            }
        }

        const className = classDeclaration.name?.text || '';
        const implementsElements = this.collectImplements(classDeclaration);
        const extendsElements = this.collectExtends(className, astFile);
        const coverageIgnore = isCoverageIgnore(classDeclaration);
        const members = this.visitMembers(classDeclaration.members, sourceFile);
        this.applyInheritedDocumentation(
            members,
            implementsElements.concat(extendsElements),
            astFile
        );

        if (nodeHasDecorator(classDeclaration)) {
            return this.buildDecoratedClassResult(
                fileName,
                className,
                classDeclaration,
                deprecation,
                coverageIgnore,
                description,
                rawdescription,
                jsdoctags,
                extendsElements,
                implementsElements,
                members
            );
        }

        return this.buildPlainClassResult(
            deprecation,
            coverageIgnore,
            description,
            rawdescription,
            jsdoctags,
            extendsElements,
            implementsElements,
            members
        );
    }

    private collectImplements(
        classDeclaration: ts.ClassDeclaration | ts.InterfaceDeclaration
    ): any[] {
        const implementsElements: any[] = [];
        if (typeof (ts as any).getEffectiveImplementsTypeNodes === 'undefined') {
            return implementsElements;
        }

        const implementedTypes = (ts as any).getEffectiveImplementsTypeNodes(classDeclaration);
        if (implementedTypes) {
            for (let i = 0; i < implementedTypes.length; i++) {
                if (implementedTypes[i].expression) {
                    implementsElements.push(implementedTypes[i].expression.text);
                }
            }
        }
        return implementsElements;
    }

    private collectExtends(className: string, astFile?: ts.SourceFile): any[] {
        if (typeof (ts as any).getClassExtendsHeritageElement === 'undefined' || !astFile) {
            return [];
        }

        let interfaceOrClassNode = (astFile as any).getInterface(className);
        if (!interfaceOrClassNode) {
            interfaceOrClassNode = (astFile as any).getClass(className);
        }
        if (!interfaceOrClassNode) {
            return [];
        }

        const extendsListRaw = interfaceOrClassNode.getExtends();
        const extendsList: any[] = [];
        if (!extendsListRaw) {
            return extendsList;
        }

        if (Array.isArray(extendsListRaw)) {
            for (const extendElement of extendsListRaw) {
                const text = extendElement.getText();
                if (text) {
                    extendsList.push(text);
                }
            }
            return extendsList;
        }

        const text = extendsListRaw.getText();
        if (text) {
            extendsList.push(text);
        }
        return extendsList;
    }

    private applyInheritedDocumentation(members: any, ancestorNames: any[], astFile?: any): void {
        if (!astFile || !members?.methods || ancestorNames.length === 0) {
            return;
        }

        for (const method of members.methods) {
            if (!method.name || !this.needsInheritedDocumentation(method)) {
                continue;
            }

            const inherited = this.findInheritedMethodDocumentation(
                method.name,
                ancestorNames,
                astFile,
                new Set<string>()
            );

            if (!inherited) {
                continue;
            }

            const rawdescription = this.hasInheritDoc(method.rawdescription)
                ? this.replaceInheritDoc(method.rawdescription, inherited.rawdescription)
                : inherited.rawdescription;

            method.rawdescription = rawdescription;
            method.description = markedAcl(rawdescription);
        }
    }

    private needsInheritedDocumentation(method: any): boolean {
        return (
            !method.rawdescription?.trim() ||
            this.hasInheritDoc(method.rawdescription) ||
            this.hasInheritDoc(method.description)
        );
    }

    private hasInheritDoc(value: string): boolean {
        return /\{@inheritDoc\}|@inheritDoc/i.test(value || '');
    }

    private replaceInheritDoc(value: string, inheritedValue: string): string {
        return (value || '').replace(/\{@inheritDoc\}|@inheritDoc/gi, inheritedValue);
    }

    private findInheritedMethodDocumentation(
        methodName: string,
        ancestorNames: any[],
        astFile: any,
        visited: Set<string>
    ): { rawdescription: string } | undefined {
        for (const ancestorName of ancestorNames) {
            const normalizedName = this.normalizeHeritageName(ancestorName);
            if (!normalizedName || visited.has(normalizedName)) {
                continue;
            }
            visited.add(normalizedName);

            const declaration = this.getAstDeclaration(normalizedName, astFile);
            if (!declaration) {
                continue;
            }

            const inheritedMethod = this.findAstMethod(declaration, methodName);
            if (inheritedMethod) {
                const documentation = this.extractAstDocumentation(inheritedMethod);
                if (documentation) {
                    return documentation;
                }
            }

            const nestedAncestors = this.collectNestedAncestorNames(normalizedName, declaration, astFile);
            const nestedDocumentation = this.findInheritedMethodDocumentation(
                methodName,
                nestedAncestors,
                astFile,
                visited
            );
            if (nestedDocumentation) {
                return nestedDocumentation;
            }
        }

        return undefined;
    }

    private normalizeHeritageName(ancestorName: any): string {
        return String(ancestorName || '')
            .replace(/<[\s\S]*$/, '')
            .trim();
    }

    private getAstDeclaration(name: string, astFile: any): any {
        return astFile.getInterface?.(name) || astFile.getClass?.(name);
    }

    private findAstMethod(declaration: any, methodName: string): any {
        const methods = declaration.getMethods?.() || [];
        return methods.find((method: any) => method.getName?.() === methodName);
    }

    private extractAstDocumentation(method: any): { rawdescription: string } | undefined {
        const compilerNode = method.compilerNode || method;
        const sourceFile = method.getSourceFile?.()?.compilerNode || compilerNode.getSourceFile?.();
        const comment = this.context.getJsdocParserUtil().getMainCommentOfNode(
            compilerNode,
            sourceFile
        );

        if (typeof comment !== 'string' || comment.length === 0) {
            return undefined;
        }

        const rawdescription = this.replaceInheritDoc(
            this.context.getJsdocParserUtil().parseComment(comment),
            ''
        );

        if (!rawdescription.trim()) {
            return undefined;
        }

        return { rawdescription };
    }

    private collectNestedAncestorNames(name: string, declaration: any, astFile: any): any[] {
        const nestedAncestors = this.collectExtends(name, astFile);
        if (declaration.compilerNode) {
            nestedAncestors.push(...this.collectImplements(declaration.compilerNode));
        }
        return nestedAncestors;
    }

    private buildDecoratedClassResult(
        fileName: string,
        className: string,
        classDeclaration: ts.ClassDeclaration | ts.InterfaceDeclaration,
        deprecation: any,
        coverageIgnore: boolean,
        description: string,
        rawdescription: string,
        jsdoctags: any[],
        extendsElements: any[],
        implementsElements: any[],
        members: any
    ): any {
        const classDecorators = getNodeDecorators(classDeclaration);
        let isDirective = false;
        let isService = false;
        let isPipe = false;
        let isModule = false;
        let isController = false;

        for (let a = 0; a < classDecorators.length; a++) {
            isDirective =
                isDirective ||
                this.context.decoratorResolver.isDirectiveDecorator(classDecorators[a]);
            isService =
                isService || this.context.decoratorResolver.isServiceDecorator(classDecorators[a]);
            isPipe = isPipe || this.context.decoratorResolver.isPipeDecorator(classDecorators[a]);
            isModule =
                isModule || this.context.decoratorResolver.isModuleDecorator(classDecorators[a]);
            isController =
                isController ||
                this.context.decoratorResolver.isControllerDecorator(classDecorators[a]);
        }

        if (isDirective) {
            return this.buildDirectiveResult(
                deprecation,
                coverageIgnore,
                description,
                rawdescription,
                jsdoctags,
                extendsElements,
                implementsElements,
                members
            );
        }

        if (isService) {
            return [
                this.buildDocumentedClassResult(
                    { fileName, className },
                    deprecation,
                    coverageIgnore,
                    description,
                    rawdescription,
                    jsdoctags,
                    extendsElements,
                    implementsElements,
                    members
                )
            ];
        }

        if (isPipe) {
            return [
                {
                    fileName,
                    className,
                    deprecated: deprecation.deprecated,
                    deprecationMessage: deprecation.deprecationMessage,
                    coverageIgnore,
                    description,
                    rawdescription,
                    jsdoctags,
                    properties: members.properties,
                    methods: members.methods
                }
            ];
        }

        if (isModule) {
            return [
                {
                    fileName,
                    className,
                    deprecated: deprecation.deprecated,
                    deprecationMessage: deprecation.deprecationMessage,
                    coverageIgnore,
                    description,
                    rawdescription,
                    jsdoctags,
                    methods: members.methods
                }
            ];
        }

        return [
            this.buildDocumentedClassResult(
                {},
                deprecation,
                coverageIgnore,
                description,
                rawdescription,
                jsdoctags,
                extendsElements,
                implementsElements,
                members
            )
        ];
    }

    private buildPlainClassResult(
        deprecation: any,
        coverageIgnore: boolean,
        description: string,
        rawdescription: string,
        jsdoctags: any[],
        extendsElements: any[],
        implementsElements: any[],
        members: any
    ): any {
        if (description) {
            return [
                this.buildDirectiveResult(
                    deprecation,
                    coverageIgnore,
                    description,
                    rawdescription,
                    jsdoctags,
                    extendsElements,
                    implementsElements,
                    members
                )
            ];
        }

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
                jsdoctags,
                extends: extendsElements,
                implements: implementsElements,
                accessors: members.accessors
            }
        ];
    }

    private buildDirectiveResult(
        deprecation: any,
        coverageIgnore: boolean,
        description: string,
        rawdescription: string,
        jsdoctags: any[],
        extendsElements: any[],
        implementsElements: any[],
        members: any
    ): any {
        return {
            deprecated: deprecation.deprecated,
            deprecationMessage: deprecation.deprecationMessage,
            coverageIgnore,
            description,
            rawdescription,
            inputs: members.inputs,
            outputs: members.outputs,
            hostBindings: members.hostBindings,
            hostListeners: members.hostListeners,
            properties: members.properties,
            methods: members.methods,
            indexSignatures: members.indexSignatures,
            kind: members.kind,
            constructor: members.constructor,
            jsdoctags,
            extends: extendsElements,
            implements: implementsElements,
            accessors: members.accessors
        };
    }

    private buildDocumentedClassResult(
        extraFields: any,
        deprecation: any,
        coverageIgnore: boolean,
        description: string,
        rawdescription: string,
        jsdoctags: any[],
        extendsElements: any[],
        implementsElements: any[],
        members: any
    ): any {
        return {
            ...extraFields,
            deprecated: deprecation.deprecated,
            deprecationMessage: deprecation.deprecationMessage,
            coverageIgnore,
            description,
            rawdescription,
            methods: members.methods,
            indexSignatures: members.indexSignatures,
            properties: members.properties,
            kind: members.kind,
            constructor: members.constructor,
            jsdoctags,
            extends: extendsElements,
            implements: implementsElements,
            accessors: members.accessors
        };
    }
}
