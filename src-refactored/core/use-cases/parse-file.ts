import { ts, Project, ScriptTarget } from 'ts-morph';

export class ParseFile {
    public project: Project;

    constructor() {
        this.project = new Project({
            compilerOptions: {
                target: ScriptTarget.ES5,
                module: ts.ModuleKind.CommonJS,
                allowJs: true
            }
        });
    }

    public parseFiles() {}

    private parseFile() {}
}
