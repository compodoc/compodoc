import { exists, read, shell, temporaryDir } from '../helpers';

const tmp = temporaryDir();

describe('CLI disable flags', () => {
    const distFolder = tmp.name + '-disable-options';

    describe('disabling excluding methods with --disablePrivate', () => {
        let componentFile;
        beforeAll(function(done) {
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
        afterAll(() => tmp.clean(distFolder));

        it('should exclude methods marked as private', () => {
            expect(componentFile).toEqual(expect.not.stringContaining('<code>privateMethod'));
        });

        it('should include methods marked as internal', () => {
            expect(componentFile).toContain('<code>internalMethod');
        });

        it('should include stuff marked as protected', () => {
            expect(componentFile).toContain('varprotected</b>');
        });

        it('should display lifecyle hooks', () => {
            expect(componentFile).toContain('<code>ngOnInit');
        });

        it('should exclude miscellaneous function marked as @private', () => {
            let file = read(distFolder + '/miscellaneous/functions.html');
            expect(file).toEqual(expect.not.stringContaining('private function'));
        });
    });

    describe('disabling excluding methods with --disableProtected', () => {
        let componentFile;
        beforeAll(function(done) {
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
        afterAll(() => tmp.clean(distFolder));

        it('should exclude methods marked as protected', () => {
            expect(componentFile).toEqual(expect.not.stringContaining('<code>varprotected'));
        });

        it('should include methods marked as private', () => {
            expect(componentFile).toContain('<code>privateMethod');
        });

        it('should include methods marked as internal', () => {
            expect(componentFile).toContain('<code>internalMethod');
        });

        it('should display lifecyle hooks', () => {
            expect(componentFile).toContain('<code>ngOnInit');
        });
    });

    describe('disabling excluding methods with --disableInternal', () => {
        let componentFile;
        beforeAll(function(done) {
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
        afterAll(() => tmp.clean(distFolder));

        it('should exclude methods marked as @internal', () => {
            expect(componentFile).toEqual(expect.not.stringContaining('<code>internalMethod'));
        });

        it('should include methods marked as private', () => {
            expect(componentFile).toContain('<code>privateMethod');
        });

        it('should include stuff marked as protected', () => {
            expect(componentFile).toContain('varprotected</b>');
        });

        it('should display lifecyle hooks', () => {
            expect(componentFile).toContain('<code>ngOnInit');
        });

        it('correct supports @internal + link', () => {
            let file = read(distFolder + '/directives/QueryParamNameDirective.html');
            expect(file).toContain('code>constructor(groupService: QueryParamGroupService');
        });
    });

    describe('disabling excluding methods with --disableLifeCycleHooks', () => {
        let componentFile;
        beforeAll(function(done) {
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
        afterAll(() => tmp.clean(distFolder));

        it('should exclude lifecyle hooks', () => {
            expect(componentFile).toEqual(expect.not.stringContaining('<code>ngOnInit'));
            const directiveFile = read(`${distFolder}/directives/BarDirective.html`);
            expect(directiveFile).toEqual(expect.not.stringContaining('<code>ngOnInit'));
        });

        it('should include methods marked as private', () => {
            expect(componentFile).toContain('<code>privateMethod');
        });

        it('should include stuff marked as protected', () => {
            expect(componentFile).toContain('varprotected</b>');
        });

        it('should include methods marked as internal', () => {
            expect(componentFile).toContain('<code>internalMethod');
        });
    });

    describe('disabling excluding methods with --disableLifeCycleHooks for component inheritance', () => {
        let componentFile;
        beforeEach(function(done) {
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
        afterEach(() => tmp.clean(distFolder));

        it('should exclude lifecyle hooks', () => {
            expect(componentFile).toEqual(expect.not.stringContaining('<code>ngOnInit'));
        });
    });

    describe('disabling excluding methods with --disableLifeCycleHooks --disableInternal --disableProtected --disablePrivate', () => {
        let componentFile;
        beforeAll(function(done) {
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
        afterAll(() => tmp.clean(distFolder));

        it('should exclude lifecyle hooks', () => {
            expect(componentFile).toEqual(expect.not.stringContaining('<code>ngOnInit'));
        });

        it('should exclude methods marked as private', () => {
            expect(componentFile).toEqual(expect.not.stringContaining('<code>privateMethod'));
        });

        it('should exclude stuff marked as protected', () => {
            expect(componentFile).toEqual(expect.not.stringContaining('<code>varprotected'));
        });

        it('should exclude methods marked as internal', () => {
            expect(componentFile).toEqual(expect.not.stringContaining('<code>internalMethod'));
        });
    });

    describe('disabling search with --disableSearch', () => {
        beforeAll(function(done) {
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
        afterAll(() => tmp.clean(distFolder));

        it('should not generate search JS files', () => {
            let file = read(`${distFolder}/index.html`);
            expect(file).toEqual(expect.not.stringContaining('lunr.min.js'));
            const index = exists(distFolder + '/js/search/search_index.js');
            expect(index).toBeFalsy();
        });

        it('should not generate search input', () => {
            let file = read(`${distFolder}/js/menu-wc.js`);
            expect(file).toEqual(expect.not.stringContaining('book-search-input'));
        });
    });

    describe('disabling dependencies with --disableDependencies', () => {
        beforeEach(function(done) {
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
        afterEach(() => tmp.clean(distFolder));

        it('should not generate the dependencies list', () => {
            let file = read(`${distFolder}/js/menu-wc.js`);
            expect(file).toEqual(expect.not.stringContaining('href="dependencies.html"'));
        });
    });

    describe('minimal with --minimal', () => {
        let fileContents;

        beforeAll(function(done) {
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
        afterAll(() => tmp.clean(distFolder));

        it('should not generate search JS files', () => {
            let file = read(`${distFolder}/index.html`);
            expect(file).toEqual(expect.not.stringContaining('lunr.min.js'));
            const index = exists(distFolder + '/js/search/search_index.js');
            expect(index).toBeFalsy();
        });

        it('should not generate search input', () => {
            let file = read(`${distFolder}/js/menu-wc.js`);
            expect(file).toEqual(expect.not.stringContaining('book-search-input'));
        });

        it('should not include the graph on the modules page', () => {
            fileContents = read(`${distFolder}/modules.html`);
            expect(fileContents).toEqual(expect.not.stringContaining('dependencies.svg'));
            expect(fileContents).toEqual(expect.not.stringContaining('svg-pan-zoom'));
        });

        it('should not include the graph on the individual modules pages', () => {
            fileContents = read(`${distFolder}/modules/AppModule.html`);
            expect(fileContents).toEqual(
                expect.not.stringContaining('modules/AppModule/dependencies.svg')
            );
            expect(fileContents).toEqual(expect.not.stringContaining('svg-pan-zoom'));
        });

        it('it should not exist routes_index.js file', () => {
            const isFileExists = exists(`${distFolder}/js/routes/routes_index.js`);
            expect(isFileExists).toBeFalsy();
        });

        it('it should not have coverage page', () => {
            const isFileExists = exists(`${distFolder}/coverage.html`);
            expect(isFileExists).toBeFalsy();
        });
    });
});
