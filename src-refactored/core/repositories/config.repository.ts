import { CommanderStatic } from 'commander';

import { COMPODOC_DEFAULTS } from '../defaults';

import { InternalConfiguration } from '../entities/internal-configuration';
import { PublicConfiguration } from '../entities/public-configuration';

export class ConfigurationRepository {
    private static instance: ConfigurationRepository;

    public publicConfiguration;
    public internalConfiguration;

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
        if (this.publicConfiguration.output) {
            this.internalConfiguration.output = this.publicConfiguration.output;
        }
        if (currentProgram.output && currentProgram.output !== COMPODOC_DEFAULTS.folder) {
            this.internalConfiguration.output = currentProgram.output;
        }
    }
}

export default ConfigurationRepository.getInstance();
