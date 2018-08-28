import { DependenciesEngine } from './dependencies.engine';
import { ConfigurationInterface } from '../interfaces/configuration.interface';
import { FileEngine } from './file.engine';

import { ExportJsonEngine } from './export-json.engine';

export class ExportEngine {
    private _engine;

    constructor(
        private configuration: ConfigurationInterface,
        private dependenciesEngine: DependenciesEngine,
        private fileEngine: FileEngine = new FileEngine()
    ) {}

    export(outputFolder, data) {
        switch (this.configuration.mainData.exportFormat) {
            case 'json':
                this._engine = new ExportJsonEngine(
                    this.configuration,
                    this.dependenciesEngine,
                    this.fileEngine
                );
                return this._engine.export(outputFolder, data);
        }
    }
}
