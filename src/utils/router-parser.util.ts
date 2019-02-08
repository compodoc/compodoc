import * as Handlebars from 'handlebars';
import * as JSON5 from 'json5';
import * as _ from 'lodash';
import * as path from 'path';
import Ast, { ts, SourceFile, SyntaxKind, TypeGuards } from 'ts-simple-ast';

import FileEngine from '../app/engines/file.engine';
import { RoutingGraphNode } from '../app/nodes/routing-graph-node';

import ImportsUtil from './imports.util';
import { logger } from './logger';

const traverse = require('traverse');

const ast = new Ast();

export class RouterParserUtil {
    private routes: any[] = [];
    private incompleteRoutes = [];
    private modules = [];
    private modulesTree;
    private rootModule: string;
    private cleanModulesTree;
    private modulesWithRoutes = [];

    private static instance: RouterParserUtil;
    private constructor() {}
    public static getInstance() {
        if (!RouterParserUtil.instance) {
            RouterParserUtil.instance = new RouterParserUtil();
        }
        return RouterParserUtil.instance;
    }

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
            if (
                imports[i].name.indexOf('RouterModule.forChild') !== -1 ||
                imports[i].name.indexOf('RouterModule.forRoot') !== -1 ||
                imports[i].name.indexOf('RouterModule') !== -1
            ) {
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
                                    _.forEach(this.routes, route => {
                                        if (
                                            argument.text &&
                                            route.name === argument.text &&
                                            route.filename === this.modulesWithRoutes[i].filename
                                        ) {
                                            route.module = this.modulesWithRoutes[i].name;
                                        } else if (
                                            argument.text &&
                                            route.name === argument.text &&
                                            route.filename !== this.modulesWithRoutes[i].filename
                                        ) {
                                            let argumentImportPath = ImportsUtil.findFilePathOfImportedVariable(
                                                argument.text,
                                                this.modulesWithRoutes[i].filename
                                            );
                                            let cleaner = (process.cwd() + path.sep).replace(
                                                /\\/g,
                                                '/'
                                            );
                                            argumentImportPath = argumentImportPath.replace(
                                                cleaner,
                                                ''
                                            );
                                            if (
                                                argument.text &&
                                                route.name === argument.text &&
                                                route.filename === argumentImportPath
                                            ) {
                                                route.module = this.modulesWithRoutes[i].name;
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    }
                }
                /**
                 * direct support of for example
                 * export const HomeRoutingModule: ModuleWithProviders = RouterModule.forChild(HOME_ROUTES);
                 */
                if (ts.isCallExpression(node)) {
                    if (node.arguments) {
                        _.forEach(node.arguments, (argument: ts.Identifier) => {
                            _.forEach(this.routes, route => {
                                if (
                                    argument.text &&
                                    route.name === argument.text &&
                                    route.filename === this.modulesWithRoutes[i].filename
                                ) {
                                    route.module = this.modulesWithRoutes[i].name;
                                }
                            });
                        });
                    }
                }
            });
        }
    }

    public foundRouteWithModuleName(moduleName: string): any {
        return _.find(this.routes, { module: moduleName });
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
        traverse(this.modulesTree).forEach(function(node) {
            if (node) {
                if (node.parent) {
                    delete node.parent;
                }
                if (node.initializer) {
                    delete node.initializer;
                }
                if (node.importsNode) {
                    delete node.importsNode;
                }
            }
        });

        this.cleanModulesTree = _.cloneDeep(this.modulesTree);

        let routesTree = {
            name: '<root>',
            kind: 'module',
            className: this.rootModule,
            children: []
        };

        let loopModulesParser = node => {
            if (node.children && node.children.length > 0) {
                // If module has child modules
                for (let i in node.children) {
                    let route = this.foundRouteWithModuleName(node.children[i].name);
                    if (route && route.data) {
                        try {
                            route.children = JSON5.parse(route.data);
                        } catch (e) {
                            logger.error(
                                'Error during generation of routes JSON file, maybe a trailing comma or an external variable inside one route.'
                            );
                        }
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
                        let routeAddedOnce = false;
                        for (i; i < len; i++) {
                            let route = routes[i];
                            if (routes[i].component) {
                                routeAddedOnce = true;
                                routesTree.children.push({
                                    kind: 'component',
                                    component: routes[i].component,
                                    path: routes[i].path
                                });
                            }
                        }
                        if (!routeAddedOnce) {
                            routesTree.children = [...routesTree.children, ...routes];
                        }
                    }
                }
            }
        };

        let startModule = _.find(this.cleanModulesTree, { name: this.rootModule });

        if (startModule) {
            loopModulesParser(startModule);
            // Loop twice for routes with lazy loading
            // loopModulesParser(routesTree);
        }

        let cleanedRoutesTree = undefined;

        let cleanRoutesTree = route => {
            for (let i in route.children) {
                let routes = route.children[i].routes;
            }
            return route;
        };

        cleanedRoutesTree = cleanRoutesTree(routesTree);

        // Try updating routes with lazy loading

        let loopInsideModule = (mod, _rawModule) => {
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
            } else {
                let route = this.foundRouteWithModuleName(mod.name);
                if (typeof route !== 'undefined') {
                    if (route.data) {
                        route.children = JSON5.parse(route.data);
                        delete route.data;
                        route.kind = 'module';
                        _rawModule.children.push(route);
                    }
                }
            }
        };

        let loopRoutesParser = route => {
            if (route.children) {
                for (let i in route.children) {
                    if (route.children[i].loadChildren) {
                        let child = this.foundLazyModuleWithPath(route.children[i].loadChildren);
                        let module: RoutingGraphNode = _.find(this.cleanModulesTree, {
                            name: child
                        });
                        if (module) {
                            let _rawModule: RoutingGraphNode = {};
                            _rawModule.kind = 'module';
                            _rawModule.children = [];
                            _rawModule.module = module.name;
                            loopInsideModule(module, _rawModule);

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
        _.forEach(this.modules, firstLoopModule => {
            _.forEach(firstLoopModule.importsNode, importNode => {
                _.forEach(this.modules, module => {
                    if (module.name === importNode.name) {
                        module.parent = firstLoopModule.name;
                    }
                });
            });
        });
        this.modulesTree = getNestedChildren(this.modules);
    }

    public generateRoutesIndex(outputFolder: string, routes: Array<any>): Promise<void> {
        return FileEngine.get(__dirname + '/../src/templates/partials/routes-index.hbs').then(
            data => {
                let template: any = Handlebars.compile(data);
                let result = template({
                    routes: JSON.stringify(routes)
                });
                let testOutputDir = outputFolder.match(process.cwd());

                if (testOutputDir && testOutputDir.length > 0) {
                    outputFolder = outputFolder.replace(process.cwd() + path.sep, '');
                }

                return FileEngine.write(
                    outputFolder + path.sep + '/js/routes/routes_index.js',
                    result
                );
            },
            err => Promise.reject('Error during routes index generation')
        );
    }

    public routesLength(): number {
        let _n = 0;
        let routesParser = route => {
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

    public isVariableRoutes(node) {
        let result = false;
        if (node.declarationList && node.declarationList.declarations) {
            let i = 0;
            let len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                if (node.declarationList.declarations[i].type) {
                    if (
                        node.declarationList.declarations[i].type.typeName &&
                        node.declarationList.declarations[i].type.typeName.text === 'Routes'
                    ) {
                        result = true;
                    }
                }
            }
        }
        return result;
    }

    public cleanFileIdentifiers(sourceFile: SourceFile): SourceFile {
        let file = sourceFile;
        const identifiers = file.getDescendantsOfKind(SyntaxKind.Identifier).filter(p => {
            return (
                TypeGuards.isArrayLiteralExpression(p.getParentOrThrow()) ||
                TypeGuards.isPropertyAssignment(p.getParentOrThrow())
            );
        });

        let identifiersInRoutesVariableStatement = [];

        for (const identifier of identifiers) {
            // Loop through their parents nodes, and if one is a variableStatement and === 'routes'
            let foundParentVariableStatement = false;
            let parent = identifier.getParentWhile(n => {
                if (n.getKind() === SyntaxKind.VariableStatement) {
                    if (this.isVariableRoutes(n.compilerNode)) {
                        foundParentVariableStatement = true;
                    }
                }
                return true;
            });
            if (foundParentVariableStatement) {
                identifiersInRoutesVariableStatement.push(identifier);
            }
        }

        // inline the property access expressions
        for (const identifier of identifiersInRoutesVariableStatement) {
            const identifierDeclaration = identifier
                .getSymbolOrThrow()
                .getValueDeclarationOrThrow();
            if (
                !TypeGuards.isPropertyAssignment(identifierDeclaration) &&
                TypeGuards.isVariableDeclaration(identifierDeclaration) &&
                (TypeGuards.isPropertyAssignment(identifierDeclaration) &&
                    !TypeGuards.isVariableDeclaration(identifierDeclaration))
            ) {
                throw new Error(
                    `Not implemented referenced declaration kind: ${identifierDeclaration.getKindName()}`
                );
            }
            if (TypeGuards.isVariableDeclaration(identifierDeclaration)) {
                identifier.replaceWithText(identifierDeclaration.getInitializerOrThrow().getText());
            }
        }

        return file;
    }

    public cleanFileSpreads(sourceFile: SourceFile): SourceFile {
        let file = sourceFile;
        const spreadElements = file
            .getDescendantsOfKind(SyntaxKind.SpreadElement)
            .filter(p => TypeGuards.isArrayLiteralExpression(p.getParentOrThrow()));

        let spreadElementsInRoutesVariableStatement = [];

        for (const spreadElement of spreadElements) {
            // Loop through their parents nodes, and if one is a variableStatement and === 'routes'
            let foundParentVariableStatement = false;
            let parent = spreadElement.getParentWhile(n => {
                if (n.getKind() === SyntaxKind.VariableStatement) {
                    if (this.isVariableRoutes(n.compilerNode)) {
                        foundParentVariableStatement = true;
                    }
                }
                return true;
            });
            if (foundParentVariableStatement) {
                spreadElementsInRoutesVariableStatement.push(spreadElement);
            }
        }

        // inline the ArrayLiteralExpression SpreadElements
        for (const spreadElement of spreadElementsInRoutesVariableStatement) {
            let spreadElementIdentifier = spreadElement.getExpression().getText(),
                searchedImport,
                aliasOriginalName = '',
                foundWithAliasInImports = false,
                foundWithAlias = false;

            // Try to find it in imports
            const imports = file.getImportDeclarations();

            imports.forEach(i => {
                let namedImports = i.getNamedImports(),
                    namedImportsLength = namedImports.length,
                    j = 0;

                if (namedImportsLength > 0) {
                    for (j; j < namedImportsLength; j++) {
                        let importName = namedImports[j].getNameNode().getText() as string,
                            importAlias;

                        if (namedImports[j].getAliasIdentifier()) {
                            importAlias = namedImports[j].getAliasIdentifier().getText();
                        }

                        if (importName === spreadElementIdentifier) {
                            foundWithAliasInImports = true;
                            searchedImport = i;
                            break;
                        }
                        if (importAlias === spreadElementIdentifier) {
                            foundWithAliasInImports = true;
                            foundWithAlias = true;
                            aliasOriginalName = importName;
                            searchedImport = i;
                            break;
                        }
                    }
                }
            });

            let referencedDeclaration;

            if (foundWithAliasInImports) {
                if (typeof searchedImport !== 'undefined') {
                    let importPath = path.resolve(
                        path.dirname(file.getFilePath()) +
                            '/' +
                            searchedImport.getModuleSpecifierValue() +
                            '.ts'
                    );
                    const sourceFileImport =
                        typeof ast.getSourceFile(importPath) !== 'undefined'
                            ? ast.getSourceFile(importPath)
                            : ast.addExistingSourceFile(importPath);
                    if (sourceFileImport) {
                        let variableName = foundWithAlias
                            ? aliasOriginalName
                            : spreadElementIdentifier;
                        referencedDeclaration = sourceFileImport.getVariableDeclaration(
                            variableName
                        );
                    }
                }
            } else {
                // if not, try directly in file
                referencedDeclaration = spreadElement
                    .getExpression()
                    .getSymbolOrThrow()
                    .getValueDeclarationOrThrow();
            }

            if (!TypeGuards.isVariableDeclaration(referencedDeclaration)) {
                throw new Error(
                    `Not implemented referenced declaration kind: ${referencedDeclaration.getKindName()}`
                );
            }

            const referencedArray = referencedDeclaration.getInitializerIfKindOrThrow(
                SyntaxKind.ArrayLiteralExpression
            );
            const spreadElementArray = spreadElement.getParentIfKindOrThrow(
                SyntaxKind.ArrayLiteralExpression
            );
            const insertIndex = spreadElementArray.getElements().indexOf(spreadElement);
            spreadElementArray.removeElement(spreadElement);
            spreadElementArray.insertElements(
                insertIndex,
                referencedArray.getElements().map(e => e.getText())
            );
        }

        return file;
    }

    public cleanFileDynamics(sourceFile: SourceFile): SourceFile {
        let file = sourceFile;
        const propertyAccessExpressions = file
            .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
            .filter(p => !TypeGuards.isPropertyAccessExpression(p.getParentOrThrow()));

        let propertyAccessExpressionsInRoutesVariableStatement = [];

        for (const propertyAccessExpression of propertyAccessExpressions) {
            // Loop through their parents nodes, and if one is a variableStatement and === 'routes'
            let foundParentVariableStatement = false;
            let parent = propertyAccessExpression.getParentWhile(n => {
                if (n.getKind() === SyntaxKind.VariableStatement) {
                    if (this.isVariableRoutes(n.compilerNode)) {
                        foundParentVariableStatement = true;
                    }
                }
                return true;
            });
            if (foundParentVariableStatement) {
                propertyAccessExpressionsInRoutesVariableStatement.push(propertyAccessExpression);
            }
        }

        // inline the property access expressions
        for (const propertyAccessExpression of propertyAccessExpressionsInRoutesVariableStatement) {
            const referencedDeclaration = propertyAccessExpression
                .getNameNode()
                .getSymbolOrThrow()
                .getValueDeclarationOrThrow();
            if (
                !TypeGuards.isPropertyAssignment(referencedDeclaration) &&
                TypeGuards.isEnumMember(referencedDeclaration) &&
                (TypeGuards.isPropertyAssignment(referencedDeclaration) &&
                    !TypeGuards.isEnumMember(referencedDeclaration))
            ) {
                throw new Error(
                    `Not implemented referenced declaration kind: ${referencedDeclaration.getKindName()}`
                );
            }
            if (typeof referencedDeclaration.getInitializerOrThrow !== 'undefined') {
                propertyAccessExpression.replaceWithText(
                    referencedDeclaration.getInitializerOrThrow().getText()
                );
            }
        }

        return file;
    }

    /**
     * replace callexpressions with string : utils.doWork() -> 'utils.doWork()' doWork() -> 'doWork()'
     * @param sourceFile ts.SourceFile
     */
    public cleanCallExpressions(sourceFile: SourceFile): SourceFile {
        let file = sourceFile;

        const variableStatements = sourceFile.getVariableDeclaration(v => {
            let result = false;
            if (typeof v.compilerNode.type !== 'undefined') {
                result = v.compilerNode.type.typeName.text === 'Routes';
            }
            return result;
        });

        const initializer = variableStatements.getInitializer();

        for (const callExpr of initializer.getDescendantsOfKind(SyntaxKind.CallExpression)) {
            if (callExpr.wasForgotten()) {
                continue;
            }
            callExpr.replaceWithText(writer => writer.quote(callExpr.getText()));
        }

        return file;
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
    public cleanRoutesDefinitionWithImport(
        initializer: ts.ArrayLiteralExpression,
        node: ts.Node,
        sourceFile: ts.SourceFile
    ): ts.Node {
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
                            if (propertyInitializer.kind !== SyntaxKind.StringLiteral) {
                                // Identifier(71) won't break parsing, but it will be better to retrive them
                                // PropertyAccessExpression(179) ex: MYIMPORT.path will break it, find it in import
                                if (
                                    propertyInitializer.kind === SyntaxKind.PropertyAccessExpression
                                ) {
                                    let lastObjectLiteralAttributeName = propertyInitializer.name.getText(),
                                        firstObjectLiteralAttributeName;
                                    if (propertyInitializer.expression) {
                                        firstObjectLiteralAttributeName = propertyInitializer.expression.getText();
                                        let result = ImportsUtil.findPropertyValueInImportOrLocalVariables(
                                            firstObjectLiteralAttributeName +
                                                '.' +
                                                lastObjectLiteralAttributeName,
                                            sourceFile
                                        ); // tslint:disable-line
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

export default RouterParserUtil.getInstance();
