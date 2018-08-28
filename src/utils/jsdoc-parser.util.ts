import { ts, SyntaxKind } from 'ts-simple-ast';
import * as _ from 'lodash';

import { JSDocParameterTagExt } from '../app/nodes/jsdoc-parameter-tag.node';

export class JsdocParserUtil {
    public isVariableLike(node: ts.Node): node is ts.VariableLikeDeclaration {
        if (node) {
            switch (node.kind) {
                case SyntaxKind.BindingElement:
                case SyntaxKind.EnumMember:
                case SyntaxKind.Parameter:
                case SyntaxKind.PropertyAssignment:
                case SyntaxKind.PropertyDeclaration:
                case SyntaxKind.PropertySignature:
                case SyntaxKind.ShorthandPropertyAssignment:
                case SyntaxKind.VariableDeclaration:
                    return true;
            }
        }
        return false;
    }

    public getMainCommentOfNode(node: ts.Node): string {
        let description: string = '';
        if (node.jsDoc) {
            if (node.jsDoc.length > 0) {
                if (typeof node.jsDoc[0].comment !== 'undefined') {
                    description = node.jsDoc[0].comment;
                }
            }
        }
        return description;
    }

    private getJSDocTags(node: ts.Node, kind: SyntaxKind): ts.JSDocTag[] {
        const docs = this.getJSDocs(node);
        if (docs) {
            const result: ts.JSDocTag[] = [];
            for (const doc of docs) {
                if (ts.isJSDocParameterTag(doc)) {
                    if (doc.kind === kind) {
                        result.push(doc);
                    }
                } else if (ts.isJSDoc(doc)) {
                    result.push(..._.filter(doc.tags, tag => tag.kind === kind));
                } else {
                    throw new Error('Unexpected type');
                }
            }
            return result;
        }
    }

    public getJSDocs(node: ts.Node): ReadonlyArray<ts.JSDoc | ts.JSDocTag> {
        // TODO: jsDocCache is internal, see if there's a way around it
        let cache: ReadonlyArray<ts.JSDoc | ts.JSDocTag> = (node as any).jsDocCache;
        if (!cache) {
            cache = this.getJSDocsWorker(node, []).filter(x => x);
            (node as any).jsDocCache = cache;
        }
        return cache;
    }

    // Try to recognize this pattern when node is initializer
    // of variable declaration and JSDoc comments are on containing variable statement.
    // /**
    //   * @param {number} name
    //   * @returns {number}
    //   */
    // var x = function(name) { return name.length; }
    private getJSDocsWorker(node: ts.Node, cache): ReadonlyArray<any> {
        const parent = node.parent;
        const isInitializerOfVariableDeclarationInStatement =
            this.isVariableLike(parent) &&
            parent.initializer === node &&
            ts.isVariableStatement(parent.parent.parent);
        const isVariableOfVariableDeclarationStatement =
            this.isVariableLike(node) && ts.isVariableStatement(parent.parent);
        const variableStatementNode = isInitializerOfVariableDeclarationInStatement
            ? parent.parent.parent
            : isVariableOfVariableDeclarationStatement
                ? parent.parent
                : undefined;
        if (variableStatementNode) {
            cache = this.getJSDocsWorker(variableStatementNode, cache);
        }

        // Also recognize when the node is the RHS of an assignment expression
        const isSourceOfAssignmentExpressionStatement =
            parent &&
            parent.parent &&
            ts.isBinaryExpression(parent) &&
            parent.operatorToken.kind === SyntaxKind.EqualsToken &&
            ts.isExpressionStatement(parent.parent);
        if (isSourceOfAssignmentExpressionStatement) {
            cache = this.getJSDocsWorker(parent.parent, cache);
        }

        const isModuleDeclaration =
            ts.isModuleDeclaration(node) && parent && ts.isModuleDeclaration(parent);
        const isPropertyAssignmentExpression = parent && ts.isPropertyAssignment(parent);
        if (isModuleDeclaration || isPropertyAssignmentExpression) {
            cache = this.getJSDocsWorker(parent, cache);
        }

        // Pull parameter comments from declaring function as well
        if (ts.isParameter(node)) {
            cache = _.concat(cache, this.getJSDocParameterTags(node));
        }

        if (this.isVariableLike(node) && node.initializer) {
            cache = _.concat(cache, node.initializer.jsDoc);
        }

        cache = _.concat(cache, node.jsDoc);

        return cache;
    }

    private getJSDocParameterTags(
        param: ts.ParameterDeclaration
    ): ReadonlyArray<ts.JSDocParameterTag> {
        const func = param.parent as ts.FunctionLikeDeclaration;
        const tags = this.getJSDocTags(
            func,
            SyntaxKind.JSDocParameterTag
        ) as ts.JSDocParameterTag[];

        if (!param.name) {
            // this is an anonymous jsdoc param from a `function(type1, type2): type3` specification
            const i = func.parameters.indexOf(param);
            const paramTags = _.filter(tags, tag => ts.isJSDocParameterTag(tag));

            if (paramTags && 0 <= i && i < paramTags.length) {
                return [paramTags[i]];
            }
        } else if (ts.isIdentifier(param.name)) {
            const name = param.name.text;
            return _.filter(tags, tag => {
                if (ts && ts.isJSDocParameterTag(tag)) {
                    let t: JSDocParameterTagExt = tag;
                    if (typeof t.parameterName !== 'undefined') {
                        return t.parameterName.text === name;
                    } else if (typeof t.name !== 'undefined') {
                        if (typeof t.name.escapedText !== 'undefined') {
                            return t.name.escapedText === name;
                        }
                    }
                }
            });
        } else {
            // TODO: it's a destructured parameter, so it should look up an "object type" series of multiple lines
            // But multi-line object types aren't supported yet either
            return undefined;
        }
    }
}
