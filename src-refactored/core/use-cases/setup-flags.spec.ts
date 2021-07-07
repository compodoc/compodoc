const expect = require('chai').expect;

import SetupFlags from './setup-flags';

import { COMPODOC_DEFAULTS } from '../defaults';

describe('Use-cases - Should setup flags', () => {
    const pkg = {
        version: '0.0.1'
    };
    let options;

    beforeEach(() => {
        SetupFlags.setup(pkg);
        options = SetupFlags.programOptions;
    });

    it('should handle options', async () => {
        expect(options.coverageTestThresholdFail).to.be.true;
        expect(options.exportFormat).equal(COMPODOC_DEFAULTS.exportFormat);
        expect(options.gaSite).equal(COMPODOC_DEFAULTS.gaSite);
        expect(options.includesName).equal(COMPODOC_DEFAULTS.additionalEntryName);
        expect(options.language).equal(COMPODOC_DEFAULTS.language);
        expect(options.name).equal(COMPODOC_DEFAULTS.title);
        expect(options.output).equal(COMPODOC_DEFAULTS.folder);
        expect(options.port).equal(COMPODOC_DEFAULTS.port);
        expect(options.toggleMenuItems).equal(COMPODOC_DEFAULTS.toggleMenuItems);
    });
});
