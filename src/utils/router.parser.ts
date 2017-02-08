import * as _ from 'lodash';
import * as util from 'util';
import * as fs from 'fs-extra';

export let RouterParser = (function() {

    var routes = [],
        modules = [],
        modulesTree,
        rootModule,
        modulesWithRoutes = [];

    return {
        addRoute: function(route) {
            routes.push(route);
            routes = _.sortBy(_.uniqWith(routes, _.isEqual), ['name']);
        },
        addModuleWithRoutes: function(moduleName, moduleImports) {
            modulesWithRoutes.push({
                name: moduleName,
                importsNode: moduleImports
            });
            modulesWithRoutes = _.sortBy(_.uniqWith(modulesWithRoutes, _.isEqual), ['name']);
        },
        addModule: function(moduleName: string, moduleImports) {
            modules.push({
                name: moduleName,
                importsNode: moduleImports
            });
            modules = _.sortBy(_.uniqWith(modules, _.isEqual), ['name']);
        },
        setRootModule: function(module: string) {
            rootModule = module;
        },
        printRoutes: function() {
            console.log('');
            console.log('printRoutes: ');
            console.log(routes);
        },
        printModulesRoutes: function() {
            console.log('');
            console.log('modulesWithRoutes: ');
            console.log(modulesWithRoutes);
        },
        hasRouterModuleInImports: function(imports) {
            let result = false,
                i = 0,
                len = imports.length;
            for(i; i<len; i++) {
                if (imports[i].name.indexOf('RouterModule.forChild') !== -1 ||
                    imports[i].name.indexOf('RouterModule.forRoot') !== -1) {
                    result = true;
                }
            }
            return result;
        },
        linkModulesAndRoutes: function() {
            //scan each module imports AST for each routes, and link routes with module
            let i = 0,
                len = modulesWithRoutes.length;
            for(i; i<len; i++) {
                _.forEach(modulesWithRoutes[i].importsNode, function(node) {
                    if (node.initializer) {
                        if (node.initializer.elements) {
                            _.forEach(node.initializer.elements, function(element) {
                                //find element with arguments
                                if (element.arguments) {
                                    _.forEach(element.arguments, function(argument) {
                                        _.forEach(routes, function(route) {
                                            if(argument.text && route.name === argument.text) {
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
            console.log('');
            console.log('end linkModulesAndRoutes: ');
            console.log(routes);
        },
        constructRoutesTree: function() {
            console.log('');
            console.log('constructRoutesTree');
            // routes[] contains routes with module link
            // modulesTree contains modules tree
            // make a final routes tree with that
            let cleanModulesTree = _.cloneDeep(modulesTree),
                modulesCleaner = function(arr) {
                    for(var i in arr) {
                        if (arr[i].importsNode) {
                            delete arr[i].importsNode;
                        }
                        if (arr[i].parent) {
                            delete arr[i].parent;
                        }
                        if(arr[i].children) {
                            modulesCleaner(arr[i].children)
                        }
                    }
                };

            modulesCleaner(cleanModulesTree);
            //fs.outputJson('./modules.json', cleanModulesTree);
            console.log('');
            console.log('  cleanModulesTree light: ', util.inspect(cleanModulesTree, { depth: 10 }));
            console.log('');
            var routesTree = {
                tag: '<root>',
                kind: 'ngModule',
                name: rootModule,
                children: []
            };

            let foundRouteWithModuleName = function(moduleName) {
                return _.find(routes, {'module': moduleName});
            }

            let loopModulesParser = function(node) {
                if (node.children && node.children.length > 0) {
                    //If module has child modules
                    console.log('   If module has child modules');
                    for(var i in node.children) {
                        let route = foundRouteWithModuleName(node.children[i].name);
                        if (route) {
                            route.routes = JSON.parse(route.data);
                            delete route.data;
                            route.kind = 'ngModule';
                            routesTree.children.push(route);
                        }
                        if (node.children[i].children) {
                            loopModulesParser(node.children[i]);
                        }
                    }
                } else {
                    //else routes are directly inside the module
                    console.log('   else routes are directly inside the module');
                }
            }
            console.log('');
            console.log('  rootModule: ', rootModule);
            console.log('');
            loopModulesParser(_.find(cleanModulesTree, {'name': rootModule}));

            console.log('');
            console.log('  routesTree: ', routesTree);
            console.log('');

            //fs.outputJson('./routes-tree.json', routesTree);

            var cleanedRoutesTree;

            var cleanRoutesTree = function(route) {
                for(var i in route.children) {
                    var routes = route.children[i].routes;
                    console.log(routes);
                }
                return route;
            }

            cleanedRoutesTree = cleanRoutesTree(routesTree);

            console.log('');
            console.log('  cleanedRoutesTree: ', util.inspect(cleanedRoutesTree, { depth: 10 }));
        },
        constructModulesTree: function() {
            console.log('');
            console.log('constructModulesTree');
            let getNestedChildren = function(arr, parent?) {
                var out = []
                for(var i in arr) {
                    if(arr[i].parent === parent) {
                        var children = getNestedChildren(arr, arr[i].name)
                        if(children.length) {
                            arr[i].children = children
                        }
                        out.push(arr[i])
                    }
                }
                return out;
            }
            //Scan each module and add parent property
            _.forEach(modules, function(firstLoopModule) {
                _.forEach(firstLoopModule.importsNode, function(importNode) {
                    _.forEach(modules, function(module) {
                        if( module.name === importNode.name) {
                            module.parent = firstLoopModule.name
                        }
                    });
                });
            });
            modulesTree = getNestedChildren(modules);
            console.log('');
            console.log('end constructModulesTree');
            console.log(modulesTree);
        }
    }
})();
