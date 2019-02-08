import { IDep } from '../dependencies.interfaces';
import { ComponentHelper } from './helpers/component-helper';
import Configuration from '../../../configuration';
import { cleanLifecycleHooksFromMethods } from '../../../../utils';

const crypto = require('crypto');

export class DirectiveDepFactory {
    constructor(private helper: ComponentHelper) {}

    public create(file: any, srcFile: any, name: any, props: any, IO: any): IDirectiveDep {
        let sourceCode = srcFile.getText();
        let hash = crypto
            .createHash('md5')
            .update(sourceCode)
            .digest('hex');
        let directiveDeps: IDirectiveDep = {
            name,
            id: 'directive-' + name + '-' + hash,
            file: file,
            type: 'directive',
            description: IO.description,
            sourceCode: srcFile.getText(),
            selector: this.helper.getComponentSelector(props),
            providers: this.helper.getComponentProviders(props),

            inputsClass: IO.inputs,
            outputsClass: IO.outputs,

            hostBindings: IO.hostBindings,
            hostListeners: IO.hostListeners,

            propertiesClass: IO.properties,
            methodsClass: IO.methods,
            exampleUrls: this.helper.getComponentExampleUrls(srcFile.getText())
        };
        if (Configuration.mainData.disableLifeCycleHooks) {
            directiveDeps.methodsClass = cleanLifecycleHooksFromMethods(directiveDeps.methodsClass);
        }
        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
            directiveDeps.jsdoctags = IO.jsdoctags[0].tags;
        }
        if (IO.implements && IO.implements.length > 0) {
            directiveDeps.implements = IO.implements;
        }
        if (IO.constructor) {
            directiveDeps.constructorObj = IO.constructor;
        }
        if (IO.accessors) {
            directiveDeps.accessors = IO.accessors;
        }
        return directiveDeps;
    }
}

export interface IDirectiveDep extends IDep {
    file: any;
    description: string;
    sourceCode: string;

    selector: string;
    providers: Array<any>;

    inputsClass: any;
    outputsClass: any;

    hostBindings: any;
    hostListeners: any;

    propertiesClass: any;
    methodsClass: any;
    exampleUrls: Array<string>;

    constructorObj?: Object;
    jsdoctags?: Array<string>;
    implements?: any;
    accessors?: Object;
}
