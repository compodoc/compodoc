import { readConfigFile, formatDiagnostics, FormatDiagnosticsHost, sys } from 'typescript';

const getCurrentDirectory = sys.getCurrentDirectory;
const useCaseSensitiveFileNames = sys.useCaseSensitiveFileNames;
const newLine = sys.newLine;

export function getNewLine(): string {
    return newLine;
}

export function getCanonicalFileName(fileName: string): string {
    return useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
}

export const formatDiagnosticsHost: FormatDiagnosticsHost = {
    getCurrentDirectory,
    getCanonicalFileName,
    getNewLine
};

export function readConfig(configFile: string): any {
    let result = readConfigFile(configFile, sys.readFile);
    if (result.error) {
        let message = formatDiagnostics([result.error], formatDiagnosticsHost);
        throw new Error(message);
    }
    return result.config;
};
