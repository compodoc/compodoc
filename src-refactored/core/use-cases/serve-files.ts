import FileEngine from '../../infrastructure/files/file.engine';
import Logger from '../../infrastructure/logging/logger';
import ServeService from '../../infrastructure/serving/serve';

import { InternalConfiguration } from '../entities/internal-configuration';

export class ServeFiles {
    private static instance: ServeFiles;

    private server;

    constructor() {}

    public static getInstance() {
        if (!ServeFiles.instance) {
            ServeFiles.instance = new ServeFiles();
        }
        return ServeFiles.instance;
    }

    public serve(configuration: InternalConfiguration) {
        if (!FileEngine.existsSync(configuration.output)) {
            Logger.error(`${configuration.output} folder doesn't exist`);
            process.exit(1);
        } else {
            this.displayServingMessage(configuration);
            this.server = ServeService.serve(configuration);
        }
    }

    public stop() {
        this.server.close();
    }

    private displayServingMessage(configuration: InternalConfiguration) {
        Logger.info(
            `Serving documentation from ${configuration.output} at http://${configuration.hostname}:${configuration.port}`
        );
    }
}

export default ServeFiles.getInstance();
