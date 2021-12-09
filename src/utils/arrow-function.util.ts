import { SyntaxKind } from 'ts-morph';

export function StringifyArrowFunction(af) {
    let i = 0,
        result = '(';
    const len = af.parameters.length;
    if (len === 1) {
        result = '';
    }
    for (i; i < len; i++) {
        if (af.parameters[i].name && af.parameters[i].name.escapedText) {
            result += af.parameters[i].name.escapedText;
        }
        if (i < len - 1) {
            result += ', ';
        }
    }
    if (len > 1 || len === 0) {
        result += ')';
    }
    // body
    result += ' => ';
    if (af.body) {
        if (af.body.kind === SyntaxKind.Identifier && af.body.escapedText) {
            result += af.body.escapedText;
        } else if (
            af.body.kind === SyntaxKind.PropertyAccessExpression &&
            af.body.expression &&
            af.body.name
        ) {
            result += af.body.expression.escapedText;
            result += '.' + af.body.name.escapedText;
        } else if (af.body.kind === SyntaxKind.StringLiteral && af.body.text) {
            result += af.body.text;
        }
    }
    return result;
}
