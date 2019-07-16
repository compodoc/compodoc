import SetupFlags from './setup-flags';

import { COMPODOC_DEFAULTS } from '../defaults';

describe('Should setup flags', () => {
    const pkg = {
        version: '0.0.1'
    };
    let program;
    let options;

    beforeAll(() => {
        SetupFlags.setup(pkg);
        program = SetupFlags.program;
        options = program.opts();
    });

    it('should handle options', async () => {
        expect(options.version).toEqual(pkg.version);
        expect(options.coverageTestThresholdFail).toBeTruthy();
        expect(options.exportFormat).toEqual(COMPODOC_DEFAULTS.exportFormat);
        expect(options.gaSite).toEqual(COMPODOC_DEFAULTS.gaSite);
        expect(options.includesName).toEqual(COMPODOC_DEFAULTS.additionalEntryName);
        expect(options.language).toEqual(COMPODOC_DEFAULTS.language);
        expect(options.name).toEqual(COMPODOC_DEFAULTS.title);
        expect(options.output).toEqual(COMPODOC_DEFAULTS.folder);
        expect(options.port).toEqual(COMPODOC_DEFAULTS.port);
        expect(options.toggleMenuItems).toEqual(COMPODOC_DEFAULTS.toggleMenuItems);
    });
});
