import * as _ from 'lodash';

export class DependenciesEngine {
    rawData: Object;
    modules: [];
    components: Object[];
    directives: Object[];
    constructor(data: Object) {
        this.rawData = data;
        this.modules = _.sortBy(this.rawData.modules, ['name']);

        this.components = _.sortBy(this.rawData.components, ['name']);
        this.directives = _.sortBy(this.rawData.directives, ['name']);
        this.injectables = _.sortBy(this.rawData.injectables, ['name']);
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
};
