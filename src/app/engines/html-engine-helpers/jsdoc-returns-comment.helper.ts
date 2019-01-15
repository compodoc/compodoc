import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';

export class JsdocReturnsCommentHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, jsdocTags: Array<any>, options: IHandlebarsOptions) {
        let i = 0;
        let len = jsdocTags.length;
        let result;
        for (i; i < len; i++) {
            if (jsdocTags[i].tagName) {
                if (
                    jsdocTags[i].tagName.text === 'returns' ||
                    jsdocTags[i].tagName.text === 'return'
                ) {
                    result = jsdocTags[i].comment;
                    break;
                }
            }
        }
        return result;
    }
}
