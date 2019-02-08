import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';
import { JsdocTagInterface } from '../../interfaces/jsdoc-tag.interface';

export class JsdocParamsValidHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, jsdocTags: JsdocTagInterface[], options: IHandlebarsOptions) {
        let i = 0;
        let len = jsdocTags.length;
        let tags = [];
        let valid = false;

        for (i; i < len; i++) {
            if (jsdocTags[i].tagName) {
                if (jsdocTags[i].tagName.text === 'param') {
                    valid = true;
                }
            }
        }
        if (valid) {
            return options.fn(context);
        } else {
            return options.inverse(context);
        }
    }
}
