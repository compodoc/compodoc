import ScanFile from './core/use-cases/scan-files';
import SetupFlags from './core/use-cases/setup-flags';

import { COMPODOC_DEFAULTS } from './core/defaults';

const pkg = require('../package.json');

export class CliApplication {
    public async start() {
        SetupFlags.setup(pkg, COMPODOC_DEFAULTS);

        let files;
        ScanFile.scan('').then(scannedFiles => {
            files = scannedFiles;
        });
    }
}
