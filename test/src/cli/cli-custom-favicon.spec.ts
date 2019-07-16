import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync, stats } from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir();

interface Image {
    size: number;
}

describe('CLI custom favicon', () => {
    const distFolder = tmp.name + '-favicon';

    describe('when specifying a custom favicon', () => {
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2/src/tsconfig.json',
                '-d',
                distFolder,
                '--customFavicon',
                './test/fixtures/todomvc-ng2/favicon.ico'
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }

            done();
        });
        after(() => tmp.clean(distFolder));

        it('should have copied the customFavicon', () => {
            let isFileExists = exists(`${distFolder}/images/favicon.ico`);
            expect(isFileExists).to.be.true;
            let originalFileSize = (stats('test/fixtures/todomvc-ng2/favicon.ico') as Image).size,
                copiedFileSize = (stats(`${distFolder}/images/favicon.ico`) as Image).size;
            expect(originalFileSize).to.equal(copiedFileSize);
        });
    });
});
