import { IDep } from '../dependencies.interfaces';
import { ComponentHelper } from './helpers/component-helper';
import Configuration from '../../../configuration';
import { cleanLifecycleHooksFromMethods } from '../../../../utils';

const crypto = require('crypto');

export class DirectiveDepFactory {
    constructor(private helper: ComponentHelper) {}

    public create(file: any, srcFile: any, name: any, props: any, IO: any): IDirectiveDep {
        const sourceCode = srcFile.getText();
        const hash = crypto.createHash('sha512').update(sourceCode).digest('hex');
        const directiveDeps: IDirectiveDep = {
            name,
            id: 'directive-' + name + '-' + hash,
            file: file,
            type: 'directive',
            description: IO.description,
            rawdescription: IO.rawdescription,
            sourceCode: srcFile.getText(),
            selector: this.helper.getComponentSelector(props, srcFile),
            providers: this.helper.getComponentProviders(props, srcFile),

            inputsClass: IO.inputs,
            outputsClass: IO.outputs,

            deprecated: IO.deprecated,
            deprecationMessage: IO.deprecationMessage,

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
        if (IO.extends) {
            directiveDeps.extends = IO.extends;
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
    rawdescription: string;
    sourceCode: string;

    selector: string;
    providers: Array<any>;

    inputsClass: any;
    outputsClass: any;

    deprecated: boolean;
    deprecationMessage: string;

    hostBindings: any;
    hostListeners: any;

    propertiesClass: any;
    methodsClass: any;
    exampleUrls: Array<string>;

    constructorObj?: Object;
    jsdoctags?: Array<string>;
    implements?: any;
    accessors?: Object;
    extends?: any;
}
