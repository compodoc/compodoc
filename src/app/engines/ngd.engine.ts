import DependenciesEngine from './dependencies.engine';
import FileEngine from './file.engine';

const ngdT = require('@compodoc/ngd-transformer');

export class NgdEngine {
    public engine;

    private static instance: NgdEngine;
    private constructor() {}
    public static getInstance() {
        if (!NgdEngine.instance) {
            NgdEngine.instance = new NgdEngine();
        }
        return NgdEngine.instance;
    }

    public init(outputpath: string) {
        this.engine = new ngdT.DotEngine({
            output: outputpath,
            displayLegend: true,
            outputFormats: 'svg',
            silent: true
        });
    }

    public renderGraph(filepath: string, outputpath: string, type: string, name?: string) {
        this.engine.updateOutput(outputpath);

        if (type === 'f') {
            return this.engine.generateGraph([DependenciesEngine.getRawModule(name)]);
        } else {
            return this.engine.generateGraph(DependenciesEngine.rawModulesForOverview);
        }
    }

    public readGraph(filepath: string, name: string): Promise<string> {
        return FileEngine.get(filepath).catch(err =>
            Promise.reject('Error during graph read ' + name)
        );
    }
}

export default NgdEngine.getInstance();
