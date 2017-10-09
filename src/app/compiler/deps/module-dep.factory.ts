import { IDep } from '../dependencies.interfaces';
import { NodeObject } from '../node-object.interface';
import { ModuleHelper } from './helpers/module-helper';
import { NsModuleCache } from './helpers/symbol-helper';
import { ComponentCache } from './helpers/component-helper';
const ts = require('typescript');



export class ModuleDepFactory {
    constructor(private moduleHelper: ModuleHelper) {

    }

    public create(file: any, srcFile: ts.SourceFile, name: any, props: any, IO: any): IModuleDep {
        return {
            name,
            id: 'module-' + name + '-' + Date.now(),
            file: file,
            providers: this.moduleHelper.getModuleProviders(props),
            declarations: this.moduleHelper.getModuleDeclations(props),
            imports: this.moduleHelper.getModuleImports(props),
            exports: this.moduleHelper.getModuleExports(props),
            bootstrap: this.moduleHelper.getModuleBootstrap(props),
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
    imports: Array<any>;
    exports: Array<any>;
    bootstrap: any;
    description: string;
    sourceCode: string;
}
