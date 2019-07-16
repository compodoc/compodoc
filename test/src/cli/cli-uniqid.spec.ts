import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir();

describe('CLI Uniq id for file', () => {

    const distFolder = tmp.name + '-uniqid';

    let indexFile;
    before(function (done) {
        tmp.create(distFolder);
        let ls = shell('node', [
            './bin/index-cli.js',
            '-p', './test/fixtures/sample-files/tsconfig.simple.json',
            '-d', distFolder]);

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
        }
        indexFile = read(`${distFolder}/js/menu-wc.js`);

        done();
    });
    after(() => tmp.clean(distFolder));

    it('it should contain a uniqid', () => {
        expect(indexFile).to.contain('6392bbbd114021b59c52f837ecd63c53');
    });
});
