import { IDep } from '../dependencies.interfaces';
import { ModuleHelper } from './helpers/module-helper';
import { ComponentCache } from './helpers/component-helper';
import * as ts from 'typescript';



export class ModuleDepFactory {
    constructor(private moduleHelper: ModuleHelper) {

    }

    public create(
        file: any,
        srcFile: ts.SourceFile,
        name: string,
        properties: ReadonlyArray<ts.ObjectLiteralElementLike>,
        IO: any): IModuleDep {
        return {
            name,
            id: 'module-' + name + '-' + Date.now(),
            file: file,
            providers: this.moduleHelper.getModuleProviders(properties),
            declarations: this.moduleHelper.getModuleDeclations(properties),
            entryComponents: this.moduleHelper.getModuleEntryComponents(properties),
            imports: this.moduleHelper.getModuleImports(properties),
            exports: this.moduleHelper.getModuleExports(properties),
            bootstrap: this.moduleHelper.getModuleBootstrap(properties),
            type: 'module',
            description: IO.description,
            sourceCode: srcFile.getText()
        } as IModuleDep;
    }
}

export interface IModuleDep extends IDep {
    file: any;
    providers: Array<any>;
    declarations: Array<any>;
    entryComponents: Array<any>;
    imports: Array<any>;
    exports: Array<any>;
    bootstrap: any;
    description: string;
    sourceCode: string;
}
