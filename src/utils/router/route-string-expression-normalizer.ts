import { Node, SyntaxKind, ts } from 'ts-morph';

export class RouteStringExpressionNormalizer {
    private readonly routeStringProperties = new Set(['path', 'redirectTo', 'outlet', 'pathMatch']);

    public isRouteStringExpression(
        node: Node,
        isVariableRoutes: (node: ts.Node) => boolean
    ): boolean {
        if (!this.isInsideRoutesVariableStatement(node, isVariableRoutes)) {
            return false;
        }

        const propertyAssignment = node.getFirstAncestorByKind(SyntaxKind.PropertyAssignment);
        if (!propertyAssignment) {
            return false;
        }

        return this.routeStringProperties.has(propertyAssignment.getName());
    }

    public stringifyTemplateExpression(templateNode: ts.TemplateExpression): string {
        let resolved = templateNode.head.text || '';

        for (const span of templateNode.templateSpans) {
            const expressionText = this.stripTemplateExpressionQuotes(span.expression.getText());
            resolved += expressionText + (span.literal.text || '');
        }

        return JSON.stringify(resolved);
    }

    private isInsideRoutesVariableStatement(
        node: Node,
        isVariableRoutes: (node: ts.Node) => boolean
    ): boolean {
        let foundParentVariableStatement = false;
        node.getParentWhile(parent => {
            if (parent.getKind() === SyntaxKind.VariableStatement) {
                if (isVariableRoutes(parent.compilerNode)) {
                    foundParentVariableStatement = true;
                }
            }
            return true;
        });
        return foundParentVariableStatement;
    }

    private stripTemplateExpressionQuotes(expression: string): string {
        const expressionText = expression.trim();
        if (
            (expressionText.startsWith('"') && expressionText.endsWith('"')) ||
            (expressionText.startsWith("'") && expressionText.endsWith("'")) ||
            (expressionText.startsWith('`') && expressionText.endsWith('`'))
        ) {
            return expressionText.slice(1, -1);
        }
        return expressionText;
    }
}
