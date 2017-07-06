import * as path from 'path';

import { LinkParser } from './link-parser';

import { readConfigFile, formatDiagnostics, FormatDiagnosticsHost, sys } from 'typescript';
import { AngularLifecycleHooks } from './angular-lifecycles-hooks';

const getCurrentDirectory = sys.getCurrentDirectory,
      useCaseSensitiveFileNames = sys.useCaseSensitiveFileNames,
      newLine = sys.newLine,
      marked = require('marked'),
      _ = require('lodash');

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
}

export function markedtags(tags) {
    var mtags = tags;
    _.forEach(mtags, (tag) => {
        tag.comment = marked(LinkParser.resolveLinks(tag.comment));
    });
    return mtags;
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

export function hasBom(source: string): boolean {
    return (source.charCodeAt(0) === 0xFEFF);
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

export function cleanLifecycleHooksFromMethods(methods) {
    var result = [],
        i = 0,
        len = methods.length;

    for(i; i<len; i++) {
        if (!methods[i].name in AngularLifecycleHooks) {
            console.log('clean');
            result.push(methods[i]);
        }
    }

    return result;
}
