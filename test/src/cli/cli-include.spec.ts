import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir(),
      tsconfigPath = require.resolve('../../../tsconfig.json'),
      env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI include with tsconfig', () => {

    describe('when specific files (glob) are included in tsconfig', () => {
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.include-glob.json',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(tmp.name));

        it('should create files included', () => {
            let isFileExists = exists(`${tmp.name}/components/BarComponent.html`);
            expect(isFileExists).to.be.true;
            isFileExists = exists(`${tmp.name}/modules/BarModule.html`);
            expect(isFileExists).to.be.false;
            isFileExists = exists(`${tmp.name}/modules/DeepModule.html`);
            expect(isFileExists).to.be.false;
        });
    });

    describe('when specific file is included in tsconfig', () => {
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.include-file.json',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(tmp.name));

        it('should create file included', () => {
            let isFileExists = exists(`${tmp.name}/components/BarComponent.html`);
            expect(isFileExists).to.be.true;
            isFileExists = exists(`${tmp.name}/modules/BarModule.html`);
            expect(isFileExists).to.be.false;
        });
    });

});
