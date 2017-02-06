import * as path from 'path';
import * as Shelljs from 'shelljs';
import * as _ from 'lodash';
import * as util from 'util';

import { $dependenciesEngine } from './dependencies.engine';

import isGlobal from '../../utils/global.path';

let ngdCr = require('@compodoc/ngd-core');
let ngdT = require('@compodoc/ngd-transformer');

export class NgdEngine {
    constructor() {

    }
    renderGraph(filepath: String, outputpath: String, type: String, name?: string) {
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
                    .generateGraph($dependenciesEngine.rawModules)
                    .then(file => {
                        resolve();
                    }, error => {
                        reject(error);
                    });
            }
        });
    }
};
