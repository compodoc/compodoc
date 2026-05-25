import { expect } from 'chai';
import { Project, SyntaxKind } from 'ts-morph';
import { JsdocParserUtil } from '../../../src/utils/jsdoc-parser.util';

describe('Utils - JsdocParserUtil', () => {
    let jsdocParserUtil: JsdocParserUtil;
    let project: Project;

    beforeEach(() => {
        jsdocParserUtil = new JsdocParserUtil();
        project = new Project();
    });

    describe('isVariableLike()', () => {
        it('should return true for VariableDeclaration', () => {
            const sourceFile = project.createSourceFile('test.ts', 'const x = 1;');
            const variableDeclaration = sourceFile.getVariableDeclaration('x');

            const result = jsdocParserUtil.isVariableLike(variableDeclaration!.compilerNode);

            expect(result).to.be.true;
        });

        it('should return true for Parameter', () => {
            const sourceFile = project.createSourceFile('test.ts', 'function test(param: string) {}');
            const parameter = sourceFile.getFunction('test')!.getParameters()[0];

            const result = jsdocParserUtil.isVariableLike(parameter.compilerNode);

            expect(result).to.be.true;
        });

        it('should return true for PropertyDeclaration', () => {
            const sourceFile = project.createSourceFile('test.ts', 'class Test { prop: string; }');
            const property = sourceFile.getClass('Test')!.getProperties()[0];

            const result = jsdocParserUtil.isVariableLike(property.compilerNode);

            expect(result).to.be.true;
        });

        it('should return true for EnumMember', () => {
            const sourceFile = project.createSourceFile('test.ts', 'enum Test { A, B }');
            const enumMember = sourceFile.getEnum('Test')!.getMembers()[0];

            const result = jsdocParserUtil.isVariableLike(enumMember.compilerNode);

            expect(result).to.be.true;
        });

        it('should return true for PropertyAssignment', () => {
            const sourceFile = project.createSourceFile('test.ts', 'const obj = { prop: "value" };');
            const propertyAssignment = sourceFile.getVariableDeclaration('obj')!
                .getInitializerIfKind(SyntaxKind.ObjectLiteralExpression)!
                .getProperties()[0];

            const result = jsdocParserUtil.isVariableLike(propertyAssignment.compilerNode);

            expect(result).to.be.true;
        });

        it('should return true for PropertySignature', () => {
            const sourceFile = project.createSourceFile('test.ts', 'interface Test { prop: string; }');
            const propertySignature = sourceFile.getInterface('Test')!.getProperties()[0];

            const result = jsdocParserUtil.isVariableLike(propertySignature.compilerNode);

            expect(result).to.be.true;
        });

        it('should return true for ShorthandPropertyAssignment', () => {
            const sourceFile = project.createSourceFile('test.ts', 'const obj = { x };');
            const shorthandProperty = sourceFile.getVariableDeclaration('obj')!
                .getInitializerIfKind(SyntaxKind.ObjectLiteralExpression)!
                .getProperties()[0];

            const result = jsdocParserUtil.isVariableLike(shorthandProperty.compilerNode);

            expect(result).to.be.true;
        });

        it('should return true for BindingElement', () => {
            const sourceFile = project.createSourceFile('test.ts', 'const [x] = [1];');
            const variableDeclaration = sourceFile.getVariableDeclarations()[0];
            const bindingElement = variableDeclaration.getNameNode().asKind(SyntaxKind.ArrayBindingPattern)!.getElements()[0];

            const result = jsdocParserUtil.isVariableLike(bindingElement.compilerNode);

            expect(result).to.be.true;
        });

        it('should return false for non-variable-like nodes', () => {
            const sourceFile = project.createSourceFile('test.ts', 'function test() {}');
            const functionDeclaration = sourceFile.getFunction('test');

            const result = jsdocParserUtil.isVariableLike(functionDeclaration!.compilerNode);

            expect(result).to.be.false;
        });

        it('should return false for null or undefined node', () => {
            expect(jsdocParserUtil.isVariableLike(null as any)).to.be.false;
            expect(jsdocParserUtil.isVariableLike(undefined as any)).to.be.false;
        });
    });

    describe('isTopmostModuleDeclaration()', () => {
        it('should return true for topmost module declaration', () => {
            const sourceFile = project.createSourceFile('test.ts', 'module A {}');
            const moduleDeclaration = sourceFile.getModule('A');

            const result = jsdocParserUtil.isTopmostModuleDeclaration(moduleDeclaration!.compilerNode);

            expect(result).to.be.true;
        });

    });

    describe('getRootModuleDeclaration()', () => {
        it('should return the same node for root module declaration', () => {
            const sourceFile = project.createSourceFile('test.ts', 'module A {}');
            const moduleDeclaration = sourceFile.getModule('A');

            const result = jsdocParserUtil.getRootModuleDeclaration(moduleDeclaration!.compilerNode);

            expect(result).to.equal(moduleDeclaration!.compilerNode);
        });
    });

    describe('getMainCommentOfNode()', () => {
        it('should return null for source file with single comment', () => {
            const sourceFile = project.createSourceFile('test.ts', '/** comment */ const x = 1;');

            const result = jsdocParserUtil.getMainCommentOfNode(sourceFile.compilerNode, sourceFile.compilerNode);

            expect(result).to.be.null;
        });

        it('should return comment for source file with multiple comments', () => {
            const sourceFile = project.createSourceFile('test.ts', '/** first */ /** second */ const x = 1;');

            const result = jsdocParserUtil.getMainCommentOfNode(sourceFile.compilerNode, sourceFile.compilerNode);

            expect(result).to.equal('/** first */');
        });

        it('should return comment for variable declaration', () => {
            const sourceFile = project.createSourceFile('test.ts', '/** comment */ const x = 1;');
            const variableDeclaration = sourceFile.getVariableDeclaration('x');

            const result = jsdocParserUtil.getMainCommentOfNode(variableDeclaration!.compilerNode, sourceFile.compilerNode);

            expect(result).to.equal('/** comment */');
        });

        it('should return the closest variable comment when a file header JSDoc exists', () => {
            const sourceFile = project.createSourceFile('test.ts', `/**
 * TEST FILE
 * @file test file
 */
/** first constant */
const FIRST = 1;
/** second constant */
const SECOND = 2;`);
            const variableDeclaration = sourceFile.getVariableDeclaration('FIRST');

            const result = jsdocParserUtil.getMainCommentOfNode(variableDeclaration!.compilerNode, sourceFile.compilerNode);

            expect(result).to.equal('/** first constant */');
        });

        it('should return comment for function declaration', () => {
            const sourceFile = project.createSourceFile('test.ts', '/** comment */ function test() {}');
            const functionDeclaration = sourceFile.getFunction('test');

            const result = jsdocParserUtil.getMainCommentOfNode(functionDeclaration!.compilerNode, sourceFile.compilerNode);

            expect(result).to.equal('/** comment */');
        });

        it('should return comment for module declaration', () => {
            const sourceFile = project.createSourceFile('test.ts', '/** module comment */ module A {}');
            const moduleDeclaration = sourceFile.getModule('A');

            const result = jsdocParserUtil.getMainCommentOfNode(moduleDeclaration!.compilerNode, sourceFile.compilerNode);

            expect(result).to.equal('/** module comment */');
        });
    });

    describe('parseComment()', () => {
        it('should parse simple JSDoc comment', () => {
            const comment = `/**
 * This is a simple comment
 */`;

            const result = jsdocParserUtil.parseComment(comment);

            expect(result).to.equal('\n\nThis is a simple comment\n');
        });

        it('should parse JSDoc comment with @param tag', () => {
            const comment = `/**
 * Function description
 * @param {string} name - The name parameter
 * @returns {string} The result
 */`;

            const result = jsdocParserUtil.parseComment(comment);

            expect(result).to.equal('\n\nFunction description\n');
        });

        it('should parse JSDoc comment with @example tag', () => {
            const comment = `/**
 * Function description
 * @example
 * const result = test();
 */`;

            const result = jsdocParserUtil.parseComment(comment);

            expect(result).to.equal('\n\nFunction description\n```html\nconst result = test();\n```');
        });

        it('should parse JSDoc comment with @example and existing code fence', () => {
            const comment = `/**
 * Function description
 * @example
 * \`\`\`typescript
 * const result = test();
 * \`\`\`
 */`;

            const result = jsdocParserUtil.parseComment(comment);

            expect(result).to.equal('\n\nFunction description\n```typescript\nconst result = test();\n```');
        });

        it('should parse JSDoc comment with @see tag', () => {
            const comment = `/**
 * Function description
 * @see OtherClass
 */`;

            const result = jsdocParserUtil.parseComment(comment);

            expect(result).to.equal('\n\nFunction description\nSee OtherClass\n');
        });

        it('should preserve empty lines within code blocks with existing fences', () => {
            const comment = `/**
 * Function description
 * @example
 * \`\`\`typescript
 * const x = 1;
 *
 * const y = 2;
 * \`\`\`
 */`;

            const result = jsdocParserUtil.parseComment(comment);

            expect(result).to.contain('___COMPODOC_EMPTY_LINE___');
        });

        it('should handle multiple @example blocks', () => {
            const comment = `/**
 * Function description
 * @example
 * const x = 1;
 * @example
 * const y = 2;
 */`;

            const result = jsdocParserUtil.parseComment(comment);

            expect(result).to.contain('```html');
            expect(result).to.contain('```');
        });
    });

    describe('getJSDocs()', () => {
        it('should return JSDoc comments for a node with JSDoc', () => {
            const sourceFile = project.createSourceFile('test.ts', '/** comment */ function test() {}');
            const functionDeclaration = sourceFile.getFunction('test');

            const result = jsdocParserUtil.getJSDocs(functionDeclaration!.compilerNode);

            expect(result).to.be.an('array');
            expect(result).to.have.length.greaterThan(0);
        });

        it('should return empty array for node without JSDoc', () => {
            const sourceFile = project.createSourceFile('test.ts', 'function test() {}');
            const functionDeclaration = sourceFile.getFunction('test');

            const result = jsdocParserUtil.getJSDocs(functionDeclaration!.compilerNode);

            expect(result).to.be.an('array');
            expect(result).to.have.length(0);
        });

        it('should return JSDoc for variable with initializer', () => {
            const sourceFile = project.createSourceFile('test.ts', 'const x = /** comment */ function() {};');
            const variableDeclaration = sourceFile.getVariableDeclaration('x');

            const result = jsdocParserUtil.getJSDocs(variableDeclaration!.compilerNode);

            expect(result).to.be.an('array');
            expect(result).to.have.length.greaterThan(0);
        });
    });

    describe('getJSDocTags()', () => {
        it('should support direct JSDocTag entries in cache without throwing', () => {
            const sourceFile = project.createSourceFile('test.ts', `class Test {
                /**
                 * @deprecated This method has been replaced by AppStripeService:getPrice
                 */
                test() {}
            }`);

            const method = sourceFile.getClass('Test')!.getMethod('test')!;
            const deprecatedTag = (method.compilerNode as any).jsDoc[0].tags[0];
            const utilWithMockedCache = jsdocParserUtil as any;

            utilWithMockedCache.getJSDocs = () => [deprecatedTag];

            const result = utilWithMockedCache.getJSDocTags(
                method.compilerNode,
                SyntaxKind.JSDocDeprecatedTag
            );

            expect(result).to.have.length(1);
            expect(result[0]).to.equal(deprecatedTag);
        });
    });

    describe('parseJSDocNode()', () => {
        it('should parse JSDoc node with string comment', () => {
            const sourceFile = project.createSourceFile('test.ts', '/** Simple comment */ function test() {}');
            const functionDeclaration = sourceFile.getFunction('test');
            const jsDocs = jsdocParserUtil.getJSDocs(functionDeclaration!.compilerNode);

            const result = jsdocParserUtil.parseJSDocNode(jsDocs[0]);

            expect(result).to.equal('Simple comment');
        });

        it('should parse JSDoc node with JSDocComment', () => {
            const sourceFile = project.createSourceFile('test.ts', '/** Simple comment */ function test() {}');
            const functionDeclaration = sourceFile.getFunction('test');
            const jsDocs = jsdocParserUtil.getJSDocs(functionDeclaration!.compilerNode);

            const result = jsdocParserUtil.parseJSDocNode(jsDocs[0]);

            expect(result).to.be.a('string');
        });

        it('should parse JSDoc node with JSDocLink', () => {
            const sourceFile = project.createSourceFile('test.ts', '/** {@link TestClass} */ function test() {}');
            const functionDeclaration = sourceFile.getFunction('test');
            const jsDocs = jsdocParserUtil.getJSDocs(functionDeclaration!.compilerNode);

            const result = jsdocParserUtil.parseJSDocNode(jsDocs[0]);

            expect(result).to.contain('{@link TestClass}');
        });

        it('should handle JSDoc node with multiple comment parts', () => {
            const sourceFile = project.createSourceFile('test.ts', '/** Comment part 1 Comment part 2 */ function test() {}');
            const functionDeclaration = sourceFile.getFunction('test');
            const jsDocs = jsdocParserUtil.getJSDocs(functionDeclaration!.compilerNode);

            const result = jsdocParserUtil.parseJSDocNode(jsDocs[0]);

            expect(result).to.be.a('string');
        });

        it('should handle JSDoc node with no comment', () => {
            const mockNode = { comment: null };

            const result = jsdocParserUtil.parseJSDocNode(mockNode);

            expect(result).to.equal('');
        });
    });
});
