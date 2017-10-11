import * as path from 'path';
import * as fs from 'fs-extra';
import * as Shelljs from 'shelljs';
import * as util from 'util';
import * as _ from 'lodash';

import isGlobal from '../../utils/global.path';
import { DependenciesEngine } from './dependencies.engine';

const ngdT = require('@compodoc/ngd-transformer');

export class NgdEngine {
    public engine;

    constructor(private dependenciesEngine: DependenciesEngine) {

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
        return new Promise((resolve, reject) => {
            if (type === 'f') {
                return this.engine.generateGraph([this.dependenciesEngine.getRawModule(name)]);
            } else {
                return this.engine.generateGraph(this.dependenciesEngine.rawModulesForOverview);
            }
        });
    }

    public readGraph(filepath: string, name: string) {
        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve(filepath), 'utf8', (err, data) => {
               if (err) {
                   reject('Error during graph read ' + name);
               } else {
                   resolve(data);
               }
           });
        });
    }
}
