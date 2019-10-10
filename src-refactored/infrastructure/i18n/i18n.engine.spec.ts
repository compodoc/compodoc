const expect = require('chai').expect;

import I18nEngine from './i18n.engine';

describe('Infrastructure - Setup i18n and use it', () => {
    before(async () => {
        return I18nEngine.init('fr-FR');
    });

    it('should translate key', () => {
        const keyTranslated = I18nEngine.translate('controllers');
        expect(keyTranslated).equal('Contrôleurs');
    });

    it('should give language support information', () => {
        expect(I18nEngine.supportLanguage('sv-SV')).to.be.false;
        expect(I18nEngine.supportLanguage('fr-FR')).to.be.true;
    });
});

describe('Setup i18n without supported language and fallback', () => {
    before(async () => {
        return I18nEngine.init('sv-SV');
    });

    it('should translate key with fallback', () => {
        const keyTranslated = I18nEngine.translate('controllers');
        expect(keyTranslated).equal('Controllers');
    });
});
