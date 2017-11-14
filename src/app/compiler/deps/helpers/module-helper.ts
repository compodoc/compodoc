import { SymbolHelper, IParseDeepIdentifierResult } from './symbol-helper';
import { ComponentCache } from './component-helper';
import { Deps } from '../../dependencies.interfaces';
import * as ts from 'typescript';

export class ModuleHelper {
    constructor(
        private cache: ComponentCache,
        private symbolHelper: SymbolHelper = new SymbolHelper()) {

    }

    public getModuleProviders(properties: ReadonlyArray<ts.ObjectLiteralElementLike>): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(properties, 'providers')
            .map((providerName) => this.symbolHelper.parseDeepIndentifier(providerName));
    }

    public getModuleDeclations(props: ReadonlyArray<ts.ObjectLiteralElementLike>): Deps[] {
        return this.symbolHelper.getSymbolDeps(props, 'declarations').map((name) => {
            let component = this.cache.get(name);

            if (component) {
                return component;
            }

            return this.symbolHelper.parseDeepIndentifier(name);
        });
    }

    public getModuleEntryComponents(props: ReadonlyArray<ts.ObjectLiteralElementLike>): Deps[] {
        return this.symbolHelper.getSymbolDeps(props, 'entryComponents').map((name) => {
            let component = this.cache.get(name);

            if (component) {
                return component;
            }

            return this.symbolHelper.parseDeepIndentifier(name);
        });
    }

    public getModuleImports(props: ReadonlyArray<ts.ObjectLiteralElementLike>): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'imports')
            .map((name) => this.symbolHelper.parseDeepIndentifier(name));
    }

    public getModuleExports(props: ReadonlyArray<ts.ObjectLiteralElementLike>): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'exports')
            .map((name) => this.symbolHelper.parseDeepIndentifier(name));
    }

    public getModuleImportsRaw(props: ReadonlyArray<ts.ObjectLiteralElementLike>): Array<ts.ObjectLiteralElementLike> {
        return this.symbolHelper.getSymbolDepsRaw(props, 'imports');
    }

    public getModuleBootstrap(props: ReadonlyArray<ts.ObjectLiteralElementLike>): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'bootstrap')
            .map((name) => this.symbolHelper.parseDeepIndentifier(name));
    }
}
