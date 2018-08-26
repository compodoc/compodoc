import * as Handlebars from 'handlebars';

import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';

import I18nEngineInstance from '../i18n.engine';

export class I18nHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, i18n_key: string, options: IHandlebarsOptions) {
        const result = I18nEngineInstance.translate(i18n_key);
        return new Handlebars.SafeString(result);
    }
}
