import I18nEngine from './i18n.engine';

describe('Setup i18n and use it', () => {
    beforeAll(async () => {
        return I18nEngine.init('fr-FR');
    });

    it('should translate key', async () => {
        const keyTranslated = I18nEngine.translate('controllers');
        expect(keyTranslated).toEqual('Contrôleurs');
    });
});
