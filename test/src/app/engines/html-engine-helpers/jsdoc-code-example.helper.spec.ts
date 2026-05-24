import { expect } from 'chai';
import { JsdocCodeExampleHelper } from '../../../../../src/app/engines/html-engine-helpers/jsdoc-code-example.helper';
import { JsdocTagInterface } from '../../../../../src/app/interfaces/jsdoc-tag.interface';

describe('JsdocCodeExampleHelper', () => {
    let helper: JsdocCodeExampleHelper;

    beforeEach(() => {
        helper = new JsdocCodeExampleHelper();
    });

    function createMockJsdocTag(tagName: string, comment: string): JsdocTagInterface {
        return {
            tagName: { text: tagName },
            comment: comment,
            name: '',
            parameterName: { text: '' },
            type: null,
            defaultValue: null,
            typeExpression: { type: null }
        };
    }

    describe('parseCodeFences method', () => {
        it('should parse TypeScript code fence correctly', () => {
            const comment = '```typescript\nconst test = "hello";\nconsole.log(test);\n```';
            const result = helper['parseCodeFences'](comment);

            expect(result).to.have.length(1);
            expect(result[0].language).to.equal('typescript');
            expect(result[0].code).to.contain('const test = "hello";');
            expect(result[0].code).to.contain('console.log(test);');
        });

        it('should parse HTML code fence correctly', () => {
            const comment = '```html\n<div>Hello World</div>\n<p>Test paragraph</p>\n```';
            const result = helper['parseCodeFences'](comment);

            expect(result).to.have.length(1);
            expect(result[0].language).to.equal('html');
            expect(result[0].code).to.contain('<div>Hello World</div>');
            expect(result[0].code).to.contain('<p>Test paragraph</p>');
        });

        it('should parse JavaScript code fence correctly', () => {
            const comment = '```javascript\nfunction test() {\n  return "hello";\n}\n```';
            const result = helper['parseCodeFences'](comment);

            expect(result).to.have.length(1);
            expect(result[0].language).to.equal('javascript');
            expect(result[0].code).to.contain('function test() {');
            expect(result[0].code).to.contain('return "hello";');
        });

        it('should handle multiple code fences in one comment', () => {
            const comment = [
                '```typescript',
                'const ts = "typescript";',
                '```',
                '',
                'Some text in between',
                '',
                '```javascript',
                'const js = "javascript";',
                '```'
            ].join('\n');

            const result = helper['parseCodeFences'](comment);

            expect(result).to.have.length(2);
            expect(result[0].language).to.equal('typescript');
            expect(result[0].code).to.contain('const ts = "typescript";');
            expect(result[1].language).to.equal('javascript');
            expect(result[1].code).to.contain('const js = "javascript";');
        });

        it('should default to html language when no language specified', () => {
            const comment = '```\n<div>No language specified</div>\n```';
            const result = helper['parseCodeFences'](comment);

            expect(result).to.have.length(1);
            expect(result[0].language).to.equal('html');
            expect(result[0].code).to.contain('<div>No language specified</div>');
        });

        it('should handle comment without code fences', () => {
            const comment = 'Simple text without code fences';
            const result = helper['parseCodeFences'](comment);

            expect(result).to.have.length(1);
            expect(result[0].language).to.equal('html');
            expect(result[0].code).to.equal('Simple text without code fences');
        });

        it('should handle empty code blocks', () => {
            const comment = '```typescript\n\n```';
            const result = helper['parseCodeFences'](comment);

            expect(result).to.have.length(0); // Empty code blocks should be filtered out
        });

        it('should handle code fences with whitespace', () => {
            const comment = '```typescript   \n  const test = "hello";  \n  ```';
            const result = helper['parseCodeFences'](comment);

            expect(result).to.have.length(1);
            expect(result[0].language).to.equal('typescript');
            expect(result[0].code).to.equal('const test = "hello";');
        });

        it('should parse indented code fences correctly', () => {
            const comment = '  ```html\n<y-map>\n  <y-map-default-scheme-layer />\n</y-map>\n  ```';
            const result = helper['parseCodeFences'](comment);

            expect(result).to.have.length(1);
            expect(result[0].language).to.equal('html');
            expect(result[0].code).to.contain('<y-map>');
            expect(result[0].code).to.contain('</y-map>');
        });
    });

    describe('cleanTag method', () => {
        it('should remove leading asterisk', () => {
            const result = helper['cleanTag']('*Example code');
            expect(result).to.equal('Example code');
        });

        it('should remove leading space', () => {
            const result = helper['cleanTag'](' Example code');
            expect(result).to.equal('Example code');
        });

        it('should remove paragraph tags', () => {
            const result = helper['cleanTag']('<p>Example code</p>');
            expect(result).to.equal('Example code');
        });

        it('should remove trailing newline', () => {
            const result = helper['cleanTag']('Example code\n');
            expect(result).to.equal('Example code');
        });

        it('should handle combination of cleanups', () => {
            const result = helper['cleanTag']('* <p>Example code</p>\n');
            expect(result).to.equal('Example code');
        });
    });

    describe('getHtmlEntities method', () => {
        it('should escape HTML entities', () => {
            const result = helper['getHtmlEntities']('<div class="test">Hello & goodbye</div>');
            expect(result).to.equal('&lt;div class=&quot;test&quot;&gt;Hello &amp; goodbye&lt;/div&gt;');
        });

        it('should handle empty string', () => {
            const result = helper['getHtmlEntities']('');
            expect(result).to.equal('');
        });

        it('should handle string without HTML entities', () => {
            const result = helper['getHtmlEntities']('Plain text');
            expect(result).to.equal('Plain text');
        });
    });

    describe('helperFunc method', () => {
        let mockContext: any;
        let mockOptions: any;

        beforeEach(() => {
            mockContext = {};
            mockOptions = {
                fn: (ctx) => ctx,
                hash: {}
            };
        });

        it('should process @example tags with TypeScript code', () => {
            const jsdocTags: JsdocTagInterface[] = [
                createMockJsdocTag('example', '```typescript\nconst test = "hello";\n```')
            ];

            const result = helper.helperFunc(mockContext, jsdocTags, mockOptions);

            expect(mockContext.tags).to.have.length(1);
            expect(mockContext.tags[0].comment).to.contain('language-typescript');
            expect(mockContext.tags[0].comment).to.contain('const test = &quot;hello&quot;;');
        });

        it('should process @example tags with HTML code', () => {
            const jsdocTags: JsdocTagInterface[] = [
                createMockJsdocTag('example', '```html\n<div>Hello World</div>\n```')
            ];

            const result = helper.helperFunc(mockContext, jsdocTags, mockOptions);

            expect(mockContext.tags).to.have.length(1);
            expect(mockContext.tags[0].comment).to.contain('language-html');
            expect(mockContext.tags[0].comment).to.contain('&lt;div&gt;Hello World&lt;/div&gt;');
        });

        it('should process multiple @example tags', () => {
            const jsdocTags: JsdocTagInterface[] = [
                createMockJsdocTag('example', '```typescript\nconst ts = "typescript";\n```'),
                createMockJsdocTag('example', '```html\n<div>HTML</div>\n```')
            ];

            const result = helper.helperFunc(mockContext, jsdocTags, mockOptions);

            expect(mockContext.tags).to.have.length(2);
            expect(mockContext.tags[0].comment).to.contain('language-typescript');
            expect(mockContext.tags[1].comment).to.contain('language-html');
        });

        it('should process @example with multiple code blocks', () => {
            const jsdocTags: JsdocTagInterface[] = [
                createMockJsdocTag('example', '```typescript\nconst ts = "typescript";\n```\n\n```javascript\nconst js = "javascript";\n```')
            ];

            const result = helper.helperFunc(mockContext, jsdocTags, mockOptions);

            expect(mockContext.tags).to.have.length(2);
            expect(mockContext.tags[0].comment).to.contain('language-typescript');
            expect(mockContext.tags[1].comment).to.contain('language-javascript');
        });

        it('should handle @example tags with captions', () => {
            const jsdocTags: JsdocTagInterface[] = [
                createMockJsdocTag('example', '<caption>Test Caption</caption>\n```typescript\nconst test = "hello";\n```')
            ];

            const result = helper.helperFunc(mockContext, jsdocTags, mockOptions);

            expect(mockContext.tags).to.have.length(2);
            expect(mockContext.tags[0].comment).to.contain('<b><i>Test Caption</i></b>');
            expect(mockContext.tags[1].comment).to.contain('language-typescript');
            expect(mockContext.tags[1].comment).to.contain('const test = &quot;hello&quot;;');
        });

        it('should ignore non-example tags', () => {
            const jsdocTags: JsdocTagInterface[] = [
                createMockJsdocTag('param', 'Parameter description'),
                createMockJsdocTag('example', '```typescript\nconst test = "hello";\n```')
            ];

            const result = helper.helperFunc(mockContext, jsdocTags, mockOptions);

            expect(mockContext.tags).to.have.length(1);
            expect(mockContext.tags[0].comment).to.contain('language-typescript');
        });

        it('should return undefined if no example tags found', () => {
            const jsdocTags: JsdocTagInterface[] = [
                createMockJsdocTag('param', 'Parameter description')
            ];

            const result = helper.helperFunc(mockContext, jsdocTags, mockOptions);

            expect(result).to.be.undefined;
            expect(mockContext.tags).to.be.undefined;
        });

        it('should generate proper HTML structure', () => {
            const jsdocTags: JsdocTagInterface[] = [
                createMockJsdocTag('example', '```typescript\nconst test = "hello";\n```')
            ];

            const result = helper.helperFunc(mockContext, jsdocTags, mockOptions);

            expect(mockContext.tags[0].comment).to.contain('<pre class="line-numbers">');
            expect(mockContext.tags[0].comment).to.contain('<code class="language-typescript">');
            expect(mockContext.tags[0].comment).to.contain('</code></pre>');
        });

        it('should process @example tags with indented fenced html blocks', () => {
            const jsdocTags: JsdocTagInterface[] = [
                createMockJsdocTag(
                    'example',
                    '  ```html\n<y-map>\n  <y-map-default-scheme-layer />\n  <y-map-default-features-layer />\n</y-map>\n  ```'
                )
            ];

            helper.helperFunc(mockContext, jsdocTags, mockOptions);

            expect(mockContext.tags).to.have.length(1);
            expect(mockContext.tags[0].comment).to.contain('language-html');
            expect(mockContext.tags[0].comment).to.contain('&lt;y-map&gt;');
            expect(mockContext.tags[0].comment).to.not.contain('```html');
        });
    });
});
