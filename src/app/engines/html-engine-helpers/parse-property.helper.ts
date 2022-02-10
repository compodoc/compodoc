import { IHtmlEngineHelper } from './html-engine-helper.interface';
import * as Handlebars from 'handlebars';

export class ParsePropertyHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, text: string) {
        if (text.indexOf('https') !== -1) {
            return `<a href="${text}" target="_blank">${text}</a>`;
        } else {
            return text;
        }
    }
}
