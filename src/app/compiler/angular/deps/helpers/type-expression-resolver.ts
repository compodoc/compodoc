import { ts, SyntaxKind } from 'ts-morph';

import { kindToType } from '../../../../../utils/kind-to-type';

export class TypeExpressionResolver {
    constructor(private readonly typeChecker: ts.TypeChecker) {}

    public getOperatorKeyword(operator: SyntaxKind): string {
        switch (operator) {
            case SyntaxKind.KeyOfKeyword:
                return 'keyof';
            case SyntaxKind.UniqueKeyword:
                return 'unique';
            case SyntaxKind.ReadonlyKeyword:
                return 'readonly';
            default:
                return kindToType(operator);
        }
    }

    public tryResolve(node: ts.Node, enclosingDeclaration?: ts.Node): string | undefined {
        if (
            !this.typeChecker ||
            typeof this.typeChecker.getTypeAtLocation !== 'function' ||
            typeof this.typeChecker.typeToString !== 'function'
        ) {
            return undefined;
        }

        try {
            const resolvedType = this.typeChecker.getTypeAtLocation(node);
            const typeAsString = this.typeChecker.typeToString(
                resolvedType,
                enclosingDeclaration || node,
                ts.TypeFormatFlags.NoTruncation
            );

            if (typeAsString && typeAsString !== 'unknown') {
                return typeAsString;
            }
            // tslint:disable-next-line:no-empty
        } catch (_error) {}

        return undefined;
    }

    public shouldResolve(typeNode: ts.TypeNode, typeName: string): boolean {
        if (ts.isTypeOperatorNode(typeNode)) {
            return true;
        }

        if (!ts.isTypeReferenceNode(typeNode)) {
            return false;
        }

        const utilityTypeNames = [
            'Awaited',
            'Partial',
            'Required',
            'Readonly',
            'Record',
            'Pick',
            'Omit',
            'Exclude',
            'Extract',
            'NonNullable',
            'Parameters',
            'ConstructorParameters',
            'ReturnType',
            'InstanceType',
            'ThisParameterType',
            'OmitThisParameter',
            'ThisType',
            'Uppercase',
            'Lowercase',
            'Capitalize',
            'Uncapitalize'
        ];

        if (utilityTypeNames.includes(typeName)) {
            return true;
        }

        return Boolean(
            typeNode.typeArguments?.some(
                argument => ts.isTypeOperatorNode(argument) || ts.isTypeQueryNode(argument)
            )
        );
    }
}
