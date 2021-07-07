import * as chai from 'chai';
import { temporaryDir, shell, exists } from '../helpers';

const expect = chai.expect;
const tmp = temporaryDir();

describe('CLI option file', () => {
    let stdoutString = undefined;

    const distFolder = 'test-config-file'; // Match /test/fixtures/todomvc-ng2/.compodocrc

    before(done => {
        tmp.create(distFolder);

        let ls = shell('node', [
            './bin/index-cli.js',
            '-c',
            './test/fixtures/todomvc-ng2/.compodocrc',
            '-p',
            './test/fixtures/todomvc-ng2/src/tsconfig.json'
        ]);

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
        }
        stdoutString = ls.stdout.toString();

        done();
    });
    after(() => {
        tmp.clean(distFolder);
    });

    it('should display generated message', () => {
        expect(stdoutString).to.contain('Documentation generated');
    });

    it('should have generated main folder', () => {
        const isFolderExists = exists(distFolder);
        expect(isFolderExists).to.be.true;
    });

    it('should have generated main pages', () => {
        const isIndexExists = exists(distFolder + '/index.html');
        expect(isIndexExists).to.be.true;
        const isModulesExists = exists(distFolder + '/modules.html');
        expect(isModulesExists).to.be.true;
        const isRoutesExists = exists(distFolder + '/routes.html');
        expect(isRoutesExists).to.be.true;
    });
});
