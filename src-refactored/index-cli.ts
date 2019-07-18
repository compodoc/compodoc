import { CommanderStatic } from 'commander';

import ConfigurationRepository from './core/repositories/config.repository';
import DisplayEnvironmentVersions from './core/use-cases/display-environment-versions';
import HandleConfigFile from './core/use-cases/handle-config';
import ScanFile from './core/use-cases/scan-files';
import SetupFlags from './core/use-cases/setup-flags';

import I18nEngine from './infrastructure/i18n/i18n.engine';
import Logger from './infrastructure/logging/logger';

const compodocPackageJsonFile = require('../package.json');

process.setMaxListeners(0);

export class CliApplication {
    public isWatching = false;

    public async start() {
        /**
         * Setup flags with commander
         */
        const currentProgram: CommanderStatic = SetupFlags.setup(compodocPackageJsonFile);
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

        /**
         * Display environement versions : compodoc, TypeScript, Node.js, OS
         */
        DisplayEnvironmentVersions.display(compodocPackageJsonFile);

        if (configExplorerResult) {
            Logger.info(`Using configuration file : ${configExplorerResult.filepath}`);
        } else {
            Logger.warn(`No configuration file found, switching to CLI flags.`);
        }

        if (currentProgram.language && !I18nEngine.supportLanguage(currentProgram.language)) {
            Logger.warn(
                `The language ${currentProgram.language} is not available, falling back to ${I18nEngine.fallbackLanguage}`
            );
        }

        I18nEngine.init(currentProgram.language);

        setTimeout(() => {
            console.log(I18nEngine.translate('constructor'));
        }, 1000);

        /**
         * Scan files
         */
        let files;
        ScanFile.scan('').then(scannedFiles => {
            files = scannedFiles;
        });
    }
}
