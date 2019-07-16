import ScanFiles from './scan-files';

describe('Should scan folders', () => {
    it('should find files', async () => {
        const testFolderpath = 'test/fixtures/todomvc-ng2';
        const files = await ScanFiles.scan(testFolderpath);
        expect(files.length).toEqual(65);
    });
});
