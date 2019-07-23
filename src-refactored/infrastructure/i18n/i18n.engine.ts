const i18next = require('i18next');

import {
    TRANSLATION_DE_DE,
    TRANSLATION_EN_US,
    TRANSLATION_ES_ES,
    TRANSLATION_FR_FR,
    TRANSLATION_HU_HU,
    TRANSLATION_IT_IT,
    TRANSLATION_JA_JP,
    TRANSLATION_NL_NL,
    TRANSLATION_PT_BR,
    TRANSLATION_ZH_CN
} from './locales';

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
        'nl-NL': 'nl-NL',
        'pt-BR': 'pt-BR',
        'zh-CN': 'zh-CN'
    };

    public fallbackLanguage = 'en-US';

    public async init(language: string) {
        return i18next.init({
            lng: language,
            fallbackLng: this.fallbackLanguage,
            resources: {
                'de-DE': {
                    translation: TRANSLATION_DE_DE
                },
                'en-US': {
                    translation: TRANSLATION_EN_US
                },
                'es-ES': {
                    translation: TRANSLATION_ES_ES
                },
                'fr-FR': {
                    translation: TRANSLATION_FR_FR
                },
                'hu-HU': {
                    translation: TRANSLATION_HU_HU
                },
                'it-IT': {
                    translation: TRANSLATION_IT_IT
                },
                'ja-JP': {
                    translation: TRANSLATION_JA_JP
                },
                'nl-NL': {
                    translation: TRANSLATION_NL_NL
                },
                'pt-BR': {
                    translation: TRANSLATION_PT_BR
                },
                'zh-CN': {
                    translation: TRANSLATION_ZH_CN
                }
            }
        });
    }

    public translate(key: string): string {
        return i18next.t(key);
    }

    public supportLanguage(language: string): boolean {
        return typeof this.availablesLanguages[language] !== 'undefined';
    }
}

export default I18nEngine.getInstance();
