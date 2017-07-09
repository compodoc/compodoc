import * as path from 'path';

import { LinkParser } from './link-parser';

import { AngularLifecycleHooks } from './angular-lifecycles-hooks';

const ts = require('typescript'),
      getCurrentDirectory = ts.sys.getCurrentDirectory,
      useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames,
      newLine = ts.sys.newLine,
      marked = require('marked'),
      _ = require('lodash');

export function getNewLine(): string {
    return newLine;
}

export function getCanonicalFileName(fileName: string): string {
    return useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
}

export const formatDiagnosticsHost: ts.FormatDiagnosticsHost = {
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
    let result = ts.readConfigFile(configFile, ts.sys.readFile);
    if (result.error) {
        let message = ts.formatDiagnostics([result.error], formatDiagnosticsHost);
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
