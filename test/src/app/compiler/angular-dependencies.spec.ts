import { expect } from 'chai';

describe('AngularDependencies', () => {
    let angularDependencies: any;

    beforeEach(() => {
        const { AngularDependencies } = require('../../../../src/app/compiler/angular-dependencies');
        angularDependencies = new AngularDependencies([], {
            tsconfigDirectory: process.cwd()
        });
    });

    describe('decorator detection', () => {
        it('should identify @Service as an injectable decorator', () => {
            const decorator = {
                expression: {
                    expression: { text: 'Service' }
                }
            };

            const isInjectable = (angularDependencies as any).isInjectable.bind(angularDependencies);

            expect(isInjectable(decorator)).to.be.true;
        });

        it('should treat @Service as an internal decorator', () => {
            const decorators = [
                {
                    expression: {
                        expression: { text: 'Service' }
                    }
                }
            ];

            const hasInternalDecorator = (angularDependencies as any).hasInternalDecorator.bind(
                angularDependencies
            );

            expect(hasInternalDecorator(decorators)).to.be.true;
        });
    });
});
