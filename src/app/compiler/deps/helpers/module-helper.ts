import { SymbolHelper } from './symbol-helper';
import { ComponentCache } from './component-helper';
import { Deps } from '../../dependencies.interfaces';
import * as ts from 'typescript';

export class ModuleHelper {
    constructor(
        private cache: ComponentCache,
        private symbolHelper: SymbolHelper = new SymbolHelper()) {

    }

    public getModuleProviders(props: Array<ts.Node>): Deps[] {
        return this.symbolHelper
            .getSymbolDeps(props, 'providers')
            .map((providerName) => this.symbolHelper.parseDeepIndentifier(providerName));
    }

    public getModuleDeclations(props: Array<ts.Node>): Deps[] {
        return this.symbolHelper.getSymbolDeps(props, 'declarations').map((name) => {
            let component = this.cache.get(name);

            if (component) {
                return component;
            }

            return this.symbolHelper.parseDeepIndentifier(name);
        });
    }

    public getModuleImports(props: Array<ts.Node>): Deps[] {
        return this.symbolHelper
            .getSymbolDeps(props, 'imports')
            .map((name) => this.symbolHelper.parseDeepIndentifier(name));
    }

    public getModuleExports(props: Array<ts.Node>): Deps[] {
        return this.symbolHelper
            .getSymbolDeps(props, 'exports')
            .map((name) => this.symbolHelper.parseDeepIndentifier(name));
    }

    public getModuleImportsRaw(props: Array<ts.Node>): Deps[] {
        return this.symbolHelper.getSymbolDepsRaw(props, 'imports');
    }

    public getModuleBootstrap(props: Array<ts.Node>): Deps[] {
        return this.symbolHelper
            .getSymbolDeps(props, 'bootstrap')
            .map((name) => this.symbolHelper.parseDeepIndentifier(name));
    }
}
