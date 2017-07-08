import * as path from 'path';
import * as fs from 'fs-extra';
import * as Shelljs from 'shelljs';
import * as util from 'util';

import { $dependenciesEngine } from './dependencies.engine';

import isGlobal from '../../utils/global.path';

const ngdCr = require('@compodoc/ngd-core'),
      ngdT = require('@compodoc/ngd-transformer'),
      _ = require('lodash');

export class NgdEngine {
    constructor() {}
    renderGraph(filepath: string, outputpath: string, type: string, name?: string) {
        return new Promise(function(resolve, reject) {
            ngdCr.logger.silent = false;
            let engine = new ngdT.DotEngine({
                output: outputpath,
                displayLegend: true,
                outputFormats: 'svg'
            });
            if (type === 'f') {
                engine
                    .generateGraph([$dependenciesEngine.getRawModule(name)])
                    .then(file => {
                        resolve();
                    }, error => {
                        reject(error);
                    });
            } else {
                engine
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
        return new Promise(function(resolve, reject) {
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
