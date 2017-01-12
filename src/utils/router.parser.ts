import * as _ from 'lodash';
import * as util from 'util';

export let RouterParser = (function() {

    var routes = [],
        modules = [],
        modulesTree,
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
        addModule: function(moduleName, moduleImports) {
            modules.push({
                name: moduleName,
                importsNode: moduleImports
            });
            modules = _.sortBy(_.uniqWith(modules, _.isEqual), ['name']);
        },
        printRoutes: function() {
            //console.log('');
            //console.log(routes);
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
        },
        constructRoutesTree: function() {
            //console.log('constructRoutesTree');
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

            //console.log('cleanModulesTree: ', util.inspect(cleanModulesTree, { depth: 10 }));
            modulesCleaner(cleanModulesTree);
            //console.log('');
            //console.log('cleanModulesTree light: ', util.inspect(cleanModulesTree, { depth: 10 }));
        },
        constructModulesTree: function() {
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
        }
    }
})();
