import { SymbolHelper, NsModuleCache } from './symbol-helper';
import { ComponentCache } from './component-helper';
import { Deps } from '../../dependencies.interfaces';
import * as ts from 'typescript';

export class ModuleHelper {
    constructor(
        private moduleCache: NsModuleCache,
        private cache: ComponentCache,
        private symbolHelper: SymbolHelper = new SymbolHelper()) {

    }

    public getModuleProviders(props: Array<ts.Node>): Deps[] {
        return this.symbolHelper
            .getSymbolDeps(props, 'providers')
            .map((providerName) => this.symbolHelper.parseDeepIndentifier(providerName, this.moduleCache));
    }

    public getModuleDeclations(props: Array<ts.Node>): Deps[] {
        return this.symbolHelper.getSymbolDeps(props, 'declarations').map((name) => {
            let component = this.cache.get(name);

            if (component) {
                return component;
            }

            return this.symbolHelper.parseDeepIndentifier(name, this.moduleCache);
        });
    }

    public getModuleImports(props: Array<ts.Node>): Deps[] {
        return this.symbolHelper
            .getSymbolDeps(props, 'imports')
            .map((name) => this.symbolHelper.parseDeepIndentifier(name, this.moduleCache));
    }

    public getModuleExports(props: Array<ts.Node>): Deps[] {
        return this.symbolHelper
            .getSymbolDeps(props, 'exports')
            .map((name) => this.symbolHelper.parseDeepIndentifier(name, this.moduleCache));
    }

    public getModuleImportsRaw(props: Array<ts.Node>): Deps[] {
        return this.symbolHelper.getSymbolDepsRaw(props, 'imports');
    }

    public getModuleBootstrap(props: Array<ts.Node>): Deps[] {
        return this.symbolHelper
            .getSymbolDeps(props, 'bootstrap')
            .map((name) => this.symbolHelper.parseDeepIndentifier(name, this.moduleCache));
    }
}
