import { ts } from 'ts-morph';

import { ClassHelper } from './angular/deps/helpers/class-helper';
import { ComponentHelper } from './angular/deps/helpers/component-helper';

import { compilerHost } from '../../utils';

export class FrameworkDependencies {
    public files: string[];
    public program: ts.Program;
    public typeChecker: ts.TypeChecker;
    public classHelper: ClassHelper;
    public componentHelper: ComponentHelper;
    public routerParser;

    constructor(files: string[], options: any) {
        this.files = files;

        const transpileOptions = {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
            tsconfigDirectory: options.tsconfigDirectory,
            allowJs: true
        };
        this.program = ts.createProgram(
            this.files,
            transpileOptions,
            compilerHost(transpileOptions)
        );
        this.typeChecker = this.program.getTypeChecker();
        this.classHelper = new ClassHelper(this.typeChecker);
        this.componentHelper = new ComponentHelper(this.classHelper);
    }
}
