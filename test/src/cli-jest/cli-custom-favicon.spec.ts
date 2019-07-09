import { exists, shell, stats, temporaryDir } from '../helpers';

const tmp = temporaryDir();

interface Image {
    size: number;
}

describe('CLI custom favicon', () => {
    const distFolder = tmp.name + '-favicon';

    describe('when specifying a custom favicon', () => {
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/todomvc-ng2/src/tsconfig.json',
                '-d',
                distFolder,
                '--customFavicon',
                './test/src/todomvc-ng2/favicon.ico'
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }

            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should have copied the customFavicon', () => {
            let isFileExists = exists(`${distFolder}/images/favicon.ico`);
            expect(isFileExists).toBeTruthy();
            let originalFileSize = (stats('test/src/todomvc-ng2/favicon.ico') as Image).size,
                copiedFileSize = (stats(`${distFolder}/images/favicon.ico`) as Image).size;
            expect(originalFileSize).toEqual(copiedFileSize);
        });
    });
});
