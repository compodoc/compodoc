import { IHtmlEngineHelper } from './html-engine-helper.interface';

export class JsdocReturnsCommentHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, jsdocTags, options) {
        let i = 0;
        let len = jsdocTags.length;
        let result;
        for (i; i < len; i++) {
            if (jsdocTags[i].tagName) {
                if (jsdocTags[i].tagName.text === 'returns') {
                    result = jsdocTags[i].comment;
                    break;
                }
            }
        }
        return result;
    }
}