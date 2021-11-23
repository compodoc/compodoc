import i18next from 'i18next';

import {
    TRANSLATION_DE_DE,
    TRANSLATION_EN_US,
    TRANSLATION_ES_ES,
    TRANSLATION_FR_FR,
    TRANSLATION_HU_HU,
    TRANSLATION_IT_IT,
    TRANSLATION_JA_JP,
    TRANSLATION_KO_KR,
    TRANSLATION_NL_NL,
    TRANSLATION_PL_PL,
    TRANSLATION_PT_BR,
    TRANSLATION_SK_SK,
    TRANSLATION_ZH_CN,
    TRANSLATION_ZH_TW
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
        'de-DE': 'de-DE',
        'en-US': 'en-US',
        'es-ES': 'es-ES',
        'fr-FR': 'fr-FR',
        'hu-HU': 'hu-HU',
        'it-IT': 'it-IT',
        'ja-JP': 'ja-JP',
        'ko-KR': 'ko-KR',
        'nl-NL': 'nl-NL',
        'pl-PL': 'pl-PL',
        'pt-BR': 'pt-BR',
        'sk-SK': 'sk-SK',
        'zh-CN': 'zh-CN',
        'zh-TW': 'zh-TW'
    };

    public fallbackLanguage = 'en-US';

    public init(language: string) {
        i18next.init({
            lng: language,
            fallbackLng: this.fallbackLanguage,
            interpolation: {
                skipOnVariables: false
            }
        });
        i18next.addResources('de-DE', 'translation', TRANSLATION_DE_DE);
        i18next.addResources('en-US', 'translation', TRANSLATION_EN_US);
        i18next.addResources('es-ES', 'translation', TRANSLATION_ES_ES);
        i18next.addResources('fr-FR', 'translation', TRANSLATION_FR_FR);
        i18next.addResources('hu-HU', 'translation', TRANSLATION_HU_HU);
        i18next.addResources('it-IT', 'translation', TRANSLATION_IT_IT);
        i18next.addResources('ja-JP', 'translation', TRANSLATION_JA_JP);
        i18next.addResources('ko-KR', 'translation', TRANSLATION_KO_KR);
        i18next.addResources('nl-NL', 'translation', TRANSLATION_NL_NL);
        i18next.addResources('pl-PL', 'translation', TRANSLATION_PL_PL);
        i18next.addResources('pt-BR', 'translation', TRANSLATION_PT_BR);
        i18next.addResources('sk-SK', 'translation', TRANSLATION_SK_SK);
        i18next.addResources('zh-CN', 'translation', TRANSLATION_ZH_CN);
        i18next.addResources('zh-TW', 'translation', TRANSLATION_ZH_TW);
    }

    public translate(key: string): string {
        return i18next.t(key);
    }

    public exists(key: string): boolean {
        return i18next.exists(key);
    }

    public supportLanguage(language: string): boolean {
        return typeof this.availablesLanguages[language] !== 'undefined';
    }
}

export default I18nEngine.getInstance();
