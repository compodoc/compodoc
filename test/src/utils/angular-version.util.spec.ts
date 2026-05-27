import { expect } from 'chai';
import AngularVersionUtil from '../../../src/utils/angular-version.util';

describe('Utils - AngularVersionUtil', () => {
    describe('getApiLink()', () => {
        it('should return angular.dev link for modern Angular versions', () => {
            const result = AngularVersionUtil.getApiLink(
                {
                    title: 'NgIf',
                    path: 'api/common/NgIf',
                    docType: 'directive',
                    stability: 'stable',
                    secure: 'true',
                    barrel: '@angular/common'
                },
                '17.3.0'
            );

            expect(result).to.equal('https://angular.dev/api/common/NgIf');
        });

        it('should keep legacy v2.angular.io link for archived Angular versions', () => {
            const result = AngularVersionUtil.getApiLink(
                {
                    title: 'Component',
                    path: 'api/core/Component',
                    docType: 'decorator',
                    stability: 'stable',
                    secure: 'true',
                    barrel: '@angular/core'
                },
                '2.4.10'
            );

            expect(result).to.equal('https://v2.angular.io/api/core/Component');
        });

        it('should return empty string when api path is missing', () => {
            const result = AngularVersionUtil.getApiLink(undefined as any, '17.0.0');

            expect(result).to.equal('');
        });
    });
});
