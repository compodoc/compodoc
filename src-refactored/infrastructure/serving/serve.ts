import * as LiveServer from 'live-server';

import { InternalConfiguration } from '../../core/entities/internal-configuration';

interface LiveServerConfiguration {
    root?: string;
    open?: boolean;
    quiet: boolean;
    logLevel: number;
    wait: number;
    host?: string;
    port?: number;
}

export class ServeService {
    private static instance: ServeService;

    public liveServerConfiguration: LiveServerConfiguration;

    constructor() {
        this.liveServerConfiguration = {
            quiet: true,
            logLevel: 0,
            wait: 1000
        };
    }

    public static getInstance() {
        if (!ServeService.instance) {
            ServeService.instance = new ServeService();
        }
        return ServeService.instance;
    }

    public serve(configuration: InternalConfiguration) {
        if (configuration.host !== '') {
            this.liveServerConfiguration.host = configuration.host;
        }
        this.liveServerConfiguration.root = configuration.output;
        this.liveServerConfiguration.open = false;
        this.liveServerConfiguration.port = configuration.port;

        return LiveServer.start(this.liveServerConfiguration);
    }
}

export default ServeService.getInstance();
