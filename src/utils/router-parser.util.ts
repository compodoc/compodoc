import * as util from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as ts from 'typescript';
import * as Handlebars from 'handlebars';
import * as _ from 'lodash';
import * as JSON5 from 'json5';

import { logger } from '../logger';
import { FileEngine } from '../app/engines/file.engine';
import { RoutingGraphNode } from '../app/nodes/routing-graph-node';
import { ImportsUtil } from './imports.util';

export class RouterParserUtil {
    private routes: any[] = [];
    private incompleteRoutes = [];
    private modules = [];
    private modulesTree;
    private rootModule: string;
    private cleanModulesTree;
    private modulesWithRoutes = [];

    private fileEngine = new FileEngine();
    private importsUtil = new ImportsUtil();

    public addRoute(route): void {
        this.routes.push(route);
        this.routes = _.sortBy(_.uniqWith(this.routes, _.isEqual), ['name']);
    }

    public addIncompleteRoute(route): void {
        this.incompleteRoutes.push(route);
        this.incompleteRoutes = _.sortBy(_.uniqWith(this.incompleteRoutes, _.isEqual), ['name']);
    }

    public addModuleWithRoutes(moduleName, moduleImports, filename): void {
        this.modulesWithRoutes.push({
            name: moduleName,
            importsNode: moduleImports,
            filename: filename
        });
        this.modulesWithRoutes = _.sortBy(_.uniqWith(this.modulesWithRoutes, _.isEqual), ['name']);
    }

    public addModule(moduleName: string, moduleImports): void {
        this.modules.push({
            name: moduleName,
            importsNode: moduleImports
        });
        this.modules = _.sortBy(_.uniqWith(this.modules, _.isEqual), ['name']);
    }

    public cleanRawRouteParsed(route: string): object {
        let routesWithoutSpaces = route.replace(/ /gm, '');
        let testTrailingComma = routesWithoutSpaces.indexOf('},]');
        if (testTrailingComma !== -1) {
            routesWithoutSpaces = routesWithoutSpaces.replace('},]', '}]');
        }
        return JSON5.parse(routesWithoutSpaces);
    }

    public cleanRawRoute(route: string): string {
        let routesWithoutSpaces = route.replace(/ /gm, '');
        let testTrailingComma = routesWithoutSpaces.indexOf('},]');
        if (testTrailingComma !== -1) {
            routesWithoutSpaces = routesWithoutSpaces.replace('},]', '}]');
        }
        return routesWithoutSpaces;
    }

    public setRootModule(module: string): void {
        this.rootModule = module;
    }

    public hasRouterModuleInImports(imports: Array<any>): boolean {
        for (let i = 0; i < imports.length; i++) {
            if (imports[i].name.indexOf('RouterModule.forChild') !== -1 ||
                imports[i].name.indexOf('RouterModule.forRoot') !== -1) {
                return true;
            }
        }

        return false;
    }

    public fixIncompleteRoutes(miscellaneousVariables: Array<any>): void {
        let matchingVariables = [];
        // For each incompleteRoute, scan if one misc variable is in code
        // if ok, try recreating complete route
        for (let i = 0; i < this.incompleteRoutes.length; i++) {
            for (let j = 0; j < miscellaneousVariables.length; j++) {
                if (this.incompleteRoutes[i].data.indexOf(miscellaneousVariables[j].name) !== -1) {
                    console.log('found one misc var inside incompleteRoute');
                    console.log(miscellaneousVariables[j].name);
                    matchingVariables.push(miscellaneousVariables[j]);
                }
            }
            // Clean incompleteRoute
            this.incompleteRoutes[i].data = this.incompleteRoutes[i].data.replace('[', '');
            this.incompleteRoutes[i].data = this.incompleteRoutes[i].data.replace(']', '');
        }
    }

    public linkModulesAndRoutes(): void {
        let i = 0;
        let len = this.modulesWithRoutes.length;
        for (i; i < len; i++) {
            _.forEach(this.modulesWithRoutes[i].importsNode, (node: ts.PropertyDeclaration) => {
                let initializer = node.initializer as ts.ArrayLiteralExpression;
                if (initializer) {
                    if (initializer.elements) {
                        _.forEach(initializer.elements, (element: ts.CallExpression) => {
                            // find element with arguments
                            if (element.arguments) {
                                _.forEach(element.arguments, (argument: ts.Identifier) => {
                                    _.forEach(this.routes, (route) => {
                                        if (argument.text && route.name === argument.text &&
                                            route.filename === this.modulesWithRoutes[i].filename) {
                                            route.module = this.modulesWithRoutes[i].name;
                                        }
                                    });
                                });
                            }
                        });
                    }
                }
            });
        }
    }

    public foundRouteWithModuleName(moduleName: string): any {
        return _.find(this.routes, { 'module': moduleName });
    }

    public foundLazyModuleWithPath(modulePath: string): string {
        // path is like app/customers/customers.module#CustomersModule
        let split = modulePath.split('#');
        let lazyModulePath = split[0];
        let lazyModuleName = split[1];
        return lazyModuleName;
    }

    public constructRoutesTree() {
        // routes[] contains routes with module link
        // modulesTree contains modules tree
        // make a final routes tree with that
        this.cleanModulesTree = _.cloneDeep(this.modulesTree);

        let modulesCleaner = (arr) => {
            for (let i in arr) {
                if (arr[i].importsNode) {
                    delete arr[i].importsNode;
                }
                if (arr[i].parent) {
                    delete arr[i].parent;
                }
                if (arr[i].children) {
                    modulesCleaner(arr[i].children);
                }
            }
        };

        modulesCleaner(this.cleanModulesTree);

        let routesTree = {
            name: '<root>',
            kind: 'module',
            className: this.rootModule,
            children: []
        };

        let loopModulesParser = (node) => {
            if (node.children && node.children.length > 0) {
                // If module has child modules
                for (let i in node.children) {
                    let route = this.foundRouteWithModuleName(node.children[i].name);
                    if (route && route.data) {
                        route.children = JSON5.parse(route.data);
                        delete route.data;
                        route.kind = 'module';
                        routesTree.children.push(route);
                    }
                    if (node.children[i].children) {
                        loopModulesParser(node.children[i]);
                    }
                }
            } else {
                // else routes are directly inside the module
                let rawRoutes = this.foundRouteWithModuleName(node.name);
                if (rawRoutes) {
                    let routes = JSON5.parse(rawRoutes.data);
                    if (routes) {
                        let i = 0;
                        let len = routes.length;
                        for (i; i < len; i++) {
                            let route = routes[i];
                            if (routes[i].component) {
                                routesTree.children.push({
                                    kind: 'component',
                                    component: routes[i].component,
                                    path: routes[i].path
                                });
                            }
                        }
                    }
                }
            }
        };

        let startModule = _.find(this.cleanModulesTree, { 'name': this.rootModule });

        if (startModule) {
            loopModulesParser(startModule);
            // Loop twice for routes with lazy loading
            // loopModulesParser(routesTree);
        }

        let cleanedRoutesTree = undefined;

        let cleanRoutesTree = (route)  => {
            for (let i in route.children) {
                let routes = route.children[i].routes;
            }
            return route;
        };

        cleanedRoutesTree = cleanRoutesTree(routesTree);

        // Try updating routes with lazy loading

        let loopInside = (mod, _rawModule) => {
            if (mod.children) {
                for (let z in mod.children) {
                    let route = this.foundRouteWithModuleName(mod.children[z].name);
                    if (typeof route !== 'undefined') {
                        if (route.data) {
                            route.children = JSON5.parse(route.data);
                            delete route.data;
                            route.kind = 'module';
                            _rawModule.children.push(route);
                        }
                    }
                }
            }
        };

        let loopRoutesParser = (route) => {
            if (route.children) {
                for (let i in route.children) {
                    if (route.children[i].loadChildren) {
                        let child = this.foundLazyModuleWithPath(route.children[i].loadChildren);
                        let module: RoutingGraphNode = _.find(this.cleanModulesTree, { 'name': child });
                        if (module) {
                            let _rawModule: RoutingGraphNode = {};
                            _rawModule.kind = 'module';
                            _rawModule.children = [];
                            _rawModule.module = module.name;
                            loopInside(module, _rawModule);

                            route.children[i].children = [];
                            route.children[i].children.push(_rawModule);
                        }
                    }
                    loopRoutesParser(route.children[i]);
                }
            }
        };
        loopRoutesParser(cleanedRoutesTree);

        return cleanedRoutesTree;
    }

    public constructModulesTree(): void {
        let getNestedChildren = (arr, parent?) => {
            let out = [];
            for (let i in arr) {
                if (arr[i].parent === parent) {
                    let children = getNestedChildren(arr, arr[i].name);
                    if (children.length) {
                        arr[i].children = children;
                    }
                    out.push(arr[i]);
                }
            }
            return out;
        };

        // Scan each module and add parent property
        _.forEach(this.modules, (firstLoopModule) => {
            _.forEach(firstLoopModule.importsNode, (importNode) => {
                _.forEach(this.modules, (module) => {
                    if (module.name === importNode.name) {
                        module.parent = firstLoopModule.name;
                    }
                });
            });
        });
        this.modulesTree = getNestedChildren(this.modules);
    }

    public generateRoutesIndex(outputFolder: string, routes: Array<any>): Promise<void> {
        return this.fileEngine.get(__dirname + '/../src/templates/partials/routes-index.hbs').then(data => {
            let template: any = Handlebars.compile(data);
            let result = template({
                routes: JSON.stringify(routes)
            });
            let testOutputDir = outputFolder.match(process.cwd());

            if (!testOutputDir) {
                outputFolder = outputFolder.replace(process.cwd(), '');
            }

            return this.fileEngine.write(outputFolder + path.sep + '/js/routes/routes_index.js', result);
        }, err => Promise.reject('Error during routes index generation'));
    }

    public routesLength(): number {
        let _n = 0;
        let routesParser = (route) => {
            if (typeof route.path !== 'undefined') {
                _n += 1;
            }
            if (route.children) {
                for (let j in route.children) {
                    routesParser(route.children[j]);
                }
            }
        };

        for (let i in this.routes) {
            routesParser(this.routes[i]);
        }

        return _n;
    }

    public printRoutes(): void {
        console.log('');
        console.log('printRoutes: ');
        console.log(this.routes);
    }

    public printModulesRoutes(): void {
        console.log('');
        console.log('printModulesRoutes: ');
        console.log(this.modulesWithRoutes);
    }

    /**
     * Clean routes definition with imported data, for example path, children, or dynamic stuff inside data
     *
     * const MY_ROUTES: Routes = [
     *     {
     *         path: 'home',
     *         component: HomeComponent
     *     },
     *     {
     *         path: PATHS.home,
     *         component: HomeComponent
     *     }
     * ];
     *
     * The initializer is an array (ArrayLiteralExpression - 177 ), it has elements, objects (ObjectLiteralExpression - 178)
     * with properties (PropertyAssignment - 261)
     *
     * For each know property (https://angular.io/api/router/Routes#description), we try to see if we have what we want
     *
     * Ex: path and pathMatch want a string, component a component reference.
     *
     * It is an imperative approach, not a generic way, parsing all the tree
     * and find something like this which willl break JSON.stringify : MYIMPORT.path
     *
     * @param  {ts.Node} initializer The node of routes definition
     * @return {ts.Node}             The edited node
     */
    public cleanRoutesDefinitionWithImport(initializer: ts.ArrayLiteralExpression, node: ts.Node, sourceFile: ts.SourceFile): ts.Node {
        initializer.elements.forEach((element: ts.ObjectLiteralExpression) => {
            element.properties.forEach((property: ts.PropertyAssignment) => {
                let propertyName = property.name.getText(),
                    propertyInitializer = property.initializer;
                switch (propertyName) {
                    case 'path':
                    case 'redirectTo':
                    case 'outlet':
                    case 'pathMatch':
                      if (propertyInitializer) {
                          if (propertyInitializer.kind !== ts.SyntaxKind.StringLiteral) {
                              // Identifier(71) won't break parsing, but it will be better to retrive them
                              // PropertyAccessExpression(179) ex: MYIMPORT.path will break it, find it in import
                              if (propertyInitializer.kind === ts.SyntaxKind.PropertyAccessExpression) {
                                  let lastObjectLiteralAttributeName = propertyInitializer.name.getText(),
                                      firstObjectLiteralAttributeName;
                                  if (propertyInitializer.expression) {
                                      firstObjectLiteralAttributeName = propertyInitializer.expression.getText();
                                      let result = this.importsUtil.findPropertyValueInImport(firstObjectLiteralAttributeName + '.' + lastObjectLiteralAttributeName, sourceFile)
                                      if (result !== '') {
                                          propertyInitializer.kind = 9;
                                          propertyInitializer.text = result;
                                      }
                                  }
                              }
                          }
                      }
                      break;
                }
            });
        });
        return initializer;
    }
}
