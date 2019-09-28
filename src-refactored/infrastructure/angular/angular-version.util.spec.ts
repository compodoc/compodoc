const expect = require('chai').expect;

import AngularVersionUtil from './angular-version.util';

describe('Manage Angular APIs', () => {
    const finalCleanedVersion = '8.0.1';

    it('should clean version', () => {
        let version = '~8.0.1';
        let cleanedVersion = AngularVersionUtil.cleanVersion(version);
        expect(cleanedVersion).equal(finalCleanedVersion);
        version = '^8.0.1';
        cleanedVersion = AngularVersionUtil.cleanVersion(version);
        expect(cleanedVersion).equal(finalCleanedVersion);
    });

    it('should retrieve Angular version of project', () => {
        const packageData = {
            dependencies: {
                '@angular/core': '~8.0.1'
            }
        };
        const version = AngularVersionUtil.getAngularVersionOfProject(packageData);
        expect(version).equal(finalCleanedVersion);
    });

    it('should not retrieve Angular version of project', () => {
        const packageData = {
            dependencies: {
                'vue.js': '~8.0.1'
            }
        };
        const version = AngularVersionUtil.getAngularVersionOfProject(packageData);
        expect(version).equal('');
    });

    it('should getApiLink for API', () => {
        const apiLink = AngularVersionUtil.getApiLink(
            {
                title: 'NgModule',
                path: 'api/core/NgModule',
                docType: 'decorator',
                stability: 'stable',
                secure: '',
                barrel: ''
            },
            '8.0.1'
        );
        expect(apiLink).equal('https://angular.io/api/core/NgModule');
    });
});
