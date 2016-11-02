import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

import { logger } from './logger';

export function d(node) {
    console.log(util.inspect(node, { showHidden: true, depth: 10 }));
}

const carriageReturnLineFeed = '\r\n';
const lineFeed = '\n';

// get default new line break
export function getNewLineCharacter(options: ts.CompilerOptions): string {
    if (options.newLine === ts.NewLineKind.CarriageReturnLineFeed) {
        return carriageReturnLineFeed;
    }
    else if (options.newLine === ts.NewLineKind.LineFeed) {
        return lineFeed;
    }
    return carriageReturnLineFeed;
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

                if (path.isAbsolute(fileName) === false) {
                    fileName = path.join(transpileOptions.tsconfigDirectory, fileName);
                }

                let libSource = '';

                try {
                    libSource = fs.readFileSync(fileName).toString();
                }
                catch(e) {
                    logger.trace(e, fileName);
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