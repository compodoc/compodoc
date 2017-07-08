const ts = require('typescript');

export function kindToType(kind: number): string {
    let _type = '';
    switch(kind) {
        case ts.SyntaxKind.StringKeyword:
            _type = 'string';
            break;
        case ts.SyntaxKind.NumberKeyword:
            _type = 'number';
            break;
        case ts.SyntaxKind.ArrayType:
            _type = '[]';
            break;
        case ts.SyntaxKind.VoidKeyword:
            _type = 'void';
            break;
        case ts.SyntaxKind.BooleanKeyword:
            _type = 'boolean';
            break;
        case ts.SyntaxKind.AnyKeyword:
            _type = 'any';
            break;
        case ts.SyntaxKind.NeverKeyword:
            _type = 'never';
            break;
        case ts.SyntaxKind.ObjectKeyword:
            _type = 'object';
            break;
    }
    return _type;
}
