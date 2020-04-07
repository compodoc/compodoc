const expect = require('chai').expect;

import AngularApiUtil from './angular-api.util';

describe('Infrastructure - Handle Angular APIs', () => {
    it('should detect it', async () => {
        const API_TO_FIND = 'HttpClientModule';
        const apiFound = AngularApiUtil.findApi(API_TO_FIND);
        const apiFoundDataPathKey = apiFound.data.path;

        expect(apiFoundDataPathKey).equal('api/common/http/HttpClientModule');
    });

    it('should detect it with generic types', () => {
        const API_TO_FIND = 'HttpRequest<any>';
        const apiFound = AngularApiUtil.findApi(API_TO_FIND);
        const apiFoundDataPathKey = apiFound.data.path;

        expect(apiFoundDataPathKey).equal('api/common/http/HttpRequest');
    });
});
