import { ts } from 'ts-morph';

const getCurrentDirectory = ts.sys.getCurrentDirectory;
const useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;
const newLine = ts.sys.newLine;

export function getNewLine(): string {
    return newLine;
}

export function cleanNameWithoutSpaceAndToLowerCase(name: string): string {
    return name.toLowerCase().replace(/ /g, '-');
}

export function getCanonicalFileName(fileName: string): string {
    return useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
}

export const formatDiagnosticsHost: ts.FormatDiagnosticsHost = {
    getCurrentDirectory,
    getCanonicalFileName,
    getNewLine
};

/**
 * Read and parse tsconfig file with tsc APIs
 */
export function readTsconfigFile(tsconfigFile: string): any {
    let result = ts.readConfigFile(tsconfigFile, ts.sys.readFile);
    if (result.error) {
        let message = ts.formatDiagnostics([result.error], formatDiagnosticsHost);
        throw new Error(message);
    }
    return result.config;
}
