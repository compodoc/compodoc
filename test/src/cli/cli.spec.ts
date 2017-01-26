import * as chai from 'chai';
const expect = chai.expect;

import {temporaryDir, shell, pkg, exists, exec, read} from '../helpers';
const tmp = temporaryDir();
const tsconfigPath = require.resolve('../../../tsconfig.json');
const tsNodePath = require.resolve('../../../node_modules/.bin/ts-node');
const env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI simple tags', () => {

    describe('when no tsconfig.json provided', () => {

        let command = null;
        beforeEach(() => {
            tmp.create();
            command = shell(tsNodePath, ['../bin/index-cli.js'], { cwd: tmp.name, env });
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
            command = shell(tsNodePath, ['../bin/index-cli.js', '-p', '../test.json'], { cwd: tmp.name, env });
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
            command = shell(tsNodePath, ['../bin/index-cli.js', '-s'], { cwd: tmp.name, env });
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
            command = shell(tsNodePath, ['../bin/index-cli.js', '-s', '-d', 'doc'], { cwd: tmp.name, env });
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
            command = shell(tsNodePath, ['../bin/index-cli.js', '-p', 'tsconfig.simple.json', '-d', tmp.name], { cwd: tmp.name, env });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('Error during README.md file reading');
            expect(command.stdout.toString()).to.contain('Error during package.json read');
        });
    });

    describe('showing the output type', () => {

        let stdoutString = null, componentFile;
        before(function (done) {
            tmp.create();
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.entry.json -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    done('error');
                    return;
                }
                stdoutString = stdout;
                componentFile = read(`${tmp.name}/components/FooComponent.html`);
                done();
            });
        });
        after(() => tmp.clean());

        it('should show the event output type', () => {
            expect(componentFile).to.contain('{foo: string}');
        });

    });

    describe('excluding methods', () => {

        let stdoutString = null, componentFile;
        before(function (done) {
            tmp.create();
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    done('error');
                    return;
                }
                stdoutString = stdout;
                componentFile = read(`${tmp.name}/components/BarComponent.html`);
                done();
            });
        });
        after(() => tmp.clean());

        it('include methods not marked as internal, private or hidden', () => {
            expect(componentFile).to.contain('<code>normalMethod');
        });

        it('should exclude methods marked as internal', () => {
            expect(componentFile).not.to.contain('<code>internalMethod');
        });

        it('should exclude methods marked as hidden', () => {
            expect(componentFile).not.to.contain('<code>hiddenMethod');
        });

        it('should exclude methods marked as private', () => {
            expect(componentFile).not.to.contain('<code>privateCommentMethod');
        });

        it('should exclude private methods', () => {
            expect(componentFile).not.to.contain('<code>privateMethod');
        });

    });

    describe('when specific files are included in tsconfig', () => {

        let stdoutString = null,
          moduleFile = null;
        before(function (done) {
            tmp.create();
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.entry.json -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    done('error');
                    return;
                }
                stdoutString = stdout;
                moduleFile = read(`${tmp.name}/modules/AppModule.html`);
                done();
            });
        });
        after(() => tmp.clean(tmp.name));

        it('should only create links to files included via tsconfig', () => {
            expect(moduleFile).to.contain('components/FooComponent.html');
            expect(moduleFile).to.contain('modules/FooModule.html');
            expect(moduleFile).not.to.contain('components/BarComponent.html');
            expect(moduleFile).not.to.contain('injectables/FooService.html');
            expect(moduleFile).not.to.contain('modules/BarModule.html');
        });
    });

});
