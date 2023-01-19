import { IHtmlEngineHelper } from './html-engine-helper.interface';
const Handlebars = require('handlebars');

export class BreakLinesHelper implements IHtmlEngineHelper {
    constructor(private bars) {}

    public helperFunc(context: any, text: string) {
        text = this.bars.Utils.escapeExpression(text);
        text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
        text = text.replace(/ /gm, '&nbsp;');
        text = text.replace(/	/gm, '&nbsp;&nbsp;&nbsp;&nbsp;');
        return new Handlebars.SafeString(text);
    }
}
