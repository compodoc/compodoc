import { expect } from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';
const tmp = temporaryDir();

describe('CLI Routes graph', () => {
    const distFolder = tmp.name + '-routes-graph';

    describe('disable it', () => {
        before(function (done) {
            tmp.create(distFolder);
            const ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2-simple-routing/src/tsconfig.json',
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
        after(() => tmp.clean(distFolder));

        it('it should not exist routes_index.js file', () => {
            const isFileExists = exists(`${distFolder}/js/routes/routes_index.js`);
            expect(isFileExists).to.be.false;
        });
    });

    describe('should support forRoot/forChild', () => {
        before(function (done) {
            tmp.create(distFolder);
            const ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2-simple-routing/src/tsconfig.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should clean forRoot and forChild in modules imports', () => {
            const file = read(distFolder + '/modules/AppModule.html');
            expect(file).to.contain('<a href="../modules/HomeModule.html">HomeModule</a>');
        });
    });

    describe('should support routing without routing module', () => {
        before(function (done) {
            tmp.create(distFolder);
            const ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/routing-without-module/src/tsconfig.app.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should have a clean graph', () => {
            const isFileExists = exists(`${distFolder}/js/routes/routes_index.js`);
            expect(isFileExists).to.be.true;
            const file = read(`${distFolder}/js/routes/routes_index.js`);
            expect(file).to.contain('ExampleComponent');
        });
    });

    describe('should support standalone routing with provideRouter', () => {
        before(function (done) {
            tmp.create(distFolder);
            const ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/standalone-provide-router/tsconfig.app.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should have a clean graph', () => {
            const isFileExists = exists(`${distFolder}/js/routes/routes_index.js`);
            expect(isFileExists).to.be.true;
            const file = read(`${distFolder}/js/routes/routes_index.js`);
            expect(file).to.contain('StandaloneHomeComponent');
        });

        it('should display a non-zero routes count in overview', () => {
            const overviewFile = read(`${distFolder}/overview.html`);
            const routeCountMatch = overviewFile.match(/href="\.\/routes\.html">(\d+)\s/);

            expect(routeCountMatch).to.not.equal(null);
            expect(Number(routeCountMatch![1])).to.be.greaterThan(0);
        });
    });

    describe('should support standalone provideRouter with inline lazy routes and default export route files', () => {
        before(function (done) {
            tmp.create(distFolder);
            const ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/standalone-provide-router-inline-lazy/tsconfig.app.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should extract routes from provideRouter inline arrays and default-export route files', () => {
            const isFileExists = exists(`${distFolder}/js/routes/routes_index.js`);
            expect(isFileExists).to.be.true;
            const file = read(`${distFolder}/js/routes/routes_index.js`);

            expect(file).to.contain('"name":"home"');
            expect(file).to.contain('"name":"about"');
            expect(file).to.contain('"name":"login"');
            expect(file).to.contain('"name":"profile/:username"');
            expect(file).to.contain('"name":"favorites"');
            expect(file).to.contain('"kind":"route-redirect"');
            expect(file).to.contain('"path":"**"');
            expect(file).to.contain('"pathMatch":"full"');
        });

        it('should resolve default-export lazy component names without forcing Component suffix', () => {
            const file = read(`${distFolder}/js/routes/routes_index.js`);
            expect(file).to.contain('"name":"login"');
            expect(file).to.contain('"component":"Login"');
            expect(file).not.to.contain('"component":"LoginComponent"');

            expect(exists(`${distFolder}/components/Login.html`)).to.be.true;
            expect(exists(`${distFolder}/components/LoginComponent.html`)).to.be.false;
        });

        it('should resolve loadChildren parent routes to real lazy landing components', () => {
            const file = read(`${distFolder}/js/routes/routes_index.js`);
            expect(file).to.contain('"name":"profile/:username"');
            expect(file).to.contain('"name":"profile/:username","kind":"route-path","component":"Profile"');
            expect(file).not.to.contain('"name":"profile/:username","kind":"route-path","component":"ProfileComponent"');
            expect(exists(`${distFolder}/components/Profile.html`)).to.be.true;
            expect(exists(`${distFolder}/components/ProfileComponent.html`)).to.be.false;
        });
    });

    describe('should support lazy-loaded modules with loadChildren syntax (containing possible trailing commas)', () => {
        before(function (done) {
            tmp.create(distFolder);
            const ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2-simple-routing-standard/src/tsconfig.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should have a clean graph', () => {
            const isFileExists = exists(`${distFolder}/js/routes/routes_index.js`);
            expect(isFileExists).to.be.true;
            const file = read(`${distFolder}/js/routes/routes_index.js`);
            expect(file).to.contain('AboutComponent');
        });
    });

    describe('should support lazy-loaded modules with new loadChildren syntax / async', () => {
        before(function (done) {
            tmp.create(distFolder);
            const ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2-simple-routing-standard-async/src/tsconfig.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should have a clean graph', () => {
            const isFileExists = exists(`${distFolder}/js/routes/routes_index.js`);
            expect(isFileExists).to.be.true;
            const file = read(`${distFolder}/js/routes/routes_index.js`);
            expect(file).to.contain('AboutComponent');
        });
    });

    describe('should support if statement for bootstrapModule', () => {
        before(function (done) {
            tmp.create(distFolder);
            const ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2-simple-routing-with-if/src/tsconfig.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should have a clean graph', () => {
            const isFileExists = exists(`${distFolder}/js/routes/routes_index.js`);
            expect(isFileExists).to.be.true;
            const file = read(`${distFolder}/js/routes/routes_index.js`);
            expect(file).to.contain('HomeComponent');
        });
    });

    describe('should support route in external file', () => {
        before(function (done) {
            tmp.create(distFolder);
            const ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2-simple-routing/src/tsconfig.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should correctly read external file', () => {
            const file = read(`${distFolder}/js/routes/routes_index.js`);
            expect(file).to.contain('login');
        });
    });
});
