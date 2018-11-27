import { SyntaxKind } from 'ts-simple-ast';

export function kindToType(kind: number): string {
    let _type = '';
    switch (kind) {
        case SyntaxKind.StringKeyword:
        case SyntaxKind.StringLiteral:
            _type = 'string';
            break;
        case SyntaxKind.NumberKeyword:
        case SyntaxKind.NumericLiteral:
            _type = 'number';
            break;
        case SyntaxKind.ArrayType:
        case SyntaxKind.ArrayLiteralExpression:
            _type = '[]';
            break;
        case SyntaxKind.VoidKeyword:
            _type = 'void';
            break;
        case SyntaxKind.FunctionType:
            _type = 'function';
            break;
        case SyntaxKind.TypeLiteral:
            _type = 'literal type';
            break;
        case SyntaxKind.BooleanKeyword:
            _type = 'boolean';
            break;
        case SyntaxKind.AnyKeyword:
            _type = 'any';
            break;
        case SyntaxKind.NullKeyword:
            _type = 'null';
            break;
        case SyntaxKind.SymbolKeyword:
            _type = 'symbol';
            break;
        case SyntaxKind.NeverKeyword:
            _type = 'never';
            break;
        case SyntaxKind.UndefinedKeyword:
            _type = 'undefined';
            break;
        case SyntaxKind.ObjectKeyword:
        case SyntaxKind.ObjectLiteralExpression:
            _type = 'object';
            break;
    }
    return _type;
}
