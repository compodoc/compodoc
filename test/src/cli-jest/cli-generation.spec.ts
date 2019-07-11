import { exists, read, shell, temporaryDir } from '../helpers';

const path = require('path'),
    tmp = temporaryDir();

describe('CLI simple generation', () => {
    const distFolder = tmp.name + '-simple-generation';

    describe('when generation with d flag - relative folder', () => {
        let stdoutString = undefined,
            fooComponentFile,
            fooServiceFile,
            componentFile,
            moduleFile,
            emptyModuleFile,
            barModuleFile,
            emptyModuleRawFile;
        beforeAll(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            fooComponentFile = read(`${distFolder}/components/FooComponent.html`);
            fooServiceFile = read(`${distFolder}/injectables/FooService.html`);
            moduleFile = read(`${distFolder}/modules/AppModule.html`);
            componentFile = read(`${distFolder}/components/BarComponent.html`);
            emptyModuleFile = read(`${distFolder}/modules/EmptyModule.html`);
            emptyModuleRawFile = read(`${distFolder}/modules/EmptyRawModule.html`);
            barModuleFile = read(`${distFolder}/modules/BarModule.html`);
            done();
        });
        afterAll(() => tmp.clean(distFolder));

        it('should display generated message', () => {
            expect(stdoutString).toContain('Documentation generated');
        });

        it('should have generated main folder', () => {
            const isFolderExists = exists(`${distFolder}`);
            expect(isFolderExists).toBeTruthy();
        });

        it('should have generated main pages', () => {
            const isIndexExists = exists(`${distFolder}/index.html`);
            expect(isIndexExists).toBeTruthy();
            const isModulesExists = exists(`${distFolder}/modules.html`);
            expect(isModulesExists).toBeTruthy();
        });

        it('should have generated resources folder', () => {
            const isImagesExists = exists(`${distFolder}/images`);
            expect(isImagesExists).toBeTruthy();
            const isJSExists = exists(`${distFolder}/js`);
            expect(isJSExists).toBeTruthy();
            const isStylesExists = exists(`${distFolder}/styles`);
            expect(isStylesExists).toBeTruthy();
            const isFontsExists = exists(`${distFolder}/fonts`);
            expect(isFontsExists).toBeTruthy();
        });

        it('should have generated search index json', () => {
            const isIndexExists = exists(`${distFolder}/js/search/search_index.js`);
            expect(isIndexExists).toBeTruthy();
        });

        it('should have generated sourceCode for files', () => {
            expect(moduleFile).toContain('import { FooDirective } from');
            expect(fooComponentFile).toContain('export class FooComponent');
            expect(fooServiceFile).toContain('export class FooService');
        });

        /**
         *   JSDOC
         */

        it('it should have a link with this syntax {@link BarComponent}', () => {
            expect(moduleFile).toContain(
                'See <a href="../components/BarComponent.html">BarComponent'
            );
        });

        it('it should have a link with this syntax [The BarComponent]{@link BarComponent}', () => {
            expect(barModuleFile).toContain(
                'Watch <a href="../components/BarComponent.html">The BarComponent'
            );
        });

        it('it should have a link with this syntax {@link BarComponent|BarComponent3}', () => {
            expect(fooComponentFile).toContain('See <a href="../modules/AppModule.html">APP');
        });

        it('it should have infos about FooService open function param', () => {
            expect(fooServiceFile).toContain('<p>The entry value');
        });

        it('it should have infos about FooService open function returns', () => {
            expect(fooServiceFile).toContain('<p>The string</p>');
        });

        it('it should have infos about FooService close function return JSDoc tag', () => {
            expect(fooServiceFile).toContain('<p>Another string</p>');
        });

        it('it should have infos about FooService open function example', () => {
            expect(fooServiceFile).toContain('<b>Example :</b>');
            expect(fooServiceFile).toContain('FooService.open(');
        });

        it('it should have link to TypeScript doc', () => {
            expect(fooServiceFile).toContain('typescriptlang.org');
        });

        it('it should have a link with this syntax {@link http://www.google.fr|Second link}', () => {
            expect(barModuleFile).toContain('<a href="http://www.google.fr">Second link</a>');
        });
        it('it should have a link with this syntax {@link http://www.google.uk Third link}', () => {
            expect(barModuleFile).toContain('<a href="http://www.google.uk">Third link</a>');
        });
        it('it should have a link with this syntax [Last link]{@link http://www.google.jp}', () => {
            expect(barModuleFile).toContain('<a href="http://www.google.jp">Last link</a>');
        });

        /**
         * internal/private methods
         */
        it('should include by default methods marked as internal', () => {
            expect(componentFile).toContain('<code>internalMethod');
        });

        it('should exclude methods marked as hidden', () => {
            expect(componentFile).toEqual(expect.not.stringContaining('<code>hiddenMethod'));
        });

        it('should include by default methods marked as private', () => {
            expect(componentFile).toContain('<code>privateMethod');
        });

        /**
         * No graph for empty module
         */

        it('it should not generate graph for empty metadatas module', () => {
            expect(emptyModuleFile).toEqual(expect.not.stringContaining('module-graph-svg'));
        });

        it('it should not break for empty raw metadatas module', () => {
            expect(emptyModuleRawFile).toEqual(expect.not.stringContaining('module-graph-svg'));
        });

        /**
         * Support of function type parameters
         */

        it('it should display function type parameters', () => {
            expect(fooServiceFile).toContain('<code>close(work: (toto: ');
        });

        it('it should display c-style typed arrays', () => {
            expect(fooServiceFile).toContain('<code>string');
        });
    });

    describe('when generation with d flag without / at the end - relative folder', () => {
        beforeAll(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
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

        it('should have generated main folder', () => {
            const isFolderExists = exists(`${distFolder}`);
            expect(isFolderExists).toBeTruthy();
        });

        it('should have generated main pages', () => {
            const isIndexExists = exists(`${distFolder}/index.html`);
            expect(isIndexExists).toBeTruthy();
            const isModulesExists = exists(`${distFolder}/modules.html`);
            expect(isModulesExists).toBeTruthy();
        });
    });

    describe('when generation with d flag - absolute folder', () => {
        let stdoutString = undefined,
            fooComponentFile,
            fooServiceFile,
            componentFile,
            moduleFile;
        beforeAll(function(done) {
            tmp.create(distFolder);
            let ls = shell(
                'node',
                [
                    '../bin/index-cli.js',
                    '-p',
                    '../test/src/sample-files/tsconfig.simple.json',
                    '-d',
                    '/tmp/' + distFolder + '/'
                ],
                { cwd: distFolder }
            );

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            fooComponentFile = read(`/tmp/${distFolder}/components/FooComponent.html`);
            fooServiceFile = read(`/tmp/${distFolder}/injectables/FooService.html`);
            moduleFile = read(`/tmp/${distFolder}/modules/AppModule.html`);
            componentFile = read(`/tmp/${distFolder}/components/BarComponent.html`);
            done();
        });
        afterAll(() => tmp.clean(distFolder));

        it('should display generated message', () => {
            expect(stdoutString).toContain('Documentation generated');
        });

        it('should have generated main folder', () => {
            const isFolderExists = exists(`/tmp/${distFolder}`);
            expect(isFolderExists).toBeTruthy();
        });

        it('should have generated main pages', () => {
            const isIndexExists = exists(`/tmp/${distFolder}/index.html`);
            expect(isIndexExists).toBeTruthy();
            const isModulesExists = exists(`/tmp/${distFolder}/modules.html`);
            expect(isModulesExists).toBeTruthy();
        });

        it('should have generated resources folder', () => {
            const isImagesExists = exists(`/tmp/${distFolder}/images`);
            expect(isImagesExists).toBeTruthy();
            const isJSExists = exists(`/tmp/${distFolder}/js`);
            expect(isJSExists).toBeTruthy();
            const isStylesExists = exists(`/tmp/${distFolder}/styles`);
            expect(isStylesExists).toBeTruthy();
            const isFontsExists = exists(`/tmp/${distFolder}/fonts`);
            expect(isFontsExists).toBeTruthy();
        });

        it('should have generated search index json', () => {
            const isIndexExists = exists(`/tmp/${distFolder}/js/search/search_index.js`);
            expect(isIndexExists).toBeTruthy();
        });
    });

    /*describe('when generation with d flag - absolute folder inside cwd', () => {

        let stdoutString = undefined,
            actualDir,
            fooComponentFile,
            fooServiceFile,
            componentFile,
            moduleFile;
        beforeEach((done) => {
            tmp.create(distFolder);

            actualDir = process.cwd();

            actualDir = actualDir.replace(' ', '');
            actualDir = actualDir.replace('\n', '');
            actualDir = actualDir.replace('\r\n', '');

            let ls = shell('node', [
                './bin/index-cli.js',
                '-p', './test/src/sample-files/tsconfig.simple.json',
                '-d', actualDir + '/' + distFolder], { cwd: distFolder});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            fooComponentFile = read(`/tmp/${distFolder}/components/FooComponent.html`);
            fooServiceFile = read(`/tmp/${distFolder}/injectables/FooService.html`);
            moduleFile  = read(`/tmp/${distFolder}/modules/AppModule.html`);
            componentFile = read(`/tmp/${distFolder}/components/BarComponent.html`);
            done();
        });
        afterEach(() => tmp.clean(actualDir + '/' + distFolder));

        it('should display generated message', () => {
            expect(stdoutString).toContain('Documentation generated');
        });

        it('should have generated main folder', () => {
            const isFolderExists = exists(`${actualDir}/${distFolder}`);
            expect(isFolderExists).toBeTruthy();
        });

        it('should have generated main pages', () => {
            const isIndexExists = exists(`${actualDir}/${distFolder}/index.html`);
            expect(isIndexExists).toBeTruthy();
            const isModulesExists = exists(`${actualDir}/${distFolder}/modules.html`);
            expect(isModulesExists).toBeTruthy();
        });

        it('should have generated resources folder', () => {
            const isImagesExists = exists(`${actualDir}/${distFolder}/images`);
            expect(isImagesExists).toBeTruthy();
            const isJSExists = exists(`${actualDir}/${distFolder}/js`);
            expect(isJSExists).toBeTruthy();
            const isStylesExists = exists(`${actualDir}/${distFolder}/styles`);
            expect(isStylesExists).toBeTruthy();
            const isFontsExists = exists(`${actualDir}/${distFolder}/fonts`);
            expect(isFontsExists).toBeTruthy();
        });

        it('should have generated search index json', () => {
            const isIndexExists = exists(`${actualDir}/${distFolder}/js/search/search_index.js`);
            expect(isIndexExists).toBeTruthy();
        });
    });*/

    describe('when generation with d and a flags', () => {
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '-d',
                distFolder,
                '-a',
                './screenshots/'
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should have copying assets folder', () => {
            const isFolderExists = exists(`${distFolder}/screenshots`);
            expect(isFolderExists).toBeTruthy();
        });
    });

    describe('when passing a deep path on a flag', () => {
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '-d',
                distFolder,
                '-a',
                './test/src/todomvc-ng2/screenshots/actions'
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should flatten the path to the deeper dirname', () => {
            const isFolderExists = exists(`${distFolder}/actions`);
            expect(isFolderExists).toBeTruthy();
        });
    });

    describe('when generation with d flag and src arg', () => {
        let stdoutString = undefined;
        beforeAll(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                './test/src/sample-files/',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        afterAll(() => tmp.clean(distFolder));

        it('should display generated message', () => {
            expect(stdoutString).toContain('Documentation generated');
        });

        it('should have generated main folder', () => {
            const isFolderExists = exists(`${distFolder}`);
            expect(isFolderExists).toBeTruthy();
        });

        it('should have generated main pages', () => {
            const isIndexExists = exists(`${distFolder}/index.html`);
            expect(isIndexExists).toBeTruthy();
            const isModulesExists = exists(`${distFolder}/modules.html`);
            expect(isModulesExists).toBeTruthy();
        });
    });

    describe('when generation without d flag', () => {
        let stdoutString = undefined;
        beforeAll(function(done) {
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json'
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        afterAll(() => tmp.clean('documentation'));

        it('should display generated message', () => {
            expect(stdoutString).toContain('Documentation generated');
        });

        it('should have generated main folder', () => {
            const isFolderExists = exists('documentation');
            expect(isFolderExists).toBeTruthy();
        });

        it('should have generated main pages', () => {
            const isIndexExists = exists('documentation/index.html');
            expect(isIndexExists).toBeTruthy();
            const isModulesExists = exists('documentation/modules.html');
            expect(isModulesExists).toBeTruthy();
        });

        it('should have generated resources folder', () => {
            const isImagesExists = exists('documentation/images');
            expect(isImagesExists).toBeTruthy();
            const isJSExists = exists('documentation/js');
            expect(isJSExists).toBeTruthy();
            const isStylesExists = exists('documentation/styles');
            expect(isStylesExists).toBeTruthy();
            const isFontsExists = exists('documentation/fonts');
            expect(isFontsExists).toBeTruthy();
        });
    });

    describe('when generation with -t flag', () => {
        let stdoutString = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '-t',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should not display anything', () => {
            expect(stdoutString).toEqual(expect.not.stringContaining('parsing'));
        });
    });

    describe('when generation with --theme flag', () => {
        let stdoutString = undefined,
            baseTheme = 'laravel',
            index = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--theme',
                baseTheme,
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should add theme css', () => {
            index = read(`${distFolder}/index.html`);
            expect(index).toContain('href="./styles/' + baseTheme + '.css"');
        });
    });

    describe('when generation with -n flag', () => {
        let stdoutString = undefined,
            name = 'TodoMVC-angular2-application',
            index = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '-n',
                name,
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should edit name', () => {
            index = read(`${distFolder}/js/menu-wc.js`);
            expect(index).toContain(name);
        });
    });

    describe('when generation with --hideGenerator flag', () => {
        let stdoutString = undefined,
            index = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--hideGenerator',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should not contain compodoc logo', () => {
            index = read(`${distFolder}/index.html`);
            expect(index).toEqual(
                expect.not.stringContaining('src="./images/compodoc-vectorise.svg"')
            );
        });
    });

    describe('when generation with --disableSourceCode flag', () => {
        let stdoutString = undefined,
            index = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--disableSourceCode',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should not contain sourceCode tab', () => {
            index = read(`${distFolder}/modules/AppModule.html`);
            expect(index).toEqual(expect.not.stringContaining('id="source-tab"'));
        });
    });

    describe('when generation with --disableDomTree flag', () => {
        let stdoutString = undefined,
            index = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--disableDomTree',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should not contain domTree tab', () => {
            index = read(`${distFolder}/components/BarComponent.html`);
            expect(index).toEqual(expect.not.stringContaining('id="tree-tab"'));
        });
    });

    describe('when generation of component dependecy doc with --navTabConfig option', () => {
        let stdoutString = undefined,
            index = undefined;
        beforeAll(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--navTabConfig',
                `[
                    {\"id\": \"source\",\"label\": \"Test Label 1\"},
                    {\"id\": \"info\",\"label\": \"Test Label 2\"}
                ]`,
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            index = read(`${distFolder}/components/BarComponent.html`);
            index = index.replace(/\r?\n|\r/g, '');
            done();
        });
        afterAll(() => tmp.clean(distFolder));

        it('should not contain a domTree tab', () => {
            expect(index).toEqual(expect.not.stringContaining('id="tree-tab"'));
        });
        it('should not contain a template tab', () => {
            expect(index).toEqual(expect.not.stringContaining('id="templateData-tab"'));
        });
        it('should set source as the active tab', () => {
            expect(index).toContain('<li class="active">            <a href="#source"');
        });
        it('should set the source tab label', () => {
            expect(index).toContain('data-link="source">Test Label 1');
        });
        it('should set the info tab label', () => {
            expect(index).toContain('data-link="info">Test Label 2');
        });
    });

    describe('when generation of module dependecy doc with --navTabConfig option', () => {
        let stdoutString = undefined,
            index = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--navTabConfig',
                `[
                    {\"id\": \"tree\",\"label\": \"DOM Tree\"},
                    {\"id\": \"source\",\"label\": \"Source\"},
                    {\"id\": \"info\",\"label\": \"Info\"}
                ]`,
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            index = read(`${distFolder}/modules/AppModule.html`);
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should not contain a domTree tab', () => {
            expect(index).toEqual(expect.not.stringContaining('id="tree-tab"'));
        });
    });

    describe('when generation with --disableTemplateTab flag', () => {
        let stdoutString = undefined,
            index = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--disableTemplateTab',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should not contain template tab', () => {
            index = read(`${distFolder}/components/BarComponent.html`);
            expect(index).toEqual(expect.not.stringContaining('id="templateData-tab"'));
        });
    });

    describe('when generation with --disableStyleTab flag', () => {
        let stdoutString = undefined,
            index = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--disableStyleTab',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should not contain style tab', () => {
            index = read(`${distFolder}/components/BarComponent.html`);
            expect(index).toEqual(expect.not.stringContaining('id="styleData-tab"'));
        });
    });

    describe('when generation with --disableGraph flag', () => {
        let stdoutString = undefined,
            fileContents = undefined;
        beforeAll(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--disableGraph',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        afterAll(() => tmp.clean(distFolder));

        it('should not generate any graph data', () => {
            expect(stdoutString).toContain('Graph generation disabled');
            expect(stdoutString).toEqual(expect.not.stringContaining('Process main graph'));
        });

        it('should not include the graph on the modules page', () => {
            fileContents = read(`${distFolder}/modules.html`);
            expect(fileContents).toEqual(expect.not.stringContaining('dependencies.svg'));
            expect(fileContents).toEqual(expect.not.stringContaining('svg-pan-zoom'));
        });

        it('should not include the graph on the overview page', () => {
            fileContents = read(`${distFolder}/index.html`);
            expect(fileContents).toEqual(expect.not.stringContaining('graph/dependencies.svg'));
            expect(fileContents).toEqual(expect.not.stringContaining('svg-pan-zoom'));
        });

        it('should not include the graph on the individual modules pages', () => {
            fileContents = read(`${distFolder}/modules/AppModule.html`);
            expect(fileContents).toEqual(
                expect.not.stringContaining('modules/AppModule/dependencies.svg')
            );
            expect(fileContents).toEqual(expect.not.stringContaining('svg-pan-zoom'));
        });
    });

    describe('when generation with -r flag', () => {
        let stdoutString = '',
            port = 6666,
            child;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell(
                'node',
                ['./bin/index-cli.js', '-s', '-r', '-r', port, '-d', distFolder],
                { timeout: 10000 }
            );

            if (ls.stderr.toString() !== '') {
                done(new Error(`shell error: ${ls.stderr.toString()}`));
                return;
            }

            stdoutString = ls.stdout.toString();
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should contain port ' + port, () => {
            expect(stdoutString).toContain('Serving documentation');
            expect(stdoutString).toContain(port);
        });
    });

    describe('when generation with -p flag - absolute folder', () => {
        let stdoutString = '';
        beforeEach(function(done) {
            tmp.create(distFolder);

            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                path.join(process.cwd() + path.sep + 'test/src/todomvc-ng2/src/tsconfig.json'),
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                done(new Error(`shell error: ${ls.stderr.toString()}`));
                return;
            }

            stdoutString = ls.stdout.toString();
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should display generated message', () => {
            expect(stdoutString).toContain('Documentation generated');
        });
    });
});
