import * as chai from 'chai';
import { exists, read, readPDF, shell, temporaryDir } from '../helpers';
const fs = require('fs-extra');
const expect = chai.expect,
    tmp = temporaryDir();

describe('CLI Export', () => {
    const distFolder = tmp.name + '-export';

    describe('when specified JSON', () => {
        let stdoutString = undefined;

        before(function(done) {
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
        after(() => tmp.clean(distFolder));

        it('should display generated message', () => {
            expect(stdoutString).to.contain('Documentation generated');
        });

        it('should create json file', () => {
            let isFileExists = exists(`${distFolder}/documentation.json`);
            expect(isFileExists).to.be.true;
        });

        it('json file should have some data', () => {
            const file = read(`${distFolder}/documentation.json`);
            expect(file).to.contain('pipe-FirstUpperPipe');
            expect(file).to.contain('interface-ClockInterface');
            expect(file).to.contain('injectable-EmitterService');
            expect(file).to.contain('class-StringIndexedItems');
            expect(file).to.contain('component-AboutComponent');
            expect(file).to.contain('AboutRoutingModule');
            expect(file).to.contain('PI');
            expect(file).to.contain('A foo bar function');
            expect(file).to.contain('ChartChange');
            expect(file).to.contain('Direction');
            expect(file).to.contain('PIPES_AND_DIRECTIVES');
            expect(file).to.contain('APP_ROUTES');
            expect(file).to.contain('coveragePercent');
        });
    });

    describe('when specified PDF', () => {
        let stdoutString = undefined;

        const title = 'Documentation in pdf';

        before(function(done) {
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
        after(() => tmp.clean(distFolder));

        it('should display generated message', () => {
            expect(stdoutString).to.contain('Documentation generated');
        });

        it('should create pdf file', () => {
            let isFileExists = exists(`${distFolder}/documentation.pdf`);
            expect(isFileExists).to.be.true;
        });

        it('pdf file should have some data', () => {
            let pdfDataBuffer = fs.readFileSync(`${distFolder}/documentation.pdf`);
            return readPDF(pdfDataBuffer).then(function(data) {
                // console.log(data);
                expect(data.text).to.contain(
                    'AboutModule\nFilename : test/src/todomvc-ng2/src/app/about/about.module.ts'
                );
            });
        });
    });

    describe('when specified not supported format', () => {
        let stdoutString = undefined;

        before(function(done) {
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
        after(() => tmp.clean(distFolder));

        it('should display error message', () => {
            expect(stdoutString).to.contain('Exported format not supported');
        });
    });
});
