import { exists, read, readPDF, shell, temporaryDir } from '../helpers';

const fs = require('fs-extra');
const tmp = temporaryDir();

describe('CLI Export', () => {
    const distFolder = tmp.name + '-export';

    describe('when specified JSON', () => {
        let stdoutString = undefined;

        beforeAll(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/todomvc-ng2/src/tsconfig.json',
                '-d',
                distFolder,
                '-e',
                'json'
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

        it('should create json file', () => {
            let isFileExists = exists(`${distFolder}/documentation.json`);
            expect(isFileExists).toBeTruthy();
        });

        it('json file should have some data', () => {
            const file = read(`${distFolder}/documentation.json`);
            expect(file).toContain('pipe-FirstUpperPipe');
            expect(file).toContain('interface-ClockInterface');
            expect(file).toContain('injectable-EmitterService');
            expect(file).toContain('class-StringIndexedItems');
            expect(file).toContain('component-AboutComponent');
            expect(file).toContain('AboutRoutingModule');
            expect(file).toContain('PI');
            expect(file).toContain('A foo bar function');
            expect(file).toContain('ChartChange');
            expect(file).toContain('Direction');
            expect(file).toContain('PIPES_AND_DIRECTIVES');
            expect(file).toContain('APP_ROUTES');
            expect(file).toContain('coveragePercent');
        });
    });

    describe('when specified JSON and disable things', () => {
        let stdoutString = undefined;

        beforeAll(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/todomvc-ng2/src/tsconfig.json',
                '-d',
                distFolder,
                '-e',
                'json',
                '--disableSourceCode',
                '--disableCoverage'
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

        it('should create json file', () => {
            let isFileExists = exists(`${distFolder}/documentation.json`);
            expect(isFileExists).toBeTruthy();
        });

        it('json file should have some data', () => {
            const file = read(`${distFolder}/documentation.json`);
            expect(file).toContain('pipe-FirstUpperPipe');
            expect(file).toContain('interface-ClockInterface');
            expect(file).toContain('injectable-EmitterService');
            expect(file).toContain('class-StringIndexedItems');
            expect(file).toContain('component-AboutComponent');
            expect(file).toContain('AboutRoutingModule');
            expect(file).toContain('PI');
            expect(file).toContain('A foo bar function');
            expect(file).toContain('ChartChange');
            expect(file).toContain('Direction');
            expect(file).toContain('PIPES_AND_DIRECTIVES');
            expect(file).toContain('APP_ROUTES');
            expect(file).toEqual(expect.not.stringContaining('coveragePercent'));
            expect(file).toEqual(expect.not.stringContaining('sourceCode'));
        });
    });

    describe('when specified PDF', () => {
        let stdoutString = undefined;

        const title = 'Documentation in pdf';

        beforeAll(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/todomvc-ng2/src/tsconfig.json',
                '-d',
                distFolder,
                '-n',
                title,
                '-e',
                'pdf'
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

        it('should create pdf file', () => {
            let isFileExists = exists(`${distFolder}/documentation.pdf`);
            expect(isFileExists).toBeTruthy();
        });

        it('pdf file should have some data', () => {
            let pdfDataBuffer = fs.readFileSync(`${distFolder}/documentation.pdf`);
            return readPDF(pdfDataBuffer).then(function(data) {
                // console.log(data);
                expect(data.text).toContain(
                    'AboutModule\nFilename : test/src/todomvc-ng2/src/app/about/about.module.ts'
                );
            });
        });
    });

    describe('when specified not supported format', () => {
        let stdoutString = undefined;

        beforeEach(function(done) {
            tmp.create();
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/todomvc-ng2/src/tsconfig.json',
                '-d',
                distFolder,
                '-e',
                'xml'
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should display error message', () => {
            expect(stdoutString).toContain('Exported format not supported');
        });
    });
});
