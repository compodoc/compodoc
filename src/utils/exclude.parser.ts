import * as path from 'path';

const glob = require('glob');

export let ExcludeParser = (function() {

    let _exclude,
        _cwd,
        _globFiles = [];

    let _init = function(exclude: string[], cwd: string) {
            _exclude = exclude;
            _cwd = cwd;
            let i = 0,
                len = exclude.length;
            for(i; i<len; i++) {
                _globFiles = [..._globFiles, ...glob.sync(exclude[i], { cwd: _cwd })];
            }
        },

        _testFile = (file: string):boolean => {
            let i = 0,
                len = _exclude.length,
                fileBasename = path.basename(file),
                result = false;
            for(i; i<len; i++) {
                if (glob.hasMagic(_exclude[i]) && _globFiles.length > 0) {
                    let resultGlobSearch = _globFiles.findIndex((element) => {
                            return path.basename(element) === fileBasename;
                        });
                    result = resultGlobSearch !== -1;
                } else {
                    result = fileBasename === path.basename(_exclude[i]);
                }
                if(result) {break;}
            }
            return result;
        }

    return {
        init: _init,
        testFile: _testFile
    }
})();
