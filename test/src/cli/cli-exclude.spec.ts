import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir(),
      tsconfigPath = require.resolve('../../../tsconfig.json'),
      env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI exclude from tsconfig', () => {

    describe('when specific files are excluded in tsconfig', () => {
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.exclude.json',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(tmp.name));

        it('should not create files excluded', () => {
            let isFileExists = exists(`${tmp.name}/components/BarComponent.html`);
            expect(isFileExists).to.be.false;
            isFileExists = exists(`${tmp.name}/modules/BarModule.html`);
            expect(isFileExists).to.be.false;
        });
    });

});
