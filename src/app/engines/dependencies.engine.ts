import * as _ from 'lodash';

import { MiscellaneousData } from '../interfaces/miscellaneous-data.interface';
import { ParsedData } from '../interfaces/parsed-data.interface';
import { RouteInterface } from '../interfaces/routes.interface';

import AngularApiUtil from '../../utils/angular-api.util';
import { IApiSourceResult } from '../../utils/api-source-result.interface';
import { getNamesCompareFn } from '../../utils/utils';

import {
    IEnumDecDep,
    IFunctionDecDep,
    IGuardDep,
    IInjectableDep,
    IInterceptorDep,
    IInterfaceDep,
    IPipeDep,
    ITypeAliasDecDep
} from '../compiler/angular/dependencies.interfaces';

import { IComponentDep } from '../compiler/angular/deps/component-dep.factory';
import { IControllerDep } from '../compiler/angular/deps/controller-dep.factory';
import { IDirectiveDep } from '../compiler/angular/deps/directive-dep.factory';
import { IModuleDep } from '../compiler/angular/deps/module-dep.factory';

const traverse = require('neotraverse/legacy');

export class DependenciesEngine {
    private static readonly angularApiAliases: { [name: string]: string[] } = {
        NgFor: ['NgForOf']
    };

    public rawData: ParsedData;
    public modules: Object[];
    public rawModules: Object[];
    public rawModulesForOverview: Object[];
    public components: Object[];
    public controllers: Object[];
    public entities: Object[];
    public directives: Object[];
    public injectables: Object[];
    public interceptors: Object[];
    public guards: Object[];
    public interfaces: IInterfaceDep[];
    public routes: RouteInterface;
    public pipes: Object[];
    public classes: Object[];
    public miscellaneous: MiscellaneousData = {
        variables: [],
        functions: [],
        typealiases: [],
        enumerations: [],
        groupedVariables: [],
        groupedFunctions: [],
        groupedEnumerations: [],
        groupedTypeAliases: []
    };
    private relationshipsCache: { [name: string]: { incoming: any[]; outgoing: any[] } } = {};

    private static instance: DependenciesEngine;
    private constructor() {}
    public static getInstance() {
        if (!DependenciesEngine.instance) {
            DependenciesEngine.instance = new DependenciesEngine();
        }
        return DependenciesEngine.instance;
    }

    private updateModulesDeclarationsExportsTypes() {
        const mergeTypes = entry => {
            const directive = this.findInCompodocDependencies(
                entry.name,
                this.directives,
                entry.file
            );
            if (typeof directive.data !== 'undefined') {
                entry.type = 'directive';
                entry.id = directive.data.id;
            }

            const component = this.findInCompodocDependencies(
                entry.name,
                this.components,
                entry.file
            );
            if (typeof component.data !== 'undefined') {
                entry.type = 'component';
                entry.id = component.data.id;
            }

            const pipe = this.findInCompodocDependencies(entry.name, this.pipes, entry.file);
            if (typeof pipe.data !== 'undefined') {
                entry.type = 'pipe';
                entry.id = pipe.data.id;
            }
        };

        this.modules.forEach((module: any) => {
            module.declarations.forEach(declaration => {
                mergeTypes(declaration);
            });
            module.exports.forEach(expt => {
                mergeTypes(expt);
            });
            module.entryComponents.forEach(ent => {
                mergeTypes(ent);
            });
        });
    }

    public init(data: ParsedData) {
        traverse(data).forEach(function (node) {
            if (node) {
                if (node.parent) {
                    delete node.parent;
                }
                if (node.initializer) {
                    delete node.initializer;
                }
            }
        });
        this.rawData = data;
        this.modules = _.sortBy(this.rawData.modules, [el => el.name.toLowerCase()]);
        this.rawModulesForOverview = _.sortBy(data.modulesForGraph, [el => el.name.toLowerCase()]);
        this.rawModules = _.sortBy(data.modulesForGraph, [el => el.name.toLowerCase()]);
        this.components = _.sortBy(this.rawData.components, [el => el.name.toLowerCase()]);
        this.controllers = _.sortBy(this.rawData.controllers, [el => el.name.toLowerCase()]);
        this.entities = _.sortBy(this.rawData.entities, [el => el.name.toLowerCase()]);
        this.directives = _.sortBy(this.rawData.directives, [el => el.name.toLowerCase()]);
        this.injectables = _.sortBy(this.rawData.injectables, [el => el.name.toLowerCase()]);
        this.interceptors = _.sortBy(this.rawData.interceptors, [el => el.name.toLowerCase()]);
        this.guards = _.sortBy(this.rawData.guards, [el => el.name.toLowerCase()]);
        this.interfaces = this.mergeDeclarationMergedInterfaces(this.rawData.interfaces);
        this.interfaces = _.sortBy(this.interfaces, [el => el.name.toLowerCase()]);
        this.pipes = _.sortBy(this.rawData.pipes, [el => el.name.toLowerCase()]);
        this.classes = _.sortBy(this.rawData.classes, [el => el.name.toLowerCase()]);
        this.miscellaneous = this.rawData.miscellaneous;
        this.prepareMiscellaneous();
        this.updateModulesDeclarationsExportsTypes();
        this.routes = this.rawData.routesTree;
        this.manageDuplicatesName();
        this.cleanRawModulesNames();
        this.relationshipsCache = {};
    }

    private cleanRawModulesNames() {
        this.rawModulesForOverview = this.rawModulesForOverview.map((module: any) => {
            module.name = module.name.replace('$', '');
            return module;
        });
    }

    private mergeDeclarationMergedInterfaces(interfaces: IInterfaceDep[]): IInterfaceDep[] {
        if (!interfaces || interfaces.length === 0) {
            return [];
        }

        const mergedInterfaces = _.chain(interfaces)
            .filter((interf: IInterfaceDep) => !!interf.declarationMergeId)
            .groupBy((interf: IInterfaceDep) => interf.declarationMergeId)
            .values()
            .map((group: IInterfaceDep[]) => {
                const merged = { ...group[0] };

                const properties = this.mergeUniqueArrayValues(
                    group.map((interf) => interf.properties)
                );
                if (properties) {
                    merged.properties = properties;
                }

                const methods = this.mergeUniqueArrayValues(group.map((interf) => interf.methods));
                if (methods) {
                    merged.methods = methods;
                }

                const indexSignatures = this.mergeUniqueArrayValues(
                    group.map((interf) => interf.indexSignatures)
                );
                if (indexSignatures) {
                    merged.indexSignatures = indexSignatures;
                }

                const extendsList = this.mergeUniqueArrayValues(
                    group.map((interf) => interf.extends)
                );
                if (extendsList) {
                    merged.extends = extendsList;
                }

                merged.deprecated = group.some((interf) => !!interf.deprecated);

                const deprecationMessages = _.uniq(
                    group.map((interf) => interf.deprecationMessage).filter(Boolean)
                );
                merged.deprecationMessage =
                    deprecationMessages.length > 0 ? deprecationMessages.join('\n\n') : '';

                return merged;
            })
            .value();

        const regularInterfaces = interfaces.filter((interf: IInterfaceDep) => !interf.declarationMergeId);

        return _.concat(regularInterfaces, mergedInterfaces);
    }

    private mergeUniqueArrayValues<T>(arrays: Array<T[] | undefined>): T[] | undefined {
        const merged = [];
        const cache = new Set<string>();

        for (const arr of arrays) {
            if (!arr || arr.length === 0) {
                continue;
            }
            for (const item of arr) {
                const key =
                    typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item);
                if (cache.has(key)) {
                    continue;
                }
                cache.add(key);
                merged.push(item);
            }
        }

        return merged.length > 0 ? merged : undefined;
    }

    private findInCompodocDependencies(name, data, file?): IApiSourceResult<any> {
        let _result = {
            source: 'internal',
            data: undefined,
            score: 0
        };
        let nameFoundCounter = 0;
        if (data && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                if (typeof name !== 'undefined') {
                    if (typeof file !== 'undefined') {
                        if (
                            name === data[i].name &&
                            file.replace(/\\/g, '/').indexOf(data[i].file) !== -1
                        ) {
                            nameFoundCounter += 1;
                            _result.data = data[i];
                            _result.score = 2;
                        } else if (
                            name.indexOf(data[i].name) !== -1 &&
                            file.replace(/\\/g, '/').indexOf(data[i].file) !== -1
                        ) {
                            nameFoundCounter += 1;
                            _result.data = data[i];
                            _result.score = 1;
                        }
                    } else {
                        if (name === data[i].name) {
                            nameFoundCounter += 1;
                            _result.data = data[i];
                            _result.score = 2;
                        } else if (name.indexOf(data[i].name) !== -1) {
                            nameFoundCounter += 1;
                            _result.data = data[i];
                            _result.score = 1;
                        }
                    }
                }
            }

            // Prevent wrong matching like MultiSelectOptionDirective with SelectOptionDirective, or QueryParamGroupService with QueryParamGroup
            if (nameFoundCounter > 1) {
                let found = false;
                for (let i = 0; i < data.length; i++) {
                    if (typeof name !== 'undefined') {
                        if (typeof file !== 'undefined') {
                            if (name === data[i].name) {
                                found = true;
                                _result.data = data[i];
                                _result.score = 2;
                            }
                        } else {
                            if (name === data[i].name) {
                                found = true;
                                _result.data = data[i];
                                _result.score = 2;
                            }
                        }
                    }
                }
                if (!found) {
                    _result = {
                        source: 'internal',
                        data: undefined,
                        score: 0
                    };
                }
            }
        }
        return _result;
    }

    private manageDuplicatesName() {
        const processDuplicates = (element, index, array) => {
            const elementsWithSameName = _.filter(array, { name: element.name });
            if (elementsWithSameName.length > 1) {
                // First element is the reference for duplicates
                for (let i = 1; i < elementsWithSameName.length; i++) {
                    let elementToEdit = elementsWithSameName[i];
                    if (typeof elementToEdit.isDuplicate === 'undefined') {
                        elementToEdit.isDuplicate = true;
                        elementToEdit.duplicateId = i;
                        elementToEdit.duplicateName =
                            elementToEdit.name + '-' + elementToEdit.duplicateId;
                        elementToEdit.id = elementToEdit.id + '-' + elementToEdit.duplicateId;
                    }
                }
            }
            return element;
        };
        this.classes = this.classes.map(processDuplicates);
        this.interfaces = this.interfaces.map(processDuplicates);
        this.injectables = this.injectables.map(processDuplicates);
        this.pipes = this.pipes.map(processDuplicates);
        this.interceptors = this.interceptors.map(processDuplicates);
        this.guards = this.guards.map(processDuplicates);
        this.modules = this.modules.map(processDuplicates);
        this.components = this.components.map(processDuplicates);
        this.controllers = this.controllers.map(processDuplicates);
        this.entities = this.entities.map(processDuplicates);
        this.directives = this.directives.map(processDuplicates);
    }

    public find(name: string): IApiSourceResult<any> | undefined {
        const normalizedName = typeof name === 'string' ? name.trim() : name;
        const namesToResolve = [normalizedName];
        if (DependenciesEngine.angularApiAliases[normalizedName]) {
            namesToResolve.push(...DependenciesEngine.angularApiAliases[normalizedName]);
        }

        let bestScore = 0;
        let bestResult = undefined;

        for (const resolvedName of namesToResolve) {
            const searchFunctions: Array<() => IApiSourceResult<any>> = [
                () => this.findInCompodocDependencies(resolvedName, this.modules),
                () => this.findInCompodocDependencies(resolvedName, this.injectables),
                () => this.findInCompodocDependencies(resolvedName, this.interceptors),
                () => this.findInCompodocDependencies(resolvedName, this.guards),
                () => this.findInCompodocDependencies(resolvedName, this.interfaces),
                () => this.findInCompodocDependencies(resolvedName, this.classes),
                () => this.findInCompodocDependencies(resolvedName, this.components),
                () => this.findInCompodocDependencies(resolvedName, this.controllers),
                () => this.findInCompodocDependencies(resolvedName, this.entities),
                () => this.findInCompodocDependencies(resolvedName, this.directives),
                () => this.findInCompodocDependencies(resolvedName, this.miscellaneous.variables),
                () => this.findInCompodocDependencies(resolvedName, this.miscellaneous.functions),
                () => this.findInCompodocDependencies(resolvedName, this.miscellaneous.typealiases),
                () => this.findInCompodocDependencies(resolvedName, this.miscellaneous.enumerations),
                () => AngularApiUtil.findApi(resolvedName)
            ];

            for (let searchFunction of searchFunctions) {
                const result = searchFunction();
                if (result.data && result.score > bestScore) {
                    bestScore = result.score;
                    bestResult = result;
                }
            }
        }

        return bestResult;
    }

    public update(updatedData): void {
        if (updatedData.modules.length > 0) {
            _.forEach(updatedData.modules, (module: IModuleDep) => {
                const _index = _.findIndex(this.modules, { name: module.name } as any);
                this.modules[_index] = module;
            });
        }
        if (updatedData.components.length > 0) {
            _.forEach(updatedData.components, (component: IComponentDep) => {
                const _index = _.findIndex(this.components, { name: component.name } as any);
                this.components[_index] = component;
            });
        }
        if (updatedData.controllers.length > 0) {
            _.forEach(updatedData.controllers, (controller: IControllerDep) => {
                const _index = _.findIndex(this.controllers, { name: controller.name } as any);
                this.controllers[_index] = controller;
            });
        }
        if (updatedData.entities.length > 0) {
            _.forEach(updatedData.entities, (entity: IControllerDep) => {
                const _index = _.findIndex(this.entities, { name: entity.name } as any);
                this.entities[_index] = entity;
            });
        }
        if (updatedData.directives.length > 0) {
            _.forEach(updatedData.directives, (directive: IDirectiveDep) => {
                const _index = _.findIndex(this.directives, { name: directive.name } as any);
                this.directives[_index] = directive;
            });
        }
        if (updatedData.injectables.length > 0) {
            _.forEach(updatedData.injectables, (injectable: IInjectableDep) => {
                const _index = _.findIndex(this.injectables, { name: injectable.name } as any);
                this.injectables[_index] = injectable;
            });
        }
        if (updatedData.interceptors.length > 0) {
            _.forEach(updatedData.interceptors, (interceptor: IInterceptorDep) => {
                const _index = _.findIndex(this.interceptors, { name: interceptor.name } as any);
                this.interceptors[_index] = interceptor;
            });
        }
        if (updatedData.guards.length > 0) {
            _.forEach(updatedData.guards, (guard: IGuardDep) => {
                const _index = _.findIndex(this.guards, { name: guard.name } as any);
                this.guards[_index] = guard;
            });
        }
        if (updatedData.interfaces.length > 0) {
            _.forEach(updatedData.interfaces, (int: IInterfaceDep) => {
                const _index = _.findIndex(this.interfaces, { name: int.name } as any);
                this.interfaces[_index] = int;
            });
        }
        if (updatedData.pipes.length > 0) {
            _.forEach(updatedData.pipes, (pipe: IPipeDep) => {
                const _index = _.findIndex(this.pipes, { name: pipe.name } as any);
                this.pipes[_index] = pipe;
            });
        }
        if (updatedData.classes.length > 0) {
            _.forEach(updatedData.classes, (classe: any) => {
                const _index = _.findIndex(this.classes, { name: classe.name } as any);
                this.classes[_index] = classe;
            });
        }
        /**
         * Miscellaneous update
         */
        if (updatedData.miscellaneous.variables.length > 0) {
            _.forEach(updatedData.miscellaneous.variables, (variable: any) => {
                const _index = _.findIndex(this.miscellaneous.variables, {
                    name: variable.name,
                    file: variable.file
                });
                this.miscellaneous.variables[_index] = variable;
            });
        }
        if (updatedData.miscellaneous.functions.length > 0) {
            _.forEach(updatedData.miscellaneous.functions, (func: IFunctionDecDep) => {
                const _index = _.findIndex(this.miscellaneous.functions, {
                    name: func.name,
                    file: func.file
                });
                this.miscellaneous.functions[_index] = func;
            });
        }
        if (updatedData.miscellaneous.typealiases.length > 0) {
            _.forEach(updatedData.miscellaneous.typealiases, (typealias: ITypeAliasDecDep) => {
                const _index = _.findIndex(this.miscellaneous.typealiases, {
                    name: typealias.name,
                    file: typealias.file
                });
                this.miscellaneous.typealiases[_index] = typealias;
            });
        }
        if (updatedData.miscellaneous.enumerations.length > 0) {
            _.forEach(updatedData.miscellaneous.enumerations, (enumeration: IEnumDecDep) => {
                const _index = _.findIndex(this.miscellaneous.enumerations, {
                    name: enumeration.name,
                    file: enumeration.file
                });
                this.miscellaneous.enumerations[_index] = enumeration;
            });
        }
        this.prepareMiscellaneous();
        this.relationshipsCache = {};
    }

    public findInCompodoc(name: string) {
        const mergedData = _.concat(
            [],
            this.modules,
            this.components,
            this.controllers,
            this.entities,
            this.directives,
            this.injectables,
            this.interceptors,
            this.guards,
            this.interfaces,
            this.pipes,
            this.classes,
            this.miscellaneous.enumerations,
            this.miscellaneous.typealiases,
            this.miscellaneous.variables,
            this.miscellaneous.functions
        );
        const result = _.find(mergedData, { name: name } as any);
        return result || false;
    }

    /**
     * Returns entity relationships split in two lists:
     * - incoming: entities that reference/use the current entity
     * - outgoing: entities referenced by the current entity
     */
    public getRelationships(entityRef: any): {
        incoming: Array<{ name: string; type: string; description?: string }>;
        outgoing: Array<{ name: string; type: string; description?: string }>;
    } {
        const target = this.resolveEntityFromReference(entityRef);
        const entityName =
            typeof entityRef === 'string' ? entityRef : entityRef?.name;
        if (!entityName) {
            return { incoming: [], outgoing: [] };
        }
        const cacheKey = target?.id || entityName;

        if (this.relationshipsCache[cacheKey]) {
            return this.relationshipsCache[cacheKey];
        }

        const MAX_ITEMS = 80;
        const incoming: Array<{ name: string; type: string; description?: string }> = [];
        const outgoing: Array<{ name: string; type: string; description?: string }> = [];
        const incomingSet = new Set<string>();
        const outgoingSet = new Set<string>();

        const addIncoming = (dep: any) => {
            if (!dep?.name || dep.name === entityName || incoming.length >= MAX_ITEMS) {
                return;
            }
            const key = `${dep.type || 'unknown'}::${dep.name}`;
            if (incomingSet.has(key)) {
                return;
            }
            incomingSet.add(key);
            incoming.push({
                name: dep.name,
                type: dep.type || 'unknown',
                description: this.extractShortDescription(dep)
            });
        };

        const addOutgoing = (item: any, fallbackType = 'dependency') => {
            if (!item) {
                return;
            }
            const name = typeof item === 'string' ? item : item.name;
            if (!name || name === entityName || outgoing.length >= MAX_ITEMS) {
                return;
            }
            const resolved = this.resolveEntityByName(name);
            const type = resolved?.type || item.type || fallbackType;
            const key = `${type}::${name}`;
            if (outgoingSet.has(key)) {
                return;
            }
            outgoingSet.add(key);
            outgoing.push({
                name,
                type,
                description: this.extractShortDescription(resolved || item)
            });
        };

        const includeIfReferences = (dep: any, references?: Array<any>) => {
            if (!references || references.length === 0) {
                return;
            }
            if (
                references.some((ref) =>
                    this.referencePointsToEntity(ref, target, entityName, dep)
                )
            ) {
                addIncoming(dep);
            }
        };

        const allInternalEntities: any[] = this.getAllInternalEntities();

        allInternalEntities.forEach((dep) => {
            includeIfReferences(dep, dep.imports);
            includeIfReferences(dep, dep.exports);
            includeIfReferences(dep, dep.declarations);
            includeIfReferences(dep, dep.controllers);
            includeIfReferences(dep, dep.providers);
            includeIfReferences(dep, dep.viewProviders);
            includeIfReferences(dep, dep.entryComponents);
            includeIfReferences(dep, dep.bootstrap);
            includeIfReferences(dep, dep.hostDirectives);

            if (dep.extends) {
                const extendsList = Array.isArray(dep.extends) ? dep.extends : [dep.extends];
                if (extendsList.some((item) => item === entityName || item?.name === entityName)) {
                    addIncoming(dep);
                }
            }
            if (dep.implements) {
                const implList = Array.isArray(dep.implements)
                    ? dep.implements
                    : [dep.implements];
                if (implList.some((item) => item === entityName || item?.name === entityName)) {
                    addIncoming(dep);
                }
            }
        });

        if (target) {
            (target.imports || []).forEach((item) => addOutgoing(item, 'module'));
            (target.exports || []).forEach((item) => addOutgoing(item, 'module'));
            (target.declarations || []).forEach((item) => addOutgoing(item));
            (target.controllers || []).forEach((item) => addOutgoing(item, 'controller'));
            (target.providers || []).forEach((item) => addOutgoing(item, 'injectable'));
            (target.viewProviders || []).forEach((item) => addOutgoing(item, 'injectable'));
            (target.entryComponents || []).forEach((item) => addOutgoing(item, 'component'));
            (target.bootstrap || []).forEach((item) => addOutgoing(item, 'component'));
            (target.hostDirectives || []).forEach((item) => addOutgoing(item, 'directive'));

            if (target.extends) {
                const extendsList = Array.isArray(target.extends)
                    ? target.extends
                    : [target.extends];
                extendsList.forEach((item) => addOutgoing(item, 'class'));
            }
            if (target.implements) {
                const implList = Array.isArray(target.implements)
                    ? target.implements
                    : [target.implements];
                implList.forEach((item) => addOutgoing(item, 'interface'));
            }
        }

        const relationships = { incoming, outgoing };
        this.relationshipsCache[cacheKey] = relationships;
        return relationships;
    }

    private referencePointsToEntity(
        reference: any,
        targetEntity: any,
        fallbackName: string,
        originEntity?: any
    ): boolean {
        if (!reference || !fallbackName) {
            return false;
        }

        if (targetEntity?.id && typeof reference === 'object' && reference.id) {
            return reference.id === targetEntity.id;
        }

        const resolved = this.resolveEntityFromReference(reference, originEntity);
        if (resolved && targetEntity) {
            return resolved.id === targetEntity.id;
        }

        if (typeof reference === 'string') {
            return reference === fallbackName;
        }

        if (reference?.name !== fallbackName) {
            return false;
        }

        const refType = this.normalizeEntityType(reference?.type);
        const targetType = this.normalizeEntityType(targetEntity?.type);
        if (refType && targetType && refType !== targetType) {
            return false;
        }
        return true;
    }

    private normalizeEntityType(type?: string): string | undefined {
        if (!type) {
            return undefined;
        }
        return type === 'classe' ? 'class' : type;
    }

    private normalizeFilePath(filePath?: string): string | undefined {
        return filePath ? String(filePath).replace(/\\/g, '/') : undefined;
    }

    private getAllInternalEntities(): any[] {
        return _.concat(
            [],
            this.modules,
            this.components,
            this.controllers,
            this.entities,
            this.directives,
            this.injectables,
            this.interceptors,
            this.guards,
            this.interfaces,
            this.pipes,
            this.classes
        );
    }

    private resolveEntityByName(name: string): any {
        if (!name) {
            return undefined;
        }
        return this.resolveEntityFromReference({ name });
    }

    private resolveEntityFromReference(reference: any, originEntity?: any): any {
        if (!reference) {
            return undefined;
        }

        const entities = this.getAllInternalEntities();
        if (typeof reference === 'object' && reference.id) {
            const byId = _.find(entities, { id: reference.id } as any);
            if (byId) {
                return byId;
            }
        }

        const refName = typeof reference === 'string' ? reference : reference.name;
        if (!refName) {
            return undefined;
        }

        let candidates = entities.filter(
            (entity: any) => entity.name === refName || entity.duplicateName === refName
        );
        if (candidates.length === 0) {
            return undefined;
        }
        if (candidates.length === 1) {
            return candidates[0];
        }

        const refType = this.normalizeEntityType(
            typeof reference === 'object' ? reference.type : undefined
        );
        if (refType) {
            const typeCandidates = candidates.filter(
                (entity: any) => this.normalizeEntityType(entity.type) === refType
            );
            if (typeCandidates.length === 1) {
                return typeCandidates[0];
            }
            if (typeCandidates.length > 0) {
                candidates = typeCandidates;
            }
        }

        const refFile = this.normalizeFilePath(
            typeof reference === 'object' ? reference.file : undefined
        );
        if (refFile) {
            const fileCandidates = candidates.filter((entity: any) => {
                const entityFile = this.normalizeFilePath(entity.file);
                return !!entityFile && (entityFile === refFile || refFile.indexOf(entityFile) !== -1);
            });
            if (fileCandidates.length === 1) {
                return fileCandidates[0];
            }
            if (fileCandidates.length > 0) {
                candidates = fileCandidates;
            }
        }

        const originFile = this.normalizeFilePath(originEntity?.file);
        if (originFile) {
            const sameFileCandidates = candidates.filter((entity: any) => {
                const entityFile = this.normalizeFilePath(entity.file);
                return !!entityFile && entityFile === originFile;
            });
            if (sameFileCandidates.length === 1) {
                return sameFileCandidates[0];
            }
        }

        const nonDuplicateCandidates = candidates.filter((entity: any) => !entity.isDuplicate);
        if (nonDuplicateCandidates.length === 1) {
            return nonDuplicateCandidates[0];
        }

        // Ambiguous homonym: avoid linking to the wrong entity.
        return undefined;
    }

    private extractShortDescription(entity: any): string | undefined {
        const raw = entity?.rawdescription || entity?.description || '';
        if (!raw) {
            return undefined;
        }
        const cleaned = String(raw)
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (!cleaned) {
            return undefined;
        }
        return cleaned.length > 140 ? `${cleaned.slice(0, 137).trim()}...` : cleaned;
    }

    private prepareMiscellaneous() {
        this.miscellaneous.variables.sort(getNamesCompareFn());
        this.miscellaneous.functions.sort(getNamesCompareFn());
        this.miscellaneous.enumerations.sort(getNamesCompareFn());
        this.miscellaneous.typealiases.sort(getNamesCompareFn());
        // group each subgoup by file
        this.miscellaneous.groupedVariables = _.groupBy(this.miscellaneous.variables, 'file');
        this.miscellaneous.groupedFunctions = _.groupBy(this.miscellaneous.functions, 'file');
        this.miscellaneous.groupedEnumerations = _.groupBy(this.miscellaneous.enumerations, 'file');
        this.miscellaneous.groupedTypeAliases = _.groupBy(this.miscellaneous.typealiases, 'file');
    }

    public getModule(name: string) {
        return _.find(this.modules, ['name', name]);
    }

    public getRawModule(name: string): any {
        return _.find(this.rawModules, ['name', name]);
    }

    public getModules() {
        return this.modules;
    }

    public getComponents() {
        return this.components;
    }

    public getControllers() {
        return this.controllers;
    }

    public getEntities() {
        return this.entities;
    }

    public getDirectives() {
        return this.directives;
    }

    public getInjectables() {
        return this.injectables;
    }

    public getInterceptors() {
        return this.interceptors;
    }

    public getGuards() {
        return this.guards;
    }

    public getInterfaces() {
        return this.interfaces;
    }

    public getRoutes() {
        return this.routes;
    }

    public getPipes() {
        return this.pipes;
    }

    public getClasses() {
        return this.classes;
    }

    public getMiscellaneous() {
        return this.miscellaneous;
    }
}

export default DependenciesEngine.getInstance();
