import * as path from 'path';
import * as fs from 'fs-extra';
import * as ts from 'typescript';
import * as _ from 'lodash';

import { LinkParser } from './link-parser';

import { AngularLifecycleHooks } from './angular-lifecycles-hooks';

const getCurrentDirectory = ts.sys.getCurrentDirectory;
const useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;
const newLine = ts.sys.newLine;
const marked = require('marked');

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
};

export function markedtags(tags: Array<any>) {
    let mtags = tags;
    _.forEach(mtags, (tag) => {
        tag.comment = marked(LinkParser.resolveLinks(tag.comment));
    });
    return mtags;
}

export function mergeTagsAndArgs(args: Array<any>, jsdoctags?: Array<any>): Array<any> {
    let margs = _.cloneDeep(args);
    _.forEach(margs, (arg) => {
        arg.tagName = {
            text: 'param'
        };
        if (jsdoctags) {
            _.forEach(jsdoctags, (jsdoctag) => {
                if (jsdoctag.name && jsdoctag.name.text === arg.name) {
                    arg.tagName = jsdoctag.tagName;
                    arg.name = jsdoctag.name;
                    arg.comment = jsdoctag.comment;
                    arg.typeExpression = jsdoctag.typeExpression;
                }
            });
        }
    });
    // Add example & returns
    if (jsdoctags) {
        _.forEach(jsdoctags, (jsdoctag) => {
            if (jsdoctag.tagName && jsdoctag.tagName.text === 'example') {
                margs.push({
                    tagName: jsdoctag.tagName,
                    comment: jsdoctag.comment
                });
            }
            if (jsdoctag.tagName && jsdoctag.tagName.text === 'returns') {
                margs.push({
                    tagName: jsdoctag.tagName,
                    comment: jsdoctag.comment
                });
            }
        });
    }
    return margs;
}

export function readConfig(configFile: string): any {
    let result = ts.readConfigFile(configFile, ts.sys.readFile);
    if (result.error) {
        let message = ts.formatDiagnostics([result.error], formatDiagnosticsHost);
        throw new Error(message);
    }
    return result.config;
}

export function stripBom(source: string): string {
    if (source.charCodeAt(0) === 0xFEFF) {
        return source.slice(1);
    }
    return source;
}

export function hasBom(source: string): boolean {
    return (source.charCodeAt(0) === 0xFEFF);
}

export function handlePath(files: Array<string>, cwd: string): Array<string> {
    let _files = files;
    let i = 0;
    let len = files.length;

    for (i; i < len; i++) {
        if (files[i].indexOf(cwd) === -1) {
            files[i] = path.resolve(cwd + path.sep + files[i]);
        }
    }

    return _files;
}

export function cleanLifecycleHooksFromMethods(methods: Array<any>): Array<any> {
    let result = [];
    let i = 0;
    let len = methods.length;

    for (i; i < len; i++) {
        if (!(methods[i].name in AngularLifecycleHooks)) {
            result.push(methods[i]);
        }
    }

    return result;
}

export function cleanSourcesForWatch(list) {
    return list.filter((element) => {
        if (fs.existsSync(process.cwd() + path.sep + element)) {
            return element;
        }
    });
}

export function getNamesCompareFn(name?) {
    /**
     * Copyright https://github.com/ng-bootstrap/ng-bootstrap
     */
    name = name || 'name';
    const t = (a, b) => {
        if (a[name]) {
            return a[name].localeCompare(b[name]);
        } else {
            return 0;
        }
    };
    return t;
}
