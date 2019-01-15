import { IHtmlEngineHelper } from './html-engine-helper.interface';

export class EscapeSimpleQuoteHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, text: string) {
        if (!text) {
            return;
        }
        text = text.replace(/'/g, "\\'");
        text = text.replace(/(\r\n|\n|\r)/gm, '');
        return text;
    }
}
