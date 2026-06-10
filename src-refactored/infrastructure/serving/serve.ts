import { InternalConfiguration } from '../../core/entities/internal-configuration';
import {
    DocumentationServerConfiguration,
    startDocumentationServer
} from '../../../src/utils/documentation-server';

export class ServeService {
    private static instance: ServeService;

    public documentationServerConfiguration: DocumentationServerConfiguration;

    constructor() {
        this.documentationServerConfiguration = {
            root: '',
            port: 8080
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
            this.documentationServerConfiguration.host = configuration.host;
        }
        this.documentationServerConfiguration.root = configuration.output;
        this.documentationServerConfiguration.open = false;
        this.documentationServerConfiguration.port = configuration.port;

        return startDocumentationServer(this.documentationServerConfiguration);
    }
}

export default ServeService.getInstance();
