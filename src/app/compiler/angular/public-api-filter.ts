import * as path from 'node:path';

import { logger } from '../../../utils/logger';

export interface PublicApiConfiguration {
    publicApiOnly: string;
    publicApiExports: Map<string, Set<string>>;
}

export class PublicApiFilter {
    private readonly allowedSymbols = new Set<string>();
    private readonly allowedFiles = new Set<string>();

    constructor(private readonly configuration: PublicApiConfiguration) {
        this.initialize();
    }

    public isSymbolAllowed(symbolName: string, fileName: string): boolean {
        if (!this.configuration.publicApiOnly) {
            return true;
        }

        if (this.allowedSymbols.size === 0) {
            return true;
        }

        const resolvedFileName = path.resolve(fileName);

        if (this.allowedSymbols.has(symbolName)) {
            const allowedSourceFiles = this.configuration.publicApiExports.get(symbolName);
            return Boolean(allowedSourceFiles?.has(resolvedFileName));
        }

        return false;
    }

    public isDependencyOfAllowedSymbol(fileName: string): boolean {
        if (!this.configuration.publicApiOnly) {
            return true;
        }

        return this.allowedFiles.has(path.resolve(fileName));
    }

    private initialize(): void {
        if (!this.configuration.publicApiOnly || this.configuration.publicApiExports.size === 0) {
            return;
        }

        logger.info('Public API filtering enabled');

        for (const [symbolName, sourceFiles] of this.configuration.publicApiExports) {
            this.allowedSymbols.add(symbolName);
            for (const sourceFile of sourceFiles) {
                this.allowedFiles.add(path.resolve(sourceFile));
            }
        }

        logger.info(
            `Allowed ${this.allowedSymbols.size} public API symbol(s) from ${this.allowedFiles.size} file(s)`
        );
    }
}
