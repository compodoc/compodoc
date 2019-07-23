import I18nEngine from './i18n.engine';

describe('Setup i18n and use it', () => {
    beforeAll(async () => {
        return I18nEngine.init('fr-FR');
    });

    it('should translate key', () => {
        const keyTranslated = I18nEngine.translate('controllers');
        expect(keyTranslated).toEqual('Contrôleurs');
    });

    it('should give language support information', () => {
        expect(I18nEngine.supportLanguage('sv-SV')).toBeFalsy();
        expect(I18nEngine.supportLanguage('fr-FR')).toBeTruthy();
    });
});

describe('Setup i18n without supported language and fallback', () => {
    beforeAll(async () => {
        return I18nEngine.init('sv-SV');
    });

    it('should translate key with fallback', () => {
        const keyTranslated = I18nEngine.translate('controllers');
        expect(keyTranslated).toEqual('Controllers');
    });
});
