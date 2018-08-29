import { ts } from 'ts-simple-ast';

import { ClassHelper } from './angular/deps/helpers/class-helper';
import { ComponentHelper } from './angular/deps/helpers/component-helper';
import { ControllerHelper } from './angular/deps/helpers/controller-helper';

import { ExtendsMerger } from '../../utils/extends-merger.util';
import { ConfigurationInterface } from '../interfaces/configuration.interface';
import { RouterParserUtil } from '../../utils';
import { compilerHost } from '../../utilities';

export class FrameworkDependencies {
    private files: string[];
    private program: ts.Program;
    private typeChecker: ts.TypeChecker;
    private classHelper: ClassHelper;
    public componentHelper: ComponentHelper;
    public controllerHelper: ControllerHelper;
    public extendsMerger: ExtendsMerger;
    public configuration: ConfigurationInterface;
    public routerParser;

    constructor(
        files: string[],
        options: any,
        configuration: ConfigurationInterface,
        routerParser: RouterParserUtil
    ) {
        this.files = files;
        this.configuration = configuration;
        this.routerParser = routerParser;

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
        this.classHelper = new ClassHelper(this.typeChecker, this.configuration);
        this.componentHelper = new ComponentHelper(this.classHelper);
        this.extendsMerger = new ExtendsMerger();
    }
}
