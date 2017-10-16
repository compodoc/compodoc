import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir(),
      tsconfigPath = require.resolve('../../../tsconfig.json'),
      env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI Export', () => {

    describe('when specified JSON', () => {

        let stdoutString = undefined;

        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/todomvc-ng2/src/tsconfig.json',
                '-d', '../' + tmp.name + '/',
                '-e', '"json"'], { cwd: tmp.name, env });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(tmp.name));

        it('should display generated message', () => {
            expect(stdoutString).to.contain('Documentation generated');
        });

        it('should create json file', () => {
            let isFileExists = exists(`${tmp.name}/documentation.json`);
            expect(isFileExists).to.be.true;
        });
    });

});
