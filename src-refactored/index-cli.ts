import { CommanderStatic } from 'commander';

import HandleConfigFile from './core/use-cases/handle-config';
import ScanFile from './core/use-cases/scan-files';
import SetupFlags from './core/use-cases/setup-flags';

import { COMPODOC_DEFAULTS } from './core/defaults';

const pkg = require('../package.json');

export class CliApplication {
    public async start() {
        let currentProgram: CommanderStatic = SetupFlags.setup(pkg, COMPODOC_DEFAULTS);
        HandleConfigFile.handle(currentProgram);

        let files;
        ScanFile.scan('').then(scannedFiles => {
            files = scannedFiles;
        });
    }
}
