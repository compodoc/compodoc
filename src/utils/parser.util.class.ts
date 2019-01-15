import * as path from 'path';

const glob = require('glob');

export class ParserUtil {
    private _files;
    private _cwd;
    private _globFiles = [];

    public init(exclude: string[], cwd: string) {
        this._files = exclude;
        this._cwd = cwd;
        let i = 0;
        let len = exclude.length;

        for (i; i < len; i++) {
            this._globFiles = [...this._globFiles, ...glob.sync(exclude[i], { cwd: this._cwd })];
        }
    }

    public testFilesWithCwdDepth() {
        let i = 0;
        let len = this._files.length;
        let result = {
            status: true,
            level: 0
        };
        for (i; i < len; i++) {
            let elementPath = path.resolve(this._cwd + path.sep, this._files[i]);
            if (elementPath.indexOf(this._cwd) === -1) {
                result.status = false;
                let level = this._files[i].match(/\..\//g).length;
                if (level > result.level) {
                    result.level = level;
                }
            }
        }
        return result;
    }

    public updateCwd(cwd, level) {
        let _cwd = cwd,
            _rewind = '';
        for (let i = 0; i < level; i++) {
            _rewind += '../';
        }
        _cwd = path.resolve(_cwd, _rewind);
        return _cwd;
    }

    public testFile(file: string): boolean {
        let i = 0;
        let len = this._files.length;
        let fileBasename = path.basename(file);
        let fileNameInCwd = file.replace(this._cwd + path.sep, '');
        let result = false;

        if (path.sep === '\\') {
            fileNameInCwd = fileNameInCwd.replace(new RegExp('\\' + path.sep, 'g'), '/');
        }

        for (i; i < len; i++) {
            if (glob.hasMagic(this._files[i]) && this._globFiles.length > 0) {
                let resultGlobSearch = this._globFiles.findIndex(element => {
                    let elementPath = path.resolve(this._cwd + path.sep, element);
                    let elementPathInCwd = elementPath.replace(this._cwd + path.sep, '');
                    elementPathInCwd = elementPathInCwd.replace(
                        new RegExp('\\' + path.sep, 'g'),
                        '/'
                    );
                    return elementPathInCwd === fileNameInCwd;
                });
                result = resultGlobSearch !== -1;
            } else {
                result = fileNameInCwd === this._files[i];
            }
            if (result) {
                break;
            }
        }
        return result;
    }
}
