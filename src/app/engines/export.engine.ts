import * as path from 'path';

import { logger } from '../../logger';
import { DependenciesEngine } from './dependencies.engine';
import { ConfigurationInterface } from '../interfaces/configuration.interface';
import { FileEngine } from './file.engine';

import { ExportData } from '../interfaces/export-data.interface';

//const CircularJSON = require('circular-json');

export class ExportEngine {
    constructor(
        configuration: ConfigurationInterface,
        dependenciesEngine: DependenciesEngine,
        private fileEngine: FileEngine = new FileEngine()) {
    }

    export(outputFolder, data) {

        //console.log(data);

        let exportData: ExportData = {};

        exportData.pipes = data.pipes;
        //exportData.interfaces = data.interfaces; Circular structure
        //exportData.injectables = data.injectables; Circular structure
        //exportData.classes = data.classes; Circular structure
        //exportData.directives = data.directives; Circular structure
        //exportData.components = data.components; Circular structure
        //exportData.modules = data.modules; Circular structure
        //exportData.miscellaneous = data.miscellaneous; Circular structure
        exportData.routes = data.routes;
        exportData.coverage = data.coverageData;

        return this.fileEngine
            .write(outputFolder + path.sep + '/documentation.json', JSON.stringify(exportData))
            .catch(err => {
                logger.error('Error during export file generation ', err);
                return Promise.reject(err);
            });
    }
};
