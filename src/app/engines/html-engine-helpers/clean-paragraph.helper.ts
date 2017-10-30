import { IHtmlEngineHelper } from './html-engine-helper.interface';
import * as Handlebars from 'handlebars';

export class CleanParagraphHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, text: string) {
        text = text.replace(/<p>/gm, '');
        text = text.replace(/<\/p>/gm, '');
        return new Handlebars.SafeString(text);
    }
}