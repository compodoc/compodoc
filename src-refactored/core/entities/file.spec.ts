import { File } from './file';

describe('File entity', () => {
    it('should create a file', () => {
        const fileName = 'newFile';
        const newFile = new File(fileName);
        expect(newFile.name).toEqual(fileName);
    });
});
