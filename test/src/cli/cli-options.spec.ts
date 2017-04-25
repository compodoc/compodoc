import * as chai from 'chai';
const expect = chai.expect;

import {temporaryDir, shell, pkg} from '../helpers';
const tmp = temporaryDir();

describe('CLI Options', () => {

    let runHelp = null;

    before( () => {
        tmp.create();
        runHelp = shell('ts-node', ['./bin/index-cli.js', '-h']);
    });
    after( () => tmp.clean() );


    it(`should display correct version ${pkg.version}`, () => {
        let runVersion = shell('ts-node', ['./bin/index-cli.js', '-V']);
        expect(runVersion.stdout.toString()).to.contain(pkg.version);
    });

    it(`should display help message`, () => {
        expect(runHelp.stdout.toString()).to.contain('Usage: index-cli <src> [options]');
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

        it(`-y`, () => {
            expect(runHelp.stdout.toString()).to.contain('-y, --extTheme [file]');
            expect(runHelp.stdout.toString()).to.contain('External styling theme');
        });

        it(`--theme`, () => {
            expect(runHelp.stdout.toString()).to.contain('--theme [theme]');
            expect(runHelp.stdout.toString()).to.contain('Choose one of available themes, default is \'gitbook\' (laravel, original, postmark, readthedocs, stripe, vagrant)');
        });

        it(`-n`, () => {
            expect(runHelp.stdout.toString()).to.contain('-n, --name [name]');
            expect(runHelp.stdout.toString()).to.contain('Title documentation');
        });

        it(`-a`, () => {
            expect(runHelp.stdout.toString()).to.contain('-a, --assetsFolder [folder]');
            expect(runHelp.stdout.toString()).to.contain('External assets folder to copy in generated documentation folder');
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

        it(`--includes`, () => {
            expect(runHelp.stdout.toString()).to.contain('--includes [path]');
            expect(runHelp.stdout.toString()).to.contain('Path of external markdown files to include');
        });

        it(`--includesName`, () => {
            expect(runHelp.stdout.toString()).to.contain('--includesName [name]');
            expect(runHelp.stdout.toString()).to.contain('Name of item menu of externals markdown files (default "Additional documentation")');
        });

        it(`--coverageTest`, () => {
            expect(runHelp.stdout.toString()).to.contain('--coverageTest');
            expect(runHelp.stdout.toString()).to.contain('Test command of documentation coverage with a threshold');
        });

        it(`--disableSourceCode`, () => {
            expect(runHelp.stdout.toString()).to.contain('--disableSourceCode');
            expect(runHelp.stdout.toString()).to.contain('Do not add source code tab');
        });

        it(`--disableGraph`, () => {
            expect(runHelp.stdout.toString()).to.contain('--disableGraph');
            expect(runHelp.stdout.toString()).to.contain('Do not add the dependency graph');
        });

        it(`--disableCoverage`, () => {
            expect(runHelp.stdout.toString()).to.contain('--disableCoverage');
            expect(runHelp.stdout.toString()).to.contain('Do not add the documentation coverage report');
        });

        it(`--disablePrivateOrInternalSupport`, () => {
            expect(runHelp.stdout.toString()).to.contain('--disablePrivateOrInternalSupport');
            expect(runHelp.stdout.toString()).to.contain('Do not show private or @internal in generated documentation');
        });

    });

});
