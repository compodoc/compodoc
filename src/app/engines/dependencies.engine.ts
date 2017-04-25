import * as _ from 'lodash';

import { finderInAngularAPIs } from '../../utils/angular-api';

class DependenciesEngine {
    private static _instance:DependenciesEngine = new DependenciesEngine();
    rawData: Object;
    modules: Object[];
    rawModules: Object[];
    components: Object[];
    directives: Object[];
    injectables: Object[];
    interfaces: Object[];
    routes: Object[];
    pipes: Object[];
    classes: Object[];
    miscellaneous: Object[];
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
            }
        }
        return _m;
    }
    init(data: Object) {
        this.rawData = data;
        this.modules = _.sortBy(this.rawData.modules, ['name']);
        this.rawModules = _.sortBy(_.cloneDeep(this.cleanModules(data.modules)), ['name']);
        this.components = _.sortBy(this.rawData.components, ['name']);
        this.directives = _.sortBy(this.rawData.directives, ['name']);
        this.injectables = _.sortBy(this.rawData.injectables, ['name']);
        this.interfaces = _.sortBy(this.rawData.interfaces, ['name']);
        //this.routes = _.sortBy(_.uniqWith(this.rawData.routes, _.isEqual), ['name']);
        this.pipes = _.sortBy(this.rawData.pipes, ['name']);
        this.classes = _.sortBy(this.rawData.classes, ['name']);
        this.miscellaneous = this.rawData.miscellaneous;
        this.prepareMiscellaneous();
        this.routes = this.rawData.routesTree;
        this.cleanRawModules();
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
            resultInAngularAPIs = finderInAngularAPIs(type)

        if (resultInCompodocInjectables.data !== null) {
            return resultInCompodocInjectables;
        } else if (resultInCompodocInterfaces.data !== null) {
            return resultInCompodocInterfaces;
        } else if (resultInCompodocClasses.data !== null) {
            return resultInCompodocClasses;
        } else if (resultInCompodocComponents.data !== null) {
            return resultInCompodocComponents;
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
    }
    findInCompodoc(name: string) {
        let mergedData = _.concat([], this.modules, this.components, this.directives, this.injectables, this.interfaces, this.pipes, this.classes),
            result = _.find(mergedData, {'name': name});
        return result || false;
    }
    cleanRawModules() {
        _.forEach(this.rawModules, (module) => {
            module.declarations = [];
            module.providers = [];
        });
    }
    prepareMiscellaneous() {
        //group each subgoup by file
        this.miscellaneous.groupedVariables = _.groupBy(this.miscellaneous.variables, 'file');
        this.miscellaneous.groupedFunctions = _.groupBy(this.miscellaneous.functions, 'file');
        this.miscellaneous.groupedEnumerations = _.groupBy(this.miscellaneous.enumerations, 'file');
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
