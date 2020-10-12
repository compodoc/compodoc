import * as chai from 'chai';
const expect = chai.expect;

import { shell, pkg } from '../helpers';

describe('CLI Options', () => {
    let runHelp = undefined;

    before(() => {
        runHelp = shell('node', ['./bin/index-cli.js', '-h']);
    });

    it(`should display correct version ${pkg.version}`, () => {
        let runVersion = shell('node', ['./bin/index-cli.js', '-V']);
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
            expect(runHelp.stdout.toString()).to.contain(
                'Where to store the generated documentation'
            );
        });

        it(`-y`, () => {
            expect(runHelp.stdout.toString()).to.contain('-y, --extTheme [file]');
            expect(runHelp.stdout.toString()).to.contain('External styling theme');
        });

        it(`--theme`, () => {
            expect(runHelp.stdout.toString()).to.contain('--theme [theme]');
            expect(runHelp.stdout.toString()).to.contain(
                "Choose one of available themes, default is 'gitbook' (laravel, original, material, postmark, readthedocs, stripe, vagrant)"
            );
        });

        it(`-n`, () => {
            expect(runHelp.stdout.toString()).to.contain('-n, --name [name]');
            expect(runHelp.stdout.toString()).to.contain('Title documentation');
        });

        it(`-a`, () => {
            expect(runHelp.stdout.toString()).to.contain('-a, --assetsFolder [folder]');
            expect(runHelp.stdout.toString()).to.contain(
                'External assets folder to copy in generated documentation folder'
            );
        });

        it(`-o`, () => {
            expect(runHelp.stdout.toString()).to.contain('-o, --open');
            expect(runHelp.stdout.toString()).to.contain('Open the generated documentation');
        });

        it(`-t`, () => {
            expect(runHelp.stdout.toString()).to.contain('-t, --silent');
            expect(runHelp.stdout.toString()).to.contain(
                "In silent mode, log messages aren't logged in the console"
            );
        });

        it(`-s`, () => {
            expect(runHelp.stdout.toString()).to.contain('-s, --serve');
            expect(runHelp.stdout.toString()).to.contain('Serve generated documentation');
        });

        it(`-r`, () => {
            expect(runHelp.stdout.toString()).to.contain('-r, --port [port]');
            expect(runHelp.stdout.toString()).to.contain('Change default serving port');
        });

        it(`-w`, () => {
            expect(runHelp.stdout.toString()).to.contain('-w, --watch');
            expect(runHelp.stdout.toString()).to.contain(
                'Watch source files after serve and force documentation rebuild'
            );
        });

        it(`-e`, () => {
            expect(runHelp.stdout.toString()).to.contain('-e, --exportFormat [format]');
            expect(runHelp.stdout.toString()).to.contain('Export in specified format (json, html)');
        });

        it(`--hideGenerator`, () => {
            expect(runHelp.stdout.toString()).to.contain('--hideGenerator');
            expect(runHelp.stdout.toString()).to.contain(
                'Do not print the Compodoc link at the bottom of the page'
            );
        });

        it(`--navTabConfig`, () => {
            expect(runHelp.stdout.toString()).to.contain('--navTabConfig');
            expect(runHelp.stdout.toString()).to.contain(
                `List navigation tab objects in the desired order with two string properties ("id" and "label"). \
Double-quotes must be escaped with '\\'. \
Available tab IDs are "info", "readme", "source", "templateData", "styleData", "tree", and "example". \
Note: Certain tabs will only be shown if applicable to a given dependency`
            );
        });

        it(`--includes`, () => {
            expect(runHelp.stdout.toString()).to.contain('--includes [path]');
            expect(runHelp.stdout.toString()).to.contain(
                'Path of external markdown files to include'
            );
        });

        it(`--includesName`, () => {
            expect(runHelp.stdout.toString()).to.contain('--includesName [name]');
            expect(runHelp.stdout.toString()).to.contain(
                'Name of item menu of externals markdown files'
            );
        });

        it(`--coverageTest`, () => {
            expect(runHelp.stdout.toString()).to.contain('--coverageTest');
            expect(runHelp.stdout.toString()).to.contain(
                'Test command of documentation coverage with a threshold'
            );
        });

        it(`--coverageMinimumPerFile`, () => {
            expect(runHelp.stdout.toString()).to.contain('--coverageMinimumPerFile');
            expect(runHelp.stdout.toString()).to.contain(
                'Test command of documentation coverage per file with a minimum (default 0)'
            );
        });

        it(`--coverageTestThresholdFail`, () => {
            expect(runHelp.stdout.toString()).to.contain(
                '--coverageTestThresholdFail [true|false]'
            );
            expect(runHelp.stdout.toString()).to.contain(
                'Test command of documentation coverage (global or per file) will fail with error or just warn user (true: error, false: warn)'
            );
        });

        it(`--disableSourceCode`, () => {
            expect(runHelp.stdout.toString()).to.contain('--disableSourceCode');
            expect(runHelp.stdout.toString()).to.contain('Do not add dom tree tab');
        });

        it(`--disableDomTree`, () => {
            expect(runHelp.stdout.toString()).to.contain('--disableDomTree');
            expect(runHelp.stdout.toString()).to.contain('Do not add source code tab');
        });

        it(`--disableTemplateTab`, () => {
            expect(runHelp.stdout.toString()).to.contain('--disableTemplateTab');
            expect(runHelp.stdout.toString()).to.contain('Do not add template tab');
        });

        it(`--disableGraph`, () => {
            expect(runHelp.stdout.toString()).to.contain('--disableGraph');
            expect(runHelp.stdout.toString()).to.contain('Do not add the dependency graph');
        });

        it(`--disableCoverage`, () => {
            expect(runHelp.stdout.toString()).to.contain('--disableCoverage');
            expect(runHelp.stdout.toString()).to.contain(
                'Do not add the documentation coverage report'
            );
        });

        it(`--disablePrivate`, () => {
            expect(runHelp.stdout.toString()).to.contain('--disablePrivate');
            expect(runHelp.stdout.toString()).to.contain(
                'Do not show private in generated documentation'
            );
        });

        it(`--disableProtected`, () => {
            expect(runHelp.stdout.toString()).to.contain('--disableProtected');
            expect(runHelp.stdout.toString()).to.contain(
                'Do not show protected in generated documentation'
            );
        });

        it(`--disableInternal`, () => {
            expect(runHelp.stdout.toString()).to.contain('--disableInternal');
            expect(runHelp.stdout.toString()).to.contain(
                'Do not show @internal in generated documentation'
            );
        });

        it(`--disableLifeCycleHooks`, () => {
            expect(runHelp.stdout.toString()).to.contain('--disableLifeCycleHooks');
            expect(runHelp.stdout.toString()).to.contain(
                'Do not show Angular lifecycle hooks in generated documentation'
            );
        });

        it(`--customFavicon`, () => {
            expect(runHelp.stdout.toString()).to.contain('--customFavicon [path]');
            expect(runHelp.stdout.toString()).to.contain('Use a custom favicon');
        });

        it(`--customLogo`, () => {
            expect(runHelp.stdout.toString()).to.contain('--customLogo [path]');
            expect(runHelp.stdout.toString()).to.contain('Use a custom logo');
        });
    });
});
