import * as util from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as _ from 'lodash';
import { logger } from '../logger';
import { FileEngine } from '../app/engines/file.engine';

const JSON5 = require('json5');

export let RouterParser = (function () {

    let routes: any[] = [];
    let incompleteRoutes = [];
    let modules = [];
    let modulesTree;
    let rootModule;
    let cleanModulesTree;
    let modulesWithRoutes = [];

    const fileEngine = new FileEngine();

    let _addRoute = function (route) {
        routes.push(route);
        routes = _.sortBy(_.uniqWith(routes, _.isEqual), ['name']);
    };

    let _addIncompleteRoute = function (route) {
        incompleteRoutes.push(route);
        incompleteRoutes = _.sortBy(_.uniqWith(incompleteRoutes, _.isEqual), ['name']);
    };

    let _addModuleWithRoutes = function (moduleName, moduleImports, filename) {
        modulesWithRoutes.push({
            name: moduleName,
            importsNode: moduleImports,
            filename: filename
        });
        modulesWithRoutes = _.sortBy(_.uniqWith(modulesWithRoutes, _.isEqual), ['name']);
    };

    let _addModule = function (moduleName: string, moduleImports) {
        modules.push({
            name: moduleName,
            importsNode: moduleImports
        });
        modules = _.sortBy(_.uniqWith(modules, _.isEqual), ['name']);
    };

    let _cleanRawRouteParsed = function (route: string) {
        let routesWithoutSpaces = route.replace(/ /gm, '');
        let testTrailingComma = routesWithoutSpaces.indexOf('},]');
        if (testTrailingComma !== -1) {
            routesWithoutSpaces = routesWithoutSpaces.replace('},]', '}]');
        }
        return JSON5.parse(routesWithoutSpaces);
    };

    let _cleanRawRoute = function (route: string) {
        let routesWithoutSpaces = route.replace(/ /gm, '');
        let testTrailingComma = routesWithoutSpaces.indexOf('},]');
        if (testTrailingComma !== -1) {
            routesWithoutSpaces = routesWithoutSpaces.replace('},]', '}]');
        }
        return routesWithoutSpaces;
    };

    let _setRootModule = function (module: string) {
        rootModule = module;
    };

    let _hasRouterModuleInImports = function (imports) {
        let result = false;
        let len = imports.length;
        for (let i = 0; i < len; i++) {
            if (imports[i].name.indexOf('RouterModule.forChild') !== -1 ||
                imports[i].name.indexOf('RouterModule.forRoot') !== -1) {
                result = true;
            }
        }
        return result;
    };

    let _fixIncompleteRoutes = function (miscellaneousVariables) {
        /*console.log('fixIncompleteRoutes');
        console.log('');
        console.log(routes);
        console.log('');*/
        // console.log(miscellaneousVariables);
        // console.log('');
        let i = 0;
        let len = incompleteRoutes.length;
        let matchingVariables = [];
        // For each incompleteRoute, scan if one misc variable is in code
        // if ok, try recreating complete route
        for (i; i < len; i++) {
            let j = 0;
            let leng = miscellaneousVariables.length;
            for (j; j < leng; j++) {
                if (incompleteRoutes[i].data.indexOf(miscellaneousVariables[j].name) !== -1) {
                    console.log('found one misc var inside incompleteRoute');
                    console.log(miscellaneousVariables[j].name);
                    matchingVariables.push(miscellaneousVariables[j]);
                }
            }
            // Clean incompleteRoute
            incompleteRoutes[i].data = incompleteRoutes[i].data.replace('[', '');
            incompleteRoutes[i].data = incompleteRoutes[i].data.replace(']', '');
        }
        /*console.log(incompleteRoutes);
        console.log('');
        console.log(matchingVariables);
        console.log('');*/

    };

    let _linkModulesAndRoutes = function () {
        /*console.log('');
        console.log('linkModulesAndRoutes: ');
        //scan each module imports AST for each routes, and link routes with module
        console.log('linkModulesAndRoutes routes: ', routes);
        console.log('');*/
        let i = 0;
        let len = modulesWithRoutes.length;
        for (i; i < len; i++) {
            _.forEach(modulesWithRoutes[i].importsNode, function (node) {
                if (node.initializer) {
                    if (node.initializer.elements) {
                        _.forEach(node.initializer.elements, function (element) {
                            // find element with arguments
                            if (element.arguments) {
                                _.forEach(element.arguments, function (argument) {
                                    _.forEach(routes, function (route) {
                                        if (argument.text && route.name === argument.text && route.filename === modulesWithRoutes[i].filename) {
                                            route.module = modulesWithRoutes[i].name;
                                        }
                                    });
                                });
                            }
                        });
                    }
                }
            });
        }
    };

    let foundRouteWithModuleName = function (moduleName) {
        return _.find(routes, { 'module': moduleName });
    };

    let foundLazyModuleWithPath = function (path) {
        // path is like app/customers/customers.module#CustomersModule
        let split = path.split('#');
        let lazyModulePath = split[0];
        let lazyModuleName = split[1];
        return lazyModuleName;
    };

    let _constructRoutesTree = function () {
        // console.log('');
        /*console.log('constructRoutesTree modules: ', modules);
        console.log('');
        console.log('constructRoutesTree modulesWithRoutes: ', modulesWithRoutes);
        console.log('');
        console.log('constructRoutesTree modulesTree: ', util.inspect(modulesTree, { depth: 10 }));
        console.log('');*/

        // routes[] contains routes with module link
        // modulesTree contains modules tree
        // make a final routes tree with that
        cleanModulesTree = _.cloneDeep(modulesTree);

        let modulesCleaner = function (arr) {
            for (let i in arr) {
                if (arr[i].importsNode) {
                    delete arr[i].importsNode;
                }
                if (arr[i].parent) {
                    delete arr[i].parent;
                }
                if (arr[i].children) {
                    modulesCleaner(arr[i].children)
                }
            }
        };

        modulesCleaner(cleanModulesTree);
        // console.log('');
        // console.log('  cleanModulesTree light: ', util.inspect(cleanModulesTree, { depth: 10 }));
        // console.log('');

        // console.log(routes);
        // console.log('');

        let routesTree = {
            name: '<root>',
            kind: 'module',
            className: rootModule,
            children: []
        };

        let loopModulesParser = function (node) {
            if (node.children && node.children.length > 0) {
                // If module has child modules
                // console.log('   If module has child modules');
                for (let i in node.children) {
                    let route = foundRouteWithModuleName(node.children[i].name);
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
                // console.log('   else routes are directly inside the root module');
                let rawRoutes = foundRouteWithModuleName(node.name);
                if (rawRoutes) {
                    let routes = JSON5.parse(rawRoutes.data);
                    if (routes) {
                        let i = 0,
                            len = routes.length;
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
        }
        // console.log('');
        // console.log('  rootModule: ', rootModule);
        // console.log('');

        let startModule = _.find(cleanModulesTree, { 'name': rootModule });

        if (startModule) {
            loopModulesParser(startModule);
            // Loop twice for routes with lazy loading
            // loopModulesParser(routesTree);
        }

        /*console.log('');
        console.log('  routesTree: ', routesTree);
        console.log('');*/

        let cleanedRoutesTree = undefined;

        let cleanRoutesTree = function (route) {
            for (let i in route.children) {
                let routes = route.children[i].routes;
            }
            return route;
        };

        cleanedRoutesTree = cleanRoutesTree(routesTree);

        // Try updating routes with lazy loading
        // console.log('');
        // console.log('Try updating routes with lazy loading');

        let loopRoutesParser = function (route) {
            if (route.children) {
                for (let i in route.children) {
                    if (route.children[i].loadChildren) {
                        let child = foundLazyModuleWithPath(route.children[i].loadChildren),
                            module = _.find(cleanModulesTree, { 'name': child });
                        if (module) {
                            let _rawModule: any = {};
                            _rawModule.kind = 'module';
                            _rawModule.children = [];
                            _rawModule.module = module.name;
                            let loopInside = function (mod) {
                                if (mod.children) {
                                    for (let i in mod.children) {
                                        let route = foundRouteWithModuleName(mod.children[i].name);
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
                            loopInside(module);

                            route.children[i].children = [];
                            route.children[i].children.push(_rawModule);
                        }
                    }
                    loopRoutesParser(route.children[i]);
                }
            }
        };
        loopRoutesParser(cleanedRoutesTree);

        // console.log('');
        // console.log('  cleanedRoutesTree: ', util.inspect(cleanedRoutesTree, { depth: 10 }));

        return cleanedRoutesTree;
    };

    let _constructModulesTree = function () {
        // console.log('');
        // console.log('constructModulesTree');
        let getNestedChildren = function (arr, parent?) {
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
        _.forEach(modules, function (firstLoopModule) {
            _.forEach(firstLoopModule.importsNode, function (importNode) {
                _.forEach(modules, function (module) {
                    if (module.name === importNode.name) {
                        module.parent = firstLoopModule.name;
                    }
                });
            });
        });
        modulesTree = getNestedChildren(modules);
        /*console.log('');
        console.log('end constructModulesTree');
        console.log(modulesTree);*/
    };

    let _generateRoutesIndex = (outputFolder, routes) => {
        return fileEngine.get(__dirname + '/../src/templates/partials/routes-index.hbs').then(data => {
            let template: any = Handlebars.compile(data);
            let result = template({
                    routes: JSON.stringify(routes)
                });
            let testOutputDir = outputFolder.match(process.cwd());

            if (!testOutputDir) {
                outputFolder = outputFolder.replace(process.cwd(), '');
            }

            return fileEngine.write(outputFolder + path.sep + '/js/routes/routes_index.js', result);
        }, err => Promise.reject('Error during routes index generation'));
    };

    let _routesLength = function (): number {
        let _n = 0;

        let routesParser = function (route) {
            if (typeof route.path !== 'undefined') {
                _n += 1;
            }
            if (route.children) {
                for (let j in route.children) {
                    routesParser(route.children[j]);
                }
            }
        };

        for (let i in routes) {
            routesParser(routes[i]);
        }

        return _n;
    };

    return {
        incompleteRoutes: incompleteRoutes,
        addRoute: _addRoute,
        addIncompleteRoute: _addIncompleteRoute,
        addModuleWithRoutes: _addModuleWithRoutes,
        addModule: _addModule,
        cleanRawRouteParsed: _cleanRawRouteParsed,
        cleanRawRoute: _cleanRawRoute,
        setRootModule: _setRootModule,
        printRoutes: function () {
            console.log('');
            console.log('printRoutes: ');
            console.log(routes);
        },
        printModulesRoutes: function () {
            console.log('');
            console.log('printModulesRoutes: ');
            console.log(modulesWithRoutes);
        },
        routesLength: _routesLength,
        hasRouterModuleInImports: _hasRouterModuleInImports,
        fixIncompleteRoutes: _fixIncompleteRoutes,
        linkModulesAndRoutes: _linkModulesAndRoutes,
        constructRoutesTree: _constructRoutesTree,
        constructModulesTree: _constructModulesTree,
        generateRoutesIndex: _generateRoutesIndex
    };
})();
