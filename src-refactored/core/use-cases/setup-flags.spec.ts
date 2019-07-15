import SetupFlags from './setup-flags';

import { COMPODOC_DEFAULTS } from '../defaults';

describe('Should setup flags', () => {
    const pkg = {
        version: '0.0.1'
    };
    let program;

    beforeAll(() => {
        SetupFlags.setup(pkg, COMPODOC_DEFAULTS);
        program = SetupFlags.program;
    });

    it('should handle options', async () => {
        expect(program._version).toEqual(pkg.version);
        expect(program.output).toEqual(COMPODOC_DEFAULTS.folder);
        expect(program.name).toEqual(COMPODOC_DEFAULTS.title);
        expect(program.port).toEqual(COMPODOC_DEFAULTS.port);
        expect(program.exportFormat).toEqual(COMPODOC_DEFAULTS.exportFormat);
        expect(program.language).toEqual(COMPODOC_DEFAULTS.language);
        expect(program.includesName).toEqual(COMPODOC_DEFAULTS.additionalEntryName);
        expect(program.coverageTestThresholdFail).toBeTruthy();
        expect(program.gaSite).toEqual(COMPODOC_DEFAULTS.gaSite);
    });
});
