const expect = require('chai').expect;

import FileEngine from './file.engine';

const rimraf = require('rimraf');

describe('Infrastructure - FileEngine', () => {
    after(() => {
        rimraf.sync('tmp');
    });

    it('should read async file', async () => {
        const fileData = await FileEngine.get('package.json');
        expect(fileData).contain('@compodoc/compodoc');
    });

    it('should read sync file', () => {
        const fileData = FileEngine.getSync('package.json');
        expect(fileData).contain('@compodoc/compodoc');
    });

    it('should write async file', async () => {
        await FileEngine.write('tmp/test-async.js', 'TEST');
        const fileData = await FileEngine.get('tmp/test-async.js');
        expect(fileData).contain('TEST');
    });

    it('should write sync file', async () => {
        FileEngine.writeSync('tmp/test-sync.js', 'TEST');
        const fileData = FileEngine.getSync('tmp/test-sync.js');
        expect(fileData).contain('TEST');
    });
});
