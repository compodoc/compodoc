import { ts } from 'ts-simple-ast';

import { ClassHelper } from './angular/deps/helpers/class-helper';
import { ComponentHelper } from './angular/deps/helpers/component-helper';

import { compilerHost } from '../../utils';

export class FrameworkDependencies {
    private files: string[];
    private program: ts.Program;
    private typeChecker: ts.TypeChecker;
    private classHelper: ClassHelper;
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
