import { find, concat, cloneDeep } from 'lodash';
import { ConfigurationInterface } from '../app/interfaces/configuration.interface';
import { cleanLifecycleHooksFromMethods } from '.';

export class ExtendsMerger {
    private components;
    private classes;

    public merge(deps, configuration: ConfigurationInterface) {
        this.components = deps.components;
        this.classes = deps.classes;

        this.components.forEach(component => {
            let ext;
            if (typeof component.extends !== 'undefined') {
                ext = this.findInDependencies(component.extends);
                if (ext) {
                    // From class to component
                    if (typeof ext.methods !== 'undefined' && ext.methods.length > 0) {
                        let newMethods = cloneDeep(ext.methods);
                        newMethods = this.markInheritance(newMethods, ext);
                        component.methodsClass = [...component.methodsClass, ...newMethods];
                    }
                    if (typeof ext.properties !== 'undefined' && ext.properties.length > 0) {
                        let newProperties = cloneDeep(ext.properties);
                        newProperties = this.markInheritance(newProperties, ext);
                        component.propertiesClass = [
                            ...component.propertiesClass,
                            ...newProperties
                        ];
                    }
                    // From component to component
                    if (typeof ext.inputsClass !== 'undefined' && ext.inputsClass.length > 0) {
                        let newInputs = cloneDeep(ext.inputsClass);
                        newInputs = this.markInheritance(newInputs, ext);
                        component.inputsClass = [...component.inputsClass, ...newInputs];
                    }
                    if (typeof ext.outputsClass !== 'undefined' && ext.outputsClass.length > 0) {
                        let newOutputs = cloneDeep(ext.outputsClass);
                        newOutputs = this.markInheritance(newOutputs, ext);
                        component.outputsClass = [...component.outputsClass, ...newOutputs];
                    }
                    if (typeof ext.methodsClass !== 'undefined' && ext.methodsClass.length > 0) {
                        let newMethods = cloneDeep(ext.methodsClass);
                        newMethods = this.markInheritance(newMethods, ext);
                        component.methodsClass = [...component.methodsClass, ...newMethods];
                    }
                    if (typeof ext.propertiesClass !== 'undefined' && ext.propertiesClass.length > 0) {
                        let newProperties = cloneDeep(ext.propertiesClass);
                        newProperties = this.markInheritance(newProperties, ext);
                        component.propertiesClass = [
                            ...component.propertiesClass,
                            ...newProperties
                        ];
                    }
                    if (typeof ext.hostBindings !== 'undefined' && ext.hostBindings.length > 0) {
                        let newHostBindings = cloneDeep(ext.hostBindings);
                        newHostBindings = this.markInheritance(newHostBindings, ext);
                        component.hostBindings = [...component.hostBindings, ...newHostBindings];
                    }
                    if (typeof ext.hostListeners !== 'undefined' && ext.hostListeners.length > 0) {
                        let newHostListeners = cloneDeep(ext.hostListeners);
                        newHostListeners = this.markInheritance(newHostListeners, ext);
                        component.hostListeners = [...component.hostListeners, ...newHostListeners];
                    }
                    if (configuration.mainData.disableLifeCycleHooks) {
                        component.methodsClass = cleanLifecycleHooksFromMethods(component.methodsClass);
                    }
                }
            }
        });

        this.classes.forEach(cla => {
            let ext;
            if (typeof cla.extends !== 'undefined') {
                ext = this.findInDependencies(cla.extends);
                if (ext) {
                    // From class to class
                    if (typeof ext.methods !== 'undefined' && ext.methods.length > 0) {
                        let newMethods = cloneDeep(ext.methods);
                        newMethods = this.markInheritance(newMethods, ext);
                        cla.methods = [...cla.methods, ...newMethods];
                    }
                    if (typeof ext.properties !== 'undefined' && ext.properties.length > 0) {
                        let newProperties = cloneDeep(ext.properties);
                        newProperties = this.markInheritance(newProperties, ext);
                        cla.properties = [
                            ...cla.properties,
                            ...newProperties
                        ];
                    }
                }
            }
        });

        return deps;
    }

    private markInheritance(data, originalource) {
        return data.map(el => {
            let newElement = el;
            newElement.inheritance = {
                file: originalource.name
            };
            return newElement;
        });
    }

    private findInDependencies(name: string) {
        let mergedData = concat([], this.components, this.classes);
        let result = find(mergedData, { name: name } as any);
        return result || false;
    }
}
