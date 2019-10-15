import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir();

describe('CLI exclude from tsconfig', () => {
    const distFolder = tmp.name + '-exclude';

    describe('when specific files are excluded in tsconfig', () => {
        before(function(done) {
            tmp.create(distFolder);

            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.exclude.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should not create files excluded', () => {
            let isFileExists = exists(`${distFolder}/components/BarComponent.html`);
            expect(isFileExists).to.be.false;
            isFileExists = exists(`${distFolder}/modules/BarModule.html`);
            expect(isFileExists).to.be.false;
        });
    });
});
