import { pkg, shell } from '../helpers';

describe('CLI Options', () => {
    let runHelp = undefined;

    beforeAll(() => {
        runHelp = shell('node', ['./bin/index-cli.js', '-h']);
    });

    it(`should display correct version ${pkg.version}`, () => {
        let runVersion = shell('node', ['./bin/index-cli.js', '-V']);
        expect(runVersion.stdout.toString()).toContain(pkg.version);
    });

    it(`should display help message`, () => {
        expect(runHelp.stdout.toString()).toContain('Usage: index-cli <src> [options]');
    });

    describe('should display options in help', () => {
        it(`-p`, () => {
            expect(runHelp.stdout.toString()).toContain('-p, --tsconfig [config]');
            expect(runHelp.stdout.toString()).toContain('A tsconfig.json file');
        });

        it(`-d`, () => {
            expect(runHelp.stdout.toString()).toContain('-d, --output [folder]');
            expect(runHelp.stdout.toString()).toContain(
                'Where to store the generated documentation'
            );
        });

        it(`-y`, () => {
            expect(runHelp.stdout.toString()).toContain('-y, --extTheme [file]');
            expect(runHelp.stdout.toString()).toContain('External styling theme');
        });

        it(`--theme`, () => {
            expect(runHelp.stdout.toString()).toContain('--theme [theme]');
            expect(runHelp.stdout.toString()).toContain(
                "Choose one of available themes, default is 'gitbook' (laravel, original, material, postmark, readthedocs, stripe, vagrant)"
            );
        });

        it(`-n`, () => {
            expect(runHelp.stdout.toString()).toContain('-n, --name [name]');
            expect(runHelp.stdout.toString()).toContain('Title documentation');
        });

        it(`-a`, () => {
            expect(runHelp.stdout.toString()).toContain('-a, --assetsFolder [folder]');
            expect(runHelp.stdout.toString()).toContain(
                'External assets folder to copy in generated documentation folder'
            );
        });

        it(`-o`, () => {
            expect(runHelp.stdout.toString()).toContain('-o, --open');
            expect(runHelp.stdout.toString()).toContain('Open the generated documentation');
        });

        it(`-t`, () => {
            expect(runHelp.stdout.toString()).toContain('-t, --silent');
            expect(runHelp.stdout.toString()).toContain(
                "In silent mode, log messages aren't logged in the console"
            );
        });

        it(`-s`, () => {
            expect(runHelp.stdout.toString()).toContain('-s, --serve');
            expect(runHelp.stdout.toString()).toContain('Serve generated documentation');
        });

        it(`-r`, () => {
            expect(runHelp.stdout.toString()).toContain('-r, --port [port]');
            expect(runHelp.stdout.toString()).toContain('Change default serving port');
        });

        it(`-w`, () => {
            expect(runHelp.stdout.toString()).toContain('-w, --watch');
            expect(runHelp.stdout.toString()).toContain(
                'Watch source files after serve and force documentation rebuild'
            );
        });

        it(`-e`, () => {
            expect(runHelp.stdout.toString()).toContain('-e, --exportFormat [format]');
            expect(runHelp.stdout.toString()).toContain('Export in specified format (json, html)');
        });

        it(`--hideGenerator`, () => {
            expect(runHelp.stdout.toString()).toContain('--hideGenerator');
            expect(runHelp.stdout.toString()).toContain(
                'Do not print the Compodoc link at the bottom of the page'
            );
        });

        it(`--navTabConfig`, () => {
            expect(runHelp.stdout.toString()).toContain('--navTabConfig');
            expect(runHelp.stdout.toString()).toContain(
                `List navigation tab objects in the desired order with two string properties ("id" and "label"). \
Double-quotes must be escaped with '\\'. \
Available tab IDs are "info", "readme", "source", "templateData", "styleData", "tree", and "example". \
Note: Certain tabs will only be shown if applicable to a given dependency`
            );
        });

        it(`--includes`, () => {
            expect(runHelp.stdout.toString()).toContain('--includes [path]');
            expect(runHelp.stdout.toString()).toContain(
                'Path of external markdown files to include'
            );
        });

        it(`--includesName`, () => {
            expect(runHelp.stdout.toString()).toContain('--includesName [name]');
            expect(runHelp.stdout.toString()).toContain(
                'Name of item menu of externals markdown files'
            );
        });

        it(`--coverageTest`, () => {
            expect(runHelp.stdout.toString()).toContain('--coverageTest');
            expect(runHelp.stdout.toString()).toContain(
                'Test command of documentation coverage with a threshold'
            );
        });

        it(`--coverageMinimumPerFile`, () => {
            expect(runHelp.stdout.toString()).toContain('--coverageMinimumPerFile');
            expect(runHelp.stdout.toString()).toContain(
                'Test command of documentation coverage per file with a minimum (default 0)'
            );
        });

        it(`--coverageTestThresholdFail`, () => {
            expect(runHelp.stdout.toString()).toContain('--coverageTestThresholdFail [true|false]');
            expect(runHelp.stdout.toString()).toContain(
                'Test command of documentation coverage (global or per file) will fail with error or just warn user (true: error, false: warn)'
            );
        });

        it(`--disableSourceCode`, () => {
            expect(runHelp.stdout.toString()).toContain('--disableSourceCode');
            expect(runHelp.stdout.toString()).toContain('Do not add dom tree tab');
        });

        it(`--disableDomTree`, () => {
            expect(runHelp.stdout.toString()).toContain('--disableDomTree');
            expect(runHelp.stdout.toString()).toContain('Do not add source code tab');
        });

        it(`--disableTemplateTab`, () => {
            expect(runHelp.stdout.toString()).toContain('--disableTemplateTab');
            expect(runHelp.stdout.toString()).toContain('Do not add template tab');
        });

        it(`--disableGraph`, () => {
            expect(runHelp.stdout.toString()).toContain('--disableGraph');
            expect(runHelp.stdout.toString()).toContain('Do not add the dependency graph');
        });

        it(`--disableCoverage`, () => {
            expect(runHelp.stdout.toString()).toContain('--disableCoverage');
            expect(runHelp.stdout.toString()).toContain(
                'Do not add the documentation coverage report'
            );
        });

        it(`--disablePrivate`, () => {
            expect(runHelp.stdout.toString()).toContain('--disablePrivate');
            expect(runHelp.stdout.toString()).toContain(
                'Do not show private in generated documentation'
            );
        });

        it(`--disableProtected`, () => {
            expect(runHelp.stdout.toString()).toContain('--disableProtected');
            expect(runHelp.stdout.toString()).toContain(
                'Do not show protected in generated documentation'
            );
        });

        it(`--disableInternal`, () => {
            expect(runHelp.stdout.toString()).toContain('--disableInternal');
            expect(runHelp.stdout.toString()).toContain(
                'Do not show @internal in generated documentation'
            );
        });

        it(`--disableLifeCycleHooks`, () => {
            expect(runHelp.stdout.toString()).toContain('--disableLifeCycleHooks');
            expect(runHelp.stdout.toString()).toContain(
                'Do not show Angular lifecycle hooks in generated documentation'
            );
        });

        it(`--customFavicon`, () => {
            expect(runHelp.stdout.toString()).toContain('--customFavicon [path]');
            expect(runHelp.stdout.toString()).toContain('Use a custom favicon');
        });

        it(`--customLogo`, () => {
            expect(runHelp.stdout.toString()).toContain('--customLogo [path]');
            expect(runHelp.stdout.toString()).toContain('Use a custom logo');
        });
    });
});
