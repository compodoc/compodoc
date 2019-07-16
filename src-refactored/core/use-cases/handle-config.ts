import { CommanderStatic } from 'commander';
import * as path from 'path';

import { PublicConfiguration } from '../entities/public-configuration';

const cosmiconfig = require('cosmiconfig');

export class HandleConfigFile {
    private static instance: HandleConfigFile;

    private cosmiconfigModuleName = 'compodoc';
    private configExplorer;
    private configExplorerResult;

    public publicConfig: PublicConfiguration;

    constructor() {
        this.configExplorer = cosmiconfig(this.cosmiconfigModuleName);
    }

    public static getInstance() {
        if (!HandleConfigFile.instance) {
            HandleConfigFile.instance = new HandleConfigFile();
        }
        return HandleConfigFile.instance;
    }

    public async handle(currentProgram: CommanderStatic) {
        return new Promise((resolve, reject) => {
            try {
                if (currentProgram.config) {
                    let configFilePath = currentProgram.config;
                    let testConfigFilePath = configFilePath.match(process.cwd());
                    if (testConfigFilePath && testConfigFilePath.length > 0) {
                        configFilePath = configFilePath.replace(process.cwd() + path.sep, '');
                    }

                    this.configExplorerResult = this.configExplorer.load(
                        path.resolve(configFilePath)
                    );
                } else {
                    this.configExplorerResult = this.configExplorer.search();
                }
                resolve(this.configExplorerResult);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default HandleConfigFile.getInstance();
