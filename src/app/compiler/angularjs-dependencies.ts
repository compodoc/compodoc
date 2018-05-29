import { ConfigurationInterface } from '../interfaces/configuration.interface';
import { RouterParserUtil, JsdocParserUtil, ImportsUtil } from '../../utils';
import { FrameworkDependencies } from './framework-dependencies';
import { ComponentCache } from './angular/deps/helpers/component-helper';
import { ModuleHelper } from './angular/deps/helpers/module-helper';
import { JsDocHelper } from './angular/deps/helpers/js-doc-helper';
import { SymbolHelper } from './angular/deps/helpers/symbol-helper';

export class AngularJSDependencies extends FrameworkDependencies {

    private engine: any;
    private cache: ComponentCache = new ComponentCache();
    private moduleHelper = new ModuleHelper(this.cache);
    private jsDocHelper = new JsDocHelper();
    private symbolHelper = new SymbolHelper();
    private jsdocParserUtil = new JsdocParserUtil();
    private importsUtil = new ImportsUtil();

    constructor(files: string[],
        options: any,
        configuration: ConfigurationInterface,
        routerParser: RouterParserUtil) {
        super(files,
            options,
            configuration,
            routerParser);
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