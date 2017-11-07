import { IDep } from '../dependencies.interfaces';
import { Configuration } from '../../configuration';
import { ComponentHelper } from './helpers/component-helper';
import { cleanLifecycleHooksFromMethods } from '../../../utils/utils';
import { ClassHelper } from './helpers/class-helper';
import { ConfigurationInterface } from '../../interfaces/configuration.interface';

export class ComponentDepFactory {
    constructor(
        private helper: ComponentHelper,
        private configuration: ConfigurationInterface) {

    }

    public create(file: any, srcFile: any, name: any, props: any, IO: any): IComponentDep {
        // console.log(util.inspect(props, { showHidden: true, depth: 10 }));
        let componentDep: IComponentDep = {
            name,
            id: 'component-' + name + '-' + Date.now(),
            file: file,
            // animations?: string[]; // TODO
            changeDetection: this.helper.getComponentChangeDetection(props),
            encapsulation: this.helper.getComponentEncapsulation(props),
            // entryComponents?: string; // TODO waiting doc infos
            exportAs: this.helper.getComponentExportAs(props),
            host: this.helper.getComponentHost(props),
            inputs: this.helper.getComponentInputsMetadata(props),
            // interpolation?: string; // TODO waiting doc infos
            moduleId: this.helper.getComponentModuleId(props),
            outputs: this.helper.getComponentOutputs(props),
            providers: this.helper.getComponentProviders(props),
            // queries?: Deps[]; // TODO
            selector: this.helper.getComponentSelector(props),
            styleUrls: this.helper.getComponentStyleUrls(props),
            styles: this.helper.getComponentStyles(props), // TODO fix args
            template: this.helper.getComponentTemplate(props),
            templateUrl: this.helper.getComponentTemplateUrl(props),
            viewProviders: this.helper.getComponentViewProviders(props),
            inputsClass: IO.inputs,
            outputsClass: IO.outputs,
            propertiesClass: IO.properties,
            methodsClass: IO.methods,

            hostBindings: IO.hostBindings,
            hostListeners: IO.hostListeners,

            description: IO.description,
            type: 'component',
            sourceCode: srcFile.getText(),
            exampleUrls: this.helper.getComponentExampleUrls(srcFile.getText())
        };
        if (this.configuration.mainData.disableLifeCycleHooks) {
            componentDep.methodsClass = cleanLifecycleHooksFromMethods(componentDep.methodsClass);
        }
        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
            componentDep.jsdoctags = IO.jsdoctags[0].tags;
        }
        if (IO.constructor) {
            componentDep.constructorObj = IO.constructor;
        }
        if (IO.extends) {
            componentDep.extends = IO.extends;
        }
        if (IO.implements && IO.implements.length > 0) {
            componentDep.implements = IO.implements;
        }
        if (IO.accessors) {
            componentDep.accessors = IO.accessors;
        }

        return componentDep;
    }
}

export interface IComponentDep extends IDep {
    file: any;
    changeDetection: any;
    encapsulation: any;
    exportAs: any;
    host: any;
    inputs: Array<any>;
    outputs: Array<any>;
    providers: Array<any>;
    moduleId: string;
    selector: string;
    styleUrls: Array<string>;
    styles: Array<string>;
    template: string;
    templateUrl: Array<string>;
    viewProviders: Array<any>;
    inputsClass: Array<any>;
    outputsClass: Array<any>;
    propertiesClass: Array<any>;
    methodsClass: Array<any>;

    hostBindings: Array<any>;
    hostListeners: Array<any>;

    description: string;
    sourceCode: string;
    exampleUrls: Array<string>;

    constructorObj?: Object;
    jsdoctags?: Array<string>;
    extends?: any;
    implements?: any;
    accessors?: Object;
}
