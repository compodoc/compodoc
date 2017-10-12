import * as ts from 'typescript';
import { JSDocParameterTag } from 'typescript';


export class JsdocParserUtil {
    public isVariableLike(node: ts.Node): node is ts.VariableLikeDeclaration {
        if (node) {
            switch (node.kind) {
                case ts.SyntaxKind.BindingElement:
                case ts.SyntaxKind.EnumMember:
                case ts.SyntaxKind.Parameter:
                case ts.SyntaxKind.PropertyAssignment:
                case ts.SyntaxKind.PropertyDeclaration:
                case ts.SyntaxKind.PropertySignature:
                case ts.SyntaxKind.ShorthandPropertyAssignment:
                case ts.SyntaxKind.VariableDeclaration:
                    return true;
            }
        }
        return false;
    }

    public some<T>(array: ReadonlyArray<T>, predicate?: (value: T) => boolean): boolean {
        if (array) {
            if (predicate) {
                for (const v of array) {
                    if (predicate(v)) {
                        return true;
                    }
                }
            } else {
                return array.length > 0;
            }
        }
        return false;
    }

    public concatenate<T>(array1: ReadonlyArray<T>, array2: ReadonlyArray<T>): ReadonlyArray<T> {
        if (!this.some(array2)) { return array1; }
        if (!this.some(array1)) { return array2; }
        return [...array1, ...array2];
    }

    public isParameter(node: ts.Node): node is ts.ParameterDeclaration {
        return node.kind === ts.SyntaxKind.Parameter;
    }

    private getJSDocTags(node: ts.Node, kind: ts.SyntaxKind): ts.JSDocTag[] {
        const docs = this.getJSDocs(node);
        if (docs) {
            const result: ts.JSDocTag[] = [];
            for (const doc of docs) {
                if (doc.kind === ts.SyntaxKind.JSDocParameterTag) {
                    if (doc.kind === kind) {
                        result.push(doc as ts.JSDocTag);
                    }
                } else {
                    result.push(...this.filter((doc as ts.JSDoc).tags, tag => tag.kind === kind));
                }
            }
            return result;
        }
    }

    /**
     * Filters an array by a predicate function. Returns the same array instance if the predicate is
     * true for all elements, otherwise returns a new array instance containing the filtered subset.
     */
    public filter<T>(array: ReadonlyArray<T>, f: (x: T) => boolean): ReadonlyArray<T> {
        if (array) {
            const len = array.length;
            let i = 0;
            while (i < len && f(array[i])) {
                i++;
            }
            if (i < len) {
                const result = array.slice(0, i);
                i++;
                while (i < len) {
                    const item = array[i];
                    if (f(item)) {
                        result.push(item);
                    }
                    i++;
                }
                return result;
            }
        }
        return array;
    }

    public getJSDocs(node: ts.Node): ReadonlyArray<ts.JSDoc | ts.JSDocTag> {
        // TODO: jsDocCache is internal, see if there's a way around it
        let cache: ReadonlyArray<ts.JSDoc | ts.JSDocTag> = (node as any).jsDocCache;
        if (!cache) {
            cache = this.getJSDocsWorker(node, cache);
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
            parent.parent.parent.kind === ts.SyntaxKind.VariableStatement;
        const isVariableOfVariableDeclarationStatement = this.isVariableLike(node) &&
            parent.parent.kind === ts.SyntaxKind.VariableStatement;
        const variableStatementNode =
            isInitializerOfVariableDeclarationInStatement ? parent.parent.parent :
                isVariableOfVariableDeclarationStatement ? parent.parent :
                    undefined;
        if (variableStatementNode) {
            cache = this.getJSDocsWorker(variableStatementNode, cache);
        }

        // Also recognize when the node is the RHS of an assignment expression
        const isSourceOfAssignmentExpressionStatement =
            parent && parent.parent &&
            parent.kind === ts.SyntaxKind.BinaryExpression &&
            (parent as ts.BinaryExpression).operatorToken.kind === ts.SyntaxKind.EqualsToken &&
            parent.parent.kind === ts.SyntaxKind.ExpressionStatement;
        if (isSourceOfAssignmentExpressionStatement) {
            cache = this.getJSDocsWorker(parent.parent, cache);
        }

        const isModuleDeclaration = node.kind === ts.SyntaxKind.ModuleDeclaration &&
            parent && parent.kind === ts.SyntaxKind.ModuleDeclaration;
        const isPropertyAssignmentExpression = parent && parent.kind === ts.SyntaxKind.PropertyAssignment;
        if (isModuleDeclaration || isPropertyAssignmentExpression) {
            cache = this.getJSDocsWorker(parent, cache);
        }

        // Pull parameter comments from declaring function as well
        if (node.kind === ts.SyntaxKind.Parameter) {
            cache = this.concatenate(cache, this.getJSDocParameterTags(node));
        }

        if (this.isVariableLike(node) && node.initializer) {
            cache = this.concatenate(cache, node.initializer.jsDoc);
        }

        cache = this.concatenate(cache, node.jsDoc);

        return cache;
    }

    public getJSDocParameterTags(param: ts.Node): ReadonlyArray<ts.JSDocParameterTag> {
        if (!this.isParameter(param)) {
            return undefined;
        }
        const func = param.parent as ts.FunctionLikeDeclaration;
        const tags = this.getJSDocTags(func, ts.SyntaxKind.JSDocParameterTag) as ts.JSDocParameterTag[];
        if (!param.name) {
            // this is an anonymous jsdoc param from a `function(type1, type2): type3` specification
            const i = func.parameters.indexOf(param);
            const paramTags = this.filter(tags, tag => tag.kind === ts.SyntaxKind.JSDocParameterTag);
            if (paramTags && 0 <= i && i < paramTags.length) {
                return [paramTags[i]];
            }
        } else if (param.name.kind === ts.SyntaxKind.Identifier) {
            console.log(tags[0]);
            const name = (param.name as ts.Identifier).text;
            return this.filter(tags, tag => this.isJSDocParameterTag(tag.kind) && tag.parameterName.text === name);
        } else {
            // TODO: it's a destructured parameter, so it should look up an "object type" series of multiple lines
            // But multi-line object types aren't supported yet either
            return undefined;
        }
    }

    private isJSDocParameterTag(tag): tag is ts.JSDocParameterTag {
        return tag.kind === ts.SyntaxKind.JSDocParameterTag;
    }
}
