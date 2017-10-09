import { IHtmlEngineHelper } from './html-engine-helper.interface';

export class EscapeSimpleQuoteHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, text) {
        if (!text) {
            return;
        }
        let _text = text.replace(/'/g, "\\'");
        _text = _text.replace(/(\r\n|\n|\r)/gm, '');
        return _text;
    }
}