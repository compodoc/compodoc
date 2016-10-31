import * as _ from 'lodash';

export class DependenciesEngine {
    rawData: object;
    modules: Array;
    components: object[];
    directives: object[];
    constructor(data: object) {
        this.rawData = data;
        this.modules = _.sortBy(this.rawData, ['name']);

        this.components = this.processComponentsAndDirectives('component');
        this.directives = this.processComponentsAndDirectives('directive');
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
    processComponentsAndDirectives(type: string) {
        let i = 0,
            len = this.modules.length,
            data = [];

        for(i; i<len; i++) {
            let j = 0,
                leng = this.modules[i].declarations.length;

            for(j; j<leng; j++) {
                if( this.modules[i].declarations[j].type === type) {
                    data.push(this.modules[i].declarations[j]);
                }
            }
        }

        return data;
    }
};
