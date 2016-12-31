import * as chai from 'chai';
const expect = chai.expect;

import {temporaryDir, shell, pkg} from './helpers';
const tmp = temporaryDir();

describe('CLI Options', () => {

    let runHelp = null;

    before( () => {
        tmp.create();
        runHelp = shell('node', ['./bin/index-cli.js', '-h']);
    });
    after( () => tmp.clean() );


    it(`should display correct version ${pkg.version}`, () => {
        let runVersion = shell('node', ['./bin/index-cli.js', '-V']);
        expect(runVersion.stdout.toString()).to.contain(pkg.version);
    });

    it(`should display help message`, () => {
        expect(runHelp.stdout.toString()).to.contain('Usage: index [options]');
    });

    describe('should display options in help', () => {

        it(`-p`, () => {
            expect(runHelp.stdout.toString()).to.contain('-p, --tsconfig [config]');
            expect(runHelp.stdout.toString()).to.contain('A tsconfig.json file');
        });

        it(`-d`, () => {
            expect(runHelp.stdout.toString()).to.contain('-d, --output [folder]');
            expect(runHelp.stdout.toString()).to.contain('Where to store the generated documentation (default: ./documentation)');
        });

        it(`-b`, () => {
            expect(runHelp.stdout.toString()).to.contain('-b, --base [base]');
            expect(runHelp.stdout.toString()).to.contain('Base reference of html tag');
        });

        it(`-y`, () => {
            expect(runHelp.stdout.toString()).to.contain('-y, --extTheme [file]');
            expect(runHelp.stdout.toString()).to.contain('External styling theme');
        });

        it(`-h`, () => {
            expect(runHelp.stdout.toString()).to.contain('-h, --theme [theme]');
            expect(runHelp.stdout.toString()).to.contain('Choose one of available themes, default is \'gitbook\' (laravel, original, postmark, readthedocs, stripe, vagrant)');
        });

        it(`-n`, () => {
            expect(runHelp.stdout.toString()).to.contain('-n, --name [name]');
            expect(runHelp.stdout.toString()).to.contain('Title documentation');
        });

        it(`-o`, () => {
            expect(runHelp.stdout.toString()).to.contain('-o, --open');
            expect(runHelp.stdout.toString()).to.contain('Open the generated documentation');
        });

        it(`-t`, () => {
            expect(runHelp.stdout.toString()).to.contain('-t, --silent');
            expect(runHelp.stdout.toString()).to.contain('In silent mode, log messages aren\'t logged in the console');
        });

        it(`-s`, () => {
            expect(runHelp.stdout.toString()).to.contain('-s, --serve');
            expect(runHelp.stdout.toString()).to.contain('Serve generated documentation');
        });

        it(`-r`, () => {
            expect(runHelp.stdout.toString()).to.contain('-r, --port [port]');
            expect(runHelp.stdout.toString()).to.contain('Change default serving port');
        });

        it(`--hideGenerator`, () => {
            expect(runHelp.stdout.toString()).to.contain('--hideGenerator');
            expect(runHelp.stdout.toString()).to.contain('Do not print the Compodoc link at the bottom of the page');
        });

        it(`--disableSourceCode`, () => {
            expect(runHelp.stdout.toString()).to.contain('--disableSourceCode');
            expect(runHelp.stdout.toString()).to.contain('Do not add source code tab');
        });


    });

});
