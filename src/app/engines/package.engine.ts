import * as fs from 'fs-extra';
import * as path from 'path';

const semverUtils = require('semver-utils');

export class PackageJSONEngine {
    constructor() {

    }
    getAngularVersion(packageJsonData) {
        return new Promise(function(resolve, reject) {
            if (typeof packageJsonData.dependencies !== 'undefined') {
                if (typeof packageJsonData.dependencies.angular !== 'undefined') {
                    var s = semverUtils.parseRange(packageJsonData.dependencies.angular);
                    if (s[0].major === '1' && parseInt(s[0].minor) < 5 ) {
                        reject('No angular 1.5+ version found');
                    } else {
                        resolve(s[0].major);
                    }
                } else if (typeof packageJsonData.dependencies['@angular/core'] !== 'undefined') {
                    var s = semverUtils.parseRange(packageJsonData.dependencies['@angular/core']);
                    resolve(s.major);
                } else {
                    reject('No angular 1 or 2 version found');
                }
            } else {
                reject('No dependencies node found');
            }
        });
    }
};
