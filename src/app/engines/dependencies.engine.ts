import * as _ from 'lodash';

export class DependenciesEngine {
    rawData: Object;
    modules: Object[];
    components: Object[];
    directives: Object[];
    injectables: Object[];
    routes: Object[];
    pipes: Object[];
    classes: Object[];
    constructor(data: Object) {
        this.rawData = data;
        this.modules = _.sortBy(this.rawData.modules, ['name']);
        this.components = _.sortBy(this.rawData.components, ['name']);
        this.directives = _.sortBy(this.rawData.directives, ['name']);
        this.injectables = _.sortBy(this.rawData.injectables, ['name']);
        this.routes = _.sortBy(this.rawData.routes, ['name']);
        this.pipes = _.sortBy(this.rawData.pipes, ['name']);
        this.classes = _.sortBy(this.rawData.classes, ['name']);
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
