import * as typedoc from 'typedoc';

const typedocOptions = {
    'mode': 'modules',
    'theme': 'default',
    'logger': 'none',
    'ignoreCompilerErrors': 'true',
    'experimentalDecorators': 'true',
    'emitDecoratorMetadata': 'true',
    'excludeExternals': 'true',
    'target': 'ES6',
    'moduleResolution': 'node',
    'preserveConstEnums': 'true',
    'stripInternal': 'true',
    'suppressExcessPropertyErrors': 'true',
    'suppressImplicitAnyIndexErrors': 'true',
    'module': 'commonjs'
};

export class TypedocEngine {
    app;
    reflection;
    constructor() {
        this.app = new typedoc.Application(typedocOptions);
    }
    parseFile(filepath:String) {
        this.reflection = this.app.convert([filepath]);
    }
    getComment():Object {
        let comment:String = '';
        for (var prop in this.reflection.reflections) {
            if(this.reflection.reflections[prop].comment) {
                comment = this.reflection.reflections[prop].comment;
                break;
            }
        }
        return comment;
    }
};
