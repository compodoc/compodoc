import * as fs from 'fs-extra';
import * as path from 'path';
import { ts } from 'ts-morph';
import { logger } from './logger';

const { glob } = require('tinyglobby');

/**
 * Result of parsing public API exports
 */
export interface PublicApiExports {
    // Map of symbol name to the source declaration file paths where it's exported
    symbolToFiles: Map<string, Set<string>>;
    // Set of all index.d.ts files found
    indexFiles: Set<string>;
}

/**
 * Utility class for parsing index.d.ts files to extract public API exports
 */
export class PublicApiParser {
    private distPath: string;
    private symbolToFiles: Map<string, Set<string>>;
    private indexFiles: Set<string>;
    private processedFiles: Set<string>;

    constructor(distPath: string) {
        this.distPath = path.resolve(distPath);
        this.symbolToFiles = new Map<string, Set<string>>();
        this.indexFiles = new Set<string>();
        this.processedFiles = new Set<string>();
    }

    /**
     * Parse all index.d.ts files in the dist folder and extract exported symbols
     */
    public async parseIndexFiles(): Promise<PublicApiExports> {
        logger.info(`Scanning for index.d.ts files in ${this.distPath}`);

        if (!fs.existsSync(this.distPath)) {
            logger.error(`Public API dist path does not exist: ${this.distPath}`);
            return {
                symbolToFiles: this.symbolToFiles,
                indexFiles: this.indexFiles
            };
        }

        // Find all index.d.ts files recursively
        const pattern = path.join(this.distPath, '**/index.d.ts');
        const indexFiles = await glob(pattern, {
            absolute: true,
            ignore: ['**/node_modules/**']
        });

        logger.info(`Found ${indexFiles.length} index.d.ts file(s)`);

        // Process each index.d.ts file
        for (const indexFile of indexFiles) {
            this.indexFiles.add(indexFile);
            await this.parseIndexFile(indexFile);
        }

        logger.info(`Extracted ${this.symbolToFiles.size} public API symbol(s)`);

        return {
            symbolToFiles: this.symbolToFiles,
            indexFiles: this.indexFiles
        };
    }

    /**
     * Parse a single index.d.ts file and extract its exports
     */
    private async parseIndexFile(indexFilePath: string): Promise<void> {
        if (this.processedFiles.has(indexFilePath)) {
            return; // Avoid circular dependencies
        }
        this.processedFiles.add(indexFilePath);

        logger.debug(`Parsing index file: ${indexFilePath}`);

        const sourceText = fs.readFileSync(indexFilePath, 'utf-8');
        const sourceFile = ts.createSourceFile(
            indexFilePath,
            sourceText,
            ts.ScriptTarget.Latest,
            true
        );

        // Process all top-level statements in the file
        for (const statement of sourceFile.statements) {
            await this.processStatement(statement, indexFilePath);
        }
    }

    /**
     * Process a TypeScript statement to extract exports
     */
    private async processStatement(statement: ts.Node, sourceFilePath: string): Promise<void> {
        // Handle: export { Foo, Bar } from './module'
        // Handle: export { Foo }
        if (ts.isExportDeclaration(statement)) {
            await this.processExportDeclaration(statement, sourceFilePath);
        }
        // Handle: export class Foo {}
        // Handle: export interface Bar {}
        // Handle: export const baz = ...
        else if (this.hasExportModifier(statement)) {
            this.processDirectExport(statement, sourceFilePath);
        }
        // Handle: export default Foo
        else if (ts.isExportAssignment(statement)) {
            this.processExportAssignment(statement, sourceFilePath);
        }
    }

    /**
     * Process export declarations like: export { Foo, Bar } from './module'
     */
    private async processExportDeclaration(
        statement: ts.ExportDeclaration,
        sourceFilePath: string
    ): Promise<void> {
        const exportClause = statement.exportClause;

        // Handle: export * from './module'
        if (!exportClause && statement.moduleSpecifier) {
            await this.processReExportAll(statement, sourceFilePath);
            return;
        }

        // Handle: export * as namespace from './module'
        if (exportClause && ts.isNamespaceExport(exportClause)) {
            // We track the namespace name as an exported symbol
            const namespaceName = exportClause.name.text;
            this.addSymbol(namespaceName, sourceFilePath);
            return;
        }

        // Handle: export { Foo, Bar } or export { Foo, Bar } from './module'
        if (exportClause && ts.isNamedExports(exportClause)) {
            const elements = exportClause.elements;

            for (const element of elements) {
                const exportedName = element.name.text;

                // If there's a module specifier, resolve the re-export
                if (statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
                    const modulePath = statement.moduleSpecifier.text;
                    await this.resolveReExport(exportedName, modulePath, sourceFilePath);
                } else {
                    // Direct export from this file
                    this.addSymbol(exportedName, sourceFilePath);
                }
            }
        }
    }

    /**
     * Process direct exports like: export class Foo {}
     */
    private processDirectExport(statement: ts.Node, sourceFilePath: string): void {
        let symbolName: string | undefined;

        if (ts.isClassDeclaration(statement) && statement.name) {
            symbolName = statement.name.text;
        } else if (ts.isInterfaceDeclaration(statement) && statement.name) {
            symbolName = statement.name.text;
        } else if (ts.isFunctionDeclaration(statement) && statement.name) {
            symbolName = statement.name.text;
        } else if (ts.isVariableStatement(statement)) {
            // Handle: export const foo = ...
            for (const declaration of statement.declarationList.declarations) {
                if (ts.isIdentifier(declaration.name)) {
                    symbolName = declaration.name.text;
                    this.addSymbol(symbolName, sourceFilePath);
                }
            }
            return;
        } else if (ts.isTypeAliasDeclaration(statement) && statement.name) {
            symbolName = statement.name.text;
        } else if (ts.isEnumDeclaration(statement) && statement.name) {
            symbolName = statement.name.text;
        }

        if (symbolName) {
            this.addSymbol(symbolName, sourceFilePath);
        }
    }

    /**
     * Process export assignments: export default Foo
     */
    private processExportAssignment(
        statement: ts.ExportAssignment,
        sourceFilePath: string
    ): void {
        // Track default exports with a special marker
        this.addSymbol('default', sourceFilePath);

        // If the default export is an identifier, also track that symbol
        if (ts.isIdentifier(statement.expression)) {
            const symbolName = statement.expression.text;
            this.addSymbol(symbolName, sourceFilePath);
        }
    }

    /**
     * Process re-export all: export * from './module'
     */
    private async processReExportAll(
        statement: ts.ExportDeclaration,
        sourceFilePath: string
    ): Promise<void> {
        if (!statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) {
            return;
        }

        const modulePath = statement.moduleSpecifier.text;
        const resolvedPath = this.resolveModulePath(modulePath, sourceFilePath);

        if (resolvedPath && fs.existsSync(resolvedPath)) {
            // Parse the re-exported file to get its exports
            await this.parseIndexFile(resolvedPath);
        }
    }

    /**
     * Resolve a re-exported symbol to its declaration file
     * 
     * Note: We intentionally do NOT parse the resolved file as an index file.
     * Only symbols explicitly re-exported via `export { X } from './module'` in an
     * index.d.ts should be considered part of the public API. Direct exports from
     * module files (like `export const API_ROOT`) should not be included unless
     * they are explicitly re-exported.
     */
    private async resolveReExport(
        symbolName: string,
        modulePath: string,
        sourceFilePath: string
    ): Promise<void> {
        const resolvedPath = this.resolveModulePath(modulePath, sourceFilePath);

        if (resolvedPath && fs.existsSync(resolvedPath)) {
            // The symbol is exported from the resolved declaration file
            this.addSymbol(symbolName, resolvedPath);
            // Do NOT parse the resolved file - only track the specific symbol being re-exported
        } else {
            // Could not resolve, assume it's from the current file
            this.addSymbol(symbolName, sourceFilePath);
        }
    }

    /**
     * Resolve a module path to an absolute .d.ts file path
     */
    private resolveModulePath(modulePath: string, fromFile: string): string | null {
        const baseDir = path.dirname(fromFile);

        // Try with .d.ts extension
        let resolvedPath = path.resolve(baseDir, modulePath + '.d.ts');
        if (fs.existsSync(resolvedPath)) {
            return resolvedPath;
        }

        // Try the path as-is (might already have extension)
        resolvedPath = path.resolve(baseDir, modulePath);
        if (fs.existsSync(resolvedPath)) {
            return resolvedPath;
        }

        // Try with /index.d.ts
        resolvedPath = path.resolve(baseDir, modulePath, 'index.d.ts');
        if (fs.existsSync(resolvedPath)) {
            return resolvedPath;
        }

        logger.debug(`Could not resolve module: ${modulePath} from ${fromFile}`);
        return null;
    }

    /**
     * Check if a statement has an export modifier
     */
    private hasExportModifier(node: ts.Node): boolean {
        const modifiers = (node as any).modifiers;
        if (!modifiers) {
            return false;
        }

        return modifiers.some(
            (modifier: ts.Modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
        );
    }

    /**
     * Add a symbol to the tracking map
     */
    private addSymbol(symbolName: string, declarationFile: string): void {
        if (!this.symbolToFiles.has(symbolName)) {
            this.symbolToFiles.set(symbolName, new Set<string>());
        }
        this.symbolToFiles.get(symbolName)!.add(declarationFile);
        logger.debug(`Tracked public API symbol: ${symbolName} from ${declarationFile}`);
    }
}

/**
 * Parse public API exports from index.d.ts files in the dist folder
 */
export async function parsePublicApi(distPath: string): Promise<PublicApiExports> {
    const parser = new PublicApiParser(distPath);
    return await parser.parseIndexFiles();
}
