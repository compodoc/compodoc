import * as path from 'path';

const glob = require('glob');

export class ExcludeParserUtil {
    private _exclude;
    private _cwd;
    private _globFiles = [];

    public init(exclude: string[], cwd: string) {
        this._exclude = exclude;
        this._cwd = cwd;
        let i = 0;
        let len = exclude.length;

        for (i; i < len; i++) {
            this._globFiles = [...this._globFiles, ...glob.sync(exclude[i], { cwd: this._cwd })];
        }
    }

    public testFile(file: string): boolean {
        let i = 0;
        let len = this._exclude.length;
        let fileBasename = path.basename(file);
        let fileNameInCwd = file.replace(this._cwd + path.sep, '');
        let result = false;

        if (path.sep === '\\') {
            fileNameInCwd = fileNameInCwd.replace(new RegExp('\\' + path.sep, 'g'), '/');
        }

        for (i; i < len; i++) {
            if (glob.hasMagic(this._exclude[i]) && this._globFiles.length > 0) {
                let resultGlobSearch = this._globFiles.findIndex(element => {
                    let elementPath = path.resolve(this._cwd + path.sep, element);
                    let elementPathInCwd = elementPath.replace(this._cwd + path.sep, '');
                    elementPathInCwd = elementPathInCwd.replace(new RegExp('\\' + path.sep, 'g'), '/');
                    return elementPathInCwd === fileNameInCwd;
                });
                result = resultGlobSearch !== -1;
            } else {
                result = fileNameInCwd === this._exclude[i];
            }
            if (result) {
                break;
            }
        }
        return result;
    }
}