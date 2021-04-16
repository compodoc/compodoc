import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir();

describe('CLI coverage report', () => {
    const distFolder = tmp.name + '-coverage';

    describe('excluding coverage', () => {
        let stdoutString = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.simple.json',
                '--disableCoverage',
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

        it('it should not have coverage page', () => {
            const isFileExists = exists(`${distFolder}/coverage.html`);
            expect(isFileExists).to.be.false;
        });
    });

    describe('coverage test command above', () => {
        let stdoutString = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.simple.json',
                '--coverageTest',
                '10',
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
        after(() => tmp.clean(distFolder));

        it('it should be over threshold', () => {
            expect(stdoutString).to.contain('is over threshold');
        });
    });

    describe('coverage test command above with src folder provided in arguments', () => {
        let stdoutString = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                './test/fixtures/sample-files/',
                '-p',
                './test/fixtures/sample-files/tsconfig.simple.json',
                '--coverageTest',
                '10',
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
        after(() => tmp.clean(distFolder));

        it('it should be over threshold', () => {
            expect(stdoutString).to.contain('is over threshold');
        });
    });

    describe('coverage test command under', () => {
        let stdoutString = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.simple.json',
                '--coverageTest',
                '40',
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
        after(() => tmp.clean(distFolder));

        it('it should not be over threshold', () => {
            expect(stdoutString).to.contain('is not over threshold');
        });
    });

    describe('coverage test per file command under', () => {
        let stdoutString = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.simple.json',
                '--coverageMinimumPerFile',
                '1',
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
        after(() => tmp.clean(distFolder));

        it('it should be under threshold per file', () => {
            expect(stdoutString).to.contain(
                'Documentation coverage per file is not over threshold'
            );
        });
    });

    describe('coverage test per file command under with --coverageTestShowOnlyFailed', () => {
        let stdoutString = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.simple.json',
                '--coverageMinimumPerFile',
                '1',
                '--coverageTestShowOnlyFailed',
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
        after(() => tmp.clean(distFolder));

        it('it should be under threshold per file', () => {
            expect(stdoutString).to.contain('under minimum per file');
            expect(stdoutString).to.not.contain('over minimum per file');
        });
    });

    describe('coverage test per file command over', () => {
        let stdoutString = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.simple.json',
                '--coverageMinimumPerFile',
                '0',
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
        after(() => tmp.clean(distFolder));

        it('it should be over threshold per file', () => {
            expect(stdoutString).to.contain('Documentation coverage per file is over threshold');
        });
    });

    describe('coverage test per file command over and global threshold - 1/4', () => {
        let stdoutString = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.simple.json',
                '--coverageMinimumPerFile',
                '30',
                '--coverageTest',
                '70',
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
        after(() => tmp.clean(distFolder));

        it('it should be over threshold per file', () => {
            expect(stdoutString).to.contain(
                'Documentation coverage per file is not over threshold'
            );
        });
        it('it should not be over threshold', () => {
            expect(stdoutString).to.contain(') is not over threshold');
        });
    });

    describe('coverage test per file command over and global threshold - 2/4', () => {
        let stdoutString = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.simple.json',
                '--coverageMinimumPerFile',
                '50',
                '--coverageTest',
                '10',
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
        after(() => tmp.clean(distFolder));

        it('it should be not over threshold per file', () => {
            expect(stdoutString).to.contain(
                'Documentation coverage per file is not over threshold'
            );
        });
        it('it should be over threshold', () => {
            expect(stdoutString).to.contain(') is over threshold');
        });
    });

    describe('coverage test per file command over and global threshold - 3/4', () => {
        let stdoutString = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.simple.json',
                '--coverageMinimumPerFile',
                '0',
                '--coverageTest',
                '10',
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
        after(() => tmp.clean(distFolder));

        it('it should be over threshold per file', () => {
            expect(stdoutString).to.contain('Documentation coverage per file is over threshold');
        });
        it('it should be over threshold', () => {
            expect(stdoutString).to.contain(') is over threshold');
        });
    });

    describe('coverage test per file command over and global threshold - 4/4', () => {
        let stdoutString = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.simple.json',
                '--coverageMinimumPerFile',
                '0',
                '--coverageTest',
                '30',
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
        after(() => tmp.clean(distFolder));

        it('it should be over threshold per file', () => {
            expect(stdoutString).to.contain('Documentation coverage per file is over threshold');
        });
        it('it should not be over threshold', () => {
            expect(stdoutString).to.contain(') is not over threshold');
        });
    });

    describe('coverage page', () => {
        let stdoutString = undefined,
            coverageFile;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.simple.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            coverageFile = read(`${distFolder}/coverage.html`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it('it should have coverage page', () => {
            expect(coverageFile).to.contain('Documentation coverage');
            expect(coverageFile).to.contain('img src="./images/coverage-badge-documentation.svg"');
            expect(coverageFile).to.contain('3/5');
        });
    });

    describe('coverage page links', () => {
        let stdoutString = undefined,
            coverageFile;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2/src/tsconfig.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            coverageFile = read(`${distFolder}/coverage.html`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it('it should have links in coverage page', () => {
            expect(coverageFile).to.contain('<td>class</td>');
            expect(coverageFile).to.contain('<td>component</td>');
            expect(coverageFile).to.contain('<td>directive</td>');
            expect(coverageFile).to.contain('<td>function</td>');
            expect(coverageFile).to.contain('<td>guard</td>');
            expect(coverageFile).to.contain('<td>injectable</td>');
            expect(coverageFile).to.contain('<td>interceptor</td>');
            expect(coverageFile).to.contain('<td>interface</td>');
            expect(coverageFile).to.contain('<td>pipe</td>');
            expect(coverageFile).to.contain('<td>variable</td>');

            expect(coverageFile).to.contain('components/CompodocComponent.html');
            expect(coverageFile).to.contain('interfaces/ClockInterface.html');
            expect(coverageFile).to.contain('miscellaneous/functions.html#foo');
            expect(coverageFile).to.contain('variables.html#PI');
            expect(coverageFile).to.contain('pipes/FirstUpperPipe.html');
            expect(coverageFile).to.contain('directives/DoNothingDirective2.html');
            expect(coverageFile).to.contain('injectables/TodoStore2.html');
            expect(coverageFile).to.contain('classes/Todo2.html');
            expect(coverageFile).to.contain('guards/AuthGuard.html');
            expect(coverageFile).to.contain('interceptors/NoopInterceptor.html');
            expect(coverageFile).to.contain('variables.html#PI');
            expect(coverageFile).to.contain('variables.html#PI');
        });
    });

    describe('coverage test per file command under with one file through --files', () => {
        let stdoutString = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '--files',
                './test/fixtures/sample-files/bar.directive.ts',
                '--files',
                './test/fixtures/sample-files/bar.service.ts',
                '--coverageMinimumPerFile',
                '1',
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
        after(() => tmp.clean(distFolder));

        it('it should be under threshold for files', () => {
            expect(stdoutString).to.contain(
                'test/fixtures/sample-files/bar.directive.ts - BarDirective - under minimum per file'
            );
            expect(stdoutString).to.contain(
                'test/fixtures/sample-files/bar.service.ts - BarService - under minimum per file'
            );
        });
    });
});
