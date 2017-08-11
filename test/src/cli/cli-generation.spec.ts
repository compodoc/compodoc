import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir(),
      tsconfigPath = require.resolve('../../../tsconfig.json'),
      env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI simple generation', () => {

    describe('when generation with d flag - relative folder', () => {

        let stdoutString = null,
            fooComponentFile,
            fooServiceFile,
            componentFile,
            moduleFile,
            emptyModuleFile,
            emptyModuleRawFile;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            fooComponentFile = read(`${tmp.name}/components/FooComponent.html`);
            fooServiceFile = read(`${tmp.name}/injectables/FooService.html`);
            moduleFile  = read(`${tmp.name}/modules/AppModule.html`);
            componentFile = read(`${tmp.name}/components/BarComponent.html`);
            emptyModuleFile = read(`${tmp.name}/modules/EmptyModule.html`);
            emptyModuleRawFile = read(`${tmp.name}/modules/EmptyRawModule.html`);
            done();
        });
        after(() => tmp.clean());

        it('should display generated message', () => {
            expect(stdoutString).to.contain('Documentation generated');
        });

        it('should have generated main folder', () => {
            const isFolderExists = exists(`${tmp.name}`);
            expect(isFolderExists).to.be.true;
        });

        it('should have generated main pages', () => {
            const isIndexExists = exists(`${tmp.name}/index.html`);
            expect(isIndexExists).to.be.true;
            const isModulesExists = exists(`${tmp.name}/modules.html`);
            expect(isModulesExists).to.be.true;
        });

        it('should have generated resources folder', () => {
            const isImagesExists = exists(`${tmp.name}/images`);
            expect(isImagesExists).to.be.true;
            const isJSExists = exists(`${tmp.name}/js`);
            expect(isJSExists).to.be.true;
            const isStylesExists = exists(`${tmp.name}/styles`);
            expect(isStylesExists).to.be.true;
            const isFontsExists = exists(`${tmp.name}/fonts`);
            expect(isFontsExists).to.be.true;
        });

        it('should have generated search index json', () => {
            const isIndexExists = exists(`${tmp.name}/js/search/search_index.js`);
            expect(isIndexExists).to.be.true;
        });

        it('should have generated sourceCode for files', () => {
            expect(moduleFile).to.contain('import { FooDirective } from');
            expect(fooComponentFile).to.contain('export class FooComponent');
            expect(fooServiceFile).to.contain('export class FooService');
        });

        /**
         *   JSDOC
         */

        it('it should have a link with this syntax {@link BarComponent}', () => {
            expect(moduleFile).to.contain('See <a href="../components/BarComponent.html">BarComponent');
        });

        it('it should have a link with this syntax [The BarComponent]{@link BarComponent}', () => {
            const barModuleFile  = read(`${tmp.name}/modules/BarModule.html`);
            expect(barModuleFile).to.contain('Watch <a href="../components/BarComponent.html">The BarComponent');
        });

        it('it should have a link with this syntax {@link BarComponent|BarComponent3}', () => {
            expect(fooComponentFile).to.contain('See <a href="../modules/AppModule.html">APP');
        });

        it('it should have infos about FooService open function param', () => {
            expect(fooServiceFile).to.contain('td><p>The entry value');
        });

        it('it should have infos about FooService open function returns', () => {
            expect(fooServiceFile).to.contain('<p>The string</p>');
        });

        it('it should have infos about FooService open function example', () => {
            expect(fooServiceFile).to.contain('<b>Example :</b>');
            expect(fooServiceFile).to.contain('FooService.open(');
        });

        it('it should have link to TypeScript doc', () => {
            expect(fooServiceFile).to.contain('typescriptlang.org');
        });

        /**
         * internal/private methods
         */
         it('should include by default methods marked as internal', () => {
             expect(componentFile).to.contain('<code>internalMethod');
         });

         it('should exclude methods marked as hidden', () => {
             expect(componentFile).not.to.contain('<code>hiddenMethod');
         });

         it('should include by default methods marked as private', () => {
             expect(componentFile).to.contain('<code>privateMethod');
         });

        /**
         * No graph for empty module
         */

         it('it should not generate graph for empty metadatas module', () => {
             expect(emptyModuleFile).not.to.contain('module-graph-svg');
         });

         it('it should not break for empty raw metadatas module', () => {
             expect(emptyModuleRawFile).not.to.contain('module-graph-svg');
         });

        /**
         * Support of function type parameters
         */

         it('it should display function type parameters', () => {
             expect(fooServiceFile).to.contain('<code>close(work: (toto: ');
         });

         it('it should display c-style typed arrays', () => {
             expect(fooServiceFile).to.contain('<code>string');
         });

    });

    describe('when generation with d flag without / at the end - relative folder', () => {
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '-d', '../' + tmp.name], { cwd: tmp.name, env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean());

        it('should have generated main folder', () => {
            const isFolderExists = exists(`${tmp.name}`);
            expect(isFolderExists).to.be.true;
        });

        it('should have generated main pages', () => {
            const isIndexExists = exists(`${tmp.name}/index.html`);
            expect(isIndexExists).to.be.true;
            const isModulesExists = exists(`${tmp.name}/modules.html`);
            expect(isModulesExists).to.be.true;
        });
    });

    describe('when generation with d flag - absolute folder', () => {

        let stdoutString = null,
            fooComponentFile,
            fooServiceFile,
            componentFile,
            moduleFile;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '-d', '/tmp/' + tmp.name + '/'], { cwd: tmp.name, env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            fooComponentFile = read(`/tmp/${tmp.name}/components/FooComponent.html`);
            fooServiceFile = read(`/tmp/${tmp.name}/injectables/FooService.html`);
            moduleFile  = read(`/tmp/${tmp.name}/modules/AppModule.html`);
            componentFile = read(`/tmp/${tmp.name}/components/BarComponent.html`);
            done();
        });
        after(() => tmp.clean());

        it('should display generated message', () => {
            expect(stdoutString).to.contain('Documentation generated');
        });

        it('should have generated main folder', () => {
            const isFolderExists = exists(`/tmp/${tmp.name}`);
            expect(isFolderExists).to.be.true;
        });

        it('should have generated main pages', () => {
            const isIndexExists = exists(`/tmp/${tmp.name}/index.html`);
            expect(isIndexExists).to.be.true;
            const isModulesExists = exists(`/tmp/${tmp.name}/modules.html`);
            expect(isModulesExists).to.be.true;
        });

        it('should have generated resources folder', () => {
            const isImagesExists = exists(`/tmp/${tmp.name}/images`);
            expect(isImagesExists).to.be.true;
            const isJSExists = exists(`/tmp/${tmp.name}/js`);
            expect(isJSExists).to.be.true;
            const isStylesExists = exists(`/tmp/${tmp.name}/styles`);
            expect(isStylesExists).to.be.true;
            const isFontsExists = exists(`/tmp/${tmp.name}/fonts`);
            expect(isFontsExists).to.be.true;
        });

        it('should have generated search index json', () => {
            const isIndexExists = exists(`/tmp/${tmp.name}/js/search/search_index.js`);
            expect(isIndexExists).to.be.true;
        });
    });

    describe('when generation with d and a flags', () => {

        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p', './test/src/sample-files/tsconfig.simple.json',
                '-d', './' + tmp.name + '/',
                '-a', './screenshots/'], { env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean());

        it('should have copying assets folder', () => {
            const isFolderExists = exists(`${tmp.name}/screenshots`);
            expect(isFolderExists).to.be.true;
        });
    });

    describe('when generation with d flag and src arg', () => {

        let stdoutString = null;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '../test/src/sample-files/',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean());

        it('should display generated message', () => {
            expect(stdoutString).to.contain('Documentation generated');
        });

        it('should have generated main folder', () => {
            const isFolderExists = exists(`${tmp.name}`);
            expect(isFolderExists).to.be.true;
        });

        it('should have generated main pages', () => {
            const isIndexExists = exists(`${tmp.name}/index.html`);
            expect(isIndexExists).to.be.true;
            const isModulesExists = exists(`${tmp.name}/modules.html`);
            expect(isModulesExists).to.be.true;
        });
    });

    describe('when generation without d flag', () => {

        let stdoutString = null;
        before(function (done) {
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p', './test/src/sample-files/tsconfig.simple.json'], { env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean('documentation'));

        it('should display generated message', () => {
            expect(stdoutString).to.contain('Documentation generated');
        });

        it('should have generated main folder', () => {
            const isFolderExists = exists('documentation');
            expect(isFolderExists).to.be.true;
        });

        it('should have generated main pages', () => {
            const isIndexExists = exists('documentation/index.html');
            expect(isIndexExists).to.be.true;
            const isModulesExists = exists('documentation/modules.html');
            expect(isModulesExists).to.be.true;
            const isOverviewExists = exists('documentation/overview.html');
            expect(isOverviewExists).to.be.true;
        });

        it('should have generated resources folder', () => {
            const isImagesExists = exists('documentation/images');
            expect(isImagesExists).to.be.true;
            const isJSExists = exists('documentation/js');
            expect(isJSExists).to.be.true;
            const isStylesExists = exists('documentation/styles');
            expect(isStylesExists).to.be.true;
            const isFontsExists = exists('documentation/fonts');
            expect(isFontsExists).to.be.true;
        });
    });

    describe('when generation with -t flag', () => {

        let stdoutString = null;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p', './test/src/sample-files/tsconfig.simple.json',
                '-t',
                '-d', './' + tmp.name + '/'], { env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(tmp.name));

        it('should not display anything', () => {
            expect(stdoutString).to.contain('Node.js');
            expect(stdoutString).to.not.contain('parsing');
        });
    });

    describe('when generation with --theme flag', () => {

        let stdoutString = null,
            baseTheme = 'laravel',
            index = null;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p', './test/src/sample-files/tsconfig.simple.json',
                '--theme', baseTheme,
                '-d', './' + tmp.name + '/'], { env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(tmp.name));

        it('should add theme css', () => {
            index = read(`${tmp.name}/index.html`);
            expect(index).to.contain('href="./styles/' + baseTheme + '.css"');
        });
    });

    describe('when generation with -n flag', () => {

        let stdoutString = null,
            name = 'TodoMVC-angular2-application',
            index = null;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p', './test/src/sample-files/tsconfig.simple.json',
                '-n', name,
                '-d', './' + tmp.name + '/'], { env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(tmp.name));

        it('should edit name', () => {
            index = read(`${tmp.name}/index.html`);
            expect(index).to.contain(name);
        });
    });

    describe('when generation with --hideGenerator flag', () => {

        let stdoutString = null,
            index = null;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p', './test/src/sample-files/tsconfig.simple.json',
                '--hideGenerator',
                '-d', './' + tmp.name + '/'], { env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(tmp.name));

        it('should not contain compodoc logo', () => {
            index = read(`${tmp.name}/index.html`);
            expect(index).to.not.contain('src="./images/compodoc-vectorise.svg"');
        });
    });

    describe('when generation with --disableSourceCode flag', () => {

        let stdoutString = null,
            index = null;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p', './test/src/sample-files/tsconfig.simple.json',
                '--disableSourceCode',
                '-d', './' + tmp.name + '/'], { env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(tmp.name));

        it('should not contain sourceCode tab', () => {
            index = read(`${tmp.name}/modules/AppModule.html`);
            expect(index).to.not.contain('id="source-tab"');
        });
    });

    describe('when generation with --disableGraph flag', () => {

        let stdoutString = null,
          fileContents = null;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p', './test/src/sample-files/tsconfig.simple.json',
                '--disableGraph',
                '-d', './' + tmp.name + '/'], { env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        //after(() => tmp.clean(tmp.name));

        it('should not generate any graph data', () => {
            expect(stdoutString).to.contain('Graph generation disabled');
            expect(stdoutString).not.to.contain('Process main graph');
        });

        it('should not include the graph on the modules page', () => {
            fileContents = read(`${tmp.name}/modules.html`);
            expect(fileContents).to.not.contain('dependencies.svg');
            expect(fileContents).to.not.contain('svg-pan-zoom');
        });

        it('should not include the graph on the overview page', () => {
            fileContents = read(`${tmp.name}/overview.html`);
            expect(fileContents).to.not.contain('graph/dependencies.svg');
            expect(fileContents).to.not.contain('svg-pan-zoom');
        });

        it('should not include the graph on the individual modules pages', () => {
            fileContents = read(`${tmp.name}/modules/AppModule.html`);
            expect(fileContents).to.not.contain('modules/AppModule/dependencies.svg');
            expect(fileContents).to.not.contain('svg-pan-zoom');
        });
    });

    describe('when generation with -r flag', () => {

        let stdoutString = '',
            port = 6666,
            child;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                './bin/index-cli.js',
                '-s',
                '-r',
                '-r', port,
                '-d', './' + tmp.name + '/'], { env, timeout: 5000});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(tmp.name));

        it('should contain port ' + port, () => {
            expect(stdoutString).to.contain('Serving documentation');
            expect(stdoutString).to.contain(port);
        });
    });

});
