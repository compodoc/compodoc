import * as chai from 'chai';
const expect = chai.expect;

import {temporaryDir, shell, pkg, exists, exec} from './helpers';
const tmp = temporaryDir();

describe('CLI', () => {
    describe('when no tsconfig.json provided', () => {

        let command = null;
        beforeEach(() => {
            tmp.create();
            command = shell('node', ['../bin/index.js'], { cwd: tmp.name });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('Entry file was not found');
        });

        it(`should not create a "documentation" directory`, () => {
            const isFolderExists = exists(`${tmp.name}/documentation`);
            expect(isFolderExists).to.be.false;
        });
    });

    describe('when no tsconfig.json is found in cwd', () => {

        let command = null;
        beforeEach(() => {
            tmp.create();
            command = shell('node', ['../bin/index.js', '-p', '../test.json'], { cwd: tmp.name });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('"tsconfig.json" file was not found in the current directory');
        });

        it(`should not create a "documentation" directory`, () => {
            const isFolderExists = exists(`${tmp.name}/documentation`);
            expect(isFolderExists).to.be.false;
        });
    });

    describe('when just serving without generation', () => {

        let command = null;
        beforeEach(() => {
            tmp.create();
            command = shell('node', ['../bin/index.js', '-s'], { cwd: tmp.name });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('Provide output generated folder with -d flag');
        });
    });

    describe('when just serving without generation and folder which does\'t exist', () => {

        let command = null;
        beforeEach(() => {
            tmp.create();
            command = shell('node', ['../bin/index.js', '-s', '-d', 'doc'], { cwd: tmp.name });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('folder doesn\'t exist');
        });
    });

    describe('when generation with d flag', () => {

        let stdoutString = null;
        before(function (done) {
            tmp.create();
            exec('MODE=TESTING node ./bin/index.js -p ./test/src/sample-files/tsconfig.simple.json -d ' + tmp.name + '/', (error, stdout, stderr) => {
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
            const isComponentsExists = exists(`${tmp.name}/components.html`);
            expect(isComponentsExists).to.be.true;
            const isDirectivesExists = exists(`${tmp.name}/directives.html`);
            expect(isDirectivesExists).to.be.true;
            const isInjectablesExists = exists(`${tmp.name}/injectables.html`);
            expect(isInjectablesExists).to.be.true;
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
    });

    describe('when generation without d flag', () => {

        let stdoutString = null;
        before(function (done) {
            exec('MODE=TESTING node ./bin/index.js -p ./test/src/sample-files/tsconfig.simple.json', (error, stdout, stderr) => {
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
            const isComponentsExists = exists('documentation/components.html');
            expect(isComponentsExists).to.be.true;
            const isDirectivesExists = exists('documentation/directives.html');
            expect(isDirectivesExists).to.be.true;
            const isInjectablesExists = exists('documentation/injectables.html');
            expect(isInjectablesExists).to.be.true;
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
            exec('MODE=TESTING node ./bin/index.js -p ./test/src/todomvc-ng2/tsconfig.json', (error, stdout, stderr) => {
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
            const isComponentsExists = exists('documentation/components.html');
            expect(isComponentsExists).to.be.true;
            const isDirectivesExists = exists('documentation/directives.html');
            expect(isDirectivesExists).to.be.true;
            const isInjectablesExists = exists('documentation/injectables.html');
            expect(isInjectablesExists).to.be.true;
            const isModulesExists = exists('documentation/modules.html');
            expect(isModulesExists).to.be.true;
            const isOverviewExists = exists('documentation/overview.html');
            expect(isOverviewExists).to.be.true;
            const isClassesExists = exists('documentation/classes.html');
            expect(isClassesExists).to.be.true;
            const isPipesExists = exists('documentation/pipes.html');
            expect(isPipesExists).to.be.true;
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
    });
});
