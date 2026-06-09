import { cloneDeep, concat, find } from './collection.util';

import { cleanLifecycleHooksFromMethods } from '.';
import Configuration from '../app/configuration';

export class ExtendsMerger {
    private components;
    private classes;
    private interfaces;
    private injectables;
    private directives;
    private controllers;
    private aliases;

    private static instance: ExtendsMerger;
    private constructor() {}
    public static getInstance() {
        if (!ExtendsMerger.instance) {
            ExtendsMerger.instance = new ExtendsMerger();
        }
        return ExtendsMerger.instance;
    }

    public merge(deps) {
        this.components = deps.components || [];
        this.classes = deps.classes || [];
        this.interfaces = deps.interfaces || [];
        this.injectables = deps.injectables || [];
        this.directives = deps.directives || [];
        this.controllers = deps.controllers || [];
        this.aliases = deps.aliases || {};

        const mergeExtendedProperties = component => {
            let ext;
            if (typeof component.extends !== 'undefined') {
                ext = this.findInDependencies(component.extends[0]);

                if (ext) {
                    const recursiveScanWithInheritance = cls => {
                        if (!cls) {
                            return;
                        }
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
                            recursiveScanWithInheritance(this.findInDependencies(cls.extends[0]));
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
                ext = this.findInDependencies(el.extends[0]);
                if (ext) {
                    const recursiveScanWithInheritance = cls => {
                        if (!cls) {
                            return;
                        }
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
                            recursiveScanWithInheritance(this.findInDependencies(cls.extends[0]));
                        }
                    };
                    // From elss to elss
                    recursiveScanWithInheritance(ext);
                }
            }
        };

        this.classes.forEach(mergeExtendedClasses);
        this.interfaces.forEach(mergeExtendedClasses);
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
        const trimmedName = (name || '').trim();
        const mergedData = this.getMergedDependenciesData();

        const result = this.findDirectDependency(trimmedName, mergedData);
        if (result) {
            return result;
        }

        const parsedTypeReference = this.parseGenericTypeReference(trimmedName);
        if (!parsedTypeReference) {
            return false;
        }

        if (parsedTypeReference.name === 'Omit' && parsedTypeReference.typeArguments.length >= 2) {
            const baseTypeName = parsedTypeReference.typeArguments[0];
            const baseType = this.resolveTypeReference(baseTypeName, mergedData);
            if (!baseType) {
                return false;
            }

            const omittedKeys = this.extractStringLiteralUnionValues(
                parsedTypeReference.typeArguments[1]
            );

            if (!omittedKeys || omittedKeys.length === 0) {
                return baseType;
            }

            const omittedKeySet = new Set(omittedKeys);
            const mergedType = cloneDeep(baseType);

            if (Array.isArray(mergedType.properties)) {
                mergedType.properties = mergedType.properties.filter(
                    (property) => property && !omittedKeySet.has(property.name)
                );
            }

            if (Array.isArray(mergedType.methods)) {
                mergedType.methods = mergedType.methods.filter(
                    (method) => method && !omittedKeySet.has(method.name)
                );
            }

            return mergedType;
        }

        return this.resolveTypeReference(trimmedName, mergedData) || false;
    }

    private getMergedDependenciesData() {
        return concat(
            [],
            this.components,
            this.classes,
            this.interfaces,
            this.injectables,
            this.directives,
            this.controllers
        );
    }

    private findDirectDependency(name: string, mergedData: any[]) {
        let result = find(mergedData, { name: name } as any);

        // Find in aliases ?
        if (!result) {
            const aliases = Object.values(this.aliases);
            const isInAlias = aliases.includes(name);
            if (isInAlias) {
                const finalOriginalName = this.findInAliases(name);
                if (finalOriginalName) {
                    result = find(mergedData, { name: finalOriginalName } as any);
                }
            }
        }

        return result || false;
    }

    private resolveTypeReference(typeReference: string, mergedData: any[]) {
        const trimmedTypeReference = (typeReference || '').trim();
        let result = this.findDirectDependency(trimmedTypeReference, mergedData);
        if (result) {
            return result;
        }

        const parsedTypeReference = this.parseGenericTypeReference(trimmedTypeReference);
        if (parsedTypeReference) {
            result = this.findDirectDependency(parsedTypeReference.name, mergedData);
            if (result) {
                return result;
            }
        }

        return false;
    }

    private parseGenericTypeReference(typeReference: string) {
        const trimmedTypeReference = (typeReference || '').trim();
        const openingBracketIndex = trimmedTypeReference.indexOf('<');
        const closingBracketIndex = trimmedTypeReference.lastIndexOf('>');

        if (
            openingBracketIndex === -1 ||
            closingBracketIndex === -1 ||
            closingBracketIndex <= openingBracketIndex
        ) {
            return null;
        }

        const typeName = trimmedTypeReference.slice(0, openingBracketIndex).trim();
        const rawTypeArguments = trimmedTypeReference
            .slice(openingBracketIndex + 1, closingBracketIndex)
            .trim();
        if (!typeName || !rawTypeArguments) {
            return null;
        }

        const typeArguments = this.splitTopLevelTypeArguments(rawTypeArguments);
        return {
            name: typeName,
            typeArguments
        };
    }

    private splitTopLevelTypeArguments(typeArguments: string): string[] {
        const result = [];
        let current = '';
        let angleDepth = 0;
        let parenthesisDepth = 0;
        let bracketDepth = 0;
        let braceDepth = 0;
        let quote: string | null = null;

        for (let i = 0; i < typeArguments.length; i++) {
            const character = typeArguments[i];
            const previousCharacter = i > 0 ? typeArguments[i - 1] : '';

            if (quote) {
                current += character;
                if (character === quote && previousCharacter !== '\\') {
                    quote = null;
                }
                continue;
            }

            if (character === "'" || character === '"' || character === '`') {
                quote = character;
                current += character;
                continue;
            }

            if (character === '<') {
                angleDepth += 1;
                current += character;
                continue;
            }

            if (character === '>') {
                angleDepth = Math.max(0, angleDepth - 1);
                current += character;
                continue;
            }

            if (character === '(') {
                parenthesisDepth += 1;
                current += character;
                continue;
            }

            if (character === ')') {
                parenthesisDepth = Math.max(0, parenthesisDepth - 1);
                current += character;
                continue;
            }

            if (character === '[') {
                bracketDepth += 1;
                current += character;
                continue;
            }

            if (character === ']') {
                bracketDepth = Math.max(0, bracketDepth - 1);
                current += character;
                continue;
            }

            if (character === '{') {
                braceDepth += 1;
                current += character;
                continue;
            }

            if (character === '}') {
                braceDepth = Math.max(0, braceDepth - 1);
                current += character;
                continue;
            }

            if (
                character === ',' &&
                angleDepth === 0 &&
                parenthesisDepth === 0 &&
                bracketDepth === 0 &&
                braceDepth === 0
            ) {
                const argument = current.trim();
                if (argument) {
                    result.push(argument);
                }
                current = '';
                continue;
            }

            current += character;
        }

        const trailingArgument = current.trim();
        if (trailingArgument) {
            result.push(trailingArgument);
        }

        return result;
    }

    private extractStringLiteralUnionValues(typeExpression: string): string[] {
        const values = [];
        const stringLiteralRegex = /(['"`])((?:\\.|(?!\1).)*)\1/g;
        let match;
        while ((match = stringLiteralRegex.exec(typeExpression)) !== null) {
            values.push(match[2]);
        }
        return values;
    }

    public findInAliases(name: string) {
        let finalOriginalName = null;
        for (const originalName in this.aliases) {
            if (this.aliases[originalName].includes(name)) {
                finalOriginalName = originalName;
            }
        }
        return finalOriginalName;
    }
}

export default ExtendsMerger.getInstance();
