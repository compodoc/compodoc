const ts = require('typescript');

export function isVariableLike(node: Node): node is VariableLikeDeclaration {
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

export function some<T>(array: T[], predicate?: (value: T) => boolean): boolean {
    if (array) {
        if (predicate) {
            for (const v of array) {
                if (predicate(v)) {
                    return true;
                }
            }
        }
        else {
            return array.length > 0;
        }
    }
    return false;
}

export function concatenate<T>(array1: T[], array2: T[]): T[] {
    if (!some(array2)) return array1;
    if (!some(array1)) return array2;
    return [...array1, ...array2];
}

export function isParameter(node: Node): node is ParameterDeclaration {
    return node.kind === ts.SyntaxKind.Parameter;
}

export function getJSDocParameterTags(param: Node): JSDocParameterTag[] {
    if (!isParameter(param)) {
        return undefined;
    }
    const func = param.parent as FunctionLikeDeclaration;
    const tags = getJSDocTags(func, ts.SyntaxKind.JSDocParameterTag) as JSDocParameterTag[];
    if (!param.name) {
        // this is an anonymous jsdoc param from a `function(type1, type2): type3` specification
        const i = func.parameters.indexOf(param);
        const paramTags = filter(tags, tag => tag.kind === ts.SyntaxKind.JSDocParameterTag);
        if (paramTags && 0 <= i && i < paramTags.length) {
            return [paramTags[i]];
        }
    }
    else if (param.name.kind === ts.SyntaxKind.Identifier) {
        const name = (param.name as Identifier).text;
        return filter(tags, tag => tag.kind === ts.SyntaxKind.JSDocParameterTag && tag.parameterName.text === name);
    }
    else {
        // TODO: it's a destructured parameter, so it should look up an "object type" series of multiple lines
        // But multi-line object types aren't supported yet either
        return undefined;
    }
}

export let JSDocTagsParser = (function() {

    let _getJSDocs = (node: Node):(JSDoc | JSDocTag)[] => {
        //console.log('getJSDocs: ', node);
        let cache: (JSDoc | JSDocTag)[] = node.jsDocCache;
        if (!cache) {
            getJSDocsWorker(node);
            node.jsDocCache = cache;
        }
        return cache;

        function getJSDocsWorker(node: Node) {
            const parent = node.parent;
            // Try to recognize this pattern when node is initializer of variable declaration and JSDoc comments are on containing variable statement.
            // /**
            //   * @param {number} name
            //   * @returns {number}
            //   */
            // var x = function(name) { return name.length; }
            const isInitializerOfVariableDeclarationInStatement =
                isVariableLike(parent) &&
                parent.initializer === node &&
                parent.parent.parent.kind === ts.SyntaxKind.VariableStatement;
            const isVariableOfVariableDeclarationStatement = isVariableLike(node) &&
                parent.parent.kind === ts.SyntaxKind.VariableStatement;
            const variableStatementNode =
                isInitializerOfVariableDeclarationInStatement ? parent.parent.parent :
                isVariableOfVariableDeclarationStatement ? parent.parent :
                undefined;
            if (variableStatementNode) {
                getJSDocsWorker(variableStatementNode);
            }

            // Also recognize when the node is the RHS of an assignment expression
            const isSourceOfAssignmentExpressionStatement =
                parent && parent.parent &&
                parent.kind === ts.SyntaxKind.BinaryExpression &&
                (parent as BinaryExpression).operatorToken.kind === ts.SyntaxKind.EqualsToken &&
                parent.parent.kind === ts.SyntaxKind.ExpressionStatement;
            if (isSourceOfAssignmentExpressionStatement) {
                getJSDocsWorker(parent.parent);
            }

            const isModuleDeclaration = node.kind === ts.SyntaxKind.ModuleDeclaration &&
                parent && parent.kind === ts.SyntaxKind.ModuleDeclaration;
            const isPropertyAssignmentExpression = parent && parent.kind === ts.SyntaxKind.PropertyAssignment;
            if (isModuleDeclaration || isPropertyAssignmentExpression) {
                getJSDocsWorker(parent);
            }

            // Pull parameter comments from declaring function as well
            if (node.kind === ts.SyntaxKind.Parameter) {
                cache = concatenate(cache, getJSDocParameterTags(node));
            }

            if (isVariableLike(node) && node.initializer) {
                cache = concatenate(cache, node.initializer.jsDoc);
            }

            cache = concatenate(cache, node.jsDoc);
        }
    }

    return {
        getJSDocs: _getJSDocs
    }
})();
