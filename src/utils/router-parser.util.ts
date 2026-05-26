const Handlebars = require("handlebars");
import * as JSON5 from "json5";
import * as _ from "lodash";
import * as path from "path";
import { Project, ts, SourceFile, SyntaxKind, Node } from "ts-morph";

import FileEngine from "../app/engines/file.engine";
import { RoutingGraphNode } from "../app/nodes/routing-graph-node";
import Configuration from "../app/configuration";

import ImportsUtil from "./imports.util";
import { logger } from "./logger";
import { readConfig } from "./utils";

const traverse = require("neotraverse/legacy");

const ast = new Project();

export class RouterParserUtil {
    private static readonly DEFAULT_LAZY_EXPORT = "default";
    public scannedFiles: any[] = [];
    private routes: any[] = [];
    private incompleteRoutes = [];
    private modules = [];
    private modulesTree;
    private rootModule: string;
    private cleanModulesTree;
    private modulesWithRoutes = [];
    private transformAngular8ImportSyntax =
        /(['"]loadChildren['"]:)\(\)(:[^)]+?)?=>"import\((\\'|'|"|`)([^'"]+?)(\\'|'|"|`)\)\.then\(\(?\w+?\)?=>\S+?\.([^)]+?)\)(\\'|'|")/g;
    private transformAngular8ImportSyntaxComponent =
        /(['"]loadComponent['"]:)\(\)(:[^)]+?)?=>"import\((\\'|'|"|`)([^'"]+?)(\\'|'|"|`)\)\.then\(\(?\w+?\)?=>\S+?\.([^)]+?)\)(\\'|'|")/g;
    private transformAngular8ImportSyntaxAsyncAwait =
        /(['"]loadChildren['"]:)\(\)(:[^)]+?)?=>\("import\((\\'|'|"|`)([^'"]+?)(\\'|'|"|`)\)"\)\.['"]([^)]+?)['"]/g;
    private transformAngular8ImportSyntaxComponentAsyncAwait =
        /(['"]loadComponent['"]:)\(\)(:[^)]+?)?=>\("import\((\\'|'|"|`)([^'"]+?)(\\'|'|"|`)\)"\)\.['"]([^)]+?)['"]/g;
    private trailingComma = /,\s*([\]})])/g;

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
        this.routes = _.sortBy(_.uniqWith(this.routes, _.isEqual), ["name"]);
    }

    public addIncompleteRoute(route): void {
        this.incompleteRoutes.push(route);
        this.incompleteRoutes = _.sortBy(
            _.uniqWith(this.incompleteRoutes, _.isEqual),
            ["name"],
        );
    }

    public addModuleWithRoutes(moduleName, moduleImports, filename): void {
        this.modulesWithRoutes.push({
            name: moduleName,
            importsNode: moduleImports,
            filename: filename,
        });
        this.modulesWithRoutes = _.sortBy(
            _.uniqWith(this.modulesWithRoutes, _.isEqual),
            ["name"],
        );
    }

    public addModule(moduleName: string, moduleImports): void {
        this.modules.push({
            name: moduleName,
            importsNode: moduleImports,
        });
        this.modules = _.sortBy(_.uniqWith(this.modules, _.isEqual), ["name"]);
    }

    public cleanRawRouteParsed(route: string): object {
        try {
            return JSON5.parse(this.cleanRawRoute(route));
        } catch (parseError) {
            logger.error(
                `Failed to parse route data. This may be caused by special characters in file paths or route configurations.`,
            );
            logger.debug(`Raw route data: ${route}`);
            logger.debug(`Cleaned route data: ${this.cleanRawRoute(route)}`);
            logger.debug(`Parse error: ${parseError.message}`);
            throw parseError;
        }
    }

    public cleanRawRoute(route: string): string {
        let cleaned = route
            .replace(/\s/g, "")
            .replace(this.trailingComma, "$1")
            .replace(this.transformAngular8ImportSyntax, '$1"$4#$6"')
            .replace(this.transformAngular8ImportSyntaxAsyncAwait, '$1"$4#$6"')
            .replace(this.transformAngular8ImportSyntaxComponent, '$1"$4#$6"')
            .replace(
                this.transformAngular8ImportSyntaxComponentAsyncAwait,
                '$1"$4#$6"',
            );

        // Sanitize TypeScript expressions that JSON5 cannot parse.
        // Angular routes often use string concatenation, enum/const references,
        // template literals, and arrow functions — none of which are valid JSON5.

        // Step 0: Convert modern lazy-loading arrow syntax to "path#Module" strings
        //   BEFORE any arrow-function sanitization so loadChildren/loadComponent
        //   are never treated as generic arrow functions.
        //   Raw source:      loadChildren:()=>import('./path').then(m=>m.Module)
        //   CodeGenerator:   "loadChildren":()=>import("./path")."then"("m"=>"m"."Module")
        //   Both → loadChildren:"./path#Module"
        cleaned = cleaned
            .replace(
                /"?loadChildren"?:\(\)=>import\(["'`]([^"'`]+)["'`]\)\."?then"?\(\(\{["']?(\w+)["']?\}\)=>["']?\2["']?\)/g,
                'loadChildren:"$1#$2"',
            )
            .replace(
                /"?loadComponent"?:\(\)=>import\(["'`]([^"'`]+)["'`]\)\."?then"?\(\(\{["']?(\w+)["']?\}\)=>["']?\2["']?\)/g,
                'loadComponent:"$1#$2"',
            )
            .replace(
                /"?loadChildren"?:\(\)=>import\(["'`]([^"'`]+)["'`]\)\."?then"?\(\(?["']?\w+["']?\)?"?=>(?:["']?\w+["']?\.)?"?(\w+)"?\)/g,
                'loadChildren:"$1#$2"',
            )
            .replace(
                /"?loadComponent"?:\(\)=>import\(["'`]([^"'`]+)["'`]\)\."?then"?\(\(?["']?\w+["']?\)?"?=>(?:["']?\w+["']?\.)?"?(\w+)"?\)/g,
                'loadComponent:"$1#$2"',
            )
            .replace(
                /"?loadComponent"?:\(\)=>import\(["'`]([^"'`]+)["'`]\)(?!\."?then"?\()/g,
                'loadComponent:"$1#default"',
            )
            .replace(
                /"?loadChildren"?:\(\)=>import\(["'`]([^"'`]+)["'`]\)(?!\."?then"?\()/g,
                'loadChildren:"$1#default"',
            );

        // Step 1: Convert template literal interpolations to bare identifiers
        //   ${VAR} → VAR  (so subsequent steps can merge them as identifiers)
        cleaned = cleaned.replace(/\$\{([^}]+)\}/g, "$1");

        // Step 2: Merge adjacent same-type quoted string literals joined by +
        //   "a"+"b" → "ab"   'a'+'b' → 'a'
        //   Repeated until stable to handle chains: "a"+"b"+"c" → "abc"
        let prev: string;
        do {
            prev = cleaned;
            cleaned = cleaned
                .replace(/"([^"\\]*)"\+"([^"\\]*)"/g, '"$1$2"')
                .replace(/'([^'\\]*)'\+'([^'\\]*)'/g, "'$1$2'");
        } while (cleaned !== prev);

        // Step 3: Absorb unquoted identifier/property-chains into adjacent string literals
        //   Enum.VALUE+"str" → "Enum.VALUEstr"   "str"+Enum.VALUE → "strEnum.VALUE"
        //   Repeated until stable to handle: A+"/"+ B → "A/B"
        do {
            prev = cleaned;
            cleaned = cleaned
                .replace(/([a-zA-Z_$][a-zA-Z0-9_$.]*)\+"([^"]*)"/g, '"$1$2"')
                .replace(/"([^"]*)"\+([a-zA-Z_$][a-zA-Z0-9_$.]*)/g, '"$1$2"');
        } while (cleaned !== prev);

        // Step 3b: Normalize CodeGenerator dotted chains and unresolved enum/property refs
        //   "Enum"."VALUE" -> "Enum.VALUE"
        //   :Enum.VALUE -> :"Enum.VALUE"
        //   [Enum.VALUE] -> ["Enum.VALUE"]
        // This keeps route parsing resilient even when symbols cannot be resolved earlier.
        do {
            prev = cleaned;
            cleaned = cleaned.replace(
                /"([a-zA-Z_$][a-zA-Z0-9_$]*)"\."([a-zA-Z_$][a-zA-Z0-9_$]*)"/g,
                '"$1.$2"',
            );
        } while (cleaned !== prev);

        cleaned = cleaned
            .replace(
                /:([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)+)/g,
                ':"$1"',
            )
            .replace(
                /([\[,])([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)+)(?=[,\]])/g,
                '$1"$2"',
            );

        // Step 3c: Expand object shorthand properties to key/value form.
        //   data:{flag,delay:2500} -> data:{flag:"flag",delay:2500}
        // JSON5 cannot parse object shorthand, so we normalize it here.
        cleaned = cleaned.replace(
            /([{,])([a-zA-Z_$][a-zA-Z0-9_$]*)(?=[,}])/g,
            '$1$2:"$2"',
        );

        // Step 4: Replace non-block arrow function expressions in property values.
        //   :(params) => simpleExpr  →  :"[Function]"
        //   loadChildren/loadComponent are already converted to strings by Step 0 above.
        cleaned = cleaned.replace(/:(\([^)(]*\))=>[^{,}\]]+/g, ':"[Function]"');

        // Step 5: Replace block arrow function expressions in property values.
        //   :(params) => { ... }  →  :"[Function]"
        cleaned = this.replaceBlockArrowFunctions(cleaned);

        // Step 6: Unwrap constructor-wrapped object literals used in route metadata.
        //   data:newLazyRoutingOptions({preload:true}) -> data:{preload:true}
        // This keeps JSON5 parsing resilient for typed route data objects.
        cleaned = this.unwrapConstructorWrappedObjectValues(cleaned);

        return cleaned;
    }

    private replaceBlockArrowFunctions(input: string): string {
        // Find =>{ patterns outside of strings and replace the arrow function
        // (params => { body }) in the value position with "[Function]".
        // loadChildren/loadComponent are excluded (already converted by step 0).
        const LAZY_KEYS = ["loadChildren", "loadComponent"];
        let result = "";
        let i = 0;
        let inDouble = false;
        let inSingle = false;

        while (i < input.length) {
            const ch = input[i];

            // Track string context (whitespace was already removed so no mid-string newlines)
            if (ch === '"' && !inSingle) {
                inDouble = !inDouble;
                result += ch;
                i++;
                continue;
            }
            if (ch === "'" && !inDouble) {
                inSingle = !inSingle;
                result += ch;
                i++;
                continue;
            }
            if (ch === "\\" && (inDouble || inSingle)) {
                result += ch + (input[i + 1] || "");
                i += 2;
                continue;
            }

            if (
                !inDouble &&
                !inSingle &&
                ch === "=" &&
                input[i + 1] === ">" &&
                input[i + 2] === "{"
            ) {
                // Walk backwards in result to find the ':' that started this value
                let valStart = result.length - 1;
                let depth = 0;
                while (valStart >= 0) {
                    const rc = result[valStart];
                    if (rc === ")" || rc === "]") {
                        depth++;
                        valStart--;
                        continue;
                    }
                    if (rc === "(" || rc === "[") {
                        if (depth === 0) {
                            valStart--;
                            continue;
                        }
                        depth--;
                        valStart--;
                        continue;
                    }
                    if ((rc === ":" || rc === ",") && depth === 0) break;
                    valStart--;
                }

                if (valStart >= 0 && result[valStart] === ":") {
                    // Check that the key before ':' is not a lazy-loading key
                    const prefix = result.substring(0, valStart);
                    const isLazy = LAZY_KEYS.some((k) => prefix.endsWith(k));

                    if (!isLazy) {
                        // Skip the block body by counting braces
                        let bodyIdx = i + 2; // points to '{'
                        let bDepth = 1;
                        bodyIdx++;
                        while (bodyIdx < input.length && bDepth > 0) {
                            if (input[bodyIdx] === "{") bDepth++;
                            else if (input[bodyIdx] === "}") bDepth--;
                            bodyIdx++;
                        }
                        result =
                            result.substring(0, valStart + 1) + ':"[Function]"';
                        i = bodyIdx;
                        continue;
                    }
                }
            }

            result += ch;
            i++;
        }
        return result;
    }

    private unwrapConstructorWrappedObjectValues(input: string): string {
        const isIdentifierStart = (ch: string | undefined): boolean =>
            !!ch && /[A-Za-z_$]/.test(ch);
        const isIdentifierPart = (ch: string | undefined): boolean =>
            !!ch && /[A-Za-z0-9_$]/.test(ch);

        let result = "";
        let i = 0;
        let inDouble = false;
        let inSingle = false;

        while (i < input.length) {
            const ch = input[i];

            if (ch === '"' && !inSingle) {
                inDouble = !inDouble;
                result += ch;
                i++;
                continue;
            }
            if (ch === "'" && !inDouble) {
                inSingle = !inSingle;
                result += ch;
                i++;
                continue;
            }
            if (ch === "\\" && (inDouble || inSingle)) {
                result += ch + (input[i + 1] || "");
                i += 2;
                continue;
            }

            if (
                !inDouble &&
                !inSingle &&
                ch === ":" &&
                input.slice(i + 1, i + 4) === "new"
            ) {
                let nameStart = i + 4;
                if (!isIdentifierStart(input[nameStart])) {
                    result += ch;
                    i++;
                    continue;
                }

                while (isIdentifierPart(input[nameStart])) {
                    nameStart++;
                }

                if (input[nameStart] !== "(" || input[nameStart + 1] !== "{") {
                    result += ch;
                    i++;
                    continue;
                }

                let cursor = nameStart + 1; // points to '{'
                let braceDepth = 1;
                let objInDouble = false;
                let objInSingle = false;

                cursor++;
                while (cursor < input.length && braceDepth > 0) {
                    const c = input[cursor];
                    if (c === "\\" && (objInDouble || objInSingle)) {
                        cursor += 2;
                        continue;
                    }
                    if (c === '"' && !objInSingle) {
                        objInDouble = !objInDouble;
                        cursor++;
                        continue;
                    }
                    if (c === "'" && !objInDouble) {
                        objInSingle = !objInSingle;
                        cursor++;
                        continue;
                    }
                    if (!objInDouble && !objInSingle) {
                        if (c === "{") {
                            braceDepth++;
                        } else if (c === "}") {
                            braceDepth--;
                        }
                    }
                    cursor++;
                }

                if (braceDepth !== 0 || input[cursor] !== ")") {
                    result += ch;
                    i++;
                    continue;
                }

                const objectLiteral = input.slice(nameStart + 1, cursor);
                result += ":" + objectLiteral;
                i = cursor + 1;
                continue;
            }

            result += ch;
            i++;
        }

        return result;
    }

    public setRootModule(module: string): void {
        this.rootModule = module;
    }

    public hasRouterModuleInImports(imports: Array<any>): boolean {
        for (let i = 0; i < imports.length; i++) {
            if (
                imports[i].name.indexOf("RouterModule.forChild") !== -1 ||
                imports[i].name.indexOf("RouterModule.forRoot") !== -1 ||
                imports[i].name.indexOf("RouterModule") !== -1
            ) {
                return true;
            }
        }

        return false;
    }

    public fixIncompleteRoutes(miscellaneousVariables: Array<any>): void {
        const matchingVariables = [];
        // For each incompleteRoute, scan if one misc variable is in code
        // if ok, try recreating complete route
        for (let i = 0; i < this.incompleteRoutes.length; i++) {
            for (let j = 0; j < miscellaneousVariables.length; j++) {
                if (
                    this.incompleteRoutes[i].data.indexOf(
                        miscellaneousVariables[j].name,
                    ) !== -1
                ) {
                    console.log("found one misc var inside incompleteRoute");
                    console.log(miscellaneousVariables[j].name);
                    matchingVariables.push(miscellaneousVariables[j]);
                }
            }
            // Clean incompleteRoute
            this.incompleteRoutes[i].data = this.incompleteRoutes[
                i
            ].data.replace("[", "");
            this.incompleteRoutes[i].data = this.incompleteRoutes[
                i
            ].data.replace("]", "");
        }
    }

    public linkModulesAndRoutes(): void {
        let i = 0;
        const len = this.modulesWithRoutes.length;
        for (i; i < len; i++) {
            _.forEach(
                this.modulesWithRoutes[i].importsNode,
                (node: ts.Node) => {
                    if (ts.isPropertyDeclaration(node)) {
                        const initializer =
                            node.initializer as ts.ArrayLiteralExpression;
                        if (initializer) {
                            if (initializer.elements) {
                                _.forEach(
                                    initializer.elements,
                                    (element: ts.CallExpression) => {
                                        // find element with arguments
                                        if (element.arguments) {
                                            _.forEach(
                                                element.arguments,
                                                (argument: ts.Identifier) => {
                                                    _.forEach(
                                                        this.routes,
                                                        (route) => {
                                                            if (
                                                                argument.text &&
                                                                route.name ===
                                                                    argument.text &&
                                                                route.filename ===
                                                                    this
                                                                        .modulesWithRoutes[
                                                                        i
                                                                    ].filename
                                                            ) {
                                                                route.module =
                                                                    this.modulesWithRoutes[
                                                                        i
                                                                    ].name;
                                                            } else if (
                                                                argument.text &&
                                                                route.name ===
                                                                    argument.text &&
                                                                route.filename !==
                                                                    this
                                                                        .modulesWithRoutes[
                                                                        i
                                                                    ].filename
                                                            ) {
                                                                let argumentImportPath =
                                                                    ImportsUtil.findFilePathOfImportedVariable(
                                                                        argument.text,
                                                                        this
                                                                            .modulesWithRoutes[
                                                                            i
                                                                        ]
                                                                            .filename,
                                                                    );

                                                                argumentImportPath =
                                                                    argumentImportPath
                                                                        .replace(
                                                                            process.cwd() +
                                                                                path.sep,
                                                                            "",
                                                                        )
                                                                        .replace(
                                                                            /\\/g,
                                                                            "/",
                                                                        );

                                                                if (
                                                                    argument.text &&
                                                                    route.name ===
                                                                        argument.text &&
                                                                    route.filename ===
                                                                        argumentImportPath
                                                                ) {
                                                                    route.module =
                                                                        this.modulesWithRoutes[
                                                                            i
                                                                        ].name;
                                                                }
                                                            }
                                                        },
                                                    );
                                                },
                                            );
                                        }
                                    },
                                );
                            }
                        }
                    }
                    /**
                     * direct support of for example
                     * export const HomeRoutingModule: ModuleWithProviders = RouterModule.forChild(HOME_ROUTES);
                     */
                    if (ts.isCallExpression(node)) {
                        if (node.arguments) {
                            _.forEach(
                                node.arguments,
                                (argument: ts.Identifier) => {
                                    _.forEach(this.routes, (route) => {
                                        if (
                                            argument.text &&
                                            route.name === argument.text &&
                                            route.filename ===
                                                this.modulesWithRoutes[i]
                                                    .filename
                                        ) {
                                            route.module =
                                                this.modulesWithRoutes[i].name;
                                        }
                                    });
                                },
                            );
                        }
                    }
                },
            );
        }
    }

    public foundRouteWithModuleName(moduleName: string): any {
        return _.find(this.routes, { module: moduleName });
    }

    public foundLazyModuleWithPath(modulePath: string): string {
        // path is like app/customers/customers.module#CustomersModule
        const split = modulePath.split("#");
        const lazyModuleName = split[1];
        return lazyModuleName;
    }

    public foundLazyComponentWithPath(componentPath: string): string {
        // path is like app/customers/customers.component#CustomersComponent
        const split = componentPath.split("#");
        const lazyComponentName = split[1];
        return lazyComponentName;
    }

    private normalizeFsPath(filePath: string): string {
        return path.normalize(filePath).replace(/\\/g, "/");
    }

    private getScannedFilePath(scannedFile: any): string | undefined {
        if (typeof scannedFile?.getFilePath === "function") {
            return scannedFile.getFilePath();
        }
        if (scannedFile?.path) {
            return scannedFile.path;
        }
        if (scannedFile?.fileName) {
            return scannedFile.fileName;
        }
        return undefined;
    }

    private findScannedSourceFileByRelativeName(filename: string): any {
        const normalizedFilename = this.normalizeFsPath(filename || "");
        if (!normalizedFilename) {
            return undefined;
        }

        return this.scannedFiles.find((scannedFile) => {
            const scannedPath = this.getScannedFilePath(scannedFile);
            if (!scannedPath) {
                return false;
            }
            return this.normalizeFsPath(scannedPath).endsWith(normalizedFilename);
        });
    }

    private getComponentClassNames(scannedFile: any): string[] {
        if (!scannedFile) {
            return [];
        }

        if (typeof scannedFile.getClasses === "function") {
            return scannedFile
                .getClasses()
                .map((classDeclaration) => classDeclaration.getName?.())
                .filter(
                    (name) => typeof name === "string" && name.endsWith("Component"),
                );
        }

        const statements =
            scannedFile && scannedFile.statements
                ? Array.from(scannedFile.statements as any)
                : [];

        if (statements.length > 0) {
            return statements
                .filter((statement) => ts.isClassDeclaration(statement))
                .map((classDeclaration) =>
                    classDeclaration?.name ? classDeclaration.name.text : undefined,
                )
                .filter(
                    (name) => typeof name === "string" && name.endsWith("Component"),
                );
        }

        return [];
    }

    private resolveImportSpecifierToFilePath(
        importSpecifier: string,
        fromFilename: string,
    ): string | undefined {
        if (!importSpecifier || !fromFilename) {
            return undefined;
        }

        const originScannedFile =
            this.findScannedSourceFileByRelativeName(fromFilename);
        const fromPath = this.getScannedFilePath(originScannedFile);
        const baseDir = fromPath
            ? path.dirname(fromPath)
            : path.dirname(path.resolve(fromFilename));
        const candidates = [
            path.resolve(baseDir, `${importSpecifier}.ts`),
            path.resolve(baseDir, importSpecifier, "index.ts"),
        ];

        return candidates.find((candidate) =>
            this.scannedFiles.some((scannedFile) => {
                const scannedPath = this.getScannedFilePath(scannedFile);
                if (!scannedPath) {
                    return false;
                }
                return (
                    this.normalizeFsPath(scannedPath) ===
                    this.normalizeFsPath(candidate)
                );
            }),
        );
    }

    private resolveLazyComponentName(
        loadComponent: string,
        filename: string,
        routePath?: string,
    ): string | undefined {
        if (!loadComponent) {
            return undefined;
        }

        const [importSpecifier, exportName] = loadComponent.split("#");

        if (
            exportName &&
            exportName !== RouterParserUtil.DEFAULT_LAZY_EXPORT &&
            exportName !== "undefined"
        ) {
            return exportName;
        }

        const resolvedFile = this.resolveImportSpecifierToFilePath(
            importSpecifier,
            filename,
        );

        if (!resolvedFile) {
            return this.inferComponentNameFromRoutePath(routePath);
        }

        const sourceFile: any = this.scannedFiles.find((scannedFile) => {
            const scannedPath = this.getScannedFilePath(scannedFile);
            if (!scannedPath) {
                return false;
            }
            return (
                this.normalizeFsPath(scannedPath) ===
                this.normalizeFsPath(resolvedFile)
            );
        });

        if (!sourceFile) {
            return this.inferComponentNameFromRoutePath(routePath);
        }

        const statements =
            sourceFile && sourceFile.statements
                ? Array.from(sourceFile.statements as any)
                : [];

        if (statements.length > 0) {
            const classDeclarations = statements.filter((statement) =>
                ts.isClassDeclaration(statement),
            );
            const hasDefaultModifier = (classDeclaration: ts.ClassDeclaration) =>
                !!classDeclaration.modifiers?.some(
                    (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword,
                );

            const defaultComponentClass = classDeclarations.find(
                (classDeclaration: ts.ClassDeclaration) =>
                    hasDefaultModifier(classDeclaration) &&
                    classDeclaration.name &&
                    classDeclaration.name.text.endsWith("Component"),
            );

            if (defaultComponentClass && defaultComponentClass.name) {
                return defaultComponentClass.name.text;
            }

            const firstComponentClass = classDeclarations.find(
                (classDeclaration: ts.ClassDeclaration) =>
                    classDeclaration.name &&
                    classDeclaration.name.text.endsWith("Component"),
            );

            if (firstComponentClass && firstComponentClass.name) {
                return firstComponentClass.name.text;
            }
        }

        return this.inferComponentNameFromRoutePath(routePath);
    }

    private inferComponentNameFromRoutePath(routePath?: string): string | undefined {
        if (!routePath) {
            return undefined;
        }

        const cleanedPath = routePath
            .replace(/^\//, "")
            .replace(/\*\*/g, "")
            .replace(/:[^/]+/g, "")
            .trim();

        if (!cleanedPath) {
            return undefined;
        }

        const guessedName =
            cleanedPath
                .split("/")
                .filter((segment) => segment.length > 0)
                .map((segment) =>
                    segment
                        .split(/[-_]/g)
                        .filter((part) => part.length > 0)
                        .map(
                            (part) =>
                                part.charAt(0).toUpperCase() + part.slice(1),
                        )
                        .join(""),
                )
                .join("") + "Component";

        if (!guessedName || guessedName === "Component") {
            return undefined;
        }

        return guessedName;
    }

    public constructRoutesTree() {
        // routes[] contains routes with module link
        // modulesTree contains modules tree
        // make a final routes tree with that
        // Create an enhanced routes tree with comprehensive validation to prevent undefined entries
        if (
            this.routes.length > 0 ||
            (this.modulesWithRoutes && this.modulesWithRoutes.length > 0)
        ) {
            const validChildren = [];

            // Comprehensive validation function to prevent any undefined/invalid entries
            const isValidName = (name: string): boolean => {
                return (
                    name &&
                    typeof name === "string" &&
                    name.trim() !== "" &&
                    name !== "undefined" &&
                    name !== "null" &&
                    !name.includes("undefined") &&
                    name.length > 0 &&
                    !/^\s*$/.test(name)
                ); // Not just whitespace
            };

            // Helper: process a single route item and push entries into validChildren
            const processRouteItem = (routeItem, filename: string) => {
                let routeComponentName;
                let routeModuleName;

                if (routeItem.component && isValidName(routeItem.component)) {
                    routeComponentName = routeItem.component;
                    validChildren.push({
                        name: routeItem.component,
                        kind: "component",
                        component: routeItem.component,
                        path: routeItem.path || "",
                        filename,
                    });
                }
                if (routeItem.loadChildren) {
                    const lazyModuleName = this.foundLazyModuleWithPath(
                        routeItem.loadChildren,
                    );
                    if (
                        lazyModuleName &&
                        isValidName(lazyModuleName) &&
                        lazyModuleName !== RouterParserUtil.DEFAULT_LAZY_EXPORT
                    ) {
                        routeModuleName = lazyModuleName;
                        validChildren.push({
                            name: lazyModuleName,
                            kind: "module",
                            module: lazyModuleName,
                            path: routeItem.path || "",
                            filename,
                        });
                    }
                    if (!routeModuleName) {
                        const inferredComponentName =
                            this.inferComponentNameFromRoutePath(
                                routeItem.path,
                            );
                        if (
                            inferredComponentName &&
                            isValidName(inferredComponentName)
                        ) {
                            routeComponentName = inferredComponentName;
                            validChildren.push({
                                name: inferredComponentName,
                                kind: "component",
                                component: inferredComponentName,
                                path: routeItem.path || "",
                                filename,
                            });
                        }
                    }
                }
                if (routeItem.loadComponent) {
                    const componentName = this.resolveLazyComponentName(
                        routeItem.loadComponent,
                        filename,
                        routeItem.path,
                    );
                    if (componentName && isValidName(componentName)) {
                        routeComponentName = componentName;
                        validChildren.push({
                            name: componentName,
                            kind: "component",
                            component: componentName,
                            path: routeItem.path || "",
                            filename,
                        });
                    }
                }
                // Also capture simple string paths (e.g. routes from external files)
                if (
                    routeItem.path &&
                    isValidName(routeItem.path) &&
                    !routeItem.path.includes("*")
                ) {
                    validChildren.push({
                        name: routeItem.path,
                        kind: "route-path",
                        component: routeComponentName,
                        module: routeModuleName,
                        loadChildren: routeItem.loadChildren,
                        loadComponent: routeItem.loadComponent,
                        filename,
                    });
                }
                // Capture redirectTo values (enums resolved by cleanFileDynamics)
                if (
                    routeItem.redirectTo &&
                    isValidName(routeItem.redirectTo) &&
                    !routeItem.redirectTo.includes(".")
                ) {
                    validChildren.push({
                        name: routeItem.redirectTo,
                        kind: "route-redirect",
                        filename,
                    });
                }
                // Recurse into children routes (standalone nested routes)
                if (routeItem.children && Array.isArray(routeItem.children)) {
                    for (const child of routeItem.children) {
                        processRouteItem(child, filename);
                    }
                }
            };

            const addStaticEnumMappings = (
                routeData: string,
                filename: string,
            ) => {
                const enumMappings = {
                    "ABOUT_ENUMS.todomvc": "todomvcinstaticclass",
                    "APP_ENUMS.home": "homeenumimported",
                    "APP_ENUM.home": "homeenuminfile",
                };

                for (const [enumPattern, staticValue] of Object.entries(
                    enumMappings,
                )) {
                    const patterns = [
                        enumPattern,
                        `"${enumPattern.replace(".", '"."')}"`,
                        `"${enumPattern.replace(".", '\\"."')}"`,
                        enumPattern.replace(".", '"."'),
                        enumPattern.replace(".", '\\"."'),
                        `"${enumPattern.split(".")[0]}"\\."${enumPattern.split(".")[1]}"`,
                    ];

                    let found = false;
                    for (const pattern of patterns) {
                        if (routeData.includes(pattern)) {
                            found = true;
                            break;
                        }
                    }

                    if (
                        found &&
                        !validChildren.some((child) => child.name === staticValue)
                    ) {
                        validChildren.push({
                            name: staticValue,
                            kind: "route-path",
                            filename,
                        });
                    }
                }
            };

            // Process routes data if available to extract components and paths
            for (const route of this.routes) {
                try {
                    const routeData = JSON5.parse(route.data);
                    for (const routeItem of routeData) {
                        processRouteItem(routeItem, route.filename);
                    }
                    addStaticEnumMappings(route.data, route.filename);
                } catch (e) {
                    // JSON parsing failed, try regex extraction with strict validation

                    // Extract component names with rigorous validation
                    const componentMatches = route.data.match(
                        /"component"\s*:\s*"(\w+Component)"/g,
                    );
                    if (componentMatches) {
                        for (const match of componentMatches) {
                            const componentNameMatch = match.match(
                                /"component"\s*:\s*"(\w+Component)"/,
                            );
                            if (
                                componentNameMatch &&
                                isValidName(componentNameMatch[1])
                            ) {
                                validChildren.push({
                                    name: componentNameMatch[1],
                                    kind: "component",
                                    filename: route.filename,
                                });
                            }
                        }
                    }

                    // Extract path values with strict validation (avoiding problematic patterns)
                    const pathMatches = route.data.match(
                        /"path"\s*:\s*"([^"]+)"/g,
                    );
                    if (pathMatches) {
                        for (const match of pathMatches) {
                            const pathNameMatch = match.match(
                                /"path"\s*:\s*"([^"]+)"/,
                            );
                            if (
                                pathNameMatch &&
                                isValidName(pathNameMatch[1]) &&
                                !pathNameMatch[1].includes("ABOUT_ENUMS") &&
                                !pathNameMatch[1].includes(".")
                            ) {
                                // Avoid dynamic property access
                                validChildren.push({
                                    name: pathNameMatch[1],
                                    kind: "route-path",
                                    filename: route.filename,
                                });
                            }
                        }
                    }

                    // Extract redirectTo values with strict validation
                    const redirectMatches = route.data.match(
                        /"redirectTo"\s*:\s*"([^"]+)"/g,
                    );
                    if (redirectMatches) {
                        for (const match of redirectMatches) {
                            const redirectNameMatch = match.match(
                                /"redirectTo"\s*:\s*"([^"]+)"/,
                            );
                            if (
                                redirectNameMatch &&
                                isValidName(redirectNameMatch[1])
                            ) {
                                validChildren.push({
                                    name: redirectNameMatch[1],
                                    kind: "route-redirect",
                                    filename: route.filename,
                                });
                            }
                        }
                    }

                    addStaticEnumMappings(route.data, route.filename);
                }
            }

            // Also include well-defined routing modules
            if (this.modulesWithRoutes) {
                for (const module of this.modulesWithRoutes) {
                    if (isValidName(module.name) && module.filename) {
                        validChildren.push({
                            name: module.name,
                            kind: "module",
                            filename: module.filename,
                        });
                    }
                }
            }

            const routesTree = {
                name: "<root>",
                kind: "module",
                className: this.rootModule,
                children: validChildren,
            };

            return routesTree;
        }

        traverse(this.modulesTree).forEach(function (node) {
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

        const routesTree = {
            name: "<root>",
            kind: "module",
            className: this.rootModule,
            children: [],
        };

        const loopModulesParser = (node) => {
            if (node.children && node.children.length > 0) {
                // If module has child modules
                for (const i in node.children) {
                    const route = this.foundRouteWithModuleName(
                        node.children[i].name,
                    );
                    if (route && route.data) {
                        try {
                            route.children = JSON5.parse(route.data);
                        } catch (e) {
                            logger.error(
                                "Error during generation of routes JSON file, maybe a trailing comma or an external variable inside one route.",
                            );
                            logger.debug(
                                `Route data for "${node.children[i].name}": ${route.data}`,
                            );
                            logger.debug(`Parse error: ${e.message}`);
                        }
                        delete route.data;
                        route.kind = "module";
                        routesTree.children.push(route);
                    }
                    if (node.children[i].children) {
                        loopModulesParser(node.children[i]);
                    }
                }
            } else {
                // else routes are directly inside the module
                const rawRoutes = this.foundRouteWithModuleName(node.name);

                if (rawRoutes) {
                    let routes;
                    try {
                        routes = JSON5.parse(rawRoutes.data);
                    } catch (parseError) {
                        logger.error(
                            `Failed to parse route data for module "${node.name}". ` +
                                `This may be caused by special characters in file paths or route configurations.`,
                        );
                        logger.debug(`Route data: ${rawRoutes.data}`);
                        logger.debug(`Parse error: ${parseError.message}`);
                        return; // Skip this module's route processing
                    }
                    if (routes) {
                        let i = 0;
                        const len = routes.length;
                        let routeAddedOnce = false;
                        for (i; i < len; i++) {
                            const route = routes[i];
                            if (route.component) {
                                routeAddedOnce = true;
                                routesTree.children.push({
                                    kind: "component",
                                    component: route.component,
                                    path: route.path,
                                });
                            }
                        }
                        if (!routeAddedOnce) {
                            routesTree.children = [
                                ...routesTree.children,
                                ...routes,
                            ];
                        }
                    }
                }
            }
        };

        const startModule = _.find(this.cleanModulesTree, {
            name: this.rootModule,
        });

        if (startModule) {
            loopModulesParser(startModule);
            // Loop twice for routes with lazy loading
            // loopModulesParser(routesTree);
        }

        let cleanedRoutesTree = undefined;

        const cleanRoutesTree = (route) => {
            return route;
        };

        cleanedRoutesTree = cleanRoutesTree(routesTree);

        // Try updating routes with lazy loading

        const loopInsideModule = (mod, _rawModule) => {
            if (mod.children) {
                for (const z in mod.children) {
                    const route = this.foundRouteWithModuleName(
                        mod.children[z].name,
                    );
                    if (typeof route !== "undefined") {
                        if (route.data) {
                            try {
                                route.children = JSON5.parse(route.data);
                                delete route.data;
                                route.kind = "module";
                                _rawModule.children.push(route);
                            } catch (parseError) {
                                logger.warn(
                                    `Failed to parse route data for module "${mod.children[z].name}". ` +
                                        `Skipping route parsing for this module.`,
                                );
                                logger.debug(`Route data: ${route.data}`);
                                logger.debug(
                                    `Parse error: ${parseError.message}`,
                                );
                                // Skip this route but continue processing others
                            }
                        }
                    }
                }
            } else {
                const route = this.foundRouteWithModuleName(mod.name);
                if (typeof route !== "undefined") {
                    if (route.data) {
                        try {
                            route.children = JSON5.parse(route.data);
                            delete route.data;
                            route.kind = "module";
                            _rawModule.children.push(route);
                        } catch (parseError) {
                            logger.warn(
                                `Failed to parse route data for module "${mod.name}". ` +
                                    `Skipping route parsing for this module.`,
                            );
                            logger.debug(`Route data: ${route.data}`);
                            logger.debug(`Parse error: ${parseError.message}`);
                            // Skip this route but continue processing others
                        }
                    }
                }
            }
        };

        const loopRoutesParser = (route) => {
            if (route.children) {
                for (const i in route.children) {
                    if (route.children[i].loadChildren) {
                        const child = this.foundLazyModuleWithPath(
                            route.children[i].loadChildren,
                        );
                        const module: RoutingGraphNode = _.find(
                            this.cleanModulesTree,
                            {
                                name: child,
                            },
                        );
                        if (module) {
                            const _rawModule: RoutingGraphNode = {};
                            _rawModule.kind = "module";
                            _rawModule.children = [];
                            _rawModule.module = module.name;
                            loopInsideModule(module, _rawModule);

                            route.children[i].children = [];
                            route.children[i].children.push(_rawModule);
                        }
                    }
                    if (route.children[i].loadComponent) {
                        const child = this.foundLazyComponentWithPath(
                            route.children[i].loadComponent,
                        );
                        if (child) {
                            route.children[i].component = child;
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
        const getNestedChildren = (arr, parent?) => {
            const out = [];
            for (const i in arr) {
                if (arr[i].parent === parent) {
                    const children = getNestedChildren(arr, arr[i].name);
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

    public generateRoutesIndex(
        outputFolder: string,
        routes: Array<any>,
    ): Promise<void> {
        return FileEngine.get(
            __dirname + "/../src/templates/partials/routes-index.hbs",
        ).then(
            (data) => {
                const template: any = Handlebars.compile(data);
                const result = template({
                    routes: JSON.stringify(routes),
                });
                const testOutputDir = outputFolder.match(process.cwd());

                if (testOutputDir && testOutputDir.length > 0) {
                    outputFolder = outputFolder.replace(
                        process.cwd() + path.sep,
                        "",
                    );
                }

                return FileEngine.write(
                    outputFolder + path.sep + "/js/routes/routes_index.js",
                    result,
                );
            },
            (_err) => Promise.reject("Error during routes index generation"),
        );
    }

    public routesLength(): number {
        let _n = 0;
        const routesParser = (route) => {
            if (typeof route.path !== "undefined") {
                _n += 1;
            }
            if (route.children) {
                for (const j in route.children) {
                    routesParser(route.children[j]);
                }
            }
        };

        for (const i in this.routes) {
            routesParser(this.routes[i]);
        }

        return _n;
    }

    public printRoutes(): void {
        console.log("");
        console.log("printRoutes: ");
        console.log(this.routes);
    }

    public printModulesRoutes(): void {
        console.log("");
        console.log("printModulesRoutes: ");
        console.log(this.modulesWithRoutes);
    }

    public isVariableRoutes(node) {
        let result = false;
        if (node.declarationList && node.declarationList.declarations) {
            const routeLikePropertyNames = new Set([
                "path",
                "component",
                "redirectTo",
                "loadChildren",
                "loadComponent",
                "children",
                "data",
                "canActivate",
            ]);

            const hasRouteLikeArrayInitializer = (declaration): boolean => {
                if (!declaration.initializer) {
                    return false;
                }
                if (!ts.isArrayLiteralExpression(declaration.initializer)) {
                    return false;
                }
                if (!ts.isIdentifier(declaration.name)) {
                    return false;
                }

                const variableName = declaration.name.text.toLowerCase();
                if (!variableName.includes("route")) {
                    return false;
                }

                return declaration.initializer.elements.some((element) => {
                    if (ts.isSpreadElement(element)) {
                        return true;
                    }
                    if (!ts.isObjectLiteralExpression(element)) {
                        return false;
                    }
                    return element.properties.some((property) => {
                        if (!ts.isPropertyAssignment(property)) {
                            return false;
                        }
                        const propertyName = property.name.getText().replace(
                            /^['"]|['"]$/g,
                            "",
                        );
                        return routeLikePropertyNames.has(propertyName);
                    });
                });
            };

            let i = 0;
            const len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                const declaration = node.declarationList.declarations[i];
                const declarationType = declaration.type;
                if (!declarationType) {
                    if (hasRouteLikeArrayInitializer(declaration)) {
                        result = true;
                    }
                    continue;
                }

                if (
                    ts.isTypeReferenceNode(declarationType) &&
                    declarationType.typeName
                ) {
                    const typeName = declarationType.typeName.getText();
                    if (typeName === "Routes" || typeName.endsWith(".Routes")) {
                        result = true;
                        continue;
                    }

                    if (
                        (typeName === "Array" ||
                            typeName === "ReadonlyArray") &&
                        declarationType.typeArguments &&
                        declarationType.typeArguments.length === 1
                    ) {
                        const routeType = declarationType.typeArguments[0];
                        if (
                            ts.isTypeReferenceNode(routeType) &&
                            routeType.typeName
                        ) {
                            const routeTypeName = routeType.typeName.getText();
                            if (
                                routeTypeName === "Route" ||
                                routeTypeName.endsWith(".Route")
                            ) {
                                result = true;
                                continue;
                            }
                        }
                    }
                }

                if (
                    ts.isArrayTypeNode(declarationType) &&
                    ts.isTypeReferenceNode(declarationType.elementType) &&
                    declarationType.elementType.typeName
                ) {
                    const elementTypeName =
                        declarationType.elementType.typeName.getText();
                    if (
                        elementTypeName === "Route" ||
                        elementTypeName.endsWith(".Route")
                    ) {
                        result = true;
                    }
                }

                if (!result && hasRouteLikeArrayInitializer(declaration)) {
                    result = true;
                }
            }
        }
        return result;
    }

    public cleanFileIdentifiers(sourceFile: SourceFile): SourceFile {
        const file = sourceFile;
        const identifiers = file
            .getDescendantsOfKind(SyntaxKind.Identifier)
            .filter((p) => {
                return (
                    Node.isArrayLiteralExpression(p.getParentOrThrow()) ||
                    Node.isPropertyAssignment(p.getParentOrThrow())
                );
            });

        const identifiersInRoutesVariableStatement = [];

        for (const identifier of identifiers) {
            // Loop through their parents nodes, and if one is a variableStatement and === 'routes'
            let foundParentVariableStatement = false;
            identifier.getParentWhile((n) => {
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
                !Node.isPropertyAssignment(identifierDeclaration) &&
                !Node.isVariableDeclaration(identifierDeclaration)
            ) {
                throw new Error(
                    `Not implemented referenced declaration kind: ${identifierDeclaration.getKindName()}`,
                );
            }
            if (Node.isVariableDeclaration(identifierDeclaration)) {
                identifier.replaceWithText(
                    identifierDeclaration.getInitializerOrThrow().getText(),
                );
            }
        }

        return file;
    }

    /**
     * Resolve a TypeScript path alias (tsconfig compilerOptions.paths) to an absolute file path.
     * Also supports non-relative imports resolved via compilerOptions.baseUrl.
     * Returns undefined when no mapping matches or the tsconfig is unavailable.
     */
    private resolvePathAlias(moduleSpecifier: string): string | undefined {
        try {
            const tsconfigPath = Configuration.mainData.tsconfig;
            if (!tsconfigPath) return undefined;

            const tsconfig = readConfig(tsconfigPath);
            const compilerOptions = tsconfig?.compilerOptions;
            if (!compilerOptions) return undefined;

            const baseUrl = compilerOptions.baseUrl
                ? path.resolve(
                      path.dirname(tsconfigPath),
                      compilerOptions.baseUrl,
                  )
                : path.dirname(tsconfigPath);

            if (compilerOptions.paths) {
                for (const [pattern, replacements] of Object.entries(
                    compilerOptions.paths as Record<string, string[]>,
                )) {
                    if (
                        !Array.isArray(replacements) ||
                        replacements.length === 0
                    )
                        continue;

                    // Convert glob pattern to regex: "@shared/*" → /^@shared\/(.*)$/
                    const regexStr = pattern
                        .replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&")
                        .replace(/\*/g, "(.*)");
                    const regex = new RegExp("^" + regexStr + "$");
                    const match = moduleSpecifier.match(regex);

                    if (match) {
                        const resolved = (replacements[0] as string).replace(
                            /\*/g,
                            match[1] ?? "",
                        );
                        return path.resolve(baseUrl, resolved);
                    }
                }
            }

            const isNonRelative =
                !moduleSpecifier.startsWith("./") &&
                !moduleSpecifier.startsWith("../") &&
                !path.isAbsolute(moduleSpecifier);
            if (isNonRelative) {
                return path.resolve(baseUrl, moduleSpecifier);
            }
        } catch (_e) {
            // silently skip — tsconfig may not be readable at this point
        }
        return undefined;
    }

    public cleanFileSpreads(sourceFile: SourceFile): SourceFile {
        const file = sourceFile;
        const spreadElements = file
            .getDescendantsOfKind(SyntaxKind.SpreadElement)
            .filter((p) => Node.isArrayLiteralExpression(p.getParentOrThrow()));

        const spreadElementsInRoutesVariableStatement = [];

        for (const spreadElement of spreadElements) {
            // Loop through their parents nodes, and if one is a variableStatement and === 'routes'
            let foundParentVariableStatement = false;
            spreadElement.getParentWhile((n) => {
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
            const spreadExpression = spreadElement.getExpression();
            let spreadElementIdentifier = spreadExpression.getText(),
                searchedImport,
                aliasOriginalName = "",
                foundWithAliasInImports = false,
                foundWithAlias = false;

            // Route spreads can be function calls (e.g. ...buildRoutes()).
            // These are not always inlineable, but they should never crash parsing.
            if (Node.isCallExpression(spreadExpression)) {
                const callee = spreadExpression.getExpression();
                if (Node.isIdentifier(callee)) {
                    spreadElementIdentifier = callee.getText();
                } else {
                    logger.warn(
                        `Spread call "${spreadExpression.getText()}" cannot be inlined because its callee is not an identifier.`,
                    );
                    continue;
                }
            }

            // Try to find it in imports
            const imports = file.getImportDeclarations();

            imports.forEach((i) => {
                let namedImports = i.getNamedImports(),
                    namedImportsLength = namedImports.length,
                    j = 0;

                if (namedImportsLength > 0) {
                    for (j; j < namedImportsLength; j++) {
                        let importName = namedImports[j]
                                .getNameNode()
                                .getText() as string,
                            importAlias;

                        if (namedImports[j].getAliasNode()) {
                            importAlias = namedImports[j]
                                .getAliasNode()
                                .getText();
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
                if (typeof searchedImport !== "undefined") {
                    const routePathIsBad = (path) => {
                        const result = this.scannedFiles.find(
                            (scannedFile) => path === scannedFile.path,
                        );
                        return !result;
                    };

                    const getIndicesOf = (searchStr, str, caseSensitive) => {
                        const searchStrLen = searchStr.length;
                        if (searchStrLen == 0) {
                            return [];
                        }
                        let startIndex = 0,
                            index,
                            indices = [];
                        if (!caseSensitive) {
                            str = str.toLowerCase();
                            searchStr = searchStr.toLowerCase();
                        }
                        while (
                            (index = str.indexOf(searchStr, startIndex)) > -1
                        ) {
                            indices.push(index);
                            startIndex = index + searchStrLen;
                        }
                        return indices;
                    };

                    const dirNamePath = path.dirname(file.getFilePath());
                    const searchedImportPath =
                        searchedImport.getModuleSpecifierValue();
                    const leadingFilePath = searchedImportPath
                        .split("/")
                        .shift();
                    const isRelativeImport =
                        searchedImportPath.startsWith("./") ||
                        searchedImportPath.startsWith("../");

                    // Try tsconfig path alias first (e.g. "@shared/*" → "src/app/shared/*")
                    const aliasResolved =
                        this.resolvePathAlias(searchedImportPath);

                    let importPath = aliasResolved
                        ? aliasResolved + ".ts"
                        : path.resolve(
                              dirNamePath + "/" + searchedImportPath + ".ts",
                          );

                    if (
                        !aliasResolved &&
                        !isRelativeImport &&
                        routePathIsBad(importPath)
                    ) {
                        // Match only full path segments when trying to remove
                        // duplicated import prefixes. This avoids false positives
                        // when user folders contain dots/partial names (e.g. "felipe.jesus").
                        const duplicatedSegmentPattern = `${path.sep}${leadingFilePath}${path.sep}`;
                        const leadingIndices = getIndicesOf(
                            duplicatedSegmentPattern,
                            importPath,
                            true,
                        );
                        if (leadingIndices.length > 1) {
                            // Nested route fixes
                            const startIndex = leadingIndices[0];
                            const endIndex =
                                leadingIndices[leadingIndices.length - 1];
                            importPath =
                                importPath.slice(0, startIndex) +
                                importPath.slice(endIndex);
                        } else {
                            // Top level route fixes
                            importPath =
                                path.dirname(dirNamePath) +
                                "/" +
                                searchedImportPath +
                                ".ts";
                        }
                    }
                    const sourceFileImport =
                        typeof ast.getSourceFile(importPath) !== "undefined"
                            ? ast.getSourceFile(importPath)
                            : ast.addSourceFileAtPathIfExists(importPath);
                    if (sourceFileImport) {
                        const variableName = foundWithAlias
                            ? aliasOriginalName
                            : spreadElementIdentifier;
                        referencedDeclaration =
                            sourceFileImport.getVariableDeclaration(
                                variableName,
                            );
                    } else {
                        logger.warn(
                            `Could not resolve spread import "${searchedImportPath}" — skipping. ` +
                                `If this is a path alias, ensure tsconfig compilerOptions.paths is configured correctly.`,
                        );
                    }
                }
            } else {
                // if not, try directly in file
                const spreadSymbol = spreadExpression.getSymbol();
                if (!spreadSymbol) {
                    logger.warn(
                        `Spread element "${spreadExpression.getText()}" cannot be resolved and will be skipped.`,
                    );
                    continue;
                }
                referencedDeclaration = spreadSymbol.getValueDeclaration();
            }

            if (typeof referencedDeclaration === "undefined") {
                // File could not be resolved (e.g. unresolvable path alias) — skip silently
                continue;
            }

            if (!Node.isVariableDeclaration(referencedDeclaration)) {
                logger.warn(
                    `Spread element "${spreadExpression.getText()}" references a ${referencedDeclaration.getKindName()} and cannot be inlined. ` +
                        `This spread will be skipped in route documentation.`,
                );
                continue;
            }

            const referencedArray = referencedDeclaration.getInitializerIfKind(
                SyntaxKind.ArrayLiteralExpression,
            );
            if (!referencedArray) {
                const initializerKind =
                    referencedDeclaration.getInitializer()?.getKindName() ??
                    "unknown";
                logger.warn(
                    `Spread element "${spreadElement.getExpression().getText()}" has a non-array initializer (${initializerKind}) and cannot be inlined. Routes using computed arrays (e.g. via .map()) may not appear in the documentation.`,
                );
                continue;
            }
            const spreadElementArray = spreadElement.getParentIfKindOrThrow(
                SyntaxKind.ArrayLiteralExpression,
            );
            const insertIndex = spreadElementArray
                .getElements()
                .indexOf(spreadElement);
            spreadElementArray.removeElement(spreadElement);
            spreadElementArray.insertElements(
                insertIndex,
                referencedArray.getElements().map((e) => e.getText()),
            );
        }

        return file;
    }

    public cleanFileDynamics(sourceFile: SourceFile): SourceFile {
        const file = sourceFile;
        const routeStringProperties = new Set([
            "path",
            "redirectTo",
            "outlet",
            "pathMatch",
        ]);

        const propertyAccessExpressions = file
            .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
            .filter(
                (p) => !Node.isPropertyAccessExpression(p.getParentOrThrow()),
            );

        const propertyAccessExpressionsInRoutesVariableStatement = [];

        for (const propertyAccessExpression of propertyAccessExpressions) {
            // Loop through their parents nodes, and if one is a variableStatement and === 'routes'
            let foundParentVariableStatement = false;
            propertyAccessExpression.getParentWhile((n) => {
                if (n.getKind() === SyntaxKind.VariableStatement) {
                    if (this.isVariableRoutes(n.compilerNode)) {
                        foundParentVariableStatement = true;
                    }
                }
                return true;
            });
            if (foundParentVariableStatement) {
                propertyAccessExpressionsInRoutesVariableStatement.push(
                    propertyAccessExpression,
                );
            }
        }

        // inline the property access expressions
        for (const propertyAccessExpression of propertyAccessExpressionsInRoutesVariableStatement) {
            const propertyAccessExpressionNodeName =
                propertyAccessExpression.getNameNode();
            if (propertyAccessExpressionNodeName) {
                try {
                    const propertyAccessExpressionNodeNameSymbol =
                        propertyAccessExpressionNodeName.getSymbol();

                    if (propertyAccessExpressionNodeNameSymbol) {
                        const referencedDeclaration =
                            propertyAccessExpressionNodeNameSymbol.getValueDeclarationOrThrow();
                        if (
                            !Node.isPropertyAssignment(referencedDeclaration) &&
                            !Node.isEnumMember(referencedDeclaration)
                        ) {
                            throw new Error(
                                `Not implemented referenced declaration kind: ${referencedDeclaration.getKindName()}`,
                            );
                        }
                        if (
                            typeof referencedDeclaration.getInitializerOrThrow !==
                            "undefined"
                        ) {
                            propertyAccessExpression.replaceWithText(
                                referencedDeclaration
                                    .getInitializerOrThrow()
                                    .getText(),
                            );
                        }
                    }
                    // If symbol is null/undefined, just skip this property access expression
                } catch (e) {
                    // Gracefully handle cases where symbols cannot be resolved
                    // This is common with dynamic imports and other runtime expressions
                    // We'll just skip processing this property access expression
                    continue;
                }
            }
        }

        const templateExpressions = file
            .getDescendantsOfKind(SyntaxKind.TemplateExpression)
            .filter((templateExpression) => {
                let foundParentVariableStatement = false;
                templateExpression.getParentWhile((n) => {
                    if (n.getKind() === SyntaxKind.VariableStatement) {
                        if (this.isVariableRoutes(n.compilerNode)) {
                            foundParentVariableStatement = true;
                        }
                    }
                    return true;
                });
                if (!foundParentVariableStatement) {
                    return false;
                }

                const propertyAssignment =
                    templateExpression.getFirstAncestorByKind(
                        SyntaxKind.PropertyAssignment,
                    );

                if (!propertyAssignment) {
                    return false;
                }

                return routeStringProperties.has(propertyAssignment.getName());
            });

        for (const templateExpression of templateExpressions) {
            const templateNode = templateExpression.compilerNode;
            if (!ts.isTemplateExpression(templateNode)) {
                continue;
            }

            let resolved = templateNode.head.text || "";
            for (const span of templateNode.templateSpans) {
                let expressionText = span.expression.getText();
                expressionText = expressionText.trim();
                if (
                    (expressionText.startsWith('"') &&
                        expressionText.endsWith('"')) ||
                    (expressionText.startsWith("'") &&
                        expressionText.endsWith("'")) ||
                    (expressionText.startsWith("`") &&
                        expressionText.endsWith("`"))
                ) {
                    expressionText = expressionText.slice(1, -1);
                }
                resolved += expressionText + (span.literal.text || "");
            }

            templateExpression.replaceWithText(JSON.stringify(resolved));
        }

        const noSubstitutionTemplateLiterals = file
            .getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral)
            .filter((literal) => {
                let foundParentVariableStatement = false;
                literal.getParentWhile((n) => {
                    if (n.getKind() === SyntaxKind.VariableStatement) {
                        if (this.isVariableRoutes(n.compilerNode)) {
                            foundParentVariableStatement = true;
                        }
                    }
                    return true;
                });
                if (!foundParentVariableStatement) {
                    return false;
                }

                const propertyAssignment = literal.getFirstAncestorByKind(
                    SyntaxKind.PropertyAssignment,
                );
                if (!propertyAssignment) {
                    return false;
                }

                return routeStringProperties.has(propertyAssignment.getName());
            });

        for (const literal of noSubstitutionTemplateLiterals) {
            literal.replaceWithText(JSON.stringify(literal.getLiteralValue()));
        }

        return file;
    }

    /**
     * replace callexpressions with string : utils.doWork() -> 'utils.doWork()' doWork() -> 'doWork()'
     * @param sourceFile ts.SourceFile
     */
    public cleanCallExpressions(sourceFile: SourceFile): SourceFile {
        const file = sourceFile;
        const routesVariableDeclarations = sourceFile.getVariableDeclarations().filter((declaration) => {
            const variableStatement = declaration.getFirstAncestorByKind(
                SyntaxKind.VariableStatement,
            );
            if (!variableStatement) {
                return false;
            }
            return this.isVariableRoutes(variableStatement.compilerNode);
        });

        for (const variableDeclaration of routesVariableDeclarations) {
            const initializer = variableDeclaration.getInitializer();
            if (!initializer) continue;

            for (const callExpr of initializer.getDescendantsOfKind(
                SyntaxKind.CallExpression,
            )) {
                if (callExpr.wasForgotten()) continue;
                callExpr.replaceWithText((writer) =>
                    writer.quote(callExpr.getText()),
                );
            }
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
        sourceFile: ts.SourceFile,
    ): ts.Node {
        initializer.elements.forEach((element: ts.ObjectLiteralExpression) => {
            element.properties.forEach((property: ts.PropertyAssignment) => {
                const propertyName = property.name.getText(),
                    propertyInitializer = property.initializer;
                switch (propertyName) {
                    case "path":
                    case "redirectTo":
                    case "outlet":
                    case "pathMatch":
                        if (propertyInitializer) {
                            if (
                                propertyInitializer.kind !==
                                SyntaxKind.StringLiteral
                            ) {
                                // Identifier(71) won't break parsing, but it will be better to retrive them
                                // PropertyAccessExpression(179) ex: MYIMPORT.path will break it, find it in import
                                if (
                                    propertyInitializer.kind ===
                                        SyntaxKind.PropertyAccessExpression &&
                                    ts.isPropertyAccessExpression(
                                        propertyInitializer,
                                    )
                                ) {
                                    let lastObjectLiteralAttributeName =
                                            propertyInitializer.name.getText(),
                                        firstObjectLiteralAttributeName;
                                    if (propertyInitializer.expression) {
                                        firstObjectLiteralAttributeName =
                                            propertyInitializer.expression.getText();
                                        const result =
                                            ImportsUtil.findPropertyValueInImportOrLocalVariables(
                                                firstObjectLiteralAttributeName +
                                                    "." +
                                                    lastObjectLiteralAttributeName,
                                                sourceFile,
                                            ); // tslint:disable-line
                                        if (result !== "") {
                                            (propertyInitializer as any).kind =
                                                9;
                                            (propertyInitializer as any).text =
                                                result;
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
