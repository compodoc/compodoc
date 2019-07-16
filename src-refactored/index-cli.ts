import { CommanderStatic } from 'commander';

import ConfigurationRepository from './core/repositories/config.repository';

import HandleConfigFile from './core/use-cases/handle-config';
import ScanFile from './core/use-cases/scan-files';
import SetupFlags from './core/use-cases/setup-flags';

import { COMPODOC_DEFAULTS } from './core/defaults';

const pkg = require('../package.json');

export class CliApplication {
    public async start() {
        /**
         * Setup flags with commander
         */
        const currentProgram: CommanderStatic = SetupFlags.setup(pkg, COMPODOC_DEFAULTS);
        /**
         * Detect config file
         */
        const configExplorerResult = await HandleConfigFile.handle(currentProgram);

        /**
         * Update public configuration with detected config file
         */
        if (configExplorerResult) {
            ConfigurationRepository.update(configExplorerResult);
        }
        /**
         * Update internal configuration
         */
        ConfigurationRepository.init(currentProgram);

        console.log(ConfigurationRepository.publicConfiguration);
        console.log(ConfigurationRepository.internalConfiguration);

        /**
         * Scan files
         */
        let files;
        ScanFile.scan('').then(scannedFiles => {
            files = scannedFiles;
        });
    }
}
