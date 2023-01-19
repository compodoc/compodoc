import { IHtmlEngineHelper } from './html-engine-helper.interface';
const Handlebars = require('handlebars');

export class ParsePropertyHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, text: string) {
        let prop: any = text;

        if (!!text && text.constructor === Object && text['url'] !== undefined) {
            prop = text['url'];
        }

        if (!!text && text.constructor === Object && text['name'] !== undefined) {
            prop = text['name'];
        }

        if (!!text && text.constructor === Object && Object.keys(text).length === 0) {
            prop = '';
        }

        if (prop instanceof String && prop !== '' && prop.indexOf('https') !== -1) {
            return `<a href="${prop}" target="_blank">${prop}</a>`;
        } else if (prop !== '' && prop instanceof Array && prop.length > 0) {
            prop = JSON.stringify(prop);
            prop = prop.replace(/","/g, ', ');
            prop = prop.replace(/\["/g, '');
            prop = prop.replace(/"]/g, '');
            return prop;
        } else {
            return prop;
        }
    }
}
