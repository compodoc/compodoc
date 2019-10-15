import * as chai from 'chai';
import { shell, temporaryDir } from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir();

describe('CLI simple flags', () => {
    const distFolder = tmp.name + '-silent';
    let stdoutString = '';

    before(function(done) {
        tmp.create(distFolder);
        let ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/fixtures/sample-files/tsconfig.simple.json',
            '-d',
            distFolder,
            '--silent'
        ]);

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
        }
        stdoutString = ls.stdout.toString();
        done();
    });
    after(() => tmp.clean(distFolder));

    it('should display simple message', () => {
        expect(stdoutString).to.contain('Compodoc v');
        expect(stdoutString).not.to.contain('TypeScript version used by Compodoc');
    });
});
