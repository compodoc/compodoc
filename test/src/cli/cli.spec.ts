import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir();

describe('CLI simple flags', () => {
    const distFolder = tmp.name + '-simple-flags';

    describe('when no tsconfig.json provided', () => {
        let command = undefined;
        beforeEach(() => {
            command = shell('node', ['./bin/index-cli.js']);
        });

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain(
                'tsconfig.json file was not found, please use -p flag'
            );
        });

        it(`should not create a "documentation" directory`, () => {
            const isFolderExists = exists(`${tmp.name}/documentation`);
            expect(isFolderExists).to.be.false;
        });
    });

    describe('when no tsconfig.json provided with just -p', () => {
        let command = undefined;
        beforeEach(() => {
            command = shell('node', ['./bin/index-cli.js', '-p']);
        });

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('Please provide a tsconfig file.');
        });
    });

    describe('when no tsconfig.json is found in cwd', () => {
        let command = undefined;
        beforeEach(() => {
            command = shell('node', ['./bin/index-cli.js', '-p', './test.json']);
        });

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain(
                'file was not found in the current directory'
            );
        });

        it(`should not create a "documentation" directory`, () => {
            const isFolderExists = exists(`${tmp.name}/documentation`);
            expect(isFolderExists).to.be.false;
        });
    });

    describe('when just serving without generation', () => {
        let command = undefined;
        beforeEach(() => {
            command = shell('node', ['./bin/index-cli.js', '-s']);
        });

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('./documentation/ folder doesn');
        });
    });

    describe("when just serving without generation and folder which does't exist", () => {
        let command = undefined;
        beforeEach(() => {
            command = shell('node', ['./bin/index-cli.js', '-s', '-d', 'doc']);
        });

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain("folder doesn't exist");
        });
    });

    describe('when no README/package.json files available', () => {
        let command = undefined;

        beforeEach(() => {
            tmp.create(distFolder);
            tmp.copy('./test/src/sample-files/', distFolder);
            command = shell(
                'node',
                ['../bin/index-cli.js', '-p', 'tsconfig.simple.json', '-d', distFolder],
                { cwd: distFolder }
            );
        });
        afterEach(() => tmp.clean(distFolder));

        it('should display error message', () => {
            const output: string = command.stdout.toString();

            expect(
                output.indexOf('Continuing without README.md file') > -1,
                'No error displayed for README'
            ).to.be.true;
            expect(
                output.indexOf('Continuing without package.json file') > -1,
                'No error displayed for package.json'
            ).to.be.true;
        });
    });

    describe('showing the output type', () => {
        let componentFile;
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.entry.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            componentFile = read(`${distFolder}/components/FooComponent.html`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should show the event output type', () => {
            expect(componentFile).to.contain('{foo: string}');
        });
    });

    describe('when specific files are included in tsconfig', () => {
        let moduleFile = undefined;
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.entry.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            moduleFile = read(`${distFolder}/modules/AppModule.html`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should only create links to files included via tsconfig', () => {
            expect(moduleFile).to.contain('components/FooComponent.html');
            expect(moduleFile).to.contain('modules/FooModule.html');
            expect(moduleFile).not.to.contain('components/BarComponent.html');
            expect(moduleFile).not.to.contain('injectables/FooService.html');
            expect(moduleFile).not.to.contain('modules/BarModule.html');
        });
    });
});
