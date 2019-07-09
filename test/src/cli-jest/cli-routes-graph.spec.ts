import { exists, read, shell, temporaryDir } from '../helpers';
const tmp = temporaryDir();

describe('CLI Routes graph', () => {
    const distFolder = tmp.name + '-routes-graph';

    describe('disable it', () => {
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/todomvc-ng2-simple-routing/src/tsconfig.json',
                '--disableRoutesGraph',
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

        it('it should not exist routes_index.js file', () => {
            const isFileExists = exists(`${distFolder}/js/routes/routes_index.js`);
            expect(isFileExists).toBeFalsy();
        });
    });

    describe('should support forRoot/forChild', () => {
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/todomvc-ng2-simple-routing/src/tsconfig.json',
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

        it('should clean forRoot and forChild in modules imports', () => {
            let file = read(distFolder + '/modules/AppModule.html');
            expect(file).toContain('<a href="../modules/HomeModule.html">HomeModule</a>');
        });
    });

    describe('should support routing without routing module', () => {
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/routing-without-module/src/tsconfig.app.json',
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

        it('should have a clean graph', () => {
            const isFileExists = exists(`${distFolder}/js/routes/routes_index.js`);
            expect(isFileExists).toBeTruthy();
            let file = read(`${distFolder}/js/routes/routes_index.js`);
            expect(file).toContain('ExampleComponent');
        });
    });

    describe('should support if statement for bootstrapModule', () => {
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/todomvc-ng2-simple-routing-with-if/src/tsconfig.json',
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

        it('should have a clean graph', () => {
            const isFileExists = exists(`${distFolder}/js/routes/routes_index.js`);
            expect(isFileExists).toBeTruthy();
            let file = read(`${distFolder}/js/routes/routes_index.js`);
            expect(file).toContain('HomeComponent');
        });
    });
});
