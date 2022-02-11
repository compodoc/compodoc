import { IHtmlEngineHelper } from './html-engine-helper.interface';
import * as Handlebars from 'handlebars';

export class ParsePropertyHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, text: string) {
        let url = text;

        if (typeof text === 'object' && text['url'] !== undefined) {
            url = text['url'];
        }

        if (url !== '' && url.indexOf('https') !== -1) {
            return `<a href="${url}" target="_blank">${url}</a>`;
        } else {
            return text;
        }
    }
}
