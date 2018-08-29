import { ClassHelper } from '../class-helper';
import { ts, SyntaxKind } from 'ts-simple-ast';
import { expect } from 'chai';

describe(ClassHelper.name + ' visitType', () => {
    let classHelper: ClassHelper;

    beforeEach(() => {
        classHelper = new ClassHelper(undefined, undefined);
    });

    describe('when given a callsignature', () => {
        it('should convert number array', () => {
            let elementType = ts.createKeywordTypeNode(SyntaxKind.NumberKeyword);
            let arrayType = ts.createArrayTypeNode(elementType);
            let result = ts.createCallSignature([], [], arrayType);

            let helperResult = classHelper.visitType(result);

            expect(helperResult).to.equal('number[]');
        });

        it('should convert a type with a single generic argument', () => {
            let elementType = ts.createKeywordTypeNode(SyntaxKind.NumberKeyword);
            let genericType = ts.createTypeReferenceNode('SomeType', [elementType]);
            let result = ts.createCallSignature([], [], genericType);

            let helperResult = classHelper.visitType(result);

            expect(helperResult).to.equal('SomeType<number>');
        });

        it('should convert a type with a union argument', () => {
            let numberType = ts.createKeywordTypeNode(SyntaxKind.NumberKeyword);
            let stringType = ts.createKeywordTypeNode(SyntaxKind.StringKeyword);
            let genericType = ts.createTypeReferenceNode('SomeType', [numberType, stringType]);
            let result = ts.createCallSignature([], [], genericType);

            let helperResult = classHelper.visitType(result);

            expect(helperResult).to.equal('SomeType<number | string>');
        });
    });
});
