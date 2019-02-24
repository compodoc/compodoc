import { cloneDeep, concat, find } from 'lodash';

import { cleanLifecycleHooksFromMethods } from '.';
import Configuration from '../app/configuration';

export class ExtendsMerger {
    private components;
    private classes;
    private injectables;

    private static instance: ExtendsMerger;
    private constructor() {}
    public static getInstance() {
        if (!ExtendsMerger.instance) {
            ExtendsMerger.instance = new ExtendsMerger();
        }
        return ExtendsMerger.instance;
    }

    public merge(deps) {
        this.components = deps.components;
        this.classes = deps.classes;
        this.injectables = deps.injectables;

        this.components.forEach(component => {
            let ext;
            if (typeof component.extends !== 'undefined') {
                ext = this.findInDependencies(component.extends);
                if (ext) {
                    let recursiveScanWithInheritance = cls => {
                        // From class to component
                        if (typeof cls.methods !== 'undefined' && cls.methods.length > 0) {
                            let newMethods = cloneDeep(cls.methods);
                            newMethods = this.markInheritance(newMethods, cls);
                            if (typeof component.methodsClass !== 'undefined') {
                                component.methodsClass = [...component.methodsClass, ...newMethods];
                            }
                        }
                        if (typeof cls.properties !== 'undefined' && cls.properties.length > 0) {
                            let newProperties = cloneDeep(cls.properties);
                            newProperties = this.markInheritance(newProperties, cls);
                            if (typeof component.propertiesClass !== 'undefined') {
                                component.propertiesClass = [
                                    ...component.propertiesClass,
                                    ...newProperties
                                ];
                            }
                        }
                        // From component to component
                        if (typeof cls.inputsClass !== 'undefined' && cls.inputsClass.length > 0) {
                            let newInputs = cloneDeep(cls.inputsClass);
                            newInputs = this.markInheritance(newInputs, cls);
                            if (typeof component.inputsClass !== 'undefined') {
                                component.inputsClass = [...component.inputsClass, ...newInputs];
                            }
                        }
                        if (
                            typeof cls.outputsClass !== 'undefined' &&
                            cls.outputsClass.length > 0
                        ) {
                            let newOutputs = cloneDeep(cls.outputsClass);
                            newOutputs = this.markInheritance(newOutputs, cls);
                            if (typeof component.outputsClass !== 'undefined') {
                                component.outputsClass = [...component.outputsClass, ...newOutputs];
                            }
                        }
                        if (
                            typeof cls.methodsClass !== 'undefined' &&
                            cls.methodsClass.length > 0
                        ) {
                            let newMethods = cloneDeep(cls.methodsClass);
                            newMethods = this.markInheritance(newMethods, cls);
                            if (typeof component.methodsClass !== 'undefined') {
                                component.methodsClass = [...component.methodsClass, ...newMethods];
                            }
                        }
                        if (
                            typeof cls.propertiesClass !== 'undefined' &&
                            cls.propertiesClass.length > 0
                        ) {
                            let newProperties = cloneDeep(cls.propertiesClass);
                            newProperties = this.markInheritance(newProperties, cls);
                            if (typeof component.propertiesClass !== 'undefined') {
                                component.propertiesClass = [
                                    ...component.propertiesClass,
                                    ...newProperties
                                ];
                            }
                        }
                        if (
                            typeof cls.hostBindings !== 'undefined' &&
                            cls.hostBindings.length > 0
                        ) {
                            let newHostBindings = cloneDeep(cls.hostBindings);
                            newHostBindings = this.markInheritance(newHostBindings, cls);
                            if (typeof component.hostBindings !== 'undefined') {
                                component.hostBindings = [
                                    ...component.hostBindings,
                                    ...newHostBindings
                                ];
                            }
                        }
                        if (
                            typeof cls.hostListeners !== 'undefined' &&
                            cls.hostListeners.length > 0
                        ) {
                            let newHostListeners = cloneDeep(cls.hostListeners);
                            newHostListeners = this.markInheritance(newHostListeners, cls);
                            if (typeof component.hostListeners !== 'undefined') {
                                component.hostListeners = [
                                    ...component.hostListeners,
                                    ...newHostListeners
                                ];
                            }
                        }
                        if (Configuration.mainData.disableLifeCycleHooks) {
                            component.methodsClass = cleanLifecycleHooksFromMethods(
                                component.methodsClass
                            );
                        }
                        if (cls.extends) {
                            recursiveScanWithInheritance(this.findInDependencies(cls.extends));
                        }
                    };
                    // From class to class
                    recursiveScanWithInheritance(ext);
                }
            }
        });

        const mergeExtendedClasses = el => {
            let ext;
            if (typeof el.extends !== 'undefined') {
                ext = this.findInDependencies(el.extends);
                if (ext) {
                    let recursiveScanWithInheritance = cls => {
                        if (typeof cls.methods !== 'undefined' && cls.methods.length > 0) {
                            let newMethods = cloneDeep(cls.methods);
                            newMethods = this.markInheritance(newMethods, cls);
                            if (typeof el.methods !== 'undefined') {
                                el.methods = [...el.methods, ...newMethods];
                            }
                        }
                        if (typeof cls.properties !== 'undefined' && cls.properties.length > 0) {
                            let newProperties = cloneDeep(cls.properties);
                            newProperties = this.markInheritance(newProperties, cls);
                            if (typeof el.properties !== 'undefined') {
                                el.properties = [...el.properties, ...newProperties];
                            }
                        }
                        if (cls.extends) {
                            recursiveScanWithInheritance(this.findInDependencies(cls.extends));
                        }
                    };
                    // From elss to elss
                    recursiveScanWithInheritance(ext);
                }
            }
        };

        this.classes.forEach(mergeExtendedClasses);
        this.injectables.forEach(mergeExtendedClasses);

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
        let mergedData = concat([], this.components, this.classes, this.injectables);
        let result = find(mergedData, { name: name } as any);
        return result || false;
    }
}

export default ExtendsMerger.getInstance();
