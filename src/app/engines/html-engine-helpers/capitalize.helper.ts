import { IHtmlEngineHelper } from './html-engine-helper.interface';
import * as Handlebars from 'handlebars';

export class CapitalizeHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, text: string) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
}
