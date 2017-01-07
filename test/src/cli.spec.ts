import * as chai from 'chai';
const expect = chai.expect;

import {temporaryDir, shell, pkg, exists, exec, read} from './helpers';
const tmp = temporaryDir();

describe('CLI', () => {

    describe('when no tsconfig.json provided', () => {

        let command = null;
        beforeEach(() => {
            tmp.create();
            command = shell('node', ['../bin/index-cli.js'], { cwd: tmp.name });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('tsconfig.json file was not found, please use -p flag');
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
            command = shell('node', ['../bin/index-cli.js', '-p', '../test.json'], { cwd: tmp.name });
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
            command = shell('node', ['../bin/index-cli.js', '-s'], { cwd: tmp.name });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('./documentation/ folder doesn');
        });
    });

    describe('when just serving without generation and folder which does\'t exist', () => {

        let command = null;
        beforeEach(() => {
            tmp.create();
            command = shell('node', ['../bin/index-cli.js', '-s', '-d', 'doc'], { cwd: tmp.name });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('folder doesn\'t exist');
        });
    });

    describe('when no README/package.json files available', () => {

        let command = null;
        beforeEach(() => {
            tmp.create();
            tmp.copy('./test/src/sample-files/', tmp.name);
            command = shell('node', ['../bin/index-cli.js', '-p', 'tsconfig.simple.json', '-d', tmp.name], { cwd: tmp.name });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('Error during README.md file reading');
            expect(command.stdout.toString()).to.contain('Error during package.json read');
        });
    });

    describe('when generation with d flag', () => {

        let stdoutString = null;
        before(function (done) {
            tmp.create();
            exec('node ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json -d ' + tmp.name + '/', {env:{MODE:'TESTING'}}, (error, stdout, stderr) => {
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
            const isIndexExists = exists(`${tmp.name}/search_index.json`);
            expect(isIndexExists).to.be.true;
        });
    });

    describe('when generation without d flag', () => {

        let stdoutString = null;
        before(function (done) {
            exec('node ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json', {env:{MODE:'TESTING'}}, (error, stdout, stderr) => {
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
            exec('node ./bin/index-cli.js -p ./test/src/todomvc-ng2/tsconfig.json', {env:{MODE:'TESTING'}}, (error, stdout, stderr) => {
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
            const isIndexExists = exists(`documentation/search_index.json`);
            expect(isIndexExists).to.be.true;
        });
    });

    describe('when generation with -t flag', () => {

        let stdoutString = null;
        before(function (done) {
            tmp.create();
            exec('node ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json -t -d ' + tmp.name + '/', {env:{MODE:'TESTING'}}, (error, stdout, stderr) => {
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
            expect(stdoutString).to.be.empty;
        });
    });

    describe('when generation with -b flag', () => {

        let stdoutString = null,
            baseTest = 'https://compodoc.github.io/compodoc-demo-todomvc-angular2/',
            index = null;
        before(function (done) {
            tmp.create();
            exec('node ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json -b ' + baseTest + ' -d ' + tmp.name + '/', {env:{MODE:'TESTING'}}, (error, stdout, stderr) => {
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

        it('should edit base tag', () => {
            index = read(`${tmp.name}/index.html`);
            expect(index).to.contain('<base href="' + baseTest + '">');
        });
    });

    describe('when generation with --theme flag', () => {

        let stdoutString = null,
            baseTheme = 'laravel',
            index = null;
        before(function (done) {
            tmp.create();
            exec('node ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json --theme ' + baseTheme + ' -d ' + tmp.name + '/', {env:{MODE:'TESTING'}}, (error, stdout, stderr) => {
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
            exec('node ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json -n \'' + name + '\' -d ' + tmp.name + '/', {env:{MODE:'TESTING'}}, (error, stdout, stderr) => {
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
            exec('node ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json --hideGenerator -d ' + tmp.name + '/', {env:{MODE:'TESTING'}}, (error, stdout, stderr) => {
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
            exec('node ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json --disableSourceCode -d ' + tmp.name + '/', {env:{MODE:'TESTING'}}, (error, stdout, stderr) => {
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

    describe('when generation with -r flag', () => {

        let stdoutString = '',
            port = 6666,
            child;
        before(function (done) {
            tmp.create();
            child = exec('node ./bin/index-cli.js -s -r ' + port + ' -d ' + tmp.name + '/', {env:{MODE:'TESTING'}}, (error, stdout, stderr) => {});
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

        it('should countain port ' + port, () => {
            expect(stdoutString).to.contain('Serving documentation');
            expect(stdoutString).to.contain(port);
        });
    });

    describe('when serving with -s flag in another directory', () => {

        let stdoutString = '',
            child;
        before(function (done) {
            tmp.create();
            child = exec('node ./bin/index-cli.js -s -d ' + tmp.name + '/', {env:{MODE:'TESTING'}}, (error, stdout, stderr) => {});
            child.stdout.on('data', function(data) {
                stdoutString += data;
            });
            child.on('exit', (code, signal) => {
                done();
            });
            setTimeout(() => {
                child.kill();
            }, 2000);
        });
        after(() => tmp.clean(tmp.name));

        it('should serve', () => {
            expect(stdoutString).to.contain('Serving documentation from ' + tmp.name + '/ at http://127.0.0.1:8080');
        });
    });

    describe('when serving with default directory', () => {

        let stdoutString = null,
            child;
        before(function (done) {
            child = exec('node ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json -s', {env:{MODE:'TESTING'}}, (error, stdout, stderr) => {});
            child.stdout.on('data', function(data) {
                stdoutString += data;
            });
            child.on('exit', (code, signal) => {
                done();
            });
            setTimeout(() => {
                child.kill();
            }, 60000);
        });

        it('should display message', () => {
            expect(stdoutString).to.contain('Serving documentation from ./documentation/ at http://127.0.0.1:8080');
        });
    });

    describe('when serving with default directory and without doc generation', () => {

        let stdoutString = null,
            child;
        before(function (done) {
            child = exec('node ./bin/index-cli.js -s -d ./documentation/', {env:{MODE:'TESTING'}}, (error, stdout, stderr) => {});
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

        it('should display message', () => {
            expect(stdoutString).to.contain('Serving documentation from ./documentation/ at http://127.0.0.1:8080');
        });
    });

    describe('when serving with default directory, without -d and without doc generation', () => {

        let stdoutString = null,
            child;
        before(function (done) {
            child = exec('node ./bin/index-cli.js -s', {env:{MODE:'TESTING'}}, (error, stdout, stderr) => {});
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
        after(() => tmp.clean('documentation'));

        it('should display message', () => {
            expect(stdoutString).to.contain('Serving documentation from ./documentation/ at http://127.0.0.1:8080');
        });
    });

});
