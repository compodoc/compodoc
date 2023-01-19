import { IHtmlEngineHelper } from './html-engine-helper.interface';
const Handlebars = require('handlebars');

export class CleanParagraphHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, text: string) {
        text = text.replace(/<p>/gm, '');
        text = text.replace(/<\/p>/gm, '');
        return new Handlebars.SafeString(text);
    }
}
