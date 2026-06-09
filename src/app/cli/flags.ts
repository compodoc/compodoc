import type { Command } from 'commander';

import { COMPODOC_DEFAULTS } from '../../utils/defaults';

const pkg = require('../../../package.json');

export function splitFlagList(value: string): string[] {
    return value.split(',');
}

export function collectFlagValues(value: string, previous?: string | string[]): string[] {
    const values = Array.isArray(previous) ? previous : previous ? [previous] : [];
    return [...values, value];
}

export function defineCliFlags(program: Command): Command {
    const cli = program as any;

    return cli
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
            COMPODOC_DEFAULTS.silent
        )
        .option(
            '-s, --serve',
            'Serve generated documentation (default http://localhost:8080/)',
            COMPODOC_DEFAULTS.serve
        )
        .option('--host [host]', 'Change default host address')
        .option('-r, --port [port]', 'Change default serving port', COMPODOC_DEFAULTS.port)
        .option(
            '-w, --watch',
            'Watch source files after serve and force documentation rebuild',
            COMPODOC_DEFAULTS.watch
        )
        .option(
            '-e, --exportFormat [format]',
            'Export in specified format (json, html)',
            COMPODOC_DEFAULTS.exportFormat
        )
        .option(
            '--files [files]',
            'Files provided by external tool, used for coverage test',
            collectFlagValues
        )
        .option(
            '--language [language]',
            'Language used for the generated documentation (bg-BG, de-DE, en-US, es-ES, fr-FR, hu-HU, it-IT, ja-JP, ka-GE, ko-KR, nl-NL, pl-PL, pt-BR, ru-RU, sk-SK, zh-CN, zh-TW)',
            COMPODOC_DEFAULTS.language
        )
        .option(
            '--theme [theme]',
            "Choose one of available themes, default is 'gitbook' (laravel, original, material, postmark, readthedocs, stripe, vagrant)"
        )
        .option(
            '--hideGenerator',
            'Do not print the Compodoc link at the bottom of the page',
            COMPODOC_DEFAULTS.hideGenerator
        )
        .option(
            '--hideDarkModeToggle',
            'Do not show dark mode toggle button at the top right position of the page',
            COMPODOC_DEFAULTS.hideDarkModeToggle
        )
        .option(
            '--toggleMenuItems <items>',
            "Close by default items in the menu values : ['all'] or one of these ['modules','components','directives','controllers','entities','classes','injectables','guards','interfaces','interceptors','pipes','miscellaneous','additionalPages']",
            splitFlagList,
            COMPODOC_DEFAULTS.toggleMenuItems
        )
        .option(
            '--navTabConfig <tab configs>',
            `List navigation tab objects in the desired order with two string properties ("id" and "label"). \
Double-quotes must be escaped with '\\'. \
Available tab IDs are "info", "api", "readme", "source", "templateData", "styleData", "tree", and "example". \
Note: Certain tabs will only be shown if applicable to a given dependency`,
            splitFlagList,
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
            '--coverageExclude <patterns>',
            'Exclude files from documentation coverage only (comma-separated globs)',
            splitFlagList
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
            COMPODOC_DEFAULTS.disableSourceCode
        )
        .option('--disableDomTree', 'Do not add dom tree tab', COMPODOC_DEFAULTS.disableDomTree)
        .option(
            '--disableTemplateTab',
            'Do not add template tab',
            COMPODOC_DEFAULTS.disableTemplateTab
        )
        .option('--disableStyleTab', 'Do not add style tab', COMPODOC_DEFAULTS.disableStyleTab)
        .option('--disableGraph', 'Do not add the dependency graph', COMPODOC_DEFAULTS.disableGraph)
        .option(
            '--disableCoverage',
            'Do not add the documentation coverage report',
            COMPODOC_DEFAULTS.disableCoverage
        )
        .option(
            '--disablePrivate',
            'Do not show private in generated documentation',
            COMPODOC_DEFAULTS.disablePrivate
        )
        .option(
            '--disableProtected',
            'Do not show protected in generated documentation',
            COMPODOC_DEFAULTS.disableProtected
        )
        .option(
            '--disableInternal',
            'Do not show @internal in generated documentation',
            COMPODOC_DEFAULTS.disableInternal
        )
        .option(
            '--disableLifeCycleHooks',
            'Do not show Angular lifecycle hooks in generated documentation',
            COMPODOC_DEFAULTS.disableLifeCycleHooks
        )
        .option(
            '--disableConstructors',
            'Do not show constructors in generated documentation',
            COMPODOC_DEFAULTS.disableConstructors
        )
        .option(
            '--disableRoutesGraph',
            'Do not add the routes graph',
            COMPODOC_DEFAULTS.disableRoutesGraph
        )
        .option('--disableSearch', 'Do not add the search input', COMPODOC_DEFAULTS.disableSearch)
        .option(
            '--disableDependencies',
            'Do not add the dependencies list',
            COMPODOC_DEFAULTS.disableDependencies
        )
        .option(
            '--disableProperties',
            'Do not add the properties list',
            COMPODOC_DEFAULTS.disableProperties
        )
        .option('--disableFilePath', 'Do not add the file path', COMPODOC_DEFAULTS.disableFilePath)
        .option(
            '--disableOverview',
            'Do not add the overview page',
            COMPODOC_DEFAULTS.disableOverview
        )
        .option(
            '--templatePlayground',
            'Generate template playground page for customizing templates',
            false
        )
        .option(
            '--minimal',
            'Minimal mode with only documentation. No search, no graph, no coverage.',
            COMPODOC_DEFAULTS.minimal
        )
        .option('--customFavicon [path]', 'Use a custom favicon')
        .option('--customLogo [path]', 'Use a custom logo')
        .option('--gaID [id]', 'Google Analytics tracking ID')
        .option('--gaSite [site]', 'Google Analytics site name', COMPODOC_DEFAULTS.gaSite)
        .option(
            '--publicApiOnly [path]',
            'Document only symbols exported from index.d.ts files in the specified dist folder'
        )
        .option(
            '--maxSearchResults [maxSearchResults]',
            'Max search results on the results page. To show all results, set to 0',
            COMPODOC_DEFAULTS.maxSearchResults
        )
        .allowExcessArguments();
}
