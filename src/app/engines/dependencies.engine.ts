import * as _ from 'lodash';

class DependenciesEngine {
    private static _instance:DependenciesEngine = new DependenciesEngine();
    rawData: Object;
    modules: Object[];
    components: Object[];
    directives: Object[];
    injectables: Object[];
    interfaces: Object[];
    routes: Object[];
    pipes: Object[];
    classes: Object[];
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
        this.components = _.sortBy(this.rawData.components, ['name']);
        this.directives = _.sortBy(this.rawData.directives, ['name']);
        this.injectables = _.sortBy(this.rawData.injectables, ['name']);
        this.interfaces = _.sortBy(this.rawData.interfaces, ['name']);
        this.routes = _.sortBy(_.uniqWith(this.rawData.routes, _.isEqual), ['name']);
        this.pipes = _.sortBy(this.rawData.pipes, ['name']);
        this.classes = _.sortBy(this.rawData.classes, ['name']);
    }
    find(type: string) {
        let finder = function(data) {
            return _.find(data, function(o) {return type.indexOf(o.name) !== -1;}) || _.find(data, function(o) { return type.indexOf(o.name) !== -1;});
        }
        return finder(this.injectables) || finder(this.classes);
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
};

export const $dependenciesEngine = DependenciesEngine.getInstance();
