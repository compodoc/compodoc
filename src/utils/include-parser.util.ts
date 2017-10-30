import * as path from 'path';

const glob = require('glob');

export class IncludeParserUtil {
    private _include;
    private _cwd;
    private _globFiles = [];

    public init(include: string[], cwd: string) {
        this._include = include;
        this._cwd = cwd;
        let i = 0;
        let len = include.length;

        for (i; i < len; i++) {
            this._globFiles = [...this._globFiles, ...glob.sync(include[i], { cwd: this._cwd })];
        }
    }

    public testFile(file: string): boolean {
        let i = 0;
        let len = this._include.length;
        let fileBasename = path.basename(file);
        let fileNameInCwd = file.replace(this._cwd + path.sep, '');
        let result = false;

        if (path.sep === '\\') {
            fileNameInCwd = fileNameInCwd.replace(new RegExp('\\' + path.sep, 'g'), '/');
        }

        for (i; i < len; i++) {
            if (glob.hasMagic(this._include[i]) && this._globFiles.length > 0) {
                let resultGlobSearch = this._globFiles.findIndex((element) => {
                    return element === fileNameInCwd;
                });
                result = resultGlobSearch !== -1;
            } else {
                result = fileNameInCwd === this._include[i];
            }
            if (result) { break; }
        }
        return result;
    }
}
