import * as path from 'path';

import Configuration from '../configuration';

import { logger } from '../../utils/logger';
import DependenciesEngine from './dependencies.engine';

import { ExportData } from '../interfaces/export-data.interface';

import { AngularNgModuleNode } from '../nodes/angular-ngmodule-node';
import FileEngine from './file.engine';

const traverse = require('traverse');

export class ExportJsonEngine {
    private static instance: ExportJsonEngine;
    private constructor() {}
    public static getInstance() {
        if (!ExportJsonEngine.instance) {
            ExportJsonEngine.instance = new ExportJsonEngine();
        }
        return ExportJsonEngine.instance;
    }

    public export(outputFolder, data) {
        let exportData: ExportData = {};

        traverse(data).forEach(function(node) {
            if (node) {
                if (node.parent) {
                    delete node.parent;
                }
                if (node.initializer) {
                    delete node.initializer;
                }
                if (Configuration.mainData.disableSourceCode) {
                    delete node.sourceCode;
                }
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
        if (!Configuration.mainData.disableRoutesGraph) {
            exportData.routes = data.routes;
        }
        if (!Configuration.mainData.disableCoverage) {
            exportData.coverage = data.coverageData;
        }

        return FileEngine.write(
            outputFolder + path.sep + '/documentation.json',
            JSON.stringify(exportData, undefined, 4)
        ).catch(err => {
            logger.error('Error during export file generation ', err);
            return Promise.reject(err);
        });
    }

    public processModules() {
        const modules: AngularNgModuleNode[] = DependenciesEngine.getModules();

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

export default ExportJsonEngine.getInstance();
