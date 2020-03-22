import * as chai from 'chai';
import { temporaryDir, shell, read } from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir();

describe('CLI markdowns path', () => {
    const distFolder = tmp.name + '-markdowns-path';
    let indexFile = undefined;

    describe('when specifying a custom markdown path', () => {
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2/src/tsconfig.json',
                '-d',
                distFolder,
                '--markdownsPath',
                './test/fixtures/todomvc-ng2/markdowns'
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            indexFile = read(`${distFolder}/index.html`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should have content from README.md file', () => {
            expect(indexFile).to.contain('README.md file from custom directory');
        });
    });
});
