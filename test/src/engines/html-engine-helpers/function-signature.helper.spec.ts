import { expect } from 'chai';
import * as sinon from 'sinon';
import { FunctionSignatureHelper } from '../../../../src/app/engines/html-engine-helpers/function-signature.helper';
import DependenciesEngine from '../../../../src/app/engines/dependencies.engine';
import AngularVersionUtil from '../../../../src/utils/angular-version.util';
import BasicTypeUtil from '../../../../src/utils/basic-type.util';

describe('Engines - FunctionSignatureHelper', () => {
    let helper: FunctionSignatureHelper;
    let findStub: sinon.SinonStub;
    let apiLinkStub: sinon.SinonStub;
    let isKnownTypeStub: sinon.SinonStub;
    let typeUrlStub: sinon.SinonStub;

    beforeEach(() => {
        helper = new FunctionSignatureHelper();
        findStub = sinon.stub(DependenciesEngine, 'find');
        apiLinkStub = sinon.stub(AngularVersionUtil, 'getApiLink');
        isKnownTypeStub = sinon.stub(BasicTypeUtil, 'isKnownType');
        typeUrlStub = sinon.stub(BasicTypeUtil, 'getTypeUrl');
    });

    afterEach(() => {
        findStub.restore();
        apiLinkStub.restore();
        isKnownTypeStub.restore();
        typeUrlStub.restore();
    });

    describe('buildHrefForInternalType', () => {
        it('should generate correct href for type alias', () => {
            const resultData = {
                type: 'miscellaneous',
                subtype: 'typealias',
                name: 'StatusType'
            };

            const href = helper['buildHrefForInternalType'](resultData);
            expect(href).to.equal('../miscellaneous/typealiases.html#StatusType');
        });

        it('should generate correct href for enum', () => {
            const resultData = {
                type: 'miscellaneous',
                subtype: 'enum',
                name: 'StatusEnum'
            };

            const href = helper['buildHrefForInternalType'](resultData);
            expect(href).to.equal('../miscellaneous/enumerations.html#StatusEnum');
        });

        it('should generate correct href for function', () => {
            const resultData = {
                type: 'miscellaneous',
                subtype: 'function',
                name: 'myFunction'
            };

            const href = helper['buildHrefForInternalType'](resultData);
            expect(href).to.equal('../miscellaneous/functions.html#myFunction');
        });

        it('should generate correct href for variable', () => {
            const resultData = {
                type: 'miscellaneous',
                subtype: 'variable',
                name: 'MY_CONSTANT'
            };

            const href = helper['buildHrefForInternalType'](resultData);
            expect(href).to.equal('../miscellaneous/variables.html#MY_CONSTANT');
        });

        it('should handle miscellaneous with ctype', () => {
            const resultData = {
                ctype: 'miscellaneous',
                subtype: 'typealias',
                name: 'CallbackType'
            };

            const href = helper['buildHrefForInternalType'](resultData);
            expect(href).to.equal('../miscellaneous/typealiases.html#CallbackType');
        });

        it('should generate correct href for regular class', () => {
            const resultData = {
                type: 'class',
                name: 'MyClass'
            };

            const href = helper['buildHrefForInternalType'](resultData);
            expect(href).to.equal('../classes/MyClass.html');
        });

        it('should generate correct href for interface', () => {
            const resultData = {
                type: 'interface',
                name: 'MyInterface'
            };

            const href = helper['buildHrefForInternalType'](resultData);
            expect(href).to.equal('../interfaces/MyInterface.html');
        });

        it('should generate correct href for directive', () => {
            const resultData = {
                type: 'directive',
                name: 'MyDirective'
            };

            const href = helper['buildHrefForInternalType'](resultData);
            expect(href).to.equal('../directives/MyDirective.html');
        });
    });

    describe('helperFunc', () => {
        it('should handle method with no arguments', () => {
            const context = {};
            const method = {
                name: 'myMethod',
                args: []
            };

            const result = helper.helperFunc(context, method);
            expect(result).to.equal('myMethod()');
        });

        it('should include generic type parameters in method signature', () => {
            findStub.returns(null);
            isKnownTypeStub.returns(false);

            const context = {};
            const method = {
                name: 'mapValue',
                typeParameters: ['T', 'R extends Record<string, unknown>'],
                args: [
                    {
                        name: 'value',
                        type: 'T',
                        optional: false
                    }
                ]
            };

            const result = helper.helperFunc(context, method);
            expect(result).to.contain(
                'mapValue&lt;T, R extends Record<string, unknown>&gt;(value: T)'
            );
        });

        it('should handle method with internal type argument', () => {
            findStub.returns({
                source: 'internal',
                data: {
                    type: 'miscellaneous',
                    subtype: 'typealias',
                    name: 'StatusType'
                }
            });

            const context = {};
            const method = {
                name: 'setStatus',
                args: [
                    {
                        name: 'status',
                        type: 'StatusType',
                        optional: false
                    }
                ]
            };

            const result = helper.helperFunc(context, method);
            expect(result).to.contain('../miscellaneous/typealiases.html#StatusType');
            expect(result).to.contain('status');
        });

        it('should handle method with angular type argument', () => {
            findStub.returns({
                source: 'angular',
                data: {
                    name: 'ActivatedRoute'
                }
            });

            apiLinkStub.returns('https://angular.io/api/router/ActivatedRoute');

            const context = {};
            const method = {
                name: 'constructor',
                args: [
                    {
                        name: 'route',
                        type: 'ActivatedRoute',
                        optional: false
                    }
                ]
            };

            const result = helper.helperFunc(context, method);
            expect(result).to.contain('https://angular.io/api/router/ActivatedRoute');
            expect(result).to.contain('reference-badge--angular');
            expect(result).to.contain('>A</span>');
        });

        it('should handle method with basic type argument', () => {
            findStub.returns(null);
            isKnownTypeStub.returns(true);
            typeUrlStub.returns('https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String');

            const context = {};
            const method = {
                name: 'setText',
                args: [
                    {
                        name: 'text',
                        type: 'string',
                        optional: false
                    }
                ]
            };

            const result = helper.helperFunc(context, method);
            expect(result).to.contain('setText');
            expect(result).to.contain('text');
        });

        it('should handle method with optional argument', () => {
            findStub.returns(null);
            isKnownTypeStub.returns(false);

            const context = {};
            const method = {
                name: 'myMethod',
                args: [
                    {
                        name: 'optional',
                        type: 'string',
                        optional: true
                    }
                ]
            };

            const result = helper.helperFunc(context, method);
            expect(result).to.contain('optional?');
        });

        it('should handle method with rest parameters', () => {
            findStub.returns(null);
            isKnownTypeStub.returns(false);

            const context = {};
            const method = {
                name: 'concat',
                args: [
                    {
                        name: 'items',
                        type: 'string[]',
                        dotDotDotToken: true,
                        optional: false
                    }
                ]
            };

            const result = helper.helperFunc(context, method);
            expect(result).to.contain('...items');
        });

        it('should handle method with multiple arguments', () => {
            findStub.withArgs('StatusType').returns({
                source: 'internal',
                data: {
                    type: 'miscellaneous',
                    subtype: 'typealias',
                    name: 'StatusType'
                }
            });

            findStub.withArgs('string').returns(null);
            isKnownTypeStub.returns(true);
            typeUrlStub.returns('https://developer.mozilla.org/...');

            const context = {};
            const method = {
                name: 'updateStatus',
                args: [
                    {
                        name: 'status',
                        type: 'StatusType',
                        optional: false
                    },
                    {
                        name: 'message',
                        type: 'string',
                        optional: false
                    }
                ]
            };

            const result = helper.helperFunc(context, method);
            expect(result).to.contain('updateStatus');
            expect(result).to.contain('status');
            expect(result).to.contain('message');
            expect(result).to.contain(', ');
        });

        it('should handle method without name', () => {
            const context = {};
            const method = {
                args: [
                    {
                        name: 'x',
                        type: 'number',
                        optional: false
                    }
                ]
            };

            findStub.returns(null);
            isKnownTypeStub.returns(false);

            const result = helper.helperFunc(context, method);
            expect(result).to.match(/^\(.*\)$/);
        });

        it('should handle destructured parameters', () => {
            findStub.returns(null);
            isKnownTypeStub.returns(false);

            const context = {};
            const method = {
                name: 'myMethod',
                args: [
                    {
                        name: 'id',
                        type: 'number',
                        destructuredParameter: true,
                        optional: false
                    },
                    {
                        name: 'name',
                        type: 'string',
                        destructuredParameter: true,
                        optional: false
                    }
                ]
            };

            const result = helper.helperFunc(context, method);
            expect(result).to.contain('__namedParameters');
            expect(result).to.contain('{');
            expect(result).to.contain('}');
        });

        it('should handle arguments without type', () => {
            findStub.returns(null);
            isKnownTypeStub.returns(false);

            const context = {};
            const method = {
                name: 'myMethod',
                args: [
                    {
                        name: 'unknown',
                        optional: false
                    }
                ]
            };

            const result = helper.helperFunc(context, method);
            expect(result).to.contain('unknown');
        });
    });

    describe('handleFunction', () => {
        it('should handle function with no parameters', () => {
            const arg = {
                name: 'callback',
                function: [],
                optional: false
            };

            const result = helper['handleFunction'](arg);
            expect(result).to.contain('callback');
            expect(result).to.contain('() => void');
        });

        it('should handle function with internal type parameters', () => {
            findStub.returns({
                source: 'internal',
                data: {
                    type: 'miscellaneous',
                    subtype: 'typealias',
                    name: 'StatusType'
                }
            });

            const arg = {
                name: 'handler',
                function: [
                    {
                        name: 'status',
                        type: 'StatusType'
                    }
                ],
                optional: false
            };

            const result = helper['handleFunction'](arg);
            expect(result).to.contain('handler');
            expect(result).to.contain('../miscellaneous/typealiases.html#StatusType');
        });

        it('should handle function with unknown types', () => {
            findStub.returns(null);
            isKnownTypeStub.returns(false);

            const arg = {
                name: 'callback',
                function: [
                    {
                        name: 'data',
                        type: 'CustomType'
                    }
                ],
                optional: false
            };

            const result = helper['handleFunction'](arg);
            expect(result).to.contain('callback');
            expect(result).to.contain('data: CustomType');
        });
    });
});
