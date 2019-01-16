import i18next from 'i18next';

import {
    TRANSLATION_EN_US,
    TRANSLATION_FR_FR,
    TRANSLATION_PT_BR,
    TRANSLATION_ZH_CN
} from '../../locales';

class I18nEngine {
    private static instance: I18nEngine;
    private constructor() {}
    public static getInstance() {
        if (!I18nEngine.instance) {
            I18nEngine.instance = new I18nEngine();
        }
        return I18nEngine.instance;
    }

    private availablesLanguages = {
        'en-US': 'en-US',
        'fr-FR': 'fr-FR',
        'zh-CN': 'zh-CN',
        'pt-BR': 'pt-BR'
    };

    public fallbackLanguage = 'en-US';

    public init(language: string) {
        i18next.init({
            lng: language,
            fallbackLng: this.fallbackLanguage
        });
        i18next.addResources('en-US', 'translation', TRANSLATION_EN_US);
        i18next.addResources('fr-FR', 'translation', TRANSLATION_FR_FR);
        i18next.addResources('zh-CN', 'translation', TRANSLATION_ZH_CN);
        i18next.addResources('pt-BR', 'translation', TRANSLATION_PT_BR);
    }

    public translate(key: string): string {
        return i18next.t(key);
    }

    public supportLanguage(language: string): boolean {
        return typeof this.availablesLanguages[language] !== 'undefined';
    }
}

export default I18nEngine.getInstance();
