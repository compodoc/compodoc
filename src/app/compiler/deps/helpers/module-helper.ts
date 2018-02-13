import { SymbolHelper, IParseDeepIdentifierResult } from './symbol-helper';
import { ComponentCache } from './component-helper';
import { Deps } from '../../dependencies.interfaces';
import * as ts from 'typescript';

export class ModuleHelper {
    constructor(
        private cache: ComponentCache,
        private symbolHelper: SymbolHelper = new SymbolHelper()) {

    }

    public getModuleProviders(props: ReadonlyArray<ts.ObjectLiteralElementLike>, srcFile: ts.SourceFile): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'providers', srcFile)
            .map((providerName) => this.symbolHelper.parseDeepIndentifier(providerName));
    }

    public getModuleDeclations(props: ReadonlyArray<ts.ObjectLiteralElementLike>, srcFile: ts.SourceFile): Deps[] {
        return this.symbolHelper.getSymbolDeps(props, 'declarations', srcFile).map((name) => {
            let component = this.cache.get(name);

            if (component) {
                return component;
            }

            return this.symbolHelper.parseDeepIndentifier(name);
        });
    }

    public getModuleEntryComponents(props: ReadonlyArray<ts.ObjectLiteralElementLike>, srcFile: ts.SourceFile): Deps[] {
        return this.symbolHelper.getSymbolDeps(props, 'entryComponents', srcFile).map((name) => {
            let component = this.cache.get(name);

            if (component) {
                return component;
            }

            return this.symbolHelper.parseDeepIndentifier(name);
        });
    }

    public getModuleImports(props: ReadonlyArray<ts.ObjectLiteralElementLike>, srcFile: ts.SourceFile): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'imports', srcFile)
            .map((name) => this.symbolHelper.parseDeepIndentifier(name));
    }

    public getModuleExports(props: ReadonlyArray<ts.ObjectLiteralElementLike>, srcFile: ts.SourceFile): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'exports', srcFile)
            .map((name) => this.symbolHelper.parseDeepIndentifier(name));
    }

    public getModuleImportsRaw(props: ReadonlyArray<ts.ObjectLiteralElementLike>, srcFile: ts.SourceFile): Array<ts.ObjectLiteralElementLike> {
        return this.symbolHelper.getSymbolDepsRaw(props, 'imports');
    }

    public getModuleId(props: ReadonlyArray<ts.ObjectLiteralElementLike>, srcFile: ts.SourceFile): Array<IParseDeepIdentifierResult> {
        let _id = this.symbolHelper.getSymbolDeps(props, 'id', srcFile),
            id;
        if (_id.length === 1) {
            id = _id[0];
        }
        return id;
    }

    public getModuleSchemas(props: ReadonlyArray<ts.ObjectLiteralElementLike>, srcFile: ts.SourceFile) {
        let schemas = this.symbolHelper.getSymbolDeps(props, 'schemas', srcFile);
        return schemas;
    }

    public getModuleBootstrap(props: ReadonlyArray<ts.ObjectLiteralElementLike>, srcFile: ts.SourceFile): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'bootstrap', srcFile)
            .map((name) => this.symbolHelper.parseDeepIndentifier(name));
    }
}
