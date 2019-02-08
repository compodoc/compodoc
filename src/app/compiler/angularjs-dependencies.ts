import { ComponentCache } from './angular/deps/helpers/component-helper';
import { JsDocHelper } from './angular/deps/helpers/js-doc-helper';
import { ModuleHelper } from './angular/deps/helpers/module-helper';
import { SymbolHelper } from './angular/deps/helpers/symbol-helper';
import { FrameworkDependencies } from './framework-dependencies';

export class AngularJSDependencies extends FrameworkDependencies {
    private engine: any;
    private cache: ComponentCache = new ComponentCache();
    private moduleHelper = new ModuleHelper(this.cache);
    private jsDocHelper = new JsDocHelper();
    private symbolHelper = new SymbolHelper();

    constructor(files: string[], options: any) {
        super(files, options);
    }

    public getDependencies() {
        let deps = {
            modules: [],
            modulesForGraph: [],
            components: [],
            injectables: [],
            interceptors: [],
            pipes: [],
            directives: [],
            routes: [],
            classes: [],
            interfaces: [],
            miscellaneous: {
                variables: [],
                functions: [],
                typealiases: [],
                enumerations: []
            },
            routesTree: undefined
        };
        return deps;
    }
}
