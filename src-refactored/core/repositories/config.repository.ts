import { CommanderStatic } from 'commander';

import Logger from '../../infrastructure/logging/logger';

import { COMPODOC_DEFAULTS } from '../defaults';

import { InternalConfiguration } from '../entities/internal-configuration';
import { PublicConfiguration } from '../entities/public-configuration';
import { Flag, PUBLIC_FLAGS } from '../entities/public-flags';

export class ConfigurationRepository {
    private static instance: ConfigurationRepository;

    public publicConfiguration: PublicConfiguration;
    public internalConfiguration: InternalConfiguration;

    constructor() {
        this.publicConfiguration = new PublicConfiguration();
        this.internalConfiguration = new InternalConfiguration();
    }

    public static getInstance() {
        if (!ConfigurationRepository.instance) {
            ConfigurationRepository.instance = new ConfigurationRepository();
        }
        return ConfigurationRepository.instance;
    }

    public update(configExplorerResult) {
        this.publicConfiguration = Object.assign(
            this.publicConfiguration,
            configExplorerResult.config
        );
    }

    public init(currentProgram: PublicConfiguration | CommanderStatic) {
        PUBLIC_FLAGS.forEach((publicFlag: Flag) => {
            if (this.publicConfiguration[publicFlag.label]) {
                this.internalConfiguration[publicFlag.label] = this.publicConfiguration[
                    publicFlag.label
                ];
            }

            if (currentProgram.hasOwnProperty(publicFlag.label)) {
                this.internalConfiguration[publicFlag.label] = currentProgram[publicFlag.label];
            }
        });

        /**
         * Specific use-cases flags
         */

        if (this.publicConfiguration.coverageTest) {
            this.internalConfiguration.coverageTest = true;
            this.internalConfiguration.coverageTestThreshold =
                typeof this.publicConfiguration.coverageTest === 'string'
                    ? parseInt(this.publicConfiguration.coverageTest, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageThreshold;
        }
        if (currentProgram.coverageTest) {
            this.internalConfiguration.coverageTest = true;
            this.internalConfiguration.coverageTestThreshold =
                typeof currentProgram.coverageTest === 'string'
                    ? parseInt(currentProgram.coverageTest, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageThreshold;
        }

        if (this.publicConfiguration.coverageMinimumPerFile) {
            this.internalConfiguration.coverageTestPerFile = true;
            this.internalConfiguration.coverageMinimumPerFile =
                typeof this.publicConfiguration.coverageMinimumPerFile === 'string'
                    ? parseInt(this.publicConfiguration.coverageMinimumPerFile, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageMinimumPerFile;
        }
        if (currentProgram.coverageMinimumPerFile) {
            this.internalConfiguration.coverageTestPerFile = true;
            this.internalConfiguration.coverageMinimumPerFile =
                typeof currentProgram.coverageMinimumPerFile === 'string'
                    ? parseInt(currentProgram.coverageMinimumPerFile, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageMinimumPerFile;
        }

        if (this.publicConfiguration.coverageTestThresholdFail) {
            this.internalConfiguration.coverageTestThresholdFail =
                this.publicConfiguration.coverageTestThresholdFail === 'false' ? false : true;
        }
        if (currentProgram.coverageTestThresholdFail) {
            this.internalConfiguration.coverageTestThresholdFail =
                currentProgram.coverageTestThresholdFail === 'false' ? false : true;
        }

        if (this.publicConfiguration.host) {
            this.internalConfiguration.host = this.publicConfiguration.host;
            this.internalConfiguration.hostname = this.publicConfiguration.host;
        }
        if (currentProgram.host) {
            this.internalConfiguration.host = currentProgram.host;
            this.internalConfiguration.hostname = currentProgram.host;
        }

        if (this.publicConfiguration.minimal) {
            this.internalConfiguration.disableSearch = true;
            this.internalConfiguration.disableRoutesGraph = true;
            this.internalConfiguration.disableGraph = true;
            this.internalConfiguration.disableCoverage = true;
        }
        if (currentProgram.minimal) {
            this.internalConfiguration.disableSearch = true;
            this.internalConfiguration.disableRoutesGraph = true;
            this.internalConfiguration.disableGraph = true;
            this.internalConfiguration.disableCoverage = true;
        }

        if (
            currentProgram.navTabConfig &&
            JSON.parse(currentProgram.navTabConfig).length !== COMPODOC_DEFAULTS.navTabConfig.length
        ) {
            this.internalConfiguration.navTabConfig = JSON.parse(currentProgram.navTabConfig);
        }

        if (this.publicConfiguration.silent) {
            Logger.silent = true;
        }
        if (currentProgram.silent) {
            Logger.silent = true;
        }
    }
}

export default ConfigurationRepository.getInstance();
