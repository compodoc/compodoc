import * as path from 'path';
import * as fs from 'fs-extra';
import { ts } from 'ts-simple-ast';
import * as _ from 'lodash';

import { LinkParser } from './link-parser';

import { AngularLifecycleHooks } from './angular-lifecycles-hooks';
import { kindToType } from './kind-to-type';

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
    _.forEach(mtags, tag => {
        tag.comment = marked(LinkParser.resolveLinks(tag.comment));
    });
    return mtags;
}

export function mergeTagsAndArgs(args: Array<any>, jsdoctags?: Array<any>): Array<any> {
    let margs = _.cloneDeep(args);
    _.forEach(margs, arg => {
        arg.tagName = {
            text: 'param'
        };
        if (jsdoctags) {
            _.forEach(jsdoctags, jsdoctag => {
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
        _.forEach(jsdoctags, jsdoctag => {
            if (jsdoctag.tagName && jsdoctag.tagName.text === 'example') {
                margs.push({
                    tagName: jsdoctag.tagName,
                    comment: jsdoctag.comment
                });
            }
            if (
                jsdoctag.tagName &&
                (jsdoctag.tagName.text === 'returns' || jsdoctag.tagName.text === 'return')
            ) {
                let ret = {
                    tagName: jsdoctag.tagName,
                    comment: jsdoctag.comment
                };
                if (jsdoctag.typeExpression && jsdoctag.typeExpression.type) {
                    ret.returnType = kindToType(jsdoctag.typeExpression.type.kind);
                }
                margs.push(ret);
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
    if (source.charCodeAt(0) === 0xfeff) {
        return source.slice(1);
    }
    return source;
}

export function hasBom(source: string): boolean {
    return source.charCodeAt(0) === 0xfeff;
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
    if (typeof methods !== 'undefined') {
        let i = 0;
        let len = methods.length;
        for (i; i < len; i++) {
            if (!(methods[i].name in AngularLifecycleHooks)) {
                result.push(methods[i]);
            }
        }
    }
    return result;
}

export function cleanSourcesForWatch(list) {
    return list.filter(element => {
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

export function isIgnore(member): boolean {
    if (member.jsDoc) {
        for (const doc of member.jsDoc) {
            if (doc.tags) {
                for (const tag of doc.tags) {
                    if (tag.tagName.text.indexOf('ignore') > -1) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function(searchElement, fromIndex) {
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            // 1. Let O be ? ToObject(this value).
            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }

            // 4. Let n be ? ToInteger(fromIndex).
            //    (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;

            // 5. If n ≥ 0, then
            //  a. Let k be n.
            // 6. Else n < 0,
            //  a. Let k be len + n.
            //  b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return (
                    x === y ||
                    (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y))
                );
            }

            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return true.
                if (sameValueZero(o[k], searchElement)) {
                    return true;
                }
                // c. Increase k by 1.
                k++;
            }

            // 8. Return false
            return false;
        }
    });
}
