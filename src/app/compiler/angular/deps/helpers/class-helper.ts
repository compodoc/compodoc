import { ts, SyntaxKind } from 'ts-morph';

import { JsdocParserUtil } from '../../../../../utils/jsdoc-parser.util';

import { ArgumentStringifier } from './argument-stringifier';
import { ClassDeclarationVisitor } from './class-declaration.visitor';
import { ClassJsDocHelper } from './class-jsdoc.helper';
import { ClassMemberVisitor, ClassMemberVisitorContext } from './class-member.visitor';
import { DecoratorResolver } from './decorator-resolver';
import { MemberVisibilityPolicy } from './member-visibility-policy';
import { TypeExpressionRenderer } from './type-expression-renderer';
import { TypeExpressionResolver } from './type-expression-resolver';

export class ClassHelper {
    private jsdocParserUtil = new JsdocParserUtil();
    private jsDocHelper: ClassJsDocHelper;
    private argumentStringifier: ArgumentStringifier;
    private classDeclarationVisitor: ClassDeclarationVisitor;
    private classMemberVisitor: ClassMemberVisitor;
    private decoratorResolver: DecoratorResolver;
    private memberVisibility: MemberVisibilityPolicy;
    private typeExpressionRenderer: TypeExpressionRenderer;
    private typeExpressionResolver: TypeExpressionResolver;

    constructor(private typeChecker: ts.TypeChecker) {
        this.jsDocHelper = new ClassJsDocHelper(this.jsdocParserUtil);
        this.typeExpressionResolver = new TypeExpressionResolver(typeChecker);
        this.typeExpressionRenderer = new TypeExpressionRenderer(this.typeExpressionResolver);
        this.argumentStringifier = new ArgumentStringifier(node => this.visitType(node));
        this.decoratorResolver = new DecoratorResolver(args =>
            this.argumentStringifier.stringify(args)
        );
        this.memberVisibility = new MemberVisibilityPolicy((member, tagName) =>
            this.hasJSDocTag(member, tagName)
        );
        const visitorContext: ClassMemberVisitorContext = {
            typeChecker: this.typeChecker,
            jsdocParserUtil: this.jsdocParserUtil,
            decoratorResolver: this.decoratorResolver,
            memberVisibility: this.memberVisibility,
            stringifyDefaultValue: node => this.stringifyDefaultValue(node),
            initializeDocumentationFields: () => this.initializeDocumentationFields(),
            visitType: node => this.visitType(node),
            visitTypeIndex: node => this.visitTypeIndex(node),
            shouldResolveTypeWithTypeChecker: typeNode =>
                this.shouldResolveTypeWithTypeChecker(typeNode),
            tryResolveTypeFromTypeChecker: (node, enclosingDeclaration) =>
                this.tryResolveTypeFromTypeChecker(node, enclosingDeclaration),
            extractAndProcessJSDocComment: (node, sourceFile, result) =>
                this.extractAndProcessJSDocComment(node, sourceFile, result),
            processJSDocTags: (jsdoctags, result, includeTagsArray) =>
                this.processJSDocTags(jsdoctags, result, includeTagsArray),
            checkForDeprecation: (tags, result) => this.checkForDeprecation(tags, result)
        };
        this.classMemberVisitor = new ClassMemberVisitor(visitorContext);
        this.classDeclarationVisitor = new ClassDeclarationVisitor(
            visitorContext,
            (members, sourceFile) => this.classMemberVisitor.visitMembers(members, sourceFile)
        );
    }

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
            return 'false';
        } else if (node && node.kind === SyntaxKind.TrueKeyword) {
            return 'true';
        }
        return '';
    }

    private checkForDeprecation(tags: any[], result: { [key in string | number]: any }) {
        this.jsDocHelper.checkForDeprecation(tags, result);
    }

    /**
     * Process JSDoc tags and apply them to a result object
     */
    private processJSDocTags(jsdoctags: any, result: any, includeTagsArray: boolean = true): void {
        this.jsDocHelper.processTags(jsdoctags, result, includeTagsArray);
    }

    /**
     * Extract and process JSDoc comment for a node
     */
    private extractAndProcessJSDocComment(node: any, sourceFile: ts.SourceFile, result: any): void {
        this.jsDocHelper.extractComment(node, sourceFile, result);
    }

    private hasJSDocTag(member: ts.Node, tagName: string): boolean {
        return this.jsDocHelper.hasTag(member, tagName);
    }

    /**
     * Initialize common fields for documented items
     */
    private initializeDocumentationFields(): {
        deprecated: boolean;
        deprecationMessage: string;
    } {
        return this.jsDocHelper.createDocumentationFields();
    }

    private tryResolveTypeFromTypeChecker(
        node: ts.Node,
        enclosingDeclaration?: ts.Node
    ): string | undefined {
        return this.typeExpressionResolver.tryResolve(node, enclosingDeclaration);
    }

    private shouldResolveTypeWithTypeChecker(typeNode: ts.TypeNode): boolean {
        const typeName = ts.isTypeReferenceNode(typeNode)
            ? this.typeExpressionRenderer.visitTypeName(typeNode.typeName as any)
            : '';

        return this.typeExpressionResolver.shouldResolve(typeNode, typeName as string);
    }

    public visitTypeIndex(node: any): string {
        return this.typeExpressionRenderer.visitTypeIndex(node);
    }

    public visitType(node: any): string {
        return this.typeExpressionRenderer.visitType(node);
    }

    public visitClassDeclaration(
        fileName: string,
        classDeclaration: ts.ClassDeclaration | ts.InterfaceDeclaration,
        sourceFile?: ts.SourceFile,
        astFile?: ts.SourceFile
    ): any {
        return this.classDeclarationVisitor.visitClassDeclaration(
            fileName,
            classDeclaration,
            sourceFile,
            astFile
        );
    }

    private visitMembers(members: any, sourceFile: any): any {
        return this.classMemberVisitor.visitMembers(members, sourceFile);
    }
}
