import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir();

describe('CLI toggle menu items', () => {
    describe('with a list', () => {
        const distFolder = tmp.name + '-toggle';
        let stdoutString = undefined,
            fooIndexFile,
            fooServiceFile;
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/todomvc-ng2/src/tsconfig.json',
                '-d',
                distFolder,
                '--toggleMenuItems',
                'modules'
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            fooIndexFile = read(`${distFolder}/js/menu-wc.js`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it('it should have a toggled item menu', () => {
            expect(fooIndexFile).to.contain('ion-ios-arrow-up');
        });
    });
});
