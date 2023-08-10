import * as chai from 'chai';
import { exists, read, readPDF, shell, temporaryDir } from '../helpers';
const fs = require('fs-extra');
const expect = chai.expect,
    tmp = temporaryDir();

describe('CLI Export', () => {
    const distFolder = tmp.name + '-export';

    describe('when specified JSON', () => {
        let stdoutString = undefined;

        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2/src/tsconfig.json',
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

        it('should display descriptions and raw descriptions', () => {
            const file = read(`${distFolder}/documentation.json`, 'utf8');

            // property
            expect(file).to.contain('"rawdescription": "\\n\\nThe current time');
            expect(file).to.contain('"description": "<p>The current time</p>\\n');

            // method
            expect(file).to.contain('"rawdescription": "\\n\\nthe transform function');
            expect(file).to.contain('"description": "<p>the transform function</p>\\n');

            // pipe
            expect(file).to.contain(
                '"rawdescription": "\\n\\nUppercase the first letter of the string\\n\\n__Usage :__\\n  value | firstUpper'
            );
            expect(file).to.contain(
                '"description": "<p>Uppercase the first letter of the string</p>\\n<p><strong>Usage :</strong>\\n  value | firstUpper</p>\\n'
            );

            // interface
            expect(file).to.contain(
                '"rawdescription": "\\n\\nAn interface just for documentation purpose'
            );
            expect(file).to.contain(
                '"description": "<p>An interface just for documentation purpose</p>\\n'
            );

            // service
            expect(file).to.contain(
                '"rawdescription": "\\n\\nThis service is a todo store\\n\\nSee {@link Todo} for details about the main data of this store'
            );
            expect(file).to.contain(
                '"description": "<p>This service is a todo store</p>\\n<p>See {@link Todo} for details about the main data of this store</p>\\n'
            );

            // accessor (setter)
            expect(file).to.contain(
                '"rawdescription": "\\n\\nSetter of _fullName ore link to {@link Todo}\\n'
            );
            expect(file).to.contain(
                '"description": "<p>Setter of _fullName ore link to {@link Todo}</p>\\n'
            );

            // accessor (getter)
            expect(file).to.contain(
                '"rawdescription": "\\n\\nGetter of _fullName or link to {@link Todo}\\n'
            );
            expect(file).to.contain(
                '"description": "<p>Getter of _fullName or link to {@link Todo}</p>\\n'
            );
        });

        it('should display deprecated and deprecation messages', () => {
            const file = read(`${distFolder}/documentation.json`, 'utf8');

            expect(file).to.contain('"deprecated": true');
            expect(file).to.contain('"deprecated": false');

            // property
            expect(file).to.contain(
                '"deprecationMessage": "The current time property is deprecated"'
            );

            // method
            expect(file).to.contain('"deprecationMessage": "the transform function is deprecated"');

            // pipe
            expect(file).to.contain('"deprecationMessage": "This pipe is deprecated"');

            // interface
            expect(file).to.contain('"deprecationMessage": "This interface is deprecated"');

            // service
            expect(file).to.contain('"deprecationMessage": "This service is deprecated"');

            // accessor (setter)
            expect(file).to.contain('"deprecationMessage": "This setter is deprecated"');

            // accessor (getter)
            expect(file).to.contain('"deprecationMessage": "This getter is deprecated"');
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

        it('should contain numerical enumerations with strict numerical values', () => {
            const file = read(`${distFolder}/documentation.json`);
            const obj = JSON.parse(file);
            const pollingSpeedEnum = obj.miscellaneous.enumerations.find(
                enumeration => enumeration.name === 'PollingSpeed'
            );
            const valHigh = pollingSpeedEnum.childs.find(child => child.name === 'High');
            expect(valHigh.value === 100).to.be.true;
        });

        it('should export custom input decorators for components', () => {
            const file = read(`${distFolder}/documentation.json`);
            const obj = JSON.parse(file);
            const component = obj.components.find(comp => comp.name === 'AboutComponent');
            const input = component.inputsClass.find(inp => inp.name === 'myInput');

            expect(input.decorators.find(dec => dec.name === 'MyCustomInputDecorator')).to.be.ok;
        });

        it('should get jsdoctags in component', () => {
            const file = read(`${distFolder}/documentation.json`);

            // Property
            expect(file).to.contain('"comment": "<p>component property</p>');

            // Input
            expect(file).to.contain('"comment": "<p>component input</p>');

            // Accessor
            expect(file).to.contain('"comment": "<p>component accessor</p>');

            // HostBinding
            expect(file).to.contain('"comment": "<p>component hostBinding</p>');

            // HostListener
            expect(file).to.contain('"comment": "<p>component hostListener</p>');

            // Output
            expect(file).to.contain('"comment": "<p>component output</p>');

            // Method
            expect(file).to.contain('"comment": "<p>component method param</p>');
            expect(file).to.contain('"comment": "<p>component method return</p>');
        });

        it('should get jsdoctags in directive', () => {
            const file = read(`${distFolder}/documentation.json`);

            // Property
            expect(file).to.contain('"comment": "<p>directive property</p>');

            // Input
            expect(file).to.contain('"comment": "<p>directive input</p>');

            // Accessor
            expect(file).to.contain('"comment": "<p>directive accessor</p>');

            // HostBinding
            expect(file).to.contain('"comment": "<p>directive hostBinding</p>');

            // HostListener
            expect(file).to.contain('"comment": "<p>directive hostListener</p>');

            // Output
            expect(file).to.contain('"comment": "<p>directive output</p>');

            // Method
            expect(file).to.contain('"comment": "<p>directive method param</p>');
            expect(file).to.contain('"comment": "<p>directive method return</p>');
        });

        it('should get jsdoctags in pipe', () => {
            const file = read(`${distFolder}/documentation.json`);

            // Property
            expect(file).to.contain('"comment": "<p>pipe property</p>');

            // Method
            expect(file).to.contain('"comment": "<p>pipe method param</p>');
            expect(file).to.contain('"comment": "<p>pipe method return</p>');
        });

        it('should get jsdoctags in interface', () => {
            const file = read(`${distFolder}/documentation.json`);

            // Property
            expect(file).to.contain('"comment": "<p>interface property</p>');

            // Method
            expect(file).to.contain('"comment": "<p>interface method</p>');
        });

        it('should get jsdoctags in class', () => {
            const file = read(`${distFolder}/documentation.json`);

            // Property
            expect(file).to.contain('"comment": "<p>class property</p>');

            // Input
            expect(file).to.contain('"comment": "<p>class input</p>');

            // Accessor
            expect(file).to.contain('"comment": "<p>class accessor</p>');

            // HostBinding
            expect(file).to.contain('"comment": "<p>class hostBinding</p>');

            // HostListener
            expect(file).to.contain('"comment": "<p>class hostListener</p>');

            // Output
            expect(file).to.contain('"comment": "<p>class output</p>');

            // Method
            expect(file).to.contain('"comment": "<p>class method param</p>');
            expect(file).to.contain('"comment": "<p>class method return</p>');
        });

        it('should get modules informations', () => {
            const file = read(`${distFolder}/documentation.json`);

            // Description
            expect(file).to.contain('"description": "<p>The list of todos module');

            // Sourcecode
            expect(file).to.contain('"sourceCode": "import { NgModule } from');
        });
    });

    describe('when specified JSON and disable things', () => {
        let stdoutString = undefined;

        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2/src/tsconfig.json',
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
            expect(file).not.to.contain('coveragePercent');
            expect(file).not.to.contain('sourceCode');
            expect(file).not.to.contain('templateData');
            expect(file).not.to.contain('styleUrlsData');
            expect(file).not.to.contain('stylesData');
        });
    });

    describe('when specified PDF', () => {
        let stdoutString = undefined;

        const title = 'Documentation in pdf';

        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2/src/tsconfig.json',
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
            return readPDF(pdfDataBuffer).then(function (data) {
                // console.log(data);
                expect(data.text).to.contain(
                    'AboutModule\nFilename : test/fixtures/todomvc-ng2/src/app/about/about.module.ts'
                );
            });
        });
    });

    describe('when specified not supported format', () => {
        let stdoutString = undefined;

        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2/src/tsconfig.json',
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
