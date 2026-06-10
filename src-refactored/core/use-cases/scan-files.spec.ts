const expect = require('chai').expect;

import ScanFiles from './scan-files';

describe('Use-cases - Should scan folders', () => {
    it('should find files', async () => {
        const testFolderpath = 'test/fixtures/todomvc-ng2';
        const files = await ScanFiles.scan(testFolderpath);
        expect(files.length).greaterThan(0);
        expect(files.every(file => file.endsWith('.ts') || file.endsWith('.tsx'))).equal(true);
        expect(files.some(file => file.endsWith('src/app/app.module.ts'))).equal(true);
        expect(files.some(file => file.endsWith('.spec.ts'))).equal(false);
        expect(files.some(file => file.endsWith('.d.ts'))).equal(false);
        expect(files.some(file => file.includes('node_modules'))).equal(false);
    });
});
