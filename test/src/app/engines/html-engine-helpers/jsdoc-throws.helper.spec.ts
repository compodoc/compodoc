import { expect } from 'chai';
import { JsdocThrowsHelper } from '../../../../../src/app/engines/html-engine-helpers/jsdoc-throws.helper';
import { JsdocTagInterface } from '../../../../../src/app/interfaces/jsdoc-tag.interface';

describe('JsdocThrowsHelper', () => {
    let helper: JsdocThrowsHelper;
    let context: any;
    let options: any;

    beforeEach(() => {
        helper = new JsdocThrowsHelper();
        context = {};
        options = {
            fn: (ctx: any) => ctx
        };
    });

    function createMockJsdocTag(tagName: string, comment: string): JsdocTagInterface {
        return {
            tagName: { text: tagName },
            comment,
            name: '',
            parameterName: { text: '' },
            type: null,
            defaultValue: null,
            typeExpression: { type: null }
        };
    }

    it('should expose @throws tags to templates', () => {
        const jsdocTags: JsdocTagInterface[] = [
            createMockJsdocTag('throws', '<p>RecordAlreadyExists The record exists</p>'),
            createMockJsdocTag('param', '<p>Ignored parameter</p>'),
            createMockJsdocTag('throws', '<p>NoData JSONData was empty</p>')
        ];

        const result = helper.helperFunc(context, jsdocTags, options) as any;

        expect(result.tags).to.have.length(2);
        expect(result.tags[0].comment).to.equal('<p>RecordAlreadyExists The record exists</p>');
        expect(result.tags[1].comment).to.equal('<p>NoData JSONData was empty</p>');
    });

    it('should support @throw and @exception aliases', () => {
        const jsdocTags: JsdocTagInterface[] = [
            createMockJsdocTag('throw', '<p>Throw alias</p>'),
            createMockJsdocTag('exception', '<p>Exception alias</p>')
        ];

        const result = helper.helperFunc(context, jsdocTags, options) as any;

        expect(result.tags).to.have.length(2);
    });
});
