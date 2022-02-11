import { IHtmlEngineHelper } from './html-engine-helper.interface';
import * as Handlebars from 'handlebars';

export class ParsePropertyHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, text: string) {
        let prop = text;

        if (typeof text === 'object' && text['url'] !== undefined) {
            prop = text['url'];
        }

        if (typeof text === 'object' && text['name'] !== undefined) {
            prop = text['name'];
        }

        if (prop !== '' && prop.indexOf('https') !== -1) {
            return `<a href="${prop}" target="_blank">${prop}</a>`;
        } else {
            return prop;
        }
    }
}
