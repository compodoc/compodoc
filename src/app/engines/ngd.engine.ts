import { DependenciesEngine } from './dependencies.engine';
import { FileEngine } from './file.engine';

const ngdT = require('@compodoc/ngd-transformer');

export class NgdEngine {
    public engine;

    constructor(
        private dependenciesEngine: DependenciesEngine,
        private fileEngine: FileEngine = new FileEngine()) {

    }

    public init(outputpath: string) {
        this.engine = new ngdT.DotEngine({
            output: outputpath,
            displayLegend: true,
            outputFormats: 'svg',
            silent: false
        });
    }

    public renderGraph(filepath: string, outputpath: string, type: string, name?: string) {
        this.engine.updateOutput(outputpath);

        if (type === 'f') {
            return this.engine.generateGraph([this.dependenciesEngine.getRawModule(name)]);
        } else {
            return this.engine.generateGraph(this.dependenciesEngine.rawModulesForOverview);
        }
    }

    public readGraph(filepath: string, name: string): Promise<string> {
        return this.fileEngine
            .get(filepath)
            .catch(err => Promise.reject('Error during graph read ' + name));
    }
}
