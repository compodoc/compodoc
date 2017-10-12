import { IHtmlEngineHelper } from './html-engine-helper.interface';
import * as Handlebars from 'handlebars';

export class ObjectHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, text: string) {
        text = JSON.stringify(text);
        text = text.replace(/{"/, '{<br>&nbsp;&nbsp;&nbsp;&nbsp;"');
        text = text.replace(/,"/, ',<br>&nbsp;&nbsp;&nbsp;&nbsp;"');
        text = text.replace(/}$/, '<br>}');
        return new Handlebars.SafeString(text);
    }
}