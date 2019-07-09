import { exists, shell, temporaryDir } from '../helpers';

const tmp = temporaryDir();

describe('CLI option file', () => {
    let stdoutString = undefined;
    let clockInterfaceFile;
    let searchFuncFile;

    const distFolder = 'test-config-file'; // Match /test/src/todomvc-ng2/.compodocrc

    beforeEach(done => {
        tmp.create(distFolder);

        let ls = shell('node', [
            './bin/index-cli.js',
            '-c',
            './test/src/todomvc-ng2/.compodocrc',
            '-p',
            './test/src/todomvc-ng2/src/tsconfig.json'
        ]);

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
        }
        stdoutString = ls.stdout.toString();

        done();
    });
    afterEach(() => {
        tmp.clean(distFolder);
    });

    it('should display generated message', () => {
        expect(stdoutString).toContain('Documentation generated');
    });

    it('should have generated main folder', () => {
        const isFolderExists = exists(distFolder);
        expect(isFolderExists).toBeTruthy();
    });

    it('should have generated main pages', () => {
        const isIndexExists = exists(distFolder + '/index.html');
        expect(isIndexExists).toBeTruthy();
        const isModulesExists = exists(distFolder + '/modules.html');
        expect(isModulesExists).toBeTruthy();
        const isRoutesExists = exists(distFolder + '/routes.html');
        expect(isRoutesExists).toBeTruthy();
    });
});
