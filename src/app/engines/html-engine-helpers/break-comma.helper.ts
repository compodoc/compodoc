import { IHtmlEngineHelper } from './html-engine-helper.interface';
const Handlebars = require('handlebars');

export class BreakCommaHelper implements IHtmlEngineHelper {
    constructor(private bars) {}

    public helperFunc(context: any, text: string) {
        text = this.bars.Utils.escapeExpression(text);
        text = text.replace(/,/g, ',<br>');
        return new Handlebars.SafeString(text);
    }
}
