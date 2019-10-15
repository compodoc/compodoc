import * as path from 'path';

import ConfigurationRepository from '../repositories/config.repository';

import FileEngine from '../../infrastructure/files/file.engine';
import Logger from '../../infrastructure/logging/logger';
import { readTsconfigFile } from '../../infrastructure/files/tsconfig.file.util';

export class HandleTsconfigFile {
    private static instance: HandleTsconfigFile;

    constructor() {}

    public static getInstance() {
        if (!HandleTsconfigFile.instance) {
            HandleTsconfigFile.instance = new HandleTsconfigFile();
        }
        return HandleTsconfigFile.instance;
    }

    public async handle() {
        /**
         * 1. is tsconfig file provided with -p flag
         * 1b. if file doesn't exist, error and exit
         * 3. log that we handle the file
         * 4. read it
         * 5. find attributes : files, exclude, include
         */
        return new Promise(async (resolve, reject) => {
            let tsconfigFileName = ConfigurationRepository.internalConfiguration.tsconfig;
            let cwdLocal;

            if (tsconfigFileName) {
                if (!FileEngine.existsSync(tsconfigFileName)) {
                    reject(`${tsconfigFileName} file was not found in the current directory`);
                } else {
                    let tsconfigFilePath = tsconfigFileName.indexOf(process.cwd());
                    if (tsconfigFilePath !== -1) {
                        ConfigurationRepository.internalConfiguration.tsconfigFilePath = tsconfigFileName.replace(
                            process.cwd() + path.sep,
                            ''
                        );
                    }
                    ConfigurationRepository.internalConfiguration.tsconfigFilePath = path.join(
                        path.join(process.cwd(), path.dirname(tsconfigFileName)),
                        path.basename(tsconfigFileName)
                    );

                    cwdLocal = ConfigurationRepository.internalConfiguration.tsconfigFilePath
                        .split(path.sep)
                        .slice(0, -1)
                        .join(path.sep);

                    Logger.info(`Using tsconfig file : ${tsconfigFileName}`);
                }
            } else {
                Logger.warn(
                    'No tsconfig file provided with flags, trying to find it at root level'
                );
            }

            let tsConfigFile = readTsconfigFile(
                ConfigurationRepository.internalConfiguration.tsconfigFilePath
            );

            resolve(tsConfigFile);
        });
    }
}

export default HandleTsconfigFile.getInstance();
