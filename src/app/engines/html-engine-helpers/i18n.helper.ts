const Handlebars = require('handlebars');

import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';

import I18nEngine from '../i18n.engine';

export class I18nHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, i18n_key: string) {
        if (I18nEngine.exists(i18n_key)) {
            return I18nEngine.translate(i18n_key.toLowerCase());
        } else {
            return i18n_key;
        }
    }
}
