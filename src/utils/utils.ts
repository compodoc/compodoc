import * as path from 'path';
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

export function stripBom(source: string): string {
    if (source.charCodeAt(0) === 0xFEFF) {
		return source.slice(1);
	}
	return source;
}

export function handlePath(files: string[], cwd: string): string[] {
    let _files = files,
        i = 0,
        len = files.length;

    for(i; i<len; i++) {
        if (files[i].indexOf(cwd) === -1) {
            files[i] = path.resolve(cwd + path.sep + files[i]);
        }
    }

    return _files;
}
