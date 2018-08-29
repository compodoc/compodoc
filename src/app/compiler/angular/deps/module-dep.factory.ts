import { IDep } from '../dependencies.interfaces';
import { ModuleHelper } from './helpers/module-helper';
import { ts } from 'ts-simple-ast';

const crypto = require('crypto');

export class ModuleDepFactory {
    constructor(private moduleHelper: ModuleHelper) {}

    public create(
        file: any,
        srcFile: ts.SourceFile,
        name: string,
        properties: ReadonlyArray<ts.ObjectLiteralElementLike>,
        IO: any
    ): IModuleDep {
        let sourceCode = srcFile.getText();
        let hash = crypto
            .createHash('md5')
            .update(sourceCode)
            .digest('hex');
        return {
            name,
            id: 'module-' + name + '-' + hash,
            file: file,
            ngid: this.moduleHelper.getModuleId(properties, srcFile),
            providers: this.moduleHelper.getModuleProviders(properties, srcFile),
            declarations: this.moduleHelper.getModuleDeclarations(properties, srcFile),
            controllers: this.moduleHelper.getModuleControllers(properties, srcFile),
            entryComponents: this.moduleHelper.getModuleEntryComponents(properties, srcFile),
            imports: this.moduleHelper.getModuleImports(properties, srcFile),
            exports: this.moduleHelper.getModuleExports(properties, srcFile),
            schemas: this.moduleHelper.getModuleSchemas(properties, srcFile),
            bootstrap: this.moduleHelper.getModuleBootstrap(properties, srcFile),
            type: 'module',
            description: IO.description,
            sourceCode: srcFile.text
        } as IModuleDep;
    }
}

export interface IModuleDep extends IDep {
    file: any;
    providers: Array<any>;
    declarations: Array<any>;
    controllers: Array<any>;
    entryComponents: Array<any>;
    imports: Array<any>;
    exports: Array<any>;
    bootstrap: any;
    description: string;
    sourceCode: string;
}
