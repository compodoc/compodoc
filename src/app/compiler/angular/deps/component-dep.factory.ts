import { cleanLifecycleHooksFromMethods } from '../../../../utils';
import Configuration from '../../../configuration';
import { IDep } from '../dependencies.interfaces';
import { ComponentHelper } from './helpers/component-helper';

const crypto = require('crypto');

export class ComponentDepFactory {
    constructor(private helper: ComponentHelper) {}

    public create(file: any, srcFile: any, name: any, props: any, IO: any): IComponentDep {
        // console.log(util.inspect(props, { showHidden: true, depth: 10 }));
        let sourceCode = srcFile.getText();
        let hash = crypto
            .createHash('md5')
            .update(sourceCode)
            .digest('hex');
        let componentDep: IComponentDep = {
            name,
            id: 'component-' + name + '-' + hash,
            file: file,
            // animations?: string[]; // TODO
            changeDetection: this.helper.getComponentChangeDetection(props, srcFile),
            encapsulation: this.helper.getComponentEncapsulation(props, srcFile),
            entryComponents: this.helper.getComponentEntryComponents(props, srcFile),
            exportAs: this.helper.getComponentExportAs(props, srcFile),
            host: this.helper.getComponentHost(props),
            inputs: this.helper.getComponentInputsMetadata(props, srcFile),
            // interpolation?: string; // TODO waiting doc infos
            moduleId: this.helper.getComponentModuleId(props, srcFile),
            outputs: this.helper.getComponentOutputs(props, srcFile),
            providers: this.helper.getComponentProviders(props, srcFile),
            // queries?: Deps[]; // TODO
            selector: this.helper.getComponentSelector(props, srcFile),
            styleUrls: this.helper.getComponentStyleUrls(props, srcFile),
            styles: this.helper.getComponentStyles(props, srcFile), // TODO fix args
            template: this.helper.getComponentTemplate(props, srcFile),
            templateUrl: this.helper.getComponentTemplateUrl(props, srcFile),
            viewProviders: this.helper.getComponentViewProviders(props, srcFile),
            inputsClass: IO.inputs,
            outputsClass: IO.outputs,
            propertiesClass: IO.properties,
            methodsClass: IO.methods,

            hostBindings: IO.hostBindings,
            hostListeners: IO.hostListeners,

            description: IO.description,
            rawdescription: IO.rawdescription,
            type: 'component',
            sourceCode: srcFile.getText(),
            exampleUrls: this.helper.getComponentExampleUrls(srcFile.getText()),

            tag: this.helper.getComponentTag(props, srcFile),
            styleUrl: this.helper.getComponentStyleUrl(props, srcFile),
            shadow: this.helper.getComponentShadow(props, srcFile),
            scoped: this.helper.getComponentScoped(props, srcFile),
            assetsDir: this.helper.getComponentAssetsDir(props, srcFile),
            assetsDirs: this.helper.getComponentAssetsDirs(props, srcFile),
            styleUrlsData: '',
            stylesData: ''
        };
        if (typeof this.helper.getComponentPreserveWhitespaces(props, srcFile) !== 'undefined') {
            componentDep.preserveWhitespaces = this.helper.getComponentPreserveWhitespaces(
                props,
                srcFile
            );
        }
        if (Configuration.mainData.disableLifeCycleHooks) {
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
    styleUrlsData: string;
    styles: Array<string>;
    stylesData: string;
    template: string;
    templateUrl: Array<string>;
    viewProviders: Array<any>;
    inputsClass: Array<any>;
    outputsClass: Array<any>;
    propertiesClass: Array<any>;
    methodsClass: Array<any>;

    entryComponents: Array<any>;

    hostBindings: Array<any>;
    hostListeners: Array<any>;

    description: string;
    rawdescription: string;
    sourceCode: string;
    exampleUrls: Array<string>;

    constructorObj?: Object;
    jsdoctags?: Array<string>;
    extends?: any;
    implements?: any;
    accessors?: Object;

    tag?: string;
    styleUrl?: string;
    shadow?: string;
    scoped?: string;
    assetsDir?: string;
    assetsDirs?: Array<string>;

    preserveWhitespaces?: any;
}
