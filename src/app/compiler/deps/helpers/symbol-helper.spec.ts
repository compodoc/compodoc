import { SymbolHelper } from './symbol-helper';
import * as ts from 'typescript';
import { expect } from 'chai';

describe(SymbolHelper.name, () => {
    let helper: SymbolHelper;

    beforeEach(() => {
        helper = new SymbolHelper();
    });

    describe('parseProviderConfiguration', () => {

        it('should handle property is identifier', () => {
            // { provide: APP_BASE_HREF, useValue: '/' }
            const provideProperty = ts.createPropertyAssignment('provide', ts.createIdentifier('APP_BASE_HREF'));
            const useValue = ts.createPropertyAssignment('useValue', ts.createLiteral('/'));

            const obj = ts.createObjectLiteral([provideProperty, useValue]);
            const result = helper.parseProviderConfiguration(obj);

            expect(result).to.equal('{ provide: APP_BASE_HREF, useValue: "/" }');
        });

        it('should handle property is array', () => {
            // { deps: ['d1', 'd2'] }

            const array = ts.createArrayLiteral([ts.createLiteral('d1'), ts.createLiteral('d2')]);

            const obj = ts.createObjectLiteral([ts.createPropertyAssignment('deps', array)]);
            const result = helper.parseProviderConfiguration(obj);

            expect(result).to.equal('{ deps: ["d1", "d2"] }');
        });

        it('should handle lambda', () => {
            // { useFactory: (d1, d2) => new Date() }

            const dateCall = ts.createNew(ts.createIdentifier('Date'), [], []);
            const arrowFunc = ts.createArrowFunction([], [],
                [
                    ts.createParameter([], [], undefined, 'd1'),
                    ts.createParameter([], [], undefined, 'd2')],
                undefined, ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken), dateCall);

            const obj = ts.createObjectLiteral([ts.createPropertyAssignment('useFactory', arrowFunc)]);
            const result = helper.parseProviderConfiguration(obj);

            expect(result).to.equal('{ useFactory: (d1, d2) => new Date() }');
        });
    });

    describe('buildIdentifierName', () => {
        it('should handle RouterModule.forRoot', () => {
            // "RouterModule.forRoot"
            const routerModule = ts.createIdentifier('RouterModule');
            const propertyAccess = ts.createPropertyAccess(routerModule, 'forRoot');

            const result = helper.buildIdentifierName(propertyAccess);

            expect(result).to.equal('RouterModule.forRoot');

        });
    });

    describe('parseSymbolElements', () => {
        it('should handle CallExpression and remove args', () => {
            // RouterModule.forRoot(args)
            const routerModule = ts.createIdentifier('RouterModule');
            const forRoot = ts.createPropertyAccess(routerModule, 'forRoot');

            const callExp = ts.createCall(forRoot, [], [ts.createLiteral('arg1')]);

            const result = helper.parseSymbolElements(callExp);

            expect(result).to.equal('RouterModule.forRoot(args)');
        });

        it('should handle sub-Module', () => {
            // Shared.Module
            const shared = ts.createIdentifier('Shared');
            const module = ts.createPropertyAccess(shared, 'Module');

            const result = helper.parseSymbolElements(module);

            expect(result).to.equal('Shared.Module');
        });

        it('should handle string literal', () => {
            // "./app.component.css"
            const stringLiteral = ts.createLiteral('./app.component.css');

            const result = helper.parseSymbolElements(stringLiteral);

            expect(result).to.equal('./app.component.css');
        });
    });
});
