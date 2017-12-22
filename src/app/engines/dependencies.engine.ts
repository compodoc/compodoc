import { ParsedData } from '../interfaces/parsed-data.interface';
import { MiscellaneousData } from '../interfaces/miscellaneous-data.interface';

import { getNamesCompareFn } from '../../utils/utils';
import * as _ from 'lodash';
import { IModuleDep } from '../compiler/deps/module-dep.factory';
import { IComponentDep } from '../compiler/deps/component-dep.factory';
import { IDirectiveDep } from '../compiler/deps/directive-dep.factory';
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
    IInterceptorDep
} from '../compiler/dependencies.interfaces';

const traverse = require('traverse');

export class DependenciesEngine {
    public rawData: ParsedData;
    public modules: Object[];
    public rawModules: Object[];
    public rawModulesForOverview: Object[];
    public components: Object[];
    public directives: Object[];
    public injectables: Object[];
    public interceptors: Object[];
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

        let mergeTypes = (entry) => {
            let directive = this.findInCompodocDependencies(entry.name, this.directives);
            if (typeof directive.data !== 'undefined') {
                entry.type = 'directive';
            }
            let component = this.findInCompodocDependencies(entry.name, this.components);
            if (typeof component.data !== 'undefined') {
                entry.type = 'component';
            }
            let pipe = this.findInCompodocDependencies(entry.name, this.pipes);
            if (typeof pipe.data !== 'undefined') {
                entry.type = 'pipe';
            }
        }

        this.modules.forEach((module) => {
            module.declarations.forEach((declaration) => {
                mergeTypes(declaration);
            });
            module.exports.forEach((expt) => {
                mergeTypes(expt);
            });
            module.entryComponents.forEach((ent) => {
                mergeTypes(ent);
            });
        })

    }

    public init(data: ParsedData) {
        traverse(data).forEach(function (node) {
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
        this.directives = _.sortBy(this.rawData.directives, ['name']);
        this.injectables = _.sortBy(this.rawData.injectables, ['name']);
        this.interceptors = _.sortBy(this.rawData.interceptors, ['name']);
        this.interfaces = _.sortBy(this.rawData.interfaces, ['name']);
        this.pipes = _.sortBy(this.rawData.pipes, ['name']);
        this.classes = _.sortBy(this.rawData.classes, ['name']);
        this.miscellaneous = this.rawData.miscellaneous;
        this.prepareMiscellaneous();
        this.updateModulesDeclarationsExportsTypes();
        this.routes = this.rawData.routesTree;
    }

    private findInCompodocDependencies(type, data): IApiSourceResult<any> {
        let _result = {
            source: 'internal',
            data: undefined
        };
        for (let i = 0; i < data.length; i++) {
            if (typeof type !== 'undefined') {
                if (type.indexOf(data[i].name) !== -1) {
                    _result.data = data[i];
                }
            }
        }
        return _result;
    }

    public find(type: string): IApiSourceResult<any> | undefined {
        let searchFunctions: Array<() => IApiSourceResult<any>> = [
            () => this.findInCompodocDependencies(type, this.injectables),
            () => this.findInCompodocDependencies(type, this.interceptors),
            () => this.findInCompodocDependencies(type, this.interfaces),
            () => this.findInCompodocDependencies(type, this.classes),
            () => this.findInCompodocDependencies(type, this.components),
            () => this.findInCompodocDependencies(type, this.miscellaneous.variables),
            () => this.findInCompodocDependencies(type, this.miscellaneous.functions),
            () => this.findInCompodocDependencies(type, this.miscellaneous.typealiases),
            () => this.findInCompodocDependencies(type, this.miscellaneous.enumerations),
            () => this.angularApiUtil.findApi(type)];

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
                let _index = _.findIndex(this.modules, { 'name': module.name });
                this.modules[_index] = module;
            });
        }
        if (updatedData.components.length > 0) {
            _.forEach(updatedData.components, (component: IComponentDep) => {
                let _index = _.findIndex(this.components, { 'name': component.name });
                this.components[_index] = component;
            });
        }
        if (updatedData.directives.length > 0) {
            _.forEach(updatedData.directives, (directive: IDirectiveDep) => {
                let _index = _.findIndex(this.directives, { 'name': directive.name });
                this.directives[_index] = directive;
            });
        }
        if (updatedData.injectables.length > 0) {
            _.forEach(updatedData.injectables, (injectable: IInjectableDep) => {
                let _index = _.findIndex(this.injectables, { 'name': injectable.name });
                this.injectables[_index] = injectable;
            });
        }
        if (updatedData.interceptors.length > 0) {
            _.forEach(updatedData.interceptors, (interceptor: IInterceptorDep) => {
                let _index = _.findIndex(this.interceptors, { 'name': interceptor.name });
                this.interceptors[_index] = interceptor;
            });
        }
        if (updatedData.interfaces.length > 0) {
            _.forEach(updatedData.interfaces, (int: IInterfaceDep) => {
                let _index = _.findIndex(this.interfaces, { 'name': int.name });
                this.interfaces[_index] = int;
            });
        }
        if (updatedData.pipes.length > 0) {
            _.forEach(updatedData.pipes, (pipe: IPipeDep) => {
                let _index = _.findIndex(this.pipes, { 'name': pipe.name });
                this.pipes[_index] = pipe;
            });
        }
        if (updatedData.classes.length > 0) {
            _.forEach(updatedData.classes, (classe: any) => {
                let _index = _.findIndex(this.classes, { 'name': classe.name });
                this.classes[_index] = classe;
            });
        }
        /**
         * Miscellaneous update
         */
        if (updatedData.miscellaneous.variables.length > 0) {
            _.forEach(updatedData.miscellaneous.variables, (variable: any) => {
                let _index = _.findIndex(this.miscellaneous.variables, {
                    'name': variable.name,
                    'file': variable.file
                });
                this.miscellaneous.variables[_index] = variable;
            });
        }
        if (updatedData.miscellaneous.functions.length > 0) {
            _.forEach(updatedData.miscellaneous.functions, (func: IFunctionDecDep) => {
                let _index = _.findIndex(this.miscellaneous.functions, {
                    'name': func.name,
                    'file': func.file
                });
                this.miscellaneous.functions[_index] = func;
            });
        }
        if (updatedData.miscellaneous.typealiases.length > 0) {
            _.forEach(updatedData.miscellaneous.typealiases, (typealias: ITypeAliasDecDep) => {
                let _index = _.findIndex(this.miscellaneous.typealiases, {
                    'name': typealias.name,
                    'file': typealias.file
                });
                this.miscellaneous.typealiases[_index] = typealias;
            });
        }
        if (updatedData.miscellaneous.enumerations.length > 0) {
            _.forEach(updatedData.miscellaneous.enumerations, (enumeration: IEnumDecDep) => {
                let _index = _.findIndex(this.miscellaneous.enumerations, {
                    'name': enumeration.name,
                    'file': enumeration.file
                });
                this.miscellaneous.enumerations[_index] = enumeration;
            });
        }
        this.prepareMiscellaneous();
    }

    public findInCompodoc(name: string) {
        let mergedData = _.concat([], 
            this.modules, 
            this.components, 
            this.directives,
            this.injectables, 
            this.interceptors, 
            this.interfaces, 
            this.pipes, 
            this.classes, 
            this.miscellaneous.enumerations,
            this.miscellaneous.typealiases,
            this.miscellaneous.variables,
            this.miscellaneous.functions
        );
        let result = _.find(mergedData, { 'name': name } as any);
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

    public getDirectives() {
        return this.directives;
    }

    public getInjectables() {
        return this.injectables;
    }

    public getInterceptors() {
        return this.interceptors;
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
