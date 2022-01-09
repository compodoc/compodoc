import { SyntaxKind } from 'ts-morph';

export enum KindType {
    UNKNOWN = '',
    STRING = 'string',
    NUMBER = 'number',
    ARRAY = '[]',
    VOID = 'void',
    FUNCTION = 'function',
    TEMPLATE_LITERAL = 'template literal type',
    LITERAL = 'literal type',
    BOOLEAN = 'boolean',
    ANY = 'any',
    NULL = 'null',
    SYMBOL = 'symbol',
    NEVER = 'never',
    UNDEFINED = 'undefined',
    OBJECT = 'object'
}

export type IsKindTypeMethods = {
    [key in keyof typeof KindType]: (kind: number) => boolean;
};

export const IsKindType: IsKindTypeMethods = {
    ANY(kind: number): boolean {
        return kindToType(kind) === KindType.ANY;
    },
    ARRAY(kind: number): boolean {
        return kindToType(kind) === KindType.ARRAY;
    },
    BOOLEAN(kind: number): boolean {
        return kindToType(kind) === KindType.BOOLEAN;
    },
    FUNCTION(kind: number): boolean {
        return kindToType(kind) === KindType.FUNCTION;
    },
    LITERAL(kind: number): boolean {
        return kindToType(kind) === KindType.LITERAL;
    },
    NEVER(kind: number): boolean {
        return kindToType(kind) === KindType.NEVER;
    },
    NULL(kind: number): boolean {
        return kindToType(kind) === KindType.NULL;
    },
    NUMBER(kind: number): boolean {
        return kindToType(kind) === KindType.NUMBER;
    },
    OBJECT(kind: number): boolean {
        return kindToType(kind) === KindType.OBJECT;
    },
    STRING(kind: number): boolean {
        return kindToType(kind) === KindType.STRING;
    },
    SYMBOL(kind: number): boolean {
        return kindToType(kind) === KindType.SYMBOL;
    },
    TEMPLATE_LITERAL(kind: number): boolean {
        return kindToType(kind) === KindType.TEMPLATE_LITERAL;
    },
    UNDEFINED(kind: number): boolean {
        return kindToType(kind) === KindType.UNDEFINED;
    },
    UNKNOWN(kind: number): boolean {
        return kindToType(kind) === KindType.UNKNOWN;
    },
    VOID(kind: number): boolean {
        return kindToType(kind) === KindType.VOID;
    }
};

export function kindToType(kind: number): KindType {
    let _type = KindType.UNKNOWN;
    switch (kind) {
        case SyntaxKind.StringKeyword:
        case SyntaxKind.StringLiteral:
            _type = KindType.STRING;
            break;
        case SyntaxKind.NumberKeyword:
        case SyntaxKind.NumericLiteral:
            _type = KindType.NUMBER;
            break;
        case SyntaxKind.ArrayType:
        case SyntaxKind.ArrayLiteralExpression:
            _type = KindType.ARRAY;
            break;
        case SyntaxKind.VoidKeyword:
            _type = KindType.VOID;
            break;
        case SyntaxKind.FunctionType:
            _type = KindType.FUNCTION;
            break;
        case SyntaxKind.TemplateLiteralType:
            _type = KindType.TEMPLATE_LITERAL;
            break;
        case SyntaxKind.TypeLiteral:
            _type = KindType.LITERAL;
            break;
        case SyntaxKind.BooleanKeyword:
            _type = KindType.BOOLEAN;
            break;
        case SyntaxKind.AnyKeyword:
            _type = KindType.ANY;
            break;
        case SyntaxKind.NullKeyword:
            _type = KindType.NULL;
            break;
        case SyntaxKind.SymbolKeyword:
            _type = KindType.SYMBOL;
            break;
        case SyntaxKind.NeverKeyword:
            _type = KindType.NEVER;
            break;
        case SyntaxKind.UndefinedKeyword:
            _type = KindType.UNDEFINED;
            break;
        case SyntaxKind.ObjectKeyword:
        case SyntaxKind.ObjectLiteralExpression:
            _type = KindType.OBJECT;
            break;
    }
    return _type;
}
