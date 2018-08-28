import i18next from 'i18next';

import { TRANSLATION_EN_US, TRANSLATION_FR_FR, TRANSLATION_ZH_CN } from '../../locales';

class I18nEngine {
    constructor() {}

    public init(language: string) {
        i18next.init({
            lng: language,
            fallbackLng: 'en-US'
        });
        i18next.addResources('en-US', 'translation', TRANSLATION_EN_US);
        i18next.addResources('fr-FR', 'translation', TRANSLATION_FR_FR);
        i18next.addResources('zh_CN', 'translation', TRANSLATION_ZH_CN);
    }

    public translate(key: string): string {
        return i18next.t(key);
    }
}

export default new I18nEngine();
