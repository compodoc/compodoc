import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir();

describe('CLI Analytics tracking', () => {
    const distFolder = tmp.name + '-tracking';

    describe('add tracking code', () => {
        let coverageFile;
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.simple.json',
                '--gaID',
                'UA-XXXXX-Y',
                '--gaSite',
                'demo',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            coverageFile = read(`${distFolder}/index.html`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it('it should contain tracking code', () => {
            expect(coverageFile).to.contain('www.google-analytics.com');
            expect(coverageFile).to.contain('demo');
        });
    });
});
