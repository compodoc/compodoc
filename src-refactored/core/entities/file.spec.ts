const expect = require('chai').expect;

import { File } from './file';

describe('Entity - File entity', () => {
    it('should create a file', () => {
        const fileName = 'newFile';
        const newFile = new File(fileName);
        expect(newFile.name).equal(fileName);
    });
});
