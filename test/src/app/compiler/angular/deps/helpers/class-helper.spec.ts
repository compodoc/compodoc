import { expect } from 'chai';
import { Project, SyntaxKind, ts } from 'ts-morph';
import * as sinon from 'sinon';
import { ClassHelper } from '../../../../../../../src/app/compiler/angular/deps/helpers/class-helper';
import { JsdocParserUtil } from '../../../../../../../src/utils/jsdoc-parser.util';

describe('ClassHelper', () => {
    let classHelper: ClassHelper;
    let typeChecker: ts.TypeChecker;
    let project: Project;
    let sourceFile: ts.SourceFile;
    let jsdocParserStub: sinon.SinonStubbedInstance<JsdocParserUtil>;

    beforeEach(() => {
        // Create a mock type checker
        typeChecker = {} as ts.TypeChecker;
        project = new Project();
        sourceFile = project.createSourceFile('test.ts', '').compilerNode;
        jsdocParserStub = sinon.createStubInstance(JsdocParserUtil);

        classHelper = new ClassHelper(typeChecker);
        // Replace the jsdocParserUtil with our stub
        (classHelper as any).jsdocParserUtil = jsdocParserStub;

        // Mock the utility functions
        const nodeUtil = require('../../../../../../../src/utils/node.util');
        sinon.stub(nodeUtil, 'nodeHasDecorator').callsFake((node: any) => {
            return node.decorators && node.decorators.length > 0;
        });
        sinon.stub(nodeUtil, 'getNodeDecorators').callsFake((node: any) => {
            return node.decorators || [];
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('constructor', () => {
        it('should create ClassHelper with provided typeChecker', () => {
            const helper = new ClassHelper(typeChecker);
            expect(helper).to.be.instanceOf(ClassHelper);
            expect(sourceFile).to.exist; // Use sourceFile to avoid linter warning
        });
    });

    describe('stringifyDefaultValue', () => {
        it('should return the text of a node if available', () => {
            const node = { getText: () => 'test value' } as any;
            const result = classHelper.stringifyDefaultValue(node);
            expect(result).to.equal('test value');
        });

        it('should return "false" for FalseKeyword', () => {
            const node = { kind: SyntaxKind.FalseKeyword } as any;
            const result = classHelper.stringifyDefaultValue(node);
            expect(result).to.equal('false');
        });

        it('should return "true" for TrueKeyword', () => {
            const node = { kind: SyntaxKind.TrueKeyword } as any;
            const result = classHelper.stringifyDefaultValue(node);
            expect(result).to.equal('true');
        });

        it('should return empty string for nodes without text or keywords', () => {
            const node = { kind: SyntaxKind.Unknown } as any;
            const result = classHelper.stringifyDefaultValue(node);
            expect(result).to.equal('');
        });
    });

    describe('visitType', () => {
        it('should return "void" for undefined node', () => {
            const result = classHelper.visitType(undefined);
            expect(result).to.equal('void');
        });

        it('should handle type with typeName', () => {
            const node = {
                typeName: { text: 'string' },
                typeArguments: []
            } as any;
            const result = classHelper.visitType(node);
            expect(result).to.equal('string');
        });

        it('should handle union types', () => {
            const node = {
                type: {
                    types: [
                        { kind: SyntaxKind.StringKeyword },
                        { kind: SyntaxKind.NumberKeyword }
                    ],
                    kind: SyntaxKind.UnionType
                }
            } as any;
            const result = classHelper.visitType(node);
            expect(result).to.equal('string | number');
        });

        it('should handle array types', () => {
            const node = {
                type: {
                    elementType: { kind: SyntaxKind.StringKeyword },
                    kind: SyntaxKind.ArrayType
                }
            } as any;
            const result = classHelper.visitType(node);
            expect(result).to.equal('string[]');
        });

        it('should handle type arguments', () => {
            const node = {
                typeName: { text: 'Array' },
                typeArguments: [
                    { kind: SyntaxKind.StringKeyword }
                ]
            } as any;
            const result = classHelper.visitType(node);
            expect(result).to.equal('Array<string>');
        });

        it('should handle IndexedAccessType as a direct node (e.g. as a generic type argument)', () => {
            const node = {
                kind: SyntaxKind.IndexedAccessType,
                objectType: {
                    typeName: { escapedText: 'BadgeComponent', text: 'BadgeComponent' }
                },
                indexType: {
                    kind: SyntaxKind.LiteralType,
                    literal: { text: 'color' }
                }
            } as any;
            const result = classHelper.visitType(node);
            expect(result).to.equal("BadgeComponent['color']");
        });

        it('should handle generic type with IndexedAccessType argument (issue #1574)', () => {
            const node = {
                type: {
                    kind: SyntaxKind.TypeReference,
                    typeName: { escapedText: 'UnwrapInputSignal', text: 'UnwrapInputSignal' },
                    typeArguments: [
                        {
                            kind: SyntaxKind.IndexedAccessType,
                            objectType: {
                                typeName: { escapedText: 'BadgeComponent', text: 'BadgeComponent' }
                            },
                            indexType: {
                                kind: SyntaxKind.LiteralType,
                                literal: { text: 'color' }
                            }
                        }
                    ]
                }
            } as any;
            const result = classHelper.visitType(node);
            expect(result).to.equal("UnwrapInputSignal<BadgeComponent['color']>");
        });
    });

    describe('visitTypeIndex', () => {
        it('should return empty string for undefined node', () => {
            const result = classHelper.visitTypeIndex(undefined);
            expect(result).to.equal('');
        });

        it('should handle indexed access types with literal', () => {
            const node = {
                type: {
                    indexType: {
                        literal: { text: 'key' }
                    },
                    kind: SyntaxKind.IndexedAccessType
                }
            } as any;
            const result = classHelper.visitTypeIndex(node);
            expect(result).to.equal('key');
        });
    });

    describe('visitClassDeclaration', () => {
        let mockSourceFile: ts.SourceFile;

        beforeEach(() => {
            mockSourceFile = project.createSourceFile('test-class.ts', '').compilerNode;
            jsdocParserStub.getMainCommentOfNode.returns('');
            jsdocParserStub.parseComment.returns('Test description');
        });

        it('should handle basic class declaration', () => {
            const classDeclaration = {
                name: { text: 'TestClass' },
                members: [],
                kind: SyntaxKind.ClassDeclaration
            } as any;

            const symbol = {
                valueDeclaration: classDeclaration,
                declarations: [classDeclaration]
            } as any;

            // Mock typeChecker.getSymbolAtLocation
            (typeChecker as any).getSymbolAtLocation = sinon.stub().returns(symbol);

            const result = classHelper.visitClassDeclaration('test.ts', classDeclaration, mockSourceFile);
            expect(result).to.be.an('array');
            expect(result[0]).to.have.property('description').that.includes('Test description');
        });

        it('should handle class with decorators', () => {
            const classDeclaration = {
                name: { text: 'TestComponent', kind: SyntaxKind.Identifier },
                members: [],
                decorators: [{
                    expression: {
                        expression: { text: 'Component' },
                        arguments: []
                    }
                }],
                kind: SyntaxKind.ClassDeclaration
            } as any;

            const symbol = {
                valueDeclaration: classDeclaration,
                declarations: [classDeclaration]
            } as any;

            // Override the jsdoc stub for this test to return empty description
            jsdocParserStub.getMainCommentOfNode.returns('');

            (typeChecker as any).getSymbolAtLocation = sinon.stub().returns(symbol);

            const result = classHelper.visitClassDeclaration('test.ts', classDeclaration, mockSourceFile);
            expect(result).to.have.property('inputs');
            expect(result).to.have.property('outputs');

            // Restore the stub
            jsdocParserStub.getMainCommentOfNode.returns('Test description');
        });

        it('should handle @Injectable decorated class', () => {
            const classDeclaration = {
                name: { text: 'TestService', kind: SyntaxKind.Identifier },
                members: [],
                decorators: [{
                    expression: {
                        expression: { text: 'Injectable' },
                        arguments: []
                    }
                }],
                kind: SyntaxKind.ClassDeclaration
            } as any;

            const symbol = {
                valueDeclaration: classDeclaration,
                declarations: [classDeclaration]
            } as any;

            // Override the jsdoc stub for this test to return empty description
            jsdocParserStub.getMainCommentOfNode.returns('');

            (typeChecker as any).getSymbolAtLocation = sinon.stub().returns(symbol);

            const result = classHelper.visitClassDeclaration('test.ts', classDeclaration, mockSourceFile);
            expect(result).to.be.an('array');
            expect(result[0]).to.have.property('className', 'TestService');

            // Restore the stub
            jsdocParserStub.getMainCommentOfNode.returns('Test description');
        });

        it('should return ignore object for classes with @ignore', () => {
            const classDeclaration = {
                name: { text: 'IgnoredClass', kind: SyntaxKind.Identifier },
                members: [],
                jsDoc: [{
                    tags: [{
                        tagName: { text: 'ignore' }
                    }]
                }],
                kind: SyntaxKind.ClassDeclaration
            } as any;

            const symbol = {
                valueDeclaration: classDeclaration,
                declarations: [classDeclaration]
            } as any;

            (typeChecker as any).getSymbolAtLocation = sinon.stub().returns(symbol);

            const result = classHelper.visitClassDeclaration('test.ts', classDeclaration, mockSourceFile);
            expect(result).to.deep.equal([{ ignore: true }]);
        });
    });

    describe('private methods (tested via public interface)', () => {
        it('should process JSDoc tags correctly', () => {
            const mockTags = [
                {
                    tagName: { text: 'deprecated' },
                    comment: 'This is deprecated'
                }
            ];

            jsdocParserStub.parseJSDocNode.callsFake((tag: any) =>
                typeof tag.comment === 'string' ? tag.comment : ''
            );

            const jsdoctags = [{ tags: mockTags }];
            const result = { deprecated: false, deprecationMessage: '' };

            // Access private method through prototype
            const processJSDocTags = (classHelper as any).processJSDocTags.bind(classHelper);
            processJSDocTags(jsdoctags, result);

            expect(result.deprecated).to.be.true;
            expect(result.deprecationMessage).to.equal('This is deprecated');
        });

        it('should handle ECMAScript private fields', () => {
            const mockMember = {
                name: { escapedText: '#privateField' },
                modifiers: []
            };

            // Access private method through prototype
            const isPrivate = (classHelper as any).isPrivate.bind(classHelper);
            const result = isPrivate(mockMember);

            expect(result).to.be.true;
        });

        it('should identify directive decorators', () => {
            const componentDecorator = {
                expression: { expression: { text: 'Component' } }
            } as any;

            const directiveDecorator = {
                expression: { expression: { text: 'Directive' } }
            } as any;

            const isDirectiveDecorator = (classHelper as any).isDirectiveDecorator.bind(classHelper);

            expect(isDirectiveDecorator(componentDecorator)).to.be.true;
            expect(isDirectiveDecorator(directiveDecorator)).to.be.true;
        });

        it('should identify service decorators', () => {
            const injectableDecorator = {
                expression: { expression: { text: 'Injectable' } }
            } as any;

            const isServiceDecorator = (classHelper as any).isServiceDecorator.bind(classHelper);

            expect(isServiceDecorator(injectableDecorator)).to.be.true;
        });
    });

    describe('visitProperty', () => {
        let mockSourceFile: ts.SourceFile;

        beforeEach(() => {
            mockSourceFile = project.createSourceFile('test-property.ts', '').compilerNode;
            jsdocParserStub.getJSDocs.returns([]);
        });

        it('should handle basic property declaration', () => {
            const property = {
                name: { text: 'testProp' },
                type: { kind: SyntaxKind.StringKeyword },
                questionToken: undefined,
                initializer: undefined,
                modifiers: [],
                kind: SyntaxKind.PropertyDeclaration,
                pos: 10,
                end: 20
            } as any;

            const result = (classHelper as any).visitProperty(property, mockSourceFile);

            expect(result).to.have.property('name', 'testProp');
            expect(result).to.have.property('type', 'string');
            expect(result).to.have.property('optional', false);
        });

        it('should handle optional property', () => {
            const property = {
                name: { text: 'optionalProp' },
                type: { kind: SyntaxKind.StringKeyword },
                questionToken: {},
                initializer: undefined,
                modifiers: [],
                kind: SyntaxKind.PropertyDeclaration,
                pos: 10,
                end: 20
            } as any;

            const result = (classHelper as any).visitProperty(property, mockSourceFile);

            expect(result.optional).to.be.true;
        });

        it('should handle private property', () => {
            const property = {
                name: { text: 'privateProp' },
                type: { kind: SyntaxKind.StringKeyword },
                questionToken: undefined,
                initializer: undefined,
                modifiers: [{ kind: SyntaxKind.PrivateKeyword }],
                kind: SyntaxKind.PropertyDeclaration,
                pos: 10,
                end: 20
            } as any;

            const result = (classHelper as any).visitProperty(property, mockSourceFile);

            expect(result.modifierKind).to.include(SyntaxKind.PrivateKeyword);
        });

        it('should handle ECMAScript private field', () => {
            const property = {
                name: { escapedText: '#privateField' },
                type: { kind: SyntaxKind.StringKeyword },
                questionToken: undefined,
                initializer: undefined,
                modifiers: [],
                kind: SyntaxKind.PropertyDeclaration,
                pos: 10,
                end: 20
            } as any;

            const result = (classHelper as any).visitProperty(property, mockSourceFile);

            expect(result.modifierKind).to.include(SyntaxKind.PrivateKeyword);
        });
    });

    describe('visitMethodDeclaration', () => {
        let mockSourceFile: ts.SourceFile;

        beforeEach(() => {
            mockSourceFile = project.createSourceFile('test-method.ts', '').compilerNode;
            jsdocParserStub.getJSDocs.returns([]);
        });

        it('should handle basic method declaration', () => {
            const method = {
                name: { text: 'testMethod', kind: SyntaxKind.Identifier },
                parameters: [],
                type: { kind: SyntaxKind.VoidKeyword },
                questionToken: undefined,
                modifiers: [],
                typeParameters: [],
                kind: SyntaxKind.MethodDeclaration,
                pos: 10,
                end: 20
            } as any;

            const result = (classHelper as any).visitMethodDeclaration(method, mockSourceFile);

            expect(result).to.have.property('name', 'testMethod');
            expect(result).to.have.property('returnType', 'void');
            expect(result.args).to.be.an('array').with.length(0);
        });

        it('should handle method with parameters', () => {
            const method = {
                name: { text: 'methodWithParams', kind: SyntaxKind.Identifier },
                parameters: [
                    {
                        name: { text: 'param1', kind: SyntaxKind.Identifier },
                        type: { kind: SyntaxKind.StringKeyword },
                        dotDotDotToken: undefined,
                        questionToken: undefined,
                        initializer: undefined
                    }
                ],
                type: { kind: SyntaxKind.BooleanKeyword },
                questionToken: undefined,
                modifiers: [],
                typeParameters: [],
                kind: SyntaxKind.MethodDeclaration,
                pos: 10,
                end: 20
            } as any;

            const result = (classHelper as any).visitMethodDeclaration(method, mockSourceFile);

            expect(result.args).to.be.an('array').with.length(1);
            expect(result.args[0]).to.have.property('name', 'param1');
            expect(result.args[0]).to.have.property('type', 'string');
            expect(result.returnType).to.equal('boolean');
        });

        it('should handle optional method', () => {
            const method = {
                name: { text: 'optionalMethod', kind: SyntaxKind.Identifier },
                parameters: [],
                type: { kind: SyntaxKind.VoidKeyword },
                questionToken: {},
                modifiers: [],
                typeParameters: [],
                kind: SyntaxKind.MethodDeclaration,
                pos: 10,
                end: 20
            } as any;

            const result = (classHelper as any).visitMethodDeclaration(method, mockSourceFile);

            expect(result.optional).to.be.true;
        });

        it('should handle method with type parameters', () => {
            const method = {
                name: { text: 'genericMethod', kind: SyntaxKind.Identifier },
                parameters: [],
                type: { kind: SyntaxKind.VoidKeyword },
                questionToken: undefined,
                modifiers: [],
                typeParameters: [
                    { name: { text: 'T' }, kind: SyntaxKind.TypeParameter }
                ],
                kind: SyntaxKind.MethodDeclaration,
                pos: 10,
                end: 20
            } as any;

            const result = (classHelper as any).visitMethodDeclaration(method, mockSourceFile);

            expect(result.typeParameters).to.be.an('array').with.length(1);
            expect(result.typeParameters[0]).to.equal('T');
        });
    });

    describe('visitArgument', () => {
        it('should handle basic parameter', () => {
            const param = {
                name: { text: 'param1', kind: SyntaxKind.Identifier },
                type: { kind: SyntaxKind.StringKeyword },
                dotDotDotToken: undefined,
                questionToken: undefined,
                initializer: undefined
            } as any;

            const result = (classHelper as any).visitArgument(param);

            expect(result).to.have.property('name', 'param1');
            expect(result).to.have.property('type', 'string');
            expect(result).to.have.property('optional', false);
            expect(result).to.have.property('dotDotDotToken', false);
        });

        it('should handle optional parameter', () => {
            const param = {
                name: { text: 'optionalParam', kind: SyntaxKind.Identifier },
                type: { kind: SyntaxKind.StringKeyword },
                dotDotDotToken: undefined,
                questionToken: {},
                initializer: undefined
            } as any;

            const result = (classHelper as any).visitArgument(param);

            expect(result.optional).to.be.true;
        });

        it('should handle rest parameter', () => {
            const param = {
                name: { text: 'restParam', kind: SyntaxKind.Identifier },
                type: { kind: SyntaxKind.StringKeyword },
                dotDotDotToken: {},
                questionToken: undefined,
                initializer: undefined
            } as any;

            const result = (classHelper as any).visitArgument(param);

            expect(result.dotDotDotToken).to.be.true;
        });

        it('should handle parameter with default value', () => {
            const param = {
                name: { text: 'paramWithDefault', kind: SyntaxKind.Identifier },
                type: { kind: SyntaxKind.StringKeyword },
                dotDotDotToken: undefined,
                questionToken: undefined,
                initializer: { getText: () => '"default"' }
            } as any;

            const result = (classHelper as any).visitArgument(param);

            expect(result.defaultValue).to.equal('"default"');
        });
    });

    describe('visitInputAndHostBinding', () => {
        let mockSourceFile: ts.SourceFile;

        beforeEach(() => {
            mockSourceFile = project.createSourceFile('test-input.ts', '').compilerNode;
        });

        it('should handle basic @Input decorator', () => {
            const property = {
                name: { text: 'inputProp' },
                type: { kind: SyntaxKind.StringKeyword },
                initializer: undefined,
                jsDoc: [],
                kind: SyntaxKind.PropertyDeclaration,
                pos: 10,
                end: 20
            } as any;

            const decorator = {
                expression: {
                    arguments: []
                }
            } as any;

            const result = (classHelper as any).visitInputAndHostBinding(property, decorator, mockSourceFile);

            expect(result).to.have.property('name', 'inputProp');
            expect(result).to.have.property('type', 'string');
        });

        it('should handle @Input with string literal alias', () => {
            const property = {
                name: { text: 'internalProp', kind: SyntaxKind.Identifier },
                type: { kind: SyntaxKind.StringKeyword },
                initializer: undefined,
                jsDoc: [],
                kind: SyntaxKind.PropertyDeclaration,
                pos: 10,
                end: 20
            } as any;

            const mockStringLiteral = {
                kind: SyntaxKind.StringLiteral,
                text: 'externalProp'
            };

            const decorator = {
                expression: {
                    arguments: [mockStringLiteral]
                }
            } as any;

            const result = (classHelper as any).visitInputAndHostBinding(property, decorator, mockSourceFile);

            expect(result.name).to.equal('externalProp');
        });

        it('should handle @Input with object literal configuration', () => {
            const property = {
                name: { text: 'configProp', kind: SyntaxKind.Identifier },
                type: { kind: SyntaxKind.StringKeyword },
                initializer: undefined,
                jsDoc: [],
                kind: SyntaxKind.PropertyDeclaration,
                pos: 10,
                end: 20
            } as any;

            const mockObjectLiteral = {
                kind: SyntaxKind.ObjectLiteralExpression,
                properties: [
                    { name: { escapedText: 'alias' }, initializer: { text: 'aliasProp' } },
                    { name: { escapedText: 'required' }, initializer: { kind: SyntaxKind.TrueKeyword } }
                ]
            };

            const decorator = {
                expression: {
                    arguments: [mockObjectLiteral]
                }
            } as any;

            const result = (classHelper as any).visitInputAndHostBinding(property, decorator, mockSourceFile);

            expect(result.name).to.equal('aliasProp');
            expect(result.required).to.be.true;
            expect(result.optional).to.be.false;
        });
    });

    describe('visitOutput', () => {
        let mockSourceFile: ts.SourceFile;

        beforeEach(() => {
            mockSourceFile = project.createSourceFile('test-output.ts', '').compilerNode;
        });

        it('should handle basic @Output decorator', () => {
            const property = {
                name: { text: 'outputProp', kind: SyntaxKind.Identifier },
                type: undefined,
                initializer: {
                    expression: { text: 'EventEmitter' },
                    kind: SyntaxKind.NewExpression,
                    getText: () => 'new EventEmitter()'
                },
                jsDoc: [],
                kind: SyntaxKind.PropertyDeclaration,
                pos: 10,
                end: 20
            } as any;

            const decorator = {
                expression: {
                    arguments: []
                }
            } as any;

            const result = (classHelper as any).visitOutput(property, decorator, mockSourceFile);

            expect(result).to.have.property('name', 'outputProp');
            expect(result).to.have.property('type', 'EventEmitter');
        });

        it('should handle @Output with custom name', () => {
            const property = {
                name: { text: 'internalOutput', kind: SyntaxKind.Identifier },
                type: undefined,
                initializer: {
                    expression: { text: 'EventEmitter' },
                    kind: SyntaxKind.NewExpression,
                    getText: () => 'new EventEmitter()'
                },
                jsDoc: [],
                kind: SyntaxKind.PropertyDeclaration,
                pos: 10,
                end: 20
            } as any;

            const decorator = {
                expression: {
                    arguments: [{ text: 'externalOutput' }]
                }
            } as any;

            const result = (classHelper as any).visitOutput(property, decorator, mockSourceFile);

            expect(result.name).to.equal('externalOutput');
        });
    });

    describe('visitHostListener', () => {
        let mockSourceFile: ts.SourceFile;

        beforeEach(() => {
            mockSourceFile = project.createSourceFile('test-host-listener.ts', '').compilerNode;
        });

        it('should handle basic @HostListener decorator', () => {
            const property = {
                name: { text: 'onClick', kind: SyntaxKind.Identifier },
                parameters: [],
                jsDoc: [],
                kind: SyntaxKind.MethodDeclaration,
                pos: 10,
                end: 20
            } as any;

            const decorator = {
                expression: {
                    arguments: [{ text: 'click' }]
                }
            } as any;

            const result = (classHelper as any).visitHostListener(property, decorator, mockSourceFile);

            expect(result).to.have.property('name', 'click');
            expect(result.args).to.be.an('array').with.length(0);
        });

        it('should handle @HostListener with arguments', () => {
            const property = {
                name: { text: 'onCustomEvent', kind: SyntaxKind.Identifier },
                parameters: [
                    {
                        name: { text: 'event', kind: SyntaxKind.Identifier },
                        type: { kind: SyntaxKind.AnyKeyword }
                    }
                ],
                jsDoc: [],
                kind: SyntaxKind.MethodDeclaration,
                pos: 10,
                end: 20
            } as any;

            const decorator = {
                expression: {
                    arguments: [
                        { text: 'customEvent' },
                        {
                            elements: [
                                { text: '$event' }
                            ]
                        }
                    ]
                }
            } as any;

            const result = (classHelper as any).visitHostListener(property, decorator, mockSourceFile);

            expect(result.name).to.equal('customEvent');
            expect(result.args).to.be.an('array').with.length(1);
            expect(result.argsDecorator).to.deep.equal(['$event']);
        });
    });

    describe('visitConstructorDeclaration — @param description threading', () => {
        let mockSourceFile: ts.SourceFile;

        beforeEach(() => {
            mockSourceFile = project.createSourceFile('test-ctor.ts', '').compilerNode;
        });

        it('should thread @param descriptions into result.args', () => {
            const ctor = {
                parameters: [
                    {
                        name: { text: 'name', kind: SyntaxKind.Identifier },
                        type: { kind: SyntaxKind.StringKeyword },
                        dotDotDotToken: undefined,
                        questionToken: undefined,
                        initializer: undefined
                    }
                ],
                modifiers: [],
                jsDoc: [],
                kind: SyntaxKind.Constructor,
                pos: 0,
                end: 50,
                getStart: () => 0,
                getSourceFile: () => mockSourceFile
            } as any;

            // Simulate a @param JSDoc tag with a description
            jsdocParserStub.getJSDocs.returns([
                {
                    tags: [
                        {
                            tagName: { text: 'param' },
                            name: { text: 'name' },
                            comment: "The person's name"
                        }
                    ]
                }
            ]);
            jsdocParserStub.getMainCommentOfNode.returns('');
            jsdocParserStub.parseComment.returns('');
            jsdocParserStub.parseJSDocNode.callsFake((v: any) =>
                typeof v === 'string' ? v : ''
            );

            const result = (classHelper as any).visitConstructorDeclaration(ctor, mockSourceFile);

            expect(result.args).to.be.an('array').with.length(1);
            expect(result.args[0]).to.have.property('name', 'name');
            // description is populated from the @param comment (may be Markdown-rendered)
            expect(result.args[0]).to.have.property('description').that.includes('name');
        });

        it('should leave args.description unset when there are no @param tags', () => {
            const ctor = {
                parameters: [
                    {
                        name: { text: 'count', kind: SyntaxKind.Identifier },
                        type: { kind: SyntaxKind.NumberKeyword },
                        dotDotDotToken: undefined,
                        questionToken: undefined,
                        initializer: undefined
                    }
                ],
                modifiers: [],
                jsDoc: [],
                kind: SyntaxKind.Constructor,
                pos: 0,
                end: 30,
                getStart: () => 0,
                getSourceFile: () => mockSourceFile
            } as any;

            jsdocParserStub.getJSDocs.returns([]);
            jsdocParserStub.getMainCommentOfNode.returns('');
            jsdocParserStub.parseComment.returns('');

            const result = (classHelper as any).visitConstructorDeclaration(ctor, mockSourceFile);

            expect(result.args).to.be.an('array').with.length(1);
            expect(result.args[0]).to.not.have.property('description');
        });
    });
});
