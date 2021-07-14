import { SymbolHelper, IParseDeepIdentifierResult } from './symbol-helper';
import { ComponentCache } from './component-helper';
import { Deps } from '../../dependencies.interfaces';
import { ts } from 'ts-morph';

export class ModuleHelper {
    constructor(
        private cache: ComponentCache,
        private symbolHelper: SymbolHelper = new SymbolHelper()
    ) {}

    public getModuleProviders(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'providers', srcFile)
            .map(providerName => this.symbolHelper.parseDeepIndentifier(providerName, srcFile));
    }

    public getModuleControllers(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'controllers', srcFile)
            .map(providerName => this.symbolHelper.parseDeepIndentifier(providerName, srcFile));
    }

    public getModuleDeclarations(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Deps[] {
        return this.symbolHelper.getSymbolDeps(props, 'declarations', srcFile).map(name => {
            let component = this.cache.get(name);

            if (component) {
                return component;
            }

            return this.symbolHelper.parseDeepIndentifier(name, srcFile);
        });
    }

    public getModuleEntryComponents(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Deps[] {
        return this.symbolHelper.getSymbolDeps(props, 'entryComponents', srcFile).map(name => {
            let component = this.cache.get(name);

            if (component) {
                return component;
            }

            return this.symbolHelper.parseDeepIndentifier(name, srcFile);
        });
    }

    private cleanImportForRootForChild(name: string): string {
        let nsModule = name.split('.');
        if (nsModule.length > 0) {
            name = nsModule[0];
        }
        return name;
    }

    public getModuleImports(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'imports', srcFile)
            .map(name => this.cleanImportForRootForChild(name))
            .map(name => this.symbolHelper.parseDeepIndentifier(name));
    }

    public getModuleExports(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'exports', srcFile)
            .map(name => this.symbolHelper.parseDeepIndentifier(name, srcFile));
    }

    public getModuleImportsRaw(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Array<ts.ObjectLiteralElementLike> {
        return this.symbolHelper.getSymbolDepsRaw(props, 'imports');
    }

    public getModuleId(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Array<IParseDeepIdentifierResult> {
        let _id = this.symbolHelper.getSymbolDeps(props, 'id', srcFile),
            id;
        if (_id.length === 1) {
            id = _id[0];
        }
        return id;
    }

    public getModuleSchemas(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ) {
        let schemas = this.symbolHelper.getSymbolDeps(props, 'schemas', srcFile);
        return schemas;
    }

    public getModuleBootstrap(
        props: ReadonlyArray<ts.ObjectLiteralElementLike>,
        srcFile: ts.SourceFile
    ): Array<IParseDeepIdentifierResult> {
        return this.symbolHelper
            .getSymbolDeps(props, 'bootstrap', srcFile)
            .map(name => this.symbolHelper.parseDeepIndentifier(name, srcFile));
    }
}
