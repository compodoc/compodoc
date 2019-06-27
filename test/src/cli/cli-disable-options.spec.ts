import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir();

describe('CLI disable flags', () => {
    const distFolder = tmp.name + '-disable-options';

    describe('disabling excluding methods with --disablePrivate', () => {
        let componentFile;
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--disablePrivate',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            componentFile = read(`${distFolder}/components/BarComponent.html`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should exclude methods marked as private', () => {
            expect(componentFile).not.to.contain('<code>privateMethod');
        });

        it('should include methods marked as internal', () => {
            expect(componentFile).to.contain('<code>internalMethod');
        });

        it('should include stuff marked as protected', () => {
            expect(componentFile).to.contain('varprotected</b>');
        });

        it('should display lifecyle hooks', () => {
            expect(componentFile).to.contain('<code>ngOnInit');
        });

        it('should exclude miscellaneous function marked as @private', () => {
            let file = read(distFolder + '/miscellaneous/functions.html');
            expect(file).not.to.contain('private function');
        });
    });

    describe('disabling excluding methods with --disableProtected', () => {
        let componentFile;
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--disableProtected',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            componentFile = read(`${distFolder}/components/BarComponent.html`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should exclude methods marked as protected', () => {
            expect(componentFile).not.to.contain('<code>varprotected');
        });

        it('should include methods marked as private', () => {
            expect(componentFile).to.contain('<code>privateMethod');
        });

        it('should include methods marked as internal', () => {
            expect(componentFile).to.contain('<code>internalMethod');
        });

        it('should display lifecyle hooks', () => {
            expect(componentFile).to.contain('<code>ngOnInit');
        });
    });

    describe('disabling excluding methods with --disableInternal', () => {
        let componentFile;
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--disableInternal',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            componentFile = read(`${distFolder}/components/BarComponent.html`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should exclude methods marked as @internal', () => {
            expect(componentFile).not.to.contain('<code>internalMethod');
        });

        it('should include methods marked as private', () => {
            expect(componentFile).to.contain('<code>privateMethod');
        });

        it('should include stuff marked as protected', () => {
            expect(componentFile).to.contain('varprotected</b>');
        });

        it('should display lifecyle hooks', () => {
            expect(componentFile).to.contain('<code>ngOnInit');
        });

        it('correct supports @internal + link', () => {
            let file = read(distFolder + '/directives/QueryParamNameDirective.html');
            expect(file).to.contain('code>constructor(groupService: QueryParamGroupService');
        });
    });

    describe('disabling excluding methods with --disableLifeCycleHooks', () => {
        let componentFile;
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--disableLifeCycleHooks',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            componentFile = read(`${distFolder}/components/BarComponent.html`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should exclude lifecyle hooks', () => {
            expect(componentFile).not.to.contain('<code>ngOnInit');
            const directiveFile = read(`${distFolder}/directives/BarDirective.html`);
            expect(directiveFile).not.to.contain('<code>ngOnInit');
        });

        it('should include methods marked as private', () => {
            expect(componentFile).to.contain('<code>privateMethod');
        });

        it('should include stuff marked as protected', () => {
            expect(componentFile).to.contain('varprotected</b>');
        });

        it('should include methods marked as internal', () => {
            expect(componentFile).to.contain('<code>internalMethod');
        });
    });

    describe('disabling excluding methods with --disableLifeCycleHooks for component inheritance', () => {
        let componentFile;
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files-extends/src/tsconfig.json',
                '--disableLifeCycleHooks',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            componentFile = read(`${distFolder}/components/AppComponent.html`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should exclude lifecyle hooks', () => {
            expect(componentFile).not.to.contain('<code>ngOnInit');
        });
    });

    describe('disabling excluding methods with --disableLifeCycleHooks --disableInternal --disableProtected --disablePrivate', () => {
        let componentFile;
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--disablePrivate',
                '--disableProtected',
                '--disableInternal',
                '--disableLifeCycleHooks',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            componentFile = read(`${distFolder}/components/BarComponent.html`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should exclude lifecyle hooks', () => {
            expect(componentFile).not.to.contain('<code>ngOnInit');
        });

        it('should exclude methods marked as private', () => {
            expect(componentFile).not.to.contain('<code>privateMethod');
        });

        it('should exclude stuff marked as protected', () => {
            expect(componentFile).not.to.contain('<code>varprotected');
        });

        it('should exclude methods marked as internal', () => {
            expect(componentFile).not.to.contain('<code>internalMethod');
        });
    });

    describe('disabling search with --disableSearch', () => {
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--disableSearch',
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

        it('should not generate search JS files', () => {
            let file = read(`${distFolder}/index.html`);
            expect(file).not.to.contain('lunr.min.js');
            const index = exists(distFolder + '/js/search/search_index.js');
            expect(index).to.be.false;
        });

        it('should not generate search input', () => {
            let file = read(`${distFolder}/js/menu-wc.js`);
            expect(file).not.to.contain('book-search-input');
        });
    });

    describe('disabling dependencies with --disableDependencies', () => {
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--disableDependencies',
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

        it('should not generate the dependencies list', () => {
            let file = read(`${distFolder}/js/menu-wc.js`);
            expect(file).not.to.contain('href="dependencies.html"');
        });
    });

    describe('minimal with --minimal', () => {
        let fileContents;

        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--minimal',
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

        it('should not generate search JS files', () => {
            let file = read(`${distFolder}/index.html`);
            expect(file).not.to.contain('lunr.min.js');
            const index = exists(distFolder + '/js/search/search_index.js');
            expect(index).to.be.false;
        });

        it('should not generate search input', () => {
            let file = read(`${distFolder}/js/menu-wc.js`);
            expect(file).not.to.contain('book-search-input');
        });

        it('should not include the graph on the modules page', () => {
            fileContents = read(`${distFolder}/modules.html`);
            expect(fileContents).to.not.contain('dependencies.svg');
            expect(fileContents).to.not.contain('svg-pan-zoom');
        });

        it('should not include the graph on the individual modules pages', () => {
            fileContents = read(`${distFolder}/modules/AppModule.html`);
            expect(fileContents).to.not.contain('modules/AppModule/dependencies.svg');
            expect(fileContents).to.not.contain('svg-pan-zoom');
        });

        it('it should not exist routes_index.js file', () => {
            const isFileExists = exists(`${distFolder}/js/routes/routes_index.js`);
            expect(isFileExists).to.be.false;
        });

        it('it should not have coverage page', () => {
            const isFileExists = exists(`${distFolder}/coverage.html`);
            expect(isFileExists).to.be.false;
        });
    });
});
