import * as path from 'path';
export default function isGlobal() {
    var binPath,
        globalBinPath = function() {
            if (binPath) return binPath

            if (process.platform === 'win32') {
                var pathnames = process.env.PATH.split(path.delimiter)
                var len = pathnames.length

                for (var i = 0; i < len; i++) {
                    if (path.basename(pathnames[i]) === 'npm' || path.basename(pathnames[i]) === 'nodejs') {
                        binPath = pathnames[i];
                    }
                }
            } else {
                binPath = path.dirname(process.execPath)
            }

            return binPath
        },
        stripTrailingSep = function(thePath) {
            if (thePath[thePath.length - 1] === path.sep) {
                return thePath.slice(0, -1);
            }
            return thePath;
        },
        pathIsInside = function(thePath, potentialParent) {
            // For inside-directory checking, we want to allow trailing slashes, so normalize.
            thePath = stripTrailingSep(thePath);
            potentialParent = stripTrailingSep(potentialParent);

            // Node treats only Windows as case-insensitive in its path module; we follow those conventions.
            if (process.platform === "win32") {
                thePath = thePath.toLowerCase();
                potentialParent = potentialParent.toLowerCase();
            }

            return thePath.lastIndexOf(potentialParent, 0) === 0 &&
                (
                    thePath[potentialParent.length] === path.sep ||
                    thePath[potentialParent.length] === undefined
                );
        },
        isPathInside = function(a, b) {
            a = path.resolve(a);
            b = path.resolve(b);

            if (a === b) {
                return false;
            }

            return pathIsInside(a, b);
        }
    return isPathInside(process.argv[1] || '', globalBinPath() || '')
};
