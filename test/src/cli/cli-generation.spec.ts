import * as chai from 'chai';
const expect = chai.expect;

import {temporaryDir, shell, pkg, exists, exec, read} from '../helpers';
const tmp = temporaryDir();
const tsconfigPath = require.resolve('../../../tsconfig.json');
const tsNodePath = require.resolve('../../../node_modules/.bin/ts-node');
const env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI simple generation', () => {

    describe('when generation with d flag', () => {

        let stdoutString = null,
            fooComponentFile,
            fooServiceFile,
            componentFile,
            coverageFile;
        before(function (done) {
            tmp.create();
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                done('error');
                return;
              }
              stdoutString = stdout;
              fooComponentFile = read(`${tmp.name}/components/FooComponent.html`);
              fooServiceFile = read(`${tmp.name}/injectables/FooService.html`);
              coverageFile = read(`${tmp.name}/coverage.html`);
              componentFile = read(`${tmp.name}/components/BarComponent.html`);
              done();
            });
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
            const isOverviewExists = exists(`${tmp.name}/overview.html`);
            expect(isOverviewExists).to.be.true;
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

        /**
         *   JSDOC
         */

         it('it should have a link with this syntax {@link BarComponent}', () => {
             expect(fooComponentFile).to.contain('<a href="../components/BarComponent.html">BarComponent');
         });

         it('it should have a link with this syntax [BarComponent2]{@link BarComponent}', () => {
             expect(fooComponentFile).to.contain('<a href="../components/BarComponent.html">BarComponent2');
         });

         it('it should have a link with this syntax {@link BarComponent|BarComponent3}', () => {
             expect(fooComponentFile).to.contain('<a href="../components/BarComponent.html">BarComponent3');
         });


         it('it should have infos about FooService open function param', () => {
             expect(fooServiceFile).to.contain('<b>val</b>');
             expect(fooServiceFile).to.contain('<p>The entry value</p>');
         });

         it('it should have infos about FooService open function returns', () => {
             expect(fooServiceFile).to.contain('<p>The string</p>');
         });

         it('it should have infos about FooService open function example', () => {
             expect(fooServiceFile).to.contain('<b>Example :</b>');
             expect(fooServiceFile).to.contain('FooService.open(');
         });

         /**
          * Coverage
          */

          it('it should have coverage page', () => {
              expect(coverageFile).to.contain('Documentation coverage');
              expect(coverageFile).to.contain('img src="./images/coverage-badge.svg"');
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
    });

    describe('when generation with d and a flags', () => {

        let stdoutString = null;
        before(function (done) {
            tmp.create();
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json -d ' + tmp.name + '/ -a screenshots', {env}, (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                done('error');
                return;
              }
              stdoutString = stdout;
              done();
            });
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
            exec(tsNodePath + ' ./bin/index-cli.js ./test/src/sample-files/ -p ./test/src/sample-files/tsconfig.simple.json -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                done('error');
                return;
              }
              stdoutString = stdout;
              done();
            });
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
            const isOverviewExists = exists(`${tmp.name}/overview.html`);
            expect(isOverviewExists).to.be.true;
        });
    });

    describe('when generation without d flag', () => {

        let stdoutString = null;
        before(function (done) {
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json', {env}, (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                done('error');
                return;
              }
              stdoutString = stdout;
              done();
            });
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

    describe('when generation with big app', () => {

        let stdoutString = null;
        before(function (done) {
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/todomvc-ng2/src/tsconfig.json', {env}, (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                done('error');
                return;
              }
              stdoutString = stdout;
              done();
            });
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
            const isRoutesExists = exists('documentation/routes.html');
            expect(isRoutesExists).to.be.true;
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

        it('should have generated search index json', () => {
            const isIndexExists = exists(`documentation/js/search/search_index.js`);
            expect(isIndexExists).to.be.true;
        });

        it('should have generated extends information for todo class', () => {
            const todoModelFile = read(`documentation/classes/Todo.html`);
            expect(todoModelFile).to.contain('Extends');
        });

        it('should have generated implements information for clock class', () => {
            const classFile = read(`documentation/classes/Clock.html`);
            expect(classFile).to.contain('Implements');
        });

        it('should have generated interfaces', () => {
            const isInterfaceExists = exists('documentation/interfaces/ClockInterface.html');
            expect(isInterfaceExists).to.be.true;
        });

        it('should have generated classes', () => {
            const clockFile = exists('documentation/classes/Clock.html');
            expect(clockFile).to.be.true;
        });

        it('should have generated components', () => {
            const file = exists('documentation/components/AboutComponent.html');
            expect(file).to.be.true;
        });

        it('should have generated directives', () => {
            const file = exists('documentation/directives/DoNothingDirective.html');
            expect(file).to.be.true;
        });

        it('should have generated injectables', () => {
            const file = exists('documentation/injectables/TodoStore.html');
            expect(file).to.be.true;
        });

        it('should have generated modules', () => {
            const file = exists('documentation/modules/AboutModule.html');
            expect(file).to.be.true;
        });

        it('should have generated pipes', () => {
            const file = exists('documentation/pipes/FirstUpperPipe.html');
            expect(file).to.be.true;
        });

    });

    describe('when generation with -t flag', () => {

        let stdoutString = null;
        before(function (done) {
            tmp.create();
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json -t -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                done('error');
                return;
              }
              stdoutString = stdout;
              done();
            });
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
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json --theme ' + baseTheme + ' -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                done('error');
                return;
              }
              stdoutString = stdout;
              done();
            });
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
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json -n \'' + name + '\' -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                done('error');
                return;
              }
              stdoutString = stdout;
              done();
            });
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
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json --hideGenerator -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                done('error');
                return;
              }
              stdoutString = stdout;
              done();
            });
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
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json --disableSourceCode -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                done('error');
                return;
              }
              stdoutString = stdout;
              done();
            });
        });
        //after(() => tmp.clean(tmp.name));

        it('should not contain compodoc logo', () => {
            index = read(`${tmp.name}/modules/AppModule.html`);
            expect(index).to.not.contain('nav nav-tabs');
        });
    });

    describe('when generation with --disableGraph flag', () => {

        let stdoutString = null,
          fileContents = null;
        before(function (done) {
            tmp.create();
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json --disableGraph -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    done('error');
                    return;
                }
                stdoutString = stdout;
                done();
            });
        });
        after(() => tmp.clean(tmp.name));

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
            child = exec(tsNodePath + ' ./bin/index-cli.js -s -r ' + port + ' -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {});
            child.stdout.on('data', function(data) {
                stdoutString += data;
            });
            child.on('exit', (code, signal) => {
                done();
            });
            setTimeout(() => {
                child.kill();
            }, 5000);
        });
        after(() => tmp.clean(tmp.name));

        it('should contain port ' + port, () => {
            expect(stdoutString).to.contain('Serving documentation');
            expect(stdoutString).to.contain(port);
        });
    });
});
