import type { JsdocTagInterface } from '../../interfaces/jsdoc-tag.interface';
import type { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';

const THROW_TAGS = new Set(['throws', 'throw', 'exception']);

export class JsdocThrowsHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, jsdocTags: JsdocTagInterface[], options: IHandlebarsOptions) {
        const tags = [];

        for (const jsdocTag of jsdocTags) {
            if (jsdocTag.tagName && THROW_TAGS.has(jsdocTag.tagName.text)) {
                tags.push({
                    comment: jsdocTag.comment
                });
            }
        }

        if (tags.length > 0) {
            context.tags = tags;
            return options.fn(context);
        }
    }
}
