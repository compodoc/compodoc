import { IHtmlEngineHelper } from './html-engine-helper.interface';
import * as Handlebars from 'handlebars';

export class ModifKindHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, kind) {
        // https://github.com/Microsoft/TypeScript/blob/master/lib/typescript.d.ts#L62
        let _kindText = '';
        switch (kind) {
            case 112:
                _kindText = 'Private';
                break;
            case 113:
                _kindText = 'Protected';
                break;
            case 114:
                _kindText = 'Public';
                break;
            case 115:
                _kindText = 'Static';
                break;
        }
        return new Handlebars.SafeString(_kindText);
    }
}