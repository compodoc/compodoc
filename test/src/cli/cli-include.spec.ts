import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir();

describe('CLI include with tsconfig', () => {
    const distFolder = tmp.name + '-include';

    describe('when specific files (glob) are included in tsconfig', () => {
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.include-glob.json',
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

        it('should create files included', () => {
            let isFileExists = exists(`${distFolder}/components/BarComponent.html`);
            expect(isFileExists).to.be.true;
            isFileExists = exists(`${distFolder}/modules/BarModule.html`);
            expect(isFileExists).to.be.false;
            isFileExists = exists(`${distFolder}/modules/DeepModule.html`);
            expect(isFileExists).to.be.false;
        });
    });

    describe('when specific file is included in tsconfig', () => {
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.include-file.json',
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

        it('should create file included', () => {
            let isFileExists = exists(`${distFolder}/components/BarComponent.html`);
            expect(isFileExists).to.be.true;
            isFileExists = exists(`${distFolder}/modules/BarModule.html`);
            expect(isFileExists).to.be.false;
        });
    });

    describe('when specific file is included in tsconfig with one level / cwd', () => {
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2/src/tsconfig.extended.json',
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

        it('should create file included', () => {
            let isFileExists = exists(`${distFolder}/classes/GenTodo.html`);
            expect(isFileExists).to.be.true;
        });
    });
});
