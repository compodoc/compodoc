import * as Handlebars from 'handlebars';

import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';

import I18nEngine from '../i18n.engine';

export class I18nHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, i18n_key: string, options: IHandlebarsOptions) {
        let result = I18nEngine.translate(i18n_key);
        return result;
    }
}
