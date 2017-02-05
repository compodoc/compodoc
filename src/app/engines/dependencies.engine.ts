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
    init(data: Object) {
        this.rawData = data;
        this.modules = _.sortBy(this.rawData.modules, ['name']);
        this.rawModules = _.sortBy(_.cloneDeep(data.modules), ['name']);
        this.components = _.sortBy(this.rawData.components, ['name']);
        this.directives = _.sortBy(this.rawData.directives, ['name']);
        this.injectables = _.sortBy(this.rawData.injectables, ['name']);
        this.interfaces = _.sortBy(this.rawData.interfaces, ['name']);
        this.routes = _.sortBy(_.uniqWith(this.rawData.routes, _.isEqual), ['name']);
        this.pipes = _.sortBy(this.rawData.pipes, ['name']);
        this.classes = _.sortBy(this.rawData.classes, ['name']);
        this.miscellaneous = this.rawData.miscellaneous;
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
            resultInCompodocClasses = finderInCompodocDependencies(this.classes),
            resultInAngularAPIs = finderInAngularAPIs(type)

        if (resultInCompodocInjectables.data !== null) {
            return resultInCompodocInjectables
        } else if (resultInCompodocClasses.data !== null) {
            return resultInCompodocClasses
        } else if (resultInAngularAPIs.data !== null) {
            return resultInAngularAPIs
        }
    }
    findInCompodoc(name: string) {
        let mergedData = _.concat([], this.modules, this.components, this.directives, this.injectables, this.interfaces, this.pipes, this.classes),
            result = _.find(mergedData, {'name': name});
        return result || false;
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
