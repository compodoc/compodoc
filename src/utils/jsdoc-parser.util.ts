import * as _ from 'lodash';
import { ts, SyntaxKind } from 'ts-morph';

import * as _ts from './ts-internal';

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

    isTopmostModuleDeclaration(node: ts.ModuleDeclaration): boolean {
        if (node.nextContainer && node.nextContainer.kind === ts.SyntaxKind.ModuleDeclaration) {
            let next = <ts.ModuleDeclaration>node.nextContainer;
            if (node.name.end + 1 === next.name.pos) {
                return false;
            }
        }

        return true;
    }

    getRootModuleDeclaration(node: ts.ModuleDeclaration): ts.Node {
        while (node.parent && node.parent.kind === ts.SyntaxKind.ModuleDeclaration) {
            let parent = <ts.ModuleDeclaration>node.parent;
            if (node.name.pos === parent.name.end + 1) {
                node = parent;
            } else {
                break;
            }
        }

        return node;
    }

    public getMainCommentOfNode(node: ts.Node, sourceFile?: ts.SourceFile): string {
        let description: string = '';

        if (node.parent && node.parent.kind === ts.SyntaxKind.VariableDeclarationList) {
            node = node.parent.parent;
        } else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
            if (!this.isTopmostModuleDeclaration(<ts.ModuleDeclaration>node)) {
                return null;
            } else {
                node = this.getRootModuleDeclaration(<ts.ModuleDeclaration>node);
            }
        }

        const comments = _ts.getJSDocCommentRanges(node, sourceFile.text);
        if (comments && comments.length) {
            let comment: ts.CommentRange;
            if (node.kind === ts.SyntaxKind.SourceFile) {
                if (comments.length === 1) {
                    return null;
                }
                comment = comments[0];
            } else {
                comment = comments[comments.length - 1];
            }

            description = sourceFile.text.substring(comment.pos, comment.end);
        }
        return description;
    }

    public parseComment(text: string): string {
        let comment = '';
        let shortText = 0;

        function readBareLine(line: string) {
            comment += '\n' + line;
            if (line === '' && shortText === 0) {
                // Ignore
            } else if (line === '' && shortText === 1) {
                shortText = 2;
            } else {
                if (shortText === 2) {
                    comment += (comment === '' ? '' : '\n') + line;
                }
            }
        }

        const CODE_FENCE = /^\s*```(?!.*```)/;
        let inCode = false;
        let inExample = false; // first line with @example, end line with empty string or string or */
        let nbLines = 0;
        function readLine(line: string, index: number) {
            line = line.replace(/^\s*\*? ?/, '');
            line = line.replace(/\s*$/, '');

            if (CODE_FENCE.test(line)) {
                inCode = !inCode;
            }

            if (line.indexOf('@example') !== -1) {
                inExample = true;
                line = '```html';
            }

            if (inExample && line === '') {
                inExample = false;
                line = '```';
            }

            if (!inCode) {
                const tag = /^@(\S+)/.exec(line);
                const SeeTag = /^@see/.exec(line);

                if (SeeTag) {
                    line = line.replace(/^@see/, 'See');
                }

                if (tag && !SeeTag) {
                    return;
                }
            }

            readBareLine(line);
        }

        text = text.replace(/^\s*\/\*+/, '');
        text = text.replace(/\*+\/\s*$/, '');

        nbLines = text.split(/\r\n?|\n/).length;

        text.split(/\r\n?|\n/).forEach(readLine);

        return comment;
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

    public parseJSDocNode(node): string {
        let rawDescription = '';

        if (typeof node.comment === 'string') {
            rawDescription += node.comment;
        } else {
            if (node.comment) {
                const len = node.comment.length;

                for (let i = 0; i < len; i++) {
                    const JSDocNode = node.comment[i];
                    switch (JSDocNode.kind) {
                        case SyntaxKind.JSDocComment:
                            rawDescription += JSDocNode.comment;
                            break;
                        case SyntaxKind.JSDocText:
                            rawDescription += JSDocNode.text;
                            break;
                        case SyntaxKind.JSDocLink:
                            if (JSDocNode.name) {
                                let text = JSDocNode.name.escapedText;
                                if (
                                    text === undefined &&
                                    JSDocNode.name.left &&
                                    JSDocNode.name.right
                                ) {
                                    text =
                                        JSDocNode.name.left.escapedText +
                                        '.' +
                                        JSDocNode.name.right.escapedText;
                                }
                                rawDescription += JSDocNode.text + '{@link ' + text + '}';
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        return rawDescription;
    }
}
