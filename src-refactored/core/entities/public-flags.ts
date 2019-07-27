import { COMPODOC_DEFAULTS } from '../defaults';

export interface Flag {
    label: string;
    flag: string;
    description: string;
    defaultValue?: boolean | string | number | string[];
    parsingFunction?: (val: string) => string[];
    stringifyDefaultValue?: boolean;
}

function list(val: string): string[] {
    return val.split(',');
}

export const PUBLIC_FLAGS: Flag[] = [
    {
        label: 'assetsFolder',
        flag: '-a, --assetsFolder [folder]',
        description: 'External assets folder to copy in generated documentation folder'
    },
    {
        label: 'config',
        flag: '-c, --config [config]',
        description:
            'A configuration file : .compodocrc, .compodocrc.json, .compodocrc.yaml or compodoc property in package.json'
    },
    {
        label: 'coverageMinimumPerFile',
        flag: '--coverageMinimumPerFile [minimum]',
        description: 'Test command of documentation coverage per file with a minimum (default 0)'
    },
    {
        label: 'coverageTest',
        flag: '--coverageTest [threshold]',
        description: 'Test command of documentation coverage with a threshold (default 70)'
    },
    {
        label: 'coverageTestShowOnlyFailed',
        flag: '--coverageTestShowOnlyFailed',
        description: 'Display only failed files for a coverage test'
    },
    {
        label: 'coverageTestThresholdFail',
        flag: '--coverageTestThresholdFail [true|false]',
        description:
            'Test command of documentation coverage (global or per file) will fail with error or just warn user (true: error, false: warn)',
        defaultValue: COMPODOC_DEFAULTS.coverageTestThresholdFail
    },
    {
        label: 'customFavicon',
        flag: '--customFavicon [path]',
        description: 'Use a custom favicon'
    },
    {
        label: 'customLogo',
        flag: '--customLogo [path]',
        description: 'Use a custom logo'
    },
    {
        label: 'disableCoverage',
        flag: '--disableCoverage',
        description: 'Do not add the documentation coverage report',
        defaultValue: false
    },
    {
        label: 'disableDependencies',
        flag: '--disableDependencies',
        description: 'Do not add the dependencies list',
        defaultValue: COMPODOC_DEFAULTS.disableDependencies
    },
    {
        label: 'disableDomTree',
        flag: '--disableDomTree',
        description: 'Do not add dom tree tab',
        defaultValue: false
    },
    {
        label: 'disableGraph',
        flag: '--disableGraph',
        description: 'Do not add the dependency graph',
        defaultValue: false
    },
    {
        label: 'disableInternal',
        flag: '--disableInternal',
        description: 'Do not show @internal in generated documentation',
        defaultValue: false
    },
    {
        label: 'disableLifeCycleHooks',
        flag: '--disableLifeCycleHooks',
        description: 'Do not show Angular lifecycle hooks in generated documentation',
        defaultValue: false
    },
    {
        label: 'disablePrivate',
        flag: '--disablePrivate',
        description: 'Do not show private in generated documentation',
        defaultValue: false
    },
    {
        label: 'disableProtected',
        flag: '--disableProtected',
        description: 'Do not show protected in generated documentation',
        defaultValue: false
    },
    {
        label: 'disableRoutesGraph',
        flag: '--disableRoutesGraph',
        description: 'Do not add the routes graph',
        defaultValue: COMPODOC_DEFAULTS.disableRoutesGraph
    },
    {
        label: 'disableSearch',
        flag: '--disableSearch',
        description: 'Do not add the search input',
        defaultValue: false
    },
    {
        label: 'disableSourceCode',
        flag: '--disableSourceCode',
        description: 'Do not add source code tab and links to source code',
        defaultValue: false
    },
    {
        label: 'disableStyleTab',
        flag: '--disableStyleTab',
        description: 'Do not add style tab',
        defaultValue: false
    },
    {
        label: 'disableTemplateTab',
        flag: '--disableTemplateTab',
        description: 'Do not add template tab',
        defaultValue: false
    },
    {
        label: 'exportFormat',
        flag: '-e, --exportFormat [format]',
        description: 'Export in specified format (json, html)',
        defaultValue: COMPODOC_DEFAULTS.exportFormat
    },
    {
        label: 'extTheme',
        flag: '-y, --extTheme [file]',
        description: 'External styling theme file'
    },
    {
        label: 'files',
        flag: '--files [files]',
        description: 'Files provided by external tool, used for coverage test'
    },
    {
        label: 'gaID',
        flag: '--gaID [id]',
        description: 'Google Analytics tracking ID'
    },
    {
        label: 'gaSite',
        flag: '--gaSite [site]',
        description: 'Google Analytics site name',
        defaultValue: COMPODOC_DEFAULTS.gaSite
    },
    {
        label: 'hideGenerator',
        flag: '--hideGenerator',
        description: 'Do not print the Compodoc link at the bottom of the page',
        defaultValue: false
    },
    {
        label: 'host',
        flag: '--host [host]',
        description: 'Change default host address',
        defaultValue: COMPODOC_DEFAULTS.hostname
    },
    {
        label: 'includes',
        flag: '--includes [path]',
        description: 'Path of external markdown files to include'
    },
    {
        label: 'includesName',
        flag: '--includesName [name]',
        description: 'Name of item menu of externals markdown files',
        defaultValue: COMPODOC_DEFAULTS.additionalEntryName
    },
    {
        label: 'language',
        flag: '--language [language]',
        description:
            'Language used for the generated documentation (en-US, de-DE, es-ES, fr-FR, hu-HU, it-IT, ja-JP, nl-NL, pt-BR, zh-CN)',
        defaultValue: COMPODOC_DEFAULTS.language
    },
    {
        label: 'minimal',
        flag: '--minimal',
        description: 'Minimal mode with only documentation. No search, no graph, no coverage.',
        defaultValue: false
    },
    {
        label: 'name',
        flag: '-n, --name [name]',
        description: 'Title documentation',
        defaultValue: COMPODOC_DEFAULTS.title
    },
    {
        label: 'navTabConfig',
        flag: '--navTabConfig <tab configs>',
        description: `List navigation tab objects in the desired order with two string properties ("id" and "label"). \
        Double-quotes must be escaped with '\\'. \
        Available tab IDs are "info", "readme", "source", "templateData", "styleData", "tree", and "example". \
        Note: Certain tabs will only be shown if applicable to a given dependency`,
        defaultValue: false,
        parsingFunction: list,
        stringifyDefaultValue: true
    },
    {
        label: 'open',
        flag: '-o, --open [value]',
        description: 'Open the generated documentation',
        defaultValue: false
    },
    {
        label: 'output',
        flag: '-d, --output [folder]',
        description: 'Where to store the generated documentation',
        defaultValue: COMPODOC_DEFAULTS.folder
    },
    {
        label: 'port',
        flag: '-r, --port [port]',
        description: 'Change default serving port',
        defaultValue: COMPODOC_DEFAULTS.port
    },
    {
        label: 'serve',
        flag: '-s, --serve',
        description: 'Serve generated documentation (default http://localhost:8080/)',
        defaultValue: false
    },
    {
        label: 'silent',
        flag: '-t, --silent',
        description: `In silent mode, log messages aren't logged in the console`,
        defaultValue: false
    },
    {
        label: 'templates',
        flag: '--templates [folder]',
        description: 'Path to directory of Handlebars templates to override built-in templates'
    },
    {
        label: 'theme',
        flag: '--theme [theme]',
        description: `Choose one of available themes, default is 'gitbook' (laravel, original, material, postmark, readthedocs, stripe, vagrant)`,
        defaultValue: COMPODOC_DEFAULTS.theme
    },
    {
        label: 'toggleMenuItems',
        flag: '--toggleMenuItems <items>',
        description: `Close by default items in the menu values : ['all'] or one of these ['modules','components','directives','controllers','classes','injectables','guards','interfaces','interceptors','pipes','miscellaneous','additionalPages']`,
        defaultValue: COMPODOC_DEFAULTS.toggleMenuItems,
        parsingFunction: list
    },
    {
        label: 'tsconfig',
        flag: '-p, --tsconfig [config]',
        description: 'A tsconfig.json file'
    },
    {
        label: 'unitTestCoverage',
        flag: '--unitTestCoverage [json-summary]',
        description: 'To include unit test coverage, specify istanbul JSON coverage summary file'
    },
    {
        label: 'watch',
        flag: '-w, --watch',
        description: 'Watch source files after serve and force documentation rebuild',
        defaultValue: false
    },
    {
        label: 'maxSearchResults',
        flag: '--maxSearchResults [number]',
        description: 'Max search results on the results page. To show all results, set to 0',
        defaultValue: 15
    }
];
