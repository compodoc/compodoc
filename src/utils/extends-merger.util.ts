import { cloneDeep, concat, find } from 'lodash';

import { cleanLifecycleHooksFromMethods } from '.';
import Configuration from '../app/configuration';

export class ExtendsMerger {
    private components;
    private classes;
    private injectables;
    private directives;
    private controllers;

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
        this.directives = deps.directives;
        this.controllers = deps.controllers;

        const mergeExtendedProperties = component => {
            let ext;
            if (typeof component.extends !== 'undefined') {
                ext = this.findInDependencies(component.extends);

                if (ext) {
                    const recursiveScanWithInheritance = cls => {
                        // From class to component
                        if (typeof cls.methods !== 'undefined' && cls.methods.length > 0) {
                            let newMethods = cloneDeep(cls.methods);
                            newMethods = this.markInheritance(newMethods, cls);
                            if (typeof component.methodsClass !== 'undefined') {
                                this.mergeInheritance(component, 'methodsClass', newMethods);
                            }
                        }
                        if (typeof cls.properties !== 'undefined' && cls.properties.length > 0) {
                            let newProperties = cloneDeep(cls.properties);
                            newProperties = this.markInheritance(newProperties, cls);
                            if (typeof component.propertiesClass !== 'undefined') {
                                this.mergeInheritance(component, 'propertiesClass', newProperties);
                            }
                        }
                        // From component to component or directive to component
                        if (typeof cls.inputsClass !== 'undefined' && cls.inputsClass.length > 0) {
                            let newInputs = cloneDeep(cls.inputsClass);
                            newInputs = this.markInheritance(newInputs, cls);
                            if (typeof component.inputsClass !== 'undefined') {
                                this.mergeInheritance(component, 'inputsClass', newInputs);
                            }
                        }
                        if (
                            typeof cls.outputsClass !== 'undefined' &&
                            cls.outputsClass.length > 0
                        ) {
                            let newOutputs = cloneDeep(cls.outputsClass);
                            newOutputs = this.markInheritance(newOutputs, cls);
                            if (typeof component.outputsClass !== 'undefined') {
                                this.mergeInheritance(component, 'outputsClass', newOutputs);
                            }
                        }
                        if (
                            typeof cls.methodsClass !== 'undefined' &&
                            cls.methodsClass.length > 0
                        ) {
                            let newMethods = cloneDeep(cls.methodsClass);
                            newMethods = this.markInheritance(newMethods, cls);
                            if (typeof component.methodsClass !== 'undefined') {
                                this.mergeInheritance(component, 'methodsClass', newMethods);
                            }
                        }
                        if (
                            typeof cls.propertiesClass !== 'undefined' &&
                            cls.propertiesClass.length > 0
                        ) {
                            let newProperties = cloneDeep(cls.propertiesClass);
                            newProperties = this.markInheritance(newProperties, cls);
                            if (typeof component.propertiesClass !== 'undefined') {
                                this.mergeInheritance(component, 'propertiesClass', newProperties);
                            }
                        }
                        if (
                            typeof cls.hostBindings !== 'undefined' &&
                            cls.hostBindings.length > 0
                        ) {
                            let newHostBindings = cloneDeep(cls.hostBindings);
                            newHostBindings = this.markInheritance(newHostBindings, cls);
                            if (typeof component.hostBindings !== 'undefined') {
                                this.mergeInheritance(component, 'hostBindings', newHostBindings);
                            }
                        }
                        if (
                            typeof cls.hostListeners !== 'undefined' &&
                            cls.hostListeners.length > 0
                        ) {
                            let newHostListeners = cloneDeep(cls.hostListeners);
                            newHostListeners = this.markInheritance(newHostListeners, cls);
                            if (typeof component.hostListeners !== 'undefined') {
                                this.mergeInheritance(component, 'hostListeners', newHostListeners);
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
        };

        this.components.forEach(mergeExtendedProperties);
        this.directives.forEach(mergeExtendedProperties);
        this.controllers.forEach(mergeExtendedProperties);

        const mergeExtendedClasses = el => {
            let ext;
            if (typeof el.extends !== 'undefined') {
                ext = this.findInDependencies(el.extends);
                if (ext) {
                    const recursiveScanWithInheritance = cls => {
                        if (typeof cls.methods !== 'undefined' && cls.methods.length > 0) {
                            let newMethods = cloneDeep(cls.methods);
                            newMethods = this.markInheritance(newMethods, cls);
                            if (typeof el.methods !== 'undefined') {
                                this.mergeInheritance(el, 'methods', newMethods);
                            }
                        }
                        if (typeof cls.properties !== 'undefined' && cls.properties.length > 0) {
                            let newProperties = cloneDeep(cls.properties);
                            newProperties = this.markInheritance(newProperties, cls);
                            if (typeof el.properties !== 'undefined') {
                                this.mergeInheritance(el, 'properties', newProperties);
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
        this.directives.forEach(mergeExtendedClasses);
        this.controllers.forEach(mergeExtendedClasses);

        return deps;
    }

    private markInheritance(data, originalource) {
        return data.map(el => {
            const newElement = el;
            newElement.inheritance = {
                file: originalource.name
            };
            return newElement;
        });
    }

    private mergeInheritance(component: any, metaPropertyId: string, newMembers: any) {
        newMembers.forEach(newMember => {
            const overriddenMethod = component[metaPropertyId].find(
                componentMember => componentMember.name === newMember.name
            );

            if (overriddenMethod) {
                overriddenMethod.inheritance = newMember.inheritance;
            } else {
                component[metaPropertyId].push(newMember);
            }
        });
    }

    private findInDependencies(name: string) {
        const mergedData = concat(
            [],
            this.components,
            this.classes,
            this.injectables,
            this.directives,
            this.controllers
        );
        const result = find(mergedData, { name: name } as any);
        return result || false;
    }
}

export default ExtendsMerger.getInstance();
