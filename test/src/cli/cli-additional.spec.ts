import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir(),
      tsconfigPath = require.resolve('../../../tsconfig.json'),
      env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI Additional documentation', () => {

    let stdoutString = null,
        fooIndexFile,
        fooServiceFile;
    before(function (done) {
        tmp.create();
        let ls = shell('node', [
            '../bin/index-cli.js',
            '-p', '../test/src/todomvc-ng2/src/tsconfig.json',
            '-d', '../' + tmp.name + '/',
            '--includes', '../test/src/todomvc-ng2/additional-doc',
            '--includesName', '"Additional documentation"'], { cwd: tmp.name, env });

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
        }
        stdoutString = ls.stdout.toString();
        fooIndexFile = read(`${tmp.name}/index.html`);
        done();
    });
    after(() => tmp.clean());

    it('it should have a menu with links', () => {
        expect(fooIndexFile).to.contain('<a href="additional-documentation/big-introduction');
        expect(fooIndexFile).to.contain('Big Introduction');
    });
    it('it should have generated files', () => {
        let isFileExists = exists(`${tmp.name}/additional-documentation/edition.html`);
        expect(isFileExists).to.be.true;
        isFileExists = exists(`${tmp.name}/additional-documentation/big-introduction.html`);
        expect(isFileExists).to.be.true;
    });
});
