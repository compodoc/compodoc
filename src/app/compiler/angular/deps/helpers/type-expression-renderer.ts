import { ts, SyntaxKind } from 'ts-morph';

import { kindToType } from '../../../../../utils/kind-to-type';
import { TypeExpressionResolver } from './type-expression-resolver';

export class TypeExpressionRenderer {
    constructor(private readonly typeExpressionResolver: TypeExpressionResolver) {}

    public visitTypeName(typeName: any): any {
        if (typeName.escapedText) {
            return typeName.escapedText;
        }
        if (typeName.text) {
            return typeName.text;
        }
        if ((typeName as any).left && (typeName as any).right) {
            return (
                this.visitTypeName((typeName as any).left) +
                '.' +
                this.visitTypeName((typeName as any).right)
            );
        }
        return '';
    }

    public visitTypeIndex(node: any): string {
        let result = '';

        if (!node) {
            return result;
        }

        if (
            node.type &&
            node.type.kind === SyntaxKind.IndexedAccessType &&
            node.type.indexType &&
            node.type.indexType.literal
        ) {
            return this.visitTypeName(node.type.indexType.literal);
        }

        return result;
    }

    public visitType(node: any): string {
        let result = 'void';

        if (!node) {
            return result;
        }

        if (ts.isTypeOperatorNode(node)) {
            const operator = this.typeExpressionResolver.getOperatorKeyword(node.operator);
            const operand = this.visitType(node.type);
            return operand ? `${operator} ${operand}` : operator;
        }

        if (ts.isTypeQueryNode(node)) {
            return `typeof ${this.visitTypeName(node.exprName as any)}`;
        }

        if (node.typeName) {
            result = this.visitTypeName(node.typeName);
        } else if (node.type) {
            if (ts.isTypeOperatorNode(node.type)) {
                const operator = this.typeExpressionResolver.getOperatorKeyword(node.type.operator);
                const operand = this.visitType(node.type.type);
                result = operand ? `${operator} ${operand}` : operator;
            }
            if (ts.isTypeQueryNode(node.type)) {
                result = `typeof ${this.visitTypeName(node.type.exprName as any)}`;
            }
            if (
                node.type.kind &&
                !ts.isTypeLiteralNode(node.type) &&
                !ts.isTypeOperatorNode(node.type) &&
                !ts.isTypeQueryNode(node.type) &&
                !ts.isUnionTypeNode(node.type) &&
                !ts.isTupleTypeNode(node.type) &&
                !ts.isIntersectionTypeNode(node.type)
            ) {
                result = kindToType(node.type.kind);
            }
            if (node.type.typeName) {
                result = this.visitTypeName(node.type.typeName);
            }
            if (ts.isTypeLiteralNode(node.type) && node.type.members) {
                result = this.stringifyTypeLiteral(node.type);
            }
            if (node.type.typeArguments) {
                result += '<';
                const typeArguments = [];
                for (const argument of node.type.typeArguments) {
                    typeArguments.push(this.visitType(argument));
                }
                result += typeArguments.join(' | ');
                result += '>';
            }
            if (node.type.elementType) {
                const firstPart = this.visitType(node.type.elementType);
                result = firstPart + kindToType(node.type.kind);
                if (node.type.elementType.kind === SyntaxKind.ParenthesizedType) {
                    result = '(' + firstPart + ')' + kindToType(node.type.kind);
                }
            }

            const parseTypesOrElements = (arr: any[], separator: any) => {
                let i = 0;
                const len = arr.length;
                for (i; i < len; i++) {
                    const type = arr[i];

                    if (type.elementType) {
                        const firstPart = this.visitType(type.elementType);
                        if (type.elementType.kind === SyntaxKind.ParenthesizedType) {
                            result += '(' + firstPart + ')' + kindToType(type.kind);
                        } else {
                            result += firstPart + kindToType(type.kind);
                        }
                    } else {
                        if (ts.isLiteralTypeNode(type) && type.literal) {
                            if ((type.literal as any).text) {
                                result += '"' + (type.literal as any).text + '"';
                            } else {
                                result += kindToType(type.literal.kind);
                            }
                        } else if ((type as any).typeName) {
                            result += this.visitTypeName((type as any).typeName);
                        } else if (type.kind === SyntaxKind.RestType && type.type) {
                            result += '...' + this.visitType(type.type);
                        } else if (ts.isIntersectionTypeNode(type) && type.types) {
                            const parts: string[] = [];
                            for (const t of type.types) {
                                parts.push(this.visitType(t));
                            }
                            result += parts.join(' & ');
                        } else {
                            result += kindToType(type.kind);
                        }
                        if (type.typeArguments) {
                            result += '<';
                            const typeArguments = [];
                            for (const argument of type.typeArguments) {
                                typeArguments.push(this.visitType(argument));
                            }
                            result += typeArguments.join(separator);
                            result += '>';
                        }
                    }
                    if (i < len - 1) {
                        result += separator;
                    }
                }
            };

            if (node.type.elements && ts.isTupleTypeNode(node.type)) {
                result = '[';
                parseTypesOrElements(node.type.elements, ', ');
                result += ']';
            }
            if (node.type.types && ts.isUnionTypeNode(node.type)) {
                result = '';
                parseTypesOrElements(node.type.types, ' | ');
            }
            if (node.type.types && ts.isIntersectionTypeNode(node.type)) {
                result = '';
                parseTypesOrElements(node.type.types, ' & ');
            }
            if (node.type.elementTypes) {
                const elementTypes = node.type.elementTypes;
                let i = 0;
                const len = elementTypes.length;
                if (len > 0) {
                    result = '[';

                    for (i; i < len; i++) {
                        const type = elementTypes[i];
                        if (type.kind === SyntaxKind.ArrayType && type.elementType) {
                            result += kindToType(type.elementType.kind);
                            result += kindToType(type.kind);
                        } else if ((type as any).typeName) {
                            result += this.visitTypeName((type as any).typeName);
                        } else {
                            result += kindToType(type.kind);
                        }
                        if (ts.isLiteralTypeNode(type) && type.literal) {
                            if ((type.literal as any).text) {
                                result += '"' + (type.literal as any).text + '"';
                            } else {
                                result += kindToType(type.literal.kind);
                            }
                        }
                        if (type.kind === SyntaxKind.RestType && type.type) {
                            result += '...' + this.visitType(type.type);
                        }

                        if (
                            type.kind === SyntaxKind.TypeReference &&
                            type.typeName &&
                            typeof type.typeName.escapedText !== 'undefined' &&
                            type.typeName.escapedText === ''
                        ) {
                            continue;
                        }
                        if (i < len - 1) {
                            result += ', ';
                        }
                    }
                    result += ']';
                }
            }
            if (
                node.type &&
                node.type.kind === SyntaxKind.IndexedAccessType &&
                node.type.objectType
            ) {
                if (node.type.objectType.typeName) {
                    result = this.visitTypeName(node.type.objectType.typeName);
                } else {
                    result = this.visitType(node.type);
                }
            }
        } else if (node.elementType) {
            result = kindToType(node.elementType.kind) + kindToType(node.kind);
            if (node.elementType.typeName) {
                result = this.visitTypeName(node.elementType.typeName) + kindToType(node.kind);
            }
        } else if (ts.isTypeOperatorNode(node)) {
            const operator = this.typeExpressionResolver.getOperatorKeyword(node.operator);
            const operand = this.visitType(node.type);
            result = operand ? `${operator} ${operand}` : operator;
        } else if (ts.isTypeQueryNode(node)) {
            result = `typeof ${this.visitTypeName(node.exprName as any)}`;
        } else if (node.types && ts.isUnionTypeNode(node)) {
            result = '';
            let i = 0;
            const len = node.types.length;
            for (i; i < len; i++) {
                const type = node.types[i];
                if (ts.isLiteralTypeNode(type) && type.literal) {
                    if ((type.literal as any).text) {
                        result += '"' + (type.literal as any).text + '"';
                    } else {
                        result += kindToType(type.literal.kind);
                    }
                } else if ((type as any).typeName) {
                    result += this.visitTypeName((type as any).typeName);
                } else {
                    result += kindToType(type.kind);
                }
                if (i < len - 1) {
                    result += ' | ';
                }
            }
        } else if (node.types && ts.isIntersectionTypeNode(node)) {
            result = '';
            let i = 0;
            const len = node.types.length;
            for (i; i < len; i++) {
                const type = node.types[i];
                if (ts.isLiteralTypeNode(type) && type.literal) {
                    if ((type.literal as any).text) {
                        result += '"' + (type.literal as any).text + '"';
                    } else {
                        result += kindToType(type.literal.kind);
                    }
                } else if ((type as any).typeName) {
                    result += this.visitTypeName((type as any).typeName);
                } else {
                    result += this.visitType(type);
                }
                if (i < len - 1) {
                    result += ' & ';
                }
            }
        } else if (node.kind === SyntaxKind.IndexedAccessType && node.objectType) {
            let objectTypePart = '';
            if (node.objectType.typeName) {
                objectTypePart = this.visitTypeName(node.objectType.typeName);
            } else {
                objectTypePart = this.visitType(node.objectType);
            }
            let indexTypePart = '';
            if (
                node.indexType &&
                ts.isLiteralTypeNode(node.indexType) &&
                (node.indexType.literal as any).text
            ) {
                indexTypePart = (node.indexType.literal as any).text;
            } else if (node.indexType) {
                indexTypePart = this.visitType(node.indexType);
            }
            result = `${objectTypePart}['${indexTypePart}']`;
        } else if (node.dotDotDotToken) {
            result = 'any[]';
        } else {
            result = kindToType(node.kind);

            if (node.kind === SyntaxKind.TypeLiteral && node.members) {
                result = this.stringifyTypeLiteral(node as ts.TypeLiteralNode);
            }

            if (
                (result === '' || result === 'unknown') &&
                node.initializer &&
                node.initializer.kind &&
                (node.kind === SyntaxKind.PropertyDeclaration || node.kind === SyntaxKind.Parameter)
            ) {
                result = kindToType(node.initializer.kind);
            }
            if (node.kind === SyntaxKind.TypeParameter) {
                result = node.name.text;
            }
            if (node.kind === SyntaxKind.LiteralType) {
                result = node.literal.text;
            }
        }
        if (node.typeArguments && node.typeArguments.length > 0) {
            result += '<';
            let i = 0;
            const len = node.typeArguments.length;
            for (i; i < len; i++) {
                const argument = node.typeArguments[i];
                result += this.visitType(argument);
                if (i >= 0 && i < len - 1) {
                    result += ', ';
                }
            }
            result += '>';
        }
        return result;
    }

    private stringifyTypeLiteral(node: ts.TypeLiteralNode): string {
        const memberStrings: string[] = [];
        for (const member of node.members) {
            if (ts.isPropertySignature(member) && member.name && member.type) {
                const memberName = (member.name as any).text || (member.name as any).escapedText;
                const memberType = this.visitType(member.type);
                const optionalMarker = member.questionToken ? '?' : '';
                memberStrings.push(`${memberName}${optionalMarker}: ${memberType}`);
            } else if (ts.isMethodSignature(member) && member.name) {
                const memberName = (member.name as any).text || (member.name as any).escapedText;
                const returnType = member.type ? this.visitType(member.type) : 'void';
                let parameters = '';
                if (member.parameters && member.parameters.length > 0) {
                    parameters = member.parameters
                        .map(param => {
                            const paramName = param.name
                                ? (param.name as any).text || (param.name as any).escapedText
                                : '';
                            const paramType = param.type ? this.visitType(param.type) : 'any';
                            const optionalMarker = param.questionToken ? '?' : '';
                            return `${paramName}${optionalMarker}: ${paramType}`;
                        })
                        .join(', ');
                }
                memberStrings.push(`${memberName}(${parameters}): ${returnType}`);
            }
        }
        return `{ ${memberStrings.join('; ')} }`;
    }
}
