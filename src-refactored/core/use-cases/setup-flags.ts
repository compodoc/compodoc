import * as commander from 'commander';

export class SetupFlags {
    private static instance: SetupFlags;

    public program: commander.CommanderStatic;

    constructor() {
        this.program = require('commander');
    }

    public static getInstance() {
        if (!SetupFlags.instance) {
            SetupFlags.instance = new SetupFlags();
        }
        return SetupFlags.instance;
    }

    public setup(pkg, COMPODOC_DEFAULTS) {
        function list(val) {
            return val.split(',');
        }

        this.program
            .version(pkg.version)
            .usage('<src> [options]')
            .option(
                '-c, --config [config]',
                'A configuration file : .compodocrc, .compodocrc.json, .compodocrc.yaml or compodoc property in package.json'
            )
            .option('-p, --tsconfig [config]', 'A tsconfig.json file')
            .option(
                '-d, --output [folder]',
                'Where to store the generated documentation',
                COMPODOC_DEFAULTS.folder
            )
            .option('-y, --extTheme [file]', 'External styling theme file')
            .option('-n, --name [name]', 'Title documentation', COMPODOC_DEFAULTS.title)
            .option(
                '-a, --assetsFolder [folder]',
                'External assets folder to copy in generated documentation folder'
            )
            .option('-o, --open [value]', 'Open the generated documentation')
            .option(
                '-t, --silent',
                "In silent mode, log messages aren't logged in the console",
                false
            )
            .option(
                '-s, --serve',
                'Serve generated documentation (default http://localhost:8080/)',
                false
            )
            .option('--host [host]', 'Change default host address')
            .option('-r, --port [port]', 'Change default serving port', COMPODOC_DEFAULTS.port)
            .option(
                '-w, --watch',
                'Watch source files after serve and force documentation rebuild',
                false
            )
            .option(
                '-e, --exportFormat [format]',
                'Export in specified format (json, html)',
                COMPODOC_DEFAULTS.exportFormat
            )
            .option('--files [files]', 'Files provided by external tool, used for coverage test')
            .option(
                '--language [language]',
                'Language used for the generated documentation (en-US, de-DE, es-ES, fr-FR, hu-HU, it-IT, ja-JP, nl-NL, pt-BR, zh-CN)',
                COMPODOC_DEFAULTS.language
            )
            .option(
                '--theme [theme]',
                "Choose one of available themes, default is 'gitbook' (laravel, original, material, postmark, readthedocs, stripe, vagrant)"
            )
            .option(
                '--hideGenerator',
                'Do not print the Compodoc link at the bottom of the page',
                false
            )
            .option(
                '--toggleMenuItems <items>',
                "Close by default items in the menu values : ['all'] or one of these ['modules','components','directives','controllers','classes','injectables','guards','interfaces','interceptors','pipes','miscellaneous','additionalPages']",
                list,
                COMPODOC_DEFAULTS.toggleMenuItems
            )
            .option(
                '--navTabConfig <tab configs>',
                `List navigation tab objects in the desired order with two string properties ("id" and "label"). \
Double-quotes must be escaped with '\\'. \
Available tab IDs are "info", "readme", "source", "templateData", "styleData", "tree", and "example". \
Note: Certain tabs will only be shown if applicable to a given dependency`,
                list,
                JSON.stringify(COMPODOC_DEFAULTS.navTabConfig)
            )
            .option(
                '--templates [folder]',
                'Path to directory of Handlebars templates to override built-in templates'
            )
            .option('--includes [path]', 'Path of external markdown files to include')
            .option(
                '--includesName [name]',
                'Name of item menu of externals markdown files',
                COMPODOC_DEFAULTS.additionalEntryName
            )
            .option(
                '--coverageTest [threshold]',
                'Test command of documentation coverage with a threshold (default 70)'
            )
            .option(
                '--coverageMinimumPerFile [minimum]',
                'Test command of documentation coverage per file with a minimum (default 0)'
            )
            .option(
                '--coverageTestThresholdFail [true|false]',
                'Test command of documentation coverage (global or per file) will fail with error or just warn user (true: error, false: warn)',
                COMPODOC_DEFAULTS.coverageTestThresholdFail
            )
            .option('--coverageTestShowOnlyFailed', 'Display only failed files for a coverage test')
            .option(
                '--unitTestCoverage [json-summary]',
                'To include unit test coverage, specify istanbul JSON coverage summary file'
            )
            .option(
                '--disableSourceCode',
                'Do not add source code tab and links to source code',
                false
            )
            .option('--disableDomTree', 'Do not add dom tree tab', false)
            .option('--disableTemplateTab', 'Do not add template tab', false)
            .option('--disableStyleTab', 'Do not add style tab', false)
            .option('--disableGraph', 'Do not add the dependency graph', false)
            .option('--disableCoverage', 'Do not add the documentation coverage report', false)
            .option('--disablePrivate', 'Do not show private in generated documentation', false)
            .option('--disableProtected', 'Do not show protected in generated documentation', false)
            .option('--disableInternal', 'Do not show @internal in generated documentation', false)
            .option(
                '--disableLifeCycleHooks',
                'Do not show Angular lifecycle hooks in generated documentation',
                false
            )
            .option(
                '--disableRoutesGraph',
                'Do not add the routes graph',
                COMPODOC_DEFAULTS.disableRoutesGraph
            )
            .option('--disableSearch', 'Do not add the search input', false)
            .option(
                '--disableDependencies',
                'Do not add the dependencies list',
                COMPODOC_DEFAULTS.disableDependencies
            )
            .option(
                '--minimal',
                'Minimal mode with only documentation. No search, no graph, no coverage.',
                false
            )
            .option('--customFavicon [path]', 'Use a custom favicon')
            .option('--customLogo [path]', 'Use a custom logo')
            .option('--gaID [id]', 'Google Analytics tracking ID')
            .option('--gaSite [site]', 'Google Analytics site name', COMPODOC_DEFAULTS.gaSite)
            .parse(process.argv);
    }
}

export default SetupFlags.getInstance();
