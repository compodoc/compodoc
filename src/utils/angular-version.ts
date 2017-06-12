let semver = require('semver');

export function cleanVersion(version) {
    return version.replace('~', '')
                  .replace('^', '')
                  .replace('=', '')
                  .replace('<', '')
                  .replace('>', '')
}

export function getAngularVersionOfProject(packageData) {
    let _result = '';

    if (packageData['dependencies']) {
        let angularCore = packageData['dependencies']['@angular/core'];
        if (angularCore) {
            _result = cleanVersion(angularCore);
        }
    }

    return _result;
}

function isAngularVersionArchived(version) {
    let result;

    try {
        result = semver.compare(version, '2.4.10') <= 0;
    } catch (e) {}

    return result;
}

export function prefixOfficialDoc(version) {
    return isAngularVersionArchived(version) ? 'v2.' : '';
}
