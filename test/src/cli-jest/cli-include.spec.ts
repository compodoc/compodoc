import { exists, exec, pkg, read, shell, shellAsync, temporaryDir } from '../helpers';
const tmp = temporaryDir();

describe('CLI include with tsconfig', () => {
    const distFolder = tmp.name + '-include';

    describe('when specific files (glob) are included in tsconfig', () => {
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.include-glob.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should create files included', () => {
            let isFileExists = exists(`${distFolder}/components/BarComponent.html`);
            expect(isFileExists).toBeTruthy();
            isFileExists = exists(`${distFolder}/modules/BarModule.html`);
            expect(isFileExists).toBeFalsy();
            isFileExists = exists(`${distFolder}/modules/DeepModule.html`);
            expect(isFileExists).toBeFalsy();
        });
    });

    describe('when specific file is included in tsconfig', () => {
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.include-file.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should create file included', () => {
            let isFileExists = exists(`${distFolder}/components/BarComponent.html`);
            expect(isFileExists).toBeTruthy();
            isFileExists = exists(`${distFolder}/modules/BarModule.html`);
            expect(isFileExists).toBeFalsy();
        });
    });

    describe('when specific file is included in tsconfig with one level / cwd', () => {
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/todomvc-ng2/src/tsconfig.extended.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should create file included', () => {
            let isFileExists = exists(`${distFolder}/classes/GenTodo.html`);
            expect(isFileExists).toBeTruthy();
        });
    });
});
