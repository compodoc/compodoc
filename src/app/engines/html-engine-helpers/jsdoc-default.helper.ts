import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';
import { JsdocTagInterface } from '../../interfaces/jsdoc-tag.interface';

export class JsdocDefaultHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, jsdocTags: JsdocTagInterface[], options: IHandlebarsOptions) {
        if (jsdocTags) {
            let i = 0;
            let len = jsdocTags.length;
            let tag = {} as JsdocTagInterface;
            let defaultValue = false;

            for (i; i < len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'default') {
                        defaultValue = true;
                        if (jsdocTags[i].typeExpression && jsdocTags[i].typeExpression.type.name) {
                            tag.type = jsdocTags[i].typeExpression.type.name.text;
                        }
                        if (jsdocTags[i].comment) {
                            tag.comment = jsdocTags[i].comment;
                        }
                        if (jsdocTags[i].name) {
                            tag.name = jsdocTags[i].name.text;
                        }
                    }
                }
            }
            if (defaultValue) {
                context.tag = tag;
                return options.fn(context);
            }
        }
    }
}
