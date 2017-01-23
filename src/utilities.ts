import * as ts from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as util from 'util';

import { logger } from './logger';

const carriageReturnLineFeed = '\r\n';
const lineFeed = '\n';

export function detectIndent(str, count, indent?): string {
    let stripIndent = function(str: string) {
        const match = str.match(/^[ \t]*(?=\S)/gm);

        if (!match) {
            return str;
        }

        // TODO: use spread operator when targeting Node.js 6
        const indent = Math.min.apply(Math, match.map(x => x.length)); // eslint-disable-line
        const re = new RegExp(`^[ \\t]{${indent}}`, 'gm');

        return indent > 0 ? str.replace(re, '') : str;
    },
        repeating = function(n, str) {
        str = str === undefined ? ' ' : str;

        if (typeof str !== 'string') {
            throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof str}\``);
        }

        if (n < 0 || !Number.isFinite(n)) {
            throw new TypeError(`Expected \`count\` to be a positive finite number, got \`${n}\``);
        }

        let ret = '';

        do {
            if (n & 1) {
                ret += str;
            }

            str += str;
        } while ((n >>= 1));

        return ret;
    },
    indentString = function(str, count, indent) {
        indent = indent === undefined ? ' ' : indent;
        count = count === undefined ? 1 : count;

        if (typeof str !== 'string') {
            throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof str}\``);
        }

        if (typeof count !== 'number') {
            throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof count}\``);
        }

        if (typeof indent !== 'string') {
            throw new TypeError(`Expected \`indent\` to be a \`string\`, got \`${typeof indent}\``);
        }

        if (count === 0) {
            return str;
        }

        indent = count > 1 ? repeating(count, indent) : indent;

        return str.replace(/^(?!\s*$)/mg, indent);
    }

    return indentString(stripIndent(str), count || 0, indent);
}

// Create a compilerHost object to allow the compiler to read and write files
export function compilerHost(transpileOptions: any): ts.CompilerHost {

    const inputFileName = transpileOptions.fileName || (transpileOptions.jsx ? 'module.tsx' : 'module.ts');

    const compilerHost: ts.CompilerHost = {
        getSourceFile: (fileName) => {
            if (fileName.lastIndexOf('.ts') !== -1) {
                if (fileName === 'lib.d.ts') {
                    return undefined;
                }
                if (fileName.substr(-5) === '.d.ts') {
                    return undefined;
                }

                if (path.isAbsolute(fileName) === false) {
                    fileName = path.join(transpileOptions.tsconfigDirectory, fileName);
                }
                if (!fs.existsSync(fileName)) {
                    return undefined;
                }

                let libSource = '';

                try {
                    libSource = fs.readFileSync(fileName).toString();
                }
                catch(e) {
                    logger.debug(e, fileName);
                }

                return ts.createSourceFile(fileName, libSource, transpileOptions.target, false);
            }
            return undefined;
        },
        writeFile: (name, text) => {},
        getDefaultLibFileName: () => 'lib.d.ts',
        useCaseSensitiveFileNames: () => false,
        getCanonicalFileName: fileName => fileName,
        getCurrentDirectory: () => '',
        getNewLine: () => '\n',
        fileExists: (fileName): boolean => fileName === inputFileName,
        readFile: () => '',
        directoryExists: () => true,
        getDirectories: () => []
    };
    return compilerHost;
}
