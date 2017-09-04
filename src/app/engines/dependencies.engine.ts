import { finderInAngularAPIs } from '../../utils/angular-api';

import { ParsedData } from '../interfaces/parsed-data.interface';
import { MiscellaneousData } from '../interfaces/miscellaneous-data.interface';

import { getNamesCompareFn } from '../../utils/utils';

const _ = require('lodash');

class DependenciesEngine {
    private static _instance:DependenciesEngine = new DependenciesEngine();

    rawData: ParsedData;
    modules: Object[];
    rawModules: Object[];
    rawModulesForOverview: Object[];
    components: Object[];
    directives: Object[];
    injectables: Object[];
    interfaces: Object[];
    routes: Object[];
    pipes: Object[];
    classes: Object[];
    miscellaneous: MiscellaneousData;

    constructor() {
        if(DependenciesEngine._instance){
            throw new Error('Error: Instantiation failed: Use DependenciesEngine.getInstance() instead of new.');
        }
        DependenciesEngine._instance = this;
    }
    public static getInstance():DependenciesEngine
    {
        return DependenciesEngine._instance;
    }
    cleanModules(modules) {
        let _m = modules,
            i = 0,
            len = modules.length;
        for(i; i<len; i++) {
            let j = 0,
                leng = _m[i].declarations.length;
            for(j; j<leng; j++) {
                let k = 0,
                    lengt;
                if (_m[i].declarations[j].jsdoctags) {
                    lengt = _m[i].declarations[j].jsdoctags.length;
                    for(k; k<lengt; k++) {
                        delete _m[i].declarations[j].jsdoctags[k].parent;
                    }
                }
                if (_m[i].declarations[j].constructorObj) {
                    if (_m[i].declarations[j].constructorObj.jsdoctags) {
                        lengt = _m[i].declarations[j].constructorObj.jsdoctags.length;
                        for(k; k<lengt; k++) {
                            delete _m[i].declarations[j].constructorObj.jsdoctags[k].parent;
                        }
                    }
                }
            }
        }
        return _m;
    }
    init(data: ParsedData) {
        this.rawData = data;
        this.modules = _.sortBy(this.rawData.modules, ['name']);
        this.rawModulesForOverview = _.sortBy(data.modulesForGraph, ['name']);
        this.rawModules = _.sortBy(data.modulesForGraph, ['name']);
        this.components = _.sortBy(this.rawData.components, ['name']);
        this.directives = _.sortBy(this.rawData.directives, ['name']);
        this.injectables = _.sortBy(this.rawData.injectables, ['name']);
        this.interfaces = _.sortBy(this.rawData.interfaces, ['name']);
        this.pipes = _.sortBy(this.rawData.pipes, ['name']);
        this.classes = _.sortBy(this.rawData.classes, ['name']);
        this.miscellaneous = this.rawData.miscellaneous;
        this.prepareMiscellaneous();
        this.routes = this.rawData.routesTree;
    }
    find(type: string) {
        let finderInCompodocDependencies = function(data) {
            let _result = {
                    source: 'internal',
                    data: null
                },
                i = 0,
                len = data.length;
            for (i; i<len; i++) {
                if (typeof type !== 'undefined') {
                    if (type.indexOf(data[i].name) !== -1) {
                        _result.data = data[i]
                    }
                }
            }
            return _result;
        },

            resultInCompodocInjectables = finderInCompodocDependencies(this.injectables),
            resultInCompodocInterfaces = finderInCompodocDependencies(this.interfaces),
            resultInCompodocClasses = finderInCompodocDependencies(this.classes),
            resultInCompodocComponents = finderInCompodocDependencies(this.components),
            resultInCompodocMiscellaneousVariables = finderInCompodocDependencies(this.miscellaneous.variables),
            resultInCompodocMiscellaneousFunctions = finderInCompodocDependencies(this.miscellaneous.functions),
            resultInCompodocMiscellaneousTypealiases = finderInCompodocDependencies(this.miscellaneous.typealiases),
            resultInCompodocMiscellaneousEnumerations = finderInCompodocDependencies(this.miscellaneous.enumerations),
            resultInAngularAPIs = finderInAngularAPIs(type)

        if (resultInCompodocInjectables.data !== null) {
            return resultInCompodocInjectables;
        } else if (resultInCompodocInterfaces.data !== null) {
            return resultInCompodocInterfaces;
        } else if (resultInCompodocClasses.data !== null) {
            return resultInCompodocClasses;
        } else if (resultInCompodocComponents.data !== null) {
            return resultInCompodocComponents;
        } else if (resultInCompodocMiscellaneousVariables.data !== null) {
            return resultInCompodocMiscellaneousVariables;
        } else if (resultInCompodocMiscellaneousFunctions.data !== null) {
            return resultInCompodocMiscellaneousFunctions;
        } else if (resultInCompodocMiscellaneousTypealiases.data !== null) {
            return resultInCompodocMiscellaneousTypealiases;
        } else if (resultInCompodocMiscellaneousEnumerations.data !== null) {
            return resultInCompodocMiscellaneousEnumerations;
        } else if (resultInAngularAPIs.data !== null) {
            return resultInAngularAPIs;
        }
    }
    update(updatedData) {
        if (updatedData.modules.length > 0) {
            _.forEach(updatedData.modules, (module) => {
                let _index = _.findIndex(this.modules, {'name': module.name});
                this.modules[_index] = module;
            });
        }
        if (updatedData.components.length > 0) {
            _.forEach(updatedData.components, (component) => {
                let _index = _.findIndex(this.components, {'name': component.name});
                this.components[_index] = component;
            });
        }
        if (updatedData.directives.length > 0) {
            _.forEach(updatedData.directives, (directive) => {
                let _index = _.findIndex(this.directives, {'name': directive.name});
                this.directives[_index] = directive;
            });
        }
        if (updatedData.injectables.length > 0) {
            _.forEach(updatedData.injectables, (injectable) => {
                let _index = _.findIndex(this.injectables, {'name': injectable.name});
                this.injectables[_index] = injectable;
            });
        }
        if (updatedData.interfaces.length > 0) {
            _.forEach(updatedData.interfaces, (int) => {
                let _index = _.findIndex(this.interfaces, {'name': int.name});
                this.interfaces[_index] = int;
            });
        }
        if (updatedData.pipes.length > 0) {
            _.forEach(updatedData.pipes, (pipe) => {
                let _index = _.findIndex(this.pipes, {'name': pipe.name});
                this.pipes[_index] = pipe;
            });
        }
        if (updatedData.classes.length > 0) {
            _.forEach(updatedData.classes, (classe) => {
                let _index = _.findIndex(this.classes, {'name': classe.name});
                this.classes[_index] = classe;
            });
        }
        /**
         * Miscellaneous update
         */
        if (updatedData.miscellaneous.variables.length > 0 ) {
            _.forEach(updatedData.miscellaneous.variables, (variable) => {
                let _index = _.findIndex(this.miscellaneous.variables, {
                    'name': variable.name,
                    'file': variable.file
                });
                this.miscellaneous.variables[_index] = variable;
            });
        }
        if (updatedData.miscellaneous.functions.length > 0 ) {
            _.forEach(updatedData.miscellaneous.functions, (func) => {
                let _index = _.findIndex(this.miscellaneous.functions, {
                    'name': func.name,
                    'file': func.file
                });
                this.miscellaneous.functions[_index] = func;
            });
        }
        if (updatedData.miscellaneous.typealiases.length > 0 ) {
            _.forEach(updatedData.miscellaneous.typealiases, (typealias) => {
                let _index = _.findIndex(this.miscellaneous.typealiases, {
                    'name': typealias.name,
                    'file': typealias.file
                });
                this.miscellaneous.typealiases[_index] = typealias;
            });
        }
        if (updatedData.miscellaneous.enumerations.length > 0 ) {
            _.forEach(updatedData.miscellaneous.enumerations, (enumeration) => {
                let _index = _.findIndex(this.miscellaneous.enumerations, {
                    'name': enumeration.name,
                    'file': enumeration.file
                });
                this.miscellaneous.enumerations[_index] = enumeration;
            });
        }
        this.prepareMiscellaneous();
    }
    findInCompodoc(name: string) {
        let mergedData = _.concat([], this.modules, this.components, this.directives, this.injectables, this.interfaces, this.pipes, this.classes),
            result = _.find(mergedData, {'name': name});
        return result || false;
    }
    prepareMiscellaneous() {
        this.miscellaneous.variables.sort(getNamesCompareFn());
        this.miscellaneous.functions.sort(getNamesCompareFn());
        this.miscellaneous.enumerations.sort(getNamesCompareFn());
        this.miscellaneous.typealiases.sort(getNamesCompareFn());
        //group each subgoup by file
        this.miscellaneous.groupedVariables = _.groupBy(this.miscellaneous.variables, 'file');
        this.miscellaneous.groupedFunctions = _.groupBy(this.miscellaneous.functions, 'file');
        this.miscellaneous.groupedEnumerations = _.groupBy(this.miscellaneous.enumerations, 'file');
        this.miscellaneous.groupedTypeAliases = _.groupBy(this.miscellaneous.typealiases, 'file');
    }
    getModule(name: string) {
        return _.find(this.modules, ['name', name]);
    }
    getRawModule(name: string) {
        return _.find(this.rawModules, ['name', name]);
    }
    getModules() {
        return this.modules;
    }
    getComponents() {
        return this.components;
    }
    getDirectives() {
        return this.directives;
    }
    getInjectables() {
        return this.injectables;
    }
    getInterfaces() {
        return this.interfaces;
    }
    getRoutes() {
        return this.routes;
    }
    getPipes() {
        return this.pipes;
    }
    getClasses() {
        return this.classes;
    }
    getMiscellaneous() {
        return this.miscellaneous;
    }
};

export const $dependenciesEngine = DependenciesEngine.getInstance();
