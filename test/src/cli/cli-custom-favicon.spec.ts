import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync, stats} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir(),
      tsconfigPath = require.resolve('../../../tsconfig.json'),
      env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI custom favicon', () => {

    describe('when specifying a custom favicon', () => {
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/todomvc-ng2/src/tsconfig.json',
                '-d', '../' + tmp.name + '/',
                '--customFavicon', '../test/src/todomvc-ng2/favicon.ico'], { cwd: tmp.name, env });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }

            done();
        });
        after(() => tmp.clean(tmp.name));

        it('should have copied the customFavicon', () => {
            let isFileExists = exists(`${tmp.name}/images/favicon.ico`);
            expect(isFileExists).to.be.true;
            let originalFileSize = stats('test/src/todomvc-ng2/favicon.ico').size,
                copiedFileSize = stats(`${tmp.name}/images/favicon.ico`).size;
            expect(originalFileSize).to.equal(copiedFileSize)
        });
    });

});
