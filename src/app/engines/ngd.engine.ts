import * as path from 'path';
import * as fs from 'fs-extra';
import * as Shelljs from 'shelljs';
import * as util from 'util';

import { $dependenciesEngine } from './dependencies.engine';

import isGlobal from '../../utils/global.path';

const ngdT = require('@compodoc/ngd-transformer'),
      _ = require('lodash');

export class NgdEngine {
    engine;
    constructor() {}
    init(outputpath: string) {
        this.engine = new ngdT.DotEngine({
            output: outputpath,
            displayLegend: true,
            outputFormats: 'svg',
            silent: false
        });
    }
    renderGraph(filepath: string, outputpath: string, type: string, name?: string) {
        this.engine.updateOutput(outputpath);
        return new Promise((resolve, reject) => {
            if (type === 'f') {
                this.engine
                    .generateGraph([$dependenciesEngine.getRawModule(name)])
                    .then(file => {
                        resolve();
                    }, error => {
                        reject(error);
                    });
            } else {
                this.engine
                    .generateGraph($dependenciesEngine.rawModulesForOverview)
                    .then(file => {
                        resolve();
                    }, error => {
                        reject(error);
                    });
            }
        });
    }
    readGraph(filepath: string, name: string) {
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
};
