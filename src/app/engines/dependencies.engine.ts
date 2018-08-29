import * as _ from 'lodash';

import { ParsedData } from '../interfaces/parsed-data.interface';
import { MiscellaneousData } from '../interfaces/miscellaneous-data.interface';

import { getNamesCompareFn } from '../../utils/utils';
import { IModuleDep } from '../compiler/angular/deps/module-dep.factory';
import { IComponentDep } from '../compiler/angular/deps/component-dep.factory';
import { IDirectiveDep } from '../compiler/angular/deps/directive-dep.factory';
import { IApiSourceResult } from '../../utils/api-source-result.interface';
import { RouteInterface } from '../interfaces/routes.interface';
import { AngularApiUtil } from '../../utils/angular-api.util';
import {
    IInjectableDep,
    IInterfaceDep,
    IPipeDep,
    ITypeAliasDecDep,
    IFunctionDecDep,
    IEnumDecDep,
    IInterceptorDep,
    IGuardDep
} from '../compiler/angular/dependencies.interfaces';
import { IControllerDep } from '../compiler/angular/deps/controller-dep.factory';

const traverse = require('traverse');

export class DependenciesEngine {
    public rawData: ParsedData;
    public modules: Object[];
    public rawModules: Object[];
    public rawModulesForOverview: Object[];
    public components: Object[];
    public controllers: Object[];
    public directives: Object[];
    public injectables: Object[];
    public interceptors: Object[];
    public guards: Object[];
    public interfaces: Object[];
    public routes: RouteInterface;
    public pipes: Object[];
    public classes: Object[];
    public miscellaneous: MiscellaneousData;

    private angularApiUtil: AngularApiUtil = new AngularApiUtil();

    private cleanModules(modules) {
        let _m = modules;
        let i = 0;
        let len = modules.length;

        for (i; i < len; i++) {
            let j = 0;
            let leng = _m[i].declarations.length;
            for (j; j < leng; j++) {
                let k = 0;
                let lengt;
                if (_m[i].declarations[j].jsdoctags) {
                    lengt = _m[i].declarations[j].jsdoctags.length;
                    for (k; k < lengt; k++) {
                        delete _m[i].declarations[j].jsdoctags[k].parent;
                    }
                }
                if (_m[i].declarations[j].constructorObj) {
                    if (_m[i].declarations[j].constructorObj.jsdoctags) {
                        lengt = _m[i].declarations[j].constructorObj.jsdoctags.length;
                        for (k; k < lengt; k++) {
                            delete _m[i].declarations[j].constructorObj.jsdoctags[k].parent;
                        }
                    }
                }
            }
        }
        return _m;
    }

    private updateModulesDeclarationsExportsTypes() {
        let _m = this.modules,
            i = 0,
            len = this.modules.length;

        let mergeTypes = entry => {
            let directive = this.findInCompodocDependencies(entry.name, this.directives, entry.file);
            if (typeof directive.data !== 'undefined') {
                entry.type = 'directive';
                entry.id = directive.data.id;
            }
            let component = this.findInCompodocDependencies(entry.name, this.components, entry.file);
            if (typeof component.data !== 'undefined') {
                entry.type = 'component';
                entry.id = component.data.id;
            }
            let pipe = this.findInCompodocDependencies(entry.name, this.pipes, entry.file);
            if (typeof pipe.data !== 'undefined') {
                entry.type = 'pipe';
                entry.id = pipe.data.id;
            }
        };

        this.modules.forEach(module => {
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
        traverse(data).forEach(function(node) {
            if (node) {
                if (node.parent) delete node.parent;
                if (node.initializer) delete node.initializer;
            }
        });
        this.rawData = data;
        this.modules = _.sortBy(this.rawData.modules, ['name']);
        this.rawModulesForOverview = _.sortBy(data.modulesForGraph, ['name']);
        this.rawModules = _.sortBy(data.modulesForGraph, ['name']);
        this.components = _.sortBy(this.rawData.components, ['name']);
        this.controllers = _.sortBy(this.rawData.controllers, ['name']);
        this.directives = _.sortBy(this.rawData.directives, ['name']);
        this.injectables = _.sortBy(this.rawData.injectables, ['name']);
        this.interceptors = _.sortBy(this.rawData.interceptors, ['name']);
        this.guards = _.sortBy(this.rawData.guards, ['name']);
        this.interfaces = _.sortBy(this.rawData.interfaces, ['name']);
        this.pipes = _.sortBy(this.rawData.pipes, ['name']);
        this.classes = _.sortBy(this.rawData.classes, ['name']);
        this.miscellaneous = this.rawData.miscellaneous;
        this.prepareMiscellaneous();
        this.updateModulesDeclarationsExportsTypes();
        this.routes = this.rawData.routesTree;
        this.manageDuplicatesName();
        this.cleanRawModulesNames();
    }

    private cleanRawModulesNames() {
        this.rawModulesForOverview = this.rawModulesForOverview.map(module => {
            module.name = module.name.replace('$', '');
            return module;
        });
    }

    private findInCompodocDependencies(name, data, file?): IApiSourceResult<any> {
        let _result = {
            source: 'internal',
            data: undefined
        };
        for (let i = 0; i < data.length; i++) {
            if (typeof name !== 'undefined') {
                if (typeof file !== 'undefined') {
                    if (name.indexOf(data[i].name) !== -1 && file.replace(/\\/g, '/').indexOf(data[i].file) !== -1) {
                        _result.data = data[i];
                    }
                } else {
                    if (name.indexOf(data[i].name) !== -1) {
                        _result.data = data[i];
                    }
                }
            }
        }
        return _result;
    }

    private manageDuplicatesName() {
        let processDuplicates = (element, index, array) => {
            let elementsWithSameName = _.filter(array, {name: element.name});
            if (elementsWithSameName.length > 1) {
                // First element is the reference for duplicates
                for (let i = 1; i < elementsWithSameName.length; i++) {
                    let elementToEdit = elementsWithSameName[i];
                    if (
                        typeof elementToEdit.isDuplicate === 'undefined'
                    ) {
                        elementToEdit.isDuplicate = true;
                        elementToEdit.duplicateId = i;
                        elementToEdit.duplicateName = elementToEdit.name + '-' + elementToEdit.duplicateId;
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
        this.directives = this.directives.map(processDuplicates);
    }

    public find(name: string): IApiSourceResult<any> | undefined {
        let searchFunctions: Array<() => IApiSourceResult<any>> = [
            () => this.findInCompodocDependencies(name, this.injectables),
            () => this.findInCompodocDependencies(name, this.interceptors),
            () => this.findInCompodocDependencies(name, this.guards),
            () => this.findInCompodocDependencies(name, this.interfaces),
            () => this.findInCompodocDependencies(name, this.classes),
            () => this.findInCompodocDependencies(name, this.components),
            () => this.findInCompodocDependencies(name, this.controllers),
            () => this.findInCompodocDependencies(name, this.miscellaneous.variables),
            () => this.findInCompodocDependencies(name, this.miscellaneous.functions),
            () => this.findInCompodocDependencies(name, this.miscellaneous.typealiases),
            () => this.findInCompodocDependencies(name, this.miscellaneous.enumerations),
            () => this.angularApiUtil.findApi(name)
        ];

        for (let searchFunction of searchFunctions) {
            let result = searchFunction();

            if (result.data) {
                return result;
            }
        }

        return undefined;
    }

    public update(updatedData): void {
        if (updatedData.modules.length > 0) {
            _.forEach(updatedData.modules, (module: IModuleDep) => {
                let _index = _.findIndex(this.modules, { name: module.name });
                this.modules[_index] = module;
            });
        }
        if (updatedData.components.length > 0) {
            _.forEach(updatedData.components, (component: IComponentDep) => {
                let _index = _.findIndex(this.components, { name: component.name });
                this.components[_index] = component;
            });
        }
        if (updatedData.controllers.length > 0) {
            _.forEach(updatedData.controllers, (controller: IControllerDep) => {
                let _index = _.findIndex(this.controllers, { name: controller.name });
                this.controllers[_index] = controller;
            });
        }
        if (updatedData.directives.length > 0) {
            _.forEach(updatedData.directives, (directive: IDirectiveDep) => {
                let _index = _.findIndex(this.directives, { name: directive.name });
                this.directives[_index] = directive;
            });
        }
        if (updatedData.injectables.length > 0) {
            _.forEach(updatedData.injectables, (injectable: IInjectableDep) => {
                let _index = _.findIndex(this.injectables, { name: injectable.name });
                this.injectables[_index] = injectable;
            });
        }
        if (updatedData.interceptors.length > 0) {
            _.forEach(updatedData.interceptors, (interceptor: IInterceptorDep) => {
                let _index = _.findIndex(this.interceptors, { name: interceptor.name });
                this.interceptors[_index] = interceptor;
            });
        }
        if (updatedData.guards.length > 0) {
            _.forEach(updatedData.guards, (guard: IGuardDep) => {
                let _index = _.findIndex(this.guards, { name: guard.name });
                this.guards[_index] = guard;
            });
        }
        if (updatedData.interfaces.length > 0) {
            _.forEach(updatedData.interfaces, (int: IInterfaceDep) => {
                let _index = _.findIndex(this.interfaces, { name: int.name });
                this.interfaces[_index] = int;
            });
        }
        if (updatedData.pipes.length > 0) {
            _.forEach(updatedData.pipes, (pipe: IPipeDep) => {
                let _index = _.findIndex(this.pipes, { name: pipe.name });
                this.pipes[_index] = pipe;
            });
        }
        if (updatedData.classes.length > 0) {
            _.forEach(updatedData.classes, (classe: any) => {
                let _index = _.findIndex(this.classes, { name: classe.name });
                this.classes[_index] = classe;
            });
        }
        /**
         * Miscellaneous update
         */
        if (updatedData.miscellaneous.variables.length > 0) {
            _.forEach(updatedData.miscellaneous.variables, (variable: any) => {
                let _index = _.findIndex(this.miscellaneous.variables, {
                    name: variable.name,
                    file: variable.file
                });
                this.miscellaneous.variables[_index] = variable;
            });
        }
        if (updatedData.miscellaneous.functions.length > 0) {
            _.forEach(updatedData.miscellaneous.functions, (func: IFunctionDecDep) => {
                let _index = _.findIndex(this.miscellaneous.functions, {
                    name: func.name,
                    file: func.file
                });
                this.miscellaneous.functions[_index] = func;
            });
        }
        if (updatedData.miscellaneous.typealiases.length > 0) {
            _.forEach(updatedData.miscellaneous.typealiases, (typealias: ITypeAliasDecDep) => {
                let _index = _.findIndex(this.miscellaneous.typealiases, {
                    name: typealias.name,
                    file: typealias.file
                });
                this.miscellaneous.typealiases[_index] = typealias;
            });
        }
        if (updatedData.miscellaneous.enumerations.length > 0) {
            _.forEach(updatedData.miscellaneous.enumerations, (enumeration: IEnumDecDep) => {
                let _index = _.findIndex(this.miscellaneous.enumerations, {
                    name: enumeration.name,
                    file: enumeration.file
                });
                this.miscellaneous.enumerations[_index] = enumeration;
            });
        }
        this.prepareMiscellaneous();
    }

    public findInCompodoc(name: string) {
        let mergedData = _.concat(
            [],
            this.modules,
            this.components,
            this.controllers,
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
        let result = _.find(mergedData, { name: name } as any);
        return result || false;
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
