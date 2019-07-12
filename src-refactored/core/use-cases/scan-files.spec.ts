import ScanFiles from './scan-files';

describe('Should scan folders', () => {
    it('should find files', async () => {
        const testFolderpath = 'test/src/todomvc-ng2';
        const files = await ScanFiles.scan(testFolderpath);
        console.log(files);

        expect(files.length).toEqual(2);
    });
});
