import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir(),
      tsconfigPath = require.resolve('../../../tsconfig.json'),
      env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI simple flags', () => {

    describe('when no tsconfig.json provided', () => {

        let command = null;
        beforeEach(() => {
            tmp.create();
            command = shell('node', ['../bin/index-cli.js'], { cwd: tmp.name, env });
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
            command = shell('node', ['../bin/index-cli.js', '-p', '../test.json'], { cwd: tmp.name, env });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('file was not found in the current directory');
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
            command = shell('node', ['../bin/index-cli.js', '-s'], { cwd: tmp.name, env });
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
            command = shell('node', ['../bin/index-cli.js', '-s', '-d', 'doc'], { cwd: tmp.name, env });
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
            command = shell('node', ['../bin/index-cli.js', '-p', 'tsconfig.simple.json', '-d', tmp.name], { cwd: tmp.name, env });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            const output: string = command.stdout.toString();

            expect(output.indexOf('Error during README read') > -1, 'No error displayed for README').to.be.true;
            expect(output.indexOf('Error during package.json read') > -1, 'No error displayed for package.json').to.be.true;
        });
    });

    describe('showing the output type', () => {

        let componentFile;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.entry.json',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            componentFile = read(`${tmp.name}/components/FooComponent.html`);
            done();
        });
        after(() => tmp.clean());

        it('should show the event output type', () => {
            expect(componentFile).to.contain('{foo: string}');
        });

    });

    describe('disabling excluding methods with --disablePrivateOrInternalSupport', () => {

        let componentFile;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--disablePrivateOrInternalSupport',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            componentFile = read(`${tmp.name}/components/BarComponent.html`);
            done();
        });
        after(() => tmp.clean());

        it('should exclude methods marked as private', () => {
            expect(componentFile).not.to.contain('<code>privateMethod');
        });

        it('should exclude methods marked as internal', () => {
            expect(componentFile).not.to.contain('<code>internalMethod');
        });

        it('should not display lifecyle hooks', () => {
            expect(componentFile).not.to.contain('<code>ngOnInit');
        });

        it('should contain public methods', () => {
            expect(componentFile).to.contain('<code>showTab');
        });

        it('should exclude foo directive with @internal', () => {
            const directiveFile = exists(`${tmp.name}/directives/FooDirective.html`);
            expect(directiveFile).to.be.false;
        });
    });

    describe('when specific files are included in tsconfig', () => {

        let moduleFile = null;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.entry.json',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            moduleFile = read(`${tmp.name}/modules/AppModule.html`);
            done();
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
