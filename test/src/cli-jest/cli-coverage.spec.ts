import { exists, read, shell, temporaryDir } from '../helpers';

const tmp = temporaryDir();

describe('CLI coverage report', () => {
    const distFolder = tmp.name + '-coverage';

    describe('excluding coverage', () => {
        let stdoutString = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
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
        afterEach(() => tmp.clean(distFolder));

        it('it should not have coverage page', () => {
            const isFileExists = exists(`${distFolder}/coverage.html`);
            expect(isFileExists).toBeFalsy();
        });
    });

    describe('coverage test command above', () => {
        let stdoutString = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
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
        afterEach(() => tmp.clean(distFolder));

        it('it should be over threshold', () => {
            expect(stdoutString).toContain('is over threshold');
        });
    });

    describe('coverage test command above with src folder provided in arguments', () => {
        let stdoutString = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                './test/src/sample-files/',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
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
        afterEach(() => tmp.clean(distFolder));

        it('it should be over threshold', () => {
            expect(stdoutString).toContain('is over threshold');
        });
    });

    describe('coverage test command under', () => {
        let stdoutString = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
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
        afterEach(() => tmp.clean(distFolder));

        it('it should not be over threshold', () => {
            expect(stdoutString).toContain('is not over threshold');
        });
    });

    describe('coverage test per file command under', () => {
        let stdoutString = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
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
        afterEach(() => tmp.clean(distFolder));

        it('it should be under threshold per file', () => {
            expect(stdoutString).toContain('Documentation coverage per file is not over threshold');
        });
    });

    describe('coverage test per file command under with --coverageTestShowOnlyFailed', () => {
        let stdoutString = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
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
        afterEach(() => tmp.clean(distFolder));

        it('it should be under threshold per file', () => {
            expect(stdoutString).toContain('under minimum per file');
            expect(stdoutString).toEqual(expect.not.stringContaining('over minimum per file'));
        });
    });

    describe('coverage test per file command over', () => {
        let stdoutString = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
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
        afterEach(() => tmp.clean(distFolder));

        it('it should be over threshold per file', () => {
            expect(stdoutString).toContain('Documentation coverage per file is over threshold');
        });
    });

    describe('coverage test per file command over and global threshold - 1/4', () => {
        let stdoutString = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
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
        afterEach(() => tmp.clean(distFolder));

        it('it should be over threshold per file', () => {
            expect(stdoutString).toContain('Documentation coverage per file is not over threshold');
        });
        it('it should not be over threshold', () => {
            expect(stdoutString).toContain(') is not over threshold');
        });
    });

    describe('coverage test per file command over and global threshold - 2/4', () => {
        let stdoutString = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
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
        afterEach(() => tmp.clean(distFolder));

        it('it should be not over threshold per file', () => {
            expect(stdoutString).toContain('Documentation coverage per file is not over threshold');
        });
        it('it should be over threshold', () => {
            expect(stdoutString).toContain(') is over threshold');
        });
    });

    describe('coverage test per file command over and global threshold - 3/4', () => {
        let stdoutString = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
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
        afterEach(() => tmp.clean(distFolder));

        it('it should be over threshold per file', () => {
            expect(stdoutString).toContain('Documentation coverage per file is over threshold');
        });
        it('it should be over threshold', () => {
            expect(stdoutString).toContain(') is over threshold');
        });
    });

    describe('coverage test per file command over and global threshold - 4/4', () => {
        let stdoutString = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
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
        afterEach(() => tmp.clean(distFolder));

        it('it should be over threshold per file', () => {
            expect(stdoutString).toContain('Documentation coverage per file is over threshold');
        });
        it('it should not be over threshold', () => {
            expect(stdoutString).toContain(') is not over threshold');
        });
    });

    describe('coverage page', () => {
        let stdoutString = undefined,
            coverageFile;
        beforeEach(function(done) {
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
            coverageFile = read(`${distFolder}/coverage.html`);
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('it should have coverage page', () => {
            expect(coverageFile).toContain('Documentation coverage');
            expect(coverageFile).toContain('img src="./images/coverage-badge-documentation.svg"');
            expect(coverageFile).toContain('5/5');
        });
    });

    describe('coverage page links', () => {
        let stdoutString = undefined,
            coverageFile;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/todomvc-ng2/src/tsconfig.json',
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
        afterEach(() => tmp.clean(distFolder));

        it('it should have links in coverage page', () => {
            expect(coverageFile).toContain('<td>class</td>');
            expect(coverageFile).toContain('<td>component</td>');
            expect(coverageFile).toContain('<td>directive</td>');
            expect(coverageFile).toContain('<td>function</td>');
            expect(coverageFile).toContain('<td>guard</td>');
            expect(coverageFile).toContain('<td>injectable</td>');
            expect(coverageFile).toContain('<td>interceptor</td>');
            expect(coverageFile).toContain('<td>interface</td>');
            expect(coverageFile).toContain('<td>pipe</td>');
            expect(coverageFile).toContain('<td>variable</td>');
        });
    });

    describe('coverage test per file command under with one file through --files', () => {
        let stdoutString = undefined;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '--files',
                './test/src/sample-files/bar.directive.ts',
                '--files',
                './test/src/sample-files/bar.service.ts',
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
        afterEach(() => tmp.clean(distFolder));

        it('it should be under threshold for files', () => {
            expect(stdoutString).toContain(
                'test/src/sample-files/bar.directive.ts - BarDirective - under minimum per file'
            );
            expect(stdoutString).toContain(
                'test/src/sample-files/bar.service.ts - BarService - under minimum per file'
            );
        });
    });
});
