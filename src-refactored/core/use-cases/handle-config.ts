import * as path from 'path';

import { CLIProgram } from '../entities/cli-program';

import { cosmiconfig } from 'cosmiconfig';

/**
 * Detect config file with cosmiconfig
 */
export class HandleConfigFile {
    private static instance: HandleConfigFile;

    private cosmiconfigModuleName = 'compodoc';
    private configExplorer;
    private configExplorerResult;

    public configFilePath: string = '';

    constructor() {
        this.configExplorer = cosmiconfig(this.cosmiconfigModuleName);
    }

    public static getInstance() {
        if (!HandleConfigFile.instance) {
            HandleConfigFile.instance = new HandleConfigFile();
        }
        return HandleConfigFile.instance;
    }

    public async handle(currentProgram: CLIProgram) {
        return new Promise(async (resolve, reject) => {
            try {
                if (currentProgram.config) {
                    let configFilePath = currentProgram.config;
                    this.configFilePath = configFilePath;
                    let testConfigFilePath = configFilePath.match(process.cwd());
                    if (testConfigFilePath && testConfigFilePath.length > 0) {
                        configFilePath = configFilePath.replace(process.cwd() + path.sep, '');
                    }

                    this.configExplorerResult = await this.configExplorer.load(
                        path.resolve(configFilePath)
                    );
                } else {
                    this.configExplorerResult = await this.configExplorer.search();
                    if (this.configExplorerResult) {
                        this.configFilePath = path.basename(this.configExplorerResult.filepath);
                    }
                }
                resolve(this.configExplorerResult);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default HandleConfigFile.getInstance();
