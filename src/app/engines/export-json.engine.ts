import * as path from 'path';

import { logger } from '../../logger';
import { DependenciesEngine } from './dependencies.engine';
import { ConfigurationInterface } from '../interfaces/configuration.interface';
import { FileEngine } from './file.engine';

import { ExportData } from '../interfaces/export-data.interface';

import { AngularNgModuleNode } from '../nodes/angular-ngmodule-node';

const traverse = require('traverse');

export class ExportJsonEngine {
    constructor(
        private configuration: ConfigurationInterface,
        private dependenciesEngine: DependenciesEngine,
        private fileEngine: FileEngine = new FileEngine()
    ) {}

    export(outputFolder, data) {
        let exportData: ExportData = {};

        traverse(data).forEach(function(node) {
            if (node) {
                if (node.parent) delete node.parent;
                if (node.initializer) delete node.initializer;
            }
        });

        exportData.pipes = data.pipes;
        exportData.interfaces = data.interfaces;
        exportData.injectables = data.injectables;
        exportData.classes = data.classes;
        exportData.directives = data.directives;
        exportData.components = data.components;
        exportData.modules = this.processModules();
        exportData.miscellaneous = data.miscellaneous;
        exportData.routes = data.routes;
        exportData.coverage = data.coverageData;

        return this.fileEngine
            .write(
                outputFolder + path.sep + '/documentation.json',
                JSON.stringify(exportData, null, 4)
            )
            .catch(err => {
                logger.error('Error during export file generation ', err);
                return Promise.reject(err);
            });
    }

    processModules() {
        const modules: AngularNgModuleNode[] = this.dependenciesEngine.getModules();

        let _resultedModules = [];

        for (let moduleNr = 0; moduleNr < modules.length; moduleNr++) {
            const moduleElement = {
                name: modules[moduleNr].name,
                children: [
                    {
                        type: 'providers',
                        elements: []
                    },
                    {
                        type: 'declarations',
                        elements: []
                    },
                    {
                        type: 'imports',
                        elements: []
                    },
                    {
                        type: 'exports',
                        elements: []
                    },
                    {
                        type: 'bootstrap',
                        elements: []
                    },
                    {
                        type: 'classes',
                        elements: []
                    }
                ]
            };

            for (let k = 0; k < modules[moduleNr].providers.length; k++) {
                const providerElement = {
                    name: modules[moduleNr].providers[k].name
                };
                moduleElement.children[0].elements.push(providerElement);
            }
            for (let k = 0; k < modules[moduleNr].declarations.length; k++) {
                const declarationElement = {
                    name: modules[moduleNr].declarations[k].name
                };
                moduleElement.children[1].elements.push(declarationElement);
            }
            for (let k = 0; k < modules[moduleNr].imports.length; k++) {
                const importElement = {
                    name: modules[moduleNr].imports[k].name
                };
                moduleElement.children[2].elements.push(importElement);
            }
            for (let k = 0; k < modules[moduleNr].exports.length; k++) {
                const exportElement = {
                    name: modules[moduleNr].exports[k].name
                };
                moduleElement.children[3].elements.push(exportElement);
            }
            for (let k = 0; k < modules[moduleNr].bootstrap.length; k++) {
                const bootstrapElement = {
                    name: modules[moduleNr].bootstrap[k].name
                };
                moduleElement.children[4].elements.push(bootstrapElement);
            }

            _resultedModules.push(moduleElement);
        }

        return _resultedModules;
    }
}
