import * as fs from 'fs-extra';
import * as path from 'path';

import { ts } from 'ts-morph';

import { Application } from './app/application';
import Configuration from './app/configuration';
import FileEngine from './app/engines/file.engine';
import I18nEngine from './app/engines/i18n.engine';

import { ConfigurationFileInterface } from './app/interfaces/configuration-file.interface';
import AngularVersionUtil from './utils/angular-version.util';
import { COMPODOC_DEFAULTS } from './utils/defaults';
import { logger } from './utils/logger';
import { ParserUtil } from './utils/parser.util.class';
import { readConfig, ignoreDirectory } from './utils/utils';

import { cosmiconfigSync } from 'cosmiconfig';

const os = require('os');
const osName = require('os-name');
const pkg = require('../package.json');
const program = require('commander');

const cosmiconfigModuleName = 'compodoc';

let scannedFiles = [];
let excludeFiles;
let includeFiles;
let cwd = process.cwd();

process.setMaxListeners(0);

export class CliApplication extends Application {
    /**
     * Run compodoc from the command line.
     */
    protected start(): any {
        function list(val) {
            return val.split(',');
        }

        program
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
                'Language used for the generated documentation (de-DE, en-US, es-ES, fr-FR, hu-HU, it-IT, ja-JP, ko-KR, nl-NL, pl-PL, pt-BR, sk-SK, zh-CN, zh-TW)',
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
                '--hideDarkModeToggle',
                'Do not show dark mode toggle button at the top right position of the page',
                false
            )
            .option(
                '--toggleMenuItems <items>',
                "Close by default items in the menu values : ['all'] or one of these ['modules','components','directives','controllers','entities','classes','injectables','guards','interfaces','interceptors','pipes','miscellaneous','additionalPages']",
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
                '--disableProperties',
                'Do not add the properties list',
                COMPODOC_DEFAULTS.disableProperties
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
            .option(
                '--maxSearchResults [maxSearchResults]',
                'Max search results on the results page. To show all results, set to 0',
                COMPODOC_DEFAULTS.maxSearchResults
            )
            .parse(process.argv);

        let outputHelp = () => {
            program.outputHelp();
            process.exit(1);
        };

        const configExplorer = cosmiconfigSync(cosmiconfigModuleName);

        let configExplorerResult;

        let configFile: ConfigurationFileInterface = {};

        const programOptions = program.opts();

        if (programOptions.config) {
            let configFilePath = programOptions.config;
            let testConfigFilePath = configFilePath.match(process.cwd());
            if (testConfigFilePath && testConfigFilePath.length > 0) {
                configFilePath = configFilePath.replace(process.cwd() + path.sep, '');
            }
            configExplorerResult = configExplorer.load(path.resolve(configFilePath));
        } else {
            configExplorerResult = configExplorer.search();
        }

        if (configExplorerResult) {
            if (typeof configExplorerResult.config !== 'undefined') {
                configFile = configExplorerResult.config;
            }
        }

        if (configFile.output) {
            Configuration.mainData.output = configFile.output;
        }
        if (programOptions.output && programOptions.output !== COMPODOC_DEFAULTS.folder) {
            Configuration.mainData.output = programOptions.output;
        }

        if (configFile.extTheme) {
            Configuration.mainData.extTheme = configFile.extTheme;
        }
        if (programOptions.extTheme) {
            Configuration.mainData.extTheme = programOptions.extTheme;
        }

        if (configFile.language) {
            Configuration.mainData.language = configFile.language;
        }
        if (programOptions.language) {
            Configuration.mainData.language = programOptions.language;
        }

        if (configFile.theme) {
            Configuration.mainData.theme = configFile.theme;
        }
        if (programOptions.theme) {
            Configuration.mainData.theme = programOptions.theme;
        }

        if (configFile.name) {
            Configuration.mainData.documentationMainName = configFile.name;
        }
        if (programOptions.name && programOptions.name !== COMPODOC_DEFAULTS.title) {
            Configuration.mainData.documentationMainName = programOptions.name;
        }

        if (configFile.assetsFolder) {
            Configuration.mainData.assetsFolder = configFile.assetsFolder;
        }
        if (programOptions.assetsFolder) {
            Configuration.mainData.assetsFolder = programOptions.assetsFolder;
        }

        if (configFile.open) {
            Configuration.mainData.open = configFile.open;
        }
        if (programOptions.open) {
            Configuration.mainData.open = programOptions.open;
        }

        if (configFile.toggleMenuItems) {
            Configuration.mainData.toggleMenuItems = configFile.toggleMenuItems;
        }
        if (
            programOptions.toggleMenuItems &&
            programOptions.toggleMenuItems !== COMPODOC_DEFAULTS.toggleMenuItems
        ) {
            Configuration.mainData.toggleMenuItems = programOptions.toggleMenuItems;
        }

        if (configFile.templates) {
            Configuration.mainData.templates = configFile.templates;
        }
        if (programOptions.templates) {
            Configuration.mainData.templates = programOptions.templates;
        }

        if (configFile.navTabConfig) {
            Configuration.mainData.navTabConfig = configFile.navTabConfig;
        }
        if (
            programOptions.navTabConfig &&
            JSON.parse(programOptions.navTabConfig).length !== COMPODOC_DEFAULTS.navTabConfig.length
        ) {
            Configuration.mainData.navTabConfig = JSON.parse(programOptions.navTabConfig);
        }

        if (configFile.includes) {
            Configuration.mainData.includes = configFile.includes;
        }
        if (programOptions.includes) {
            Configuration.mainData.includes = programOptions.includes;
        }

        if (configFile.includesName) {
            Configuration.mainData.includesName = configFile.includesName;
        }
        if (
            programOptions.includesName &&
            programOptions.includesName !== COMPODOC_DEFAULTS.additionalEntryName
        ) {
            Configuration.mainData.includesName = programOptions.includesName;
        }

        if (configFile.silent) {
            logger.silent = false;
        }
        if (programOptions.silent) {
            logger.silent = false;
        }

        if (configFile.serve) {
            Configuration.mainData.serve = configFile.serve;
        }
        if (programOptions.serve) {
            Configuration.mainData.serve = programOptions.serve;
        }

        if (configFile.host) {
            Configuration.mainData.host = configFile.host;
            Configuration.mainData.hostname = configFile.host;
        }
        if (programOptions.host) {
            Configuration.mainData.host = programOptions.host;
            Configuration.mainData.hostname = programOptions.host;
        }

        if (configFile.port) {
            Configuration.mainData.port = configFile.port;
        }
        if (programOptions.port && programOptions.port !== COMPODOC_DEFAULTS.port) {
            Configuration.mainData.port = programOptions.port;
        }

        if (configFile.watch) {
            Configuration.mainData.watch = configFile.watch;
        }
        if (programOptions.watch) {
            Configuration.mainData.watch = programOptions.watch;
        }

        if (configFile.exportFormat) {
            Configuration.mainData.exportFormat = configFile.exportFormat;
        }
        if (
            programOptions.exportFormat &&
            programOptions.exportFormat !== COMPODOC_DEFAULTS.exportFormat
        ) {
            Configuration.mainData.exportFormat = programOptions.exportFormat;
        }

        if (configFile.hideGenerator) {
            Configuration.mainData.hideGenerator = configFile.hideGenerator;
        }
        if (programOptions.hideGenerator) {
            Configuration.mainData.hideGenerator = programOptions.hideGenerator;
        }

        if (configFile.hideDarkModeToggle) {
            Configuration.mainData.hideDarkModeToggle = configFile.hideDarkModeToggle;
        }
        if (programOptions.hideDarkModeToggle) {
            Configuration.mainData.hideDarkModeToggle = programOptions.hideDarkModeToggle;
        }

        if (configFile.coverageTest) {
            Configuration.mainData.coverageTest = true;
            Configuration.mainData.coverageTestThreshold =
                typeof configFile.coverageTest === 'string'
                    ? parseInt(configFile.coverageTest, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageThreshold;
        }
        if (programOptions.coverageTest) {
            Configuration.mainData.coverageTest = true;
            Configuration.mainData.coverageTestThreshold =
                typeof programOptions.coverageTest === 'string'
                    ? parseInt(programOptions.coverageTest, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageThreshold;
        }

        if (configFile.coverageMinimumPerFile) {
            Configuration.mainData.coverageTestPerFile = true;
            Configuration.mainData.coverageMinimumPerFile =
                typeof configFile.coverageMinimumPerFile === 'string'
                    ? parseInt(configFile.coverageMinimumPerFile, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageMinimumPerFile;
        }
        if (programOptions.coverageMinimumPerFile) {
            Configuration.mainData.coverageTestPerFile = true;
            Configuration.mainData.coverageMinimumPerFile =
                typeof programOptions.coverageMinimumPerFile === 'string'
                    ? parseInt(programOptions.coverageMinimumPerFile, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageMinimumPerFile;
        }

        if (configFile.coverageTestThresholdFail) {
            Configuration.mainData.coverageTestThresholdFail =
                configFile.coverageTestThresholdFail === 'false' ? false : true;
        }
        if (programOptions.coverageTestThresholdFail) {
            Configuration.mainData.coverageTestThresholdFail =
                programOptions.coverageTestThresholdFail === 'false' ? false : true;
        }

        if (configFile.coverageTestShowOnlyFailed) {
            Configuration.mainData.coverageTestShowOnlyFailed =
                configFile.coverageTestShowOnlyFailed;
        }
        if (programOptions.coverageTestShowOnlyFailed) {
            Configuration.mainData.coverageTestShowOnlyFailed =
                programOptions.coverageTestShowOnlyFailed;
        }

        if (configFile.unitTestCoverage) {
            Configuration.mainData.unitTestCoverage = configFile.unitTestCoverage;
        }
        if (programOptions.unitTestCoverage) {
            Configuration.mainData.unitTestCoverage = programOptions.unitTestCoverage;
        }

        if (configFile.disableSourceCode) {
            Configuration.mainData.disableSourceCode = configFile.disableSourceCode;
        }
        if (programOptions.disableSourceCode) {
            Configuration.mainData.disableSourceCode = programOptions.disableSourceCode;
        }

        if (configFile.disableDomTree) {
            Configuration.mainData.disableDomTree = configFile.disableDomTree;
        }
        if (programOptions.disableDomTree) {
            Configuration.mainData.disableDomTree = programOptions.disableDomTree;
        }

        if (configFile.disableTemplateTab) {
            Configuration.mainData.disableTemplateTab = configFile.disableTemplateTab;
        }
        if (programOptions.disableTemplateTab) {
            Configuration.mainData.disableTemplateTab = programOptions.disableTemplateTab;
        }

        if (configFile.disableStyleTab) {
            Configuration.mainData.disableStyleTab = configFile.disableStyleTab;
        }
        if (programOptions.disableStyleTab) {
            Configuration.mainData.disableStyleTab = programOptions.disableStyleTab;
        }

        if (configFile.disableGraph) {
            Configuration.mainData.disableGraph = configFile.disableGraph;
        }
        if (programOptions.disableGraph) {
            Configuration.mainData.disableGraph = programOptions.disableGraph;
        }

        if (configFile.disableCoverage) {
            Configuration.mainData.disableCoverage = configFile.disableCoverage;
        }
        if (programOptions.disableCoverage) {
            Configuration.mainData.disableCoverage = programOptions.disableCoverage;
        }

        if (configFile.disablePrivate) {
            Configuration.mainData.disablePrivate = configFile.disablePrivate;
        }
        if (programOptions.disablePrivate) {
            Configuration.mainData.disablePrivate = programOptions.disablePrivate;
        }

        if (configFile.disableProtected) {
            Configuration.mainData.disableProtected = configFile.disableProtected;
        }
        if (programOptions.disableProtected) {
            Configuration.mainData.disableProtected = programOptions.disableProtected;
        }

        if (configFile.disableInternal) {
            Configuration.mainData.disableInternal = configFile.disableInternal;
        }
        if (programOptions.disableInternal) {
            Configuration.mainData.disableInternal = programOptions.disableInternal;
        }

        if (configFile.disableLifeCycleHooks) {
            Configuration.mainData.disableLifeCycleHooks = configFile.disableLifeCycleHooks;
        }
        if (programOptions.disableLifeCycleHooks) {
            Configuration.mainData.disableLifeCycleHooks = programOptions.disableLifeCycleHooks;
        }

        if (configFile.disableRoutesGraph) {
            Configuration.mainData.disableRoutesGraph = configFile.disableRoutesGraph;
        }
        if (programOptions.disableRoutesGraph) {
            Configuration.mainData.disableRoutesGraph = programOptions.disableRoutesGraph;
        }

        if (configFile.disableSearch) {
            Configuration.mainData.disableSearch = configFile.disableSearch;
        }
        if (programOptions.disableSearch) {
            Configuration.mainData.disableSearch = programOptions.disableSearch;
        }

        if (configFile.disableDependencies) {
            Configuration.mainData.disableDependencies = configFile.disableDependencies;
        }
        if (programOptions.disableDependencies) {
            Configuration.mainData.disableDependencies = programOptions.disableDependencies;
        }

        if (configFile.disableProperties) {
            Configuration.mainData.disableProperties = configFile.disableProperties;
        }
        if (programOptions.disableProperties) {
            Configuration.mainData.disableProperties = programOptions.disableProperties;
        }

        if (configFile.minimal) {
            Configuration.mainData.disableSearch = true;
            Configuration.mainData.disableRoutesGraph = true;
            Configuration.mainData.disableGraph = true;
            Configuration.mainData.disableCoverage = true;
        }
        if (programOptions.minimal) {
            Configuration.mainData.disableSearch = true;
            Configuration.mainData.disableRoutesGraph = true;
            Configuration.mainData.disableGraph = true;
            Configuration.mainData.disableCoverage = true;
        }

        if (configFile.customFavicon) {
            Configuration.mainData.customFavicon = configFile.customFavicon;
        }
        if (programOptions.customFavicon) {
            Configuration.mainData.customFavicon = programOptions.customFavicon;
        }

        if (configFile.customLogo) {
            Configuration.mainData.customLogo = configFile.customLogo;
        }
        if (programOptions.customLogo) {
            Configuration.mainData.customLogo = programOptions.customLogo;
        }

        if (configFile.gaID) {
            Configuration.mainData.gaID = configFile.gaID;
        }
        if (programOptions.gaID) {
            Configuration.mainData.gaID = programOptions.gaID;
        }

        if (configFile.gaSite) {
            Configuration.mainData.gaSite = configFile.gaSite;
        }
        if (programOptions.gaSite && programOptions.gaSite !== COMPODOC_DEFAULTS.gaSite) {
            Configuration.mainData.gaSite = programOptions.gaSite;
        }

        if (!this.isWatching) {
            if (!logger.silent) {
                console.log(`Compodoc v${pkg.version}`);
            } else {
                console.log(fs.readFileSync(path.join(__dirname, '../src/banner')).toString());
                console.log(pkg.version);
                console.log('');
                console.log(`TypeScript version used by Compodoc : ${ts.version}`);
                console.log('');

                if (FileEngine.existsSync(cwd + path.sep + 'package.json')) {
                    const packageData = FileEngine.getSync(cwd + path.sep + 'package.json');
                    if (packageData) {
                        const parsedData = JSON.parse(packageData);
                        const projectDevDependencies = parsedData.devDependencies;
                        if (projectDevDependencies && projectDevDependencies.typescript) {
                            const tsProjectVersion = AngularVersionUtil.cleanVersion(
                                projectDevDependencies.typescript
                            );
                            console.log(
                                `TypeScript version of current project : ${tsProjectVersion}`
                            );
                            console.log('');
                        }
                    }
                }
                console.log(`Node.js version : ${process.version}`);
                console.log('');
                console.log(`Operating system : ${osName(os.platform(), os.release())}`);
                console.log('');
            }
        }

        if (configExplorerResult) {
            if (typeof configExplorerResult.config !== 'undefined') {
                logger.info(`Using configuration file : ${configExplorerResult.filepath}`);
            }
        }

        if (!configExplorerResult) {
            logger.warn(`No configuration file found, switching to CLI flags.`);
        }

        if (programOptions.language && !I18nEngine.supportLanguage(programOptions.language)) {
            logger.warn(
                `The language ${programOptions.language} is not available, falling back to ${I18nEngine.fallbackLanguage}`
            );
        }

        if (programOptions.tsconfig && typeof programOptions.tsconfig === 'boolean') {
            logger.error(`Please provide a tsconfig file.`);
            process.exit(1);
        }

        if (configFile.tsconfig) {
            Configuration.mainData.tsconfig = configFile.tsconfig;
        }
        if (programOptions.tsconfig) {
            Configuration.mainData.tsconfig = programOptions.tsconfig;
        }

        if (programOptions.maxSearchResults) {
            Configuration.mainData.maxSearchResults = programOptions.maxSearchResults;
        }

        if (configFile.files) {
            scannedFiles = configFile.files;
        }
        if (configFile.exclude) {
            excludeFiles = configFile.exclude;
        }
        if (configFile.include) {
            includeFiles = configFile.include;
        }

        /**
         * Check --files argument call
         */
        const argv = require('minimist')(process.argv.slice(2));
        if (argv && argv.files) {
            Configuration.mainData.hasFilesToCoverage = true;
            if (typeof argv.files === 'string') {
                super.setFiles([argv.files]);
            } else {
                super.setFiles(argv.files);
            }
        }

        if (programOptions.serve && !Configuration.mainData.tsconfig && programOptions.output) {
            // if -s & -d, serve it
            if (!FileEngine.existsSync(Configuration.mainData.output)) {
                logger.error(`${Configuration.mainData.output} folder doesn't exist`);
                process.exit(1);
            } else {
                logger.info(
                    `Serving documentation from ${Configuration.mainData.output} at http://${Configuration.mainData.hostname}:${programOptions.port}`
                );
                super.runWebServer(Configuration.mainData.output);
            }
        } else if (
            programOptions.serve &&
            !Configuration.mainData.tsconfig &&
            !programOptions.output
        ) {
            // if only -s find ./documentation, if ok serve, else error provide -d
            if (!FileEngine.existsSync(Configuration.mainData.output)) {
                logger.error('Provide output generated folder with -d flag');
                process.exit(1);
            } else {
                logger.info(
                    `Serving documentation from ${Configuration.mainData.output} at http://${Configuration.mainData.hostname}:${programOptions.port}`
                );
                super.runWebServer(Configuration.mainData.output);
            }
        } else if (Configuration.mainData.hasFilesToCoverage) {
            if (programOptions.coverageMinimumPerFile) {
                logger.info('Run documentation coverage test for files');
                super.testCoverage();
            } else {
                logger.error('Missing coverage configuration');
            }
        } else {
            if (programOptions.hideGenerator) {
                Configuration.mainData.hideGenerator = true;
            }

            if (Configuration.mainData.tsconfig && program.args.length === 0) {
                /**
                 * tsconfig file provided only
                 */
                let testTsConfigPath = Configuration.mainData.tsconfig.indexOf(process.cwd());
                if (testTsConfigPath !== -1) {
                    Configuration.mainData.tsconfig = Configuration.mainData.tsconfig.replace(
                        process.cwd() + path.sep,
                        ''
                    );
                }

                if (!FileEngine.existsSync(Configuration.mainData.tsconfig)) {
                    logger.error(
                        `"${Configuration.mainData.tsconfig}" file was not found in the current directory`
                    );
                    process.exit(1);
                } else {
                    let _file = path.join(
                        path.join(process.cwd(), path.dirname(Configuration.mainData.tsconfig)),
                        path.basename(Configuration.mainData.tsconfig)
                    );
                    // use the current directory of tsconfig.json as a working directory
                    cwd = _file.split(path.sep).slice(0, -1).join(path.sep);
                    logger.info('Using tsconfig file ', _file);

                    let tsConfigFile = readConfig(_file);
                    if (tsConfigFile.files) {
                        scannedFiles = tsConfigFile.files;
                        // Normalize path of these files
                        scannedFiles = scannedFiles.map(scannedFile => {
                            return cwd + path.sep + scannedFile;
                        });
                    }

                    // even if files are supplied with "files" attributes, enhance the array with includes
                    excludeFiles = tsConfigFile.exclude || [];
                    includeFiles = tsConfigFile.include || [];

                    if (scannedFiles.length > 0) {
                        includeFiles = [...includeFiles, ...scannedFiles];
                    }

                    let excludeParser = new ParserUtil(),
                        includeParser = new ParserUtil();

                    excludeParser.init(excludeFiles, cwd);
                    includeParser.init(includeFiles, cwd);

                    let startCwd = cwd;

                    let excludeParserTestFilesWithCwdDepth = excludeParser.testFilesWithCwdDepth();
                    if (!excludeParserTestFilesWithCwdDepth.status) {
                        startCwd = excludeParser.updateCwd(
                            cwd,
                            excludeParserTestFilesWithCwdDepth.level
                        );
                    }
                    let includeParserTestFilesWithCwdDepth = includeParser.testFilesWithCwdDepth();
                    if (!includeParser.testFilesWithCwdDepth().status) {
                        startCwd = includeParser.updateCwd(
                            cwd,
                            includeParserTestFilesWithCwdDepth.level
                        );
                    }

                    let finder = require('findit2')(startCwd || '.');

                    finder.on('directory', function (dir, stat, stop) {
                        if (ignoreDirectory(dir)) {
                            stop();
                        }
                    });

                    finder.on('file', (file, stat) => {
                        if (/(spec|\.d)\.ts/.test(file)) {
                            logger.warn('Ignoring', file);
                        } else if (
                            excludeParser.testFile(file) &&
                            (path.extname(file) === '.ts' || path.extname(file) === '.tsx')
                        ) {
                            logger.warn('Excluding', file);
                        } else if (includeFiles.length > 0) {
                            /**
                             * If include provided in tsconfig, use only this source,
                             * and not files found with global findit scan in working directory
                             */
                            if (
                                (path.extname(file) === '.ts' || path.extname(file) === '.tsx') &&
                                includeParser.testFile(file)
                            ) {
                                logger.debug('Including', file);
                                scannedFiles.push(file);
                            } else {
                                if (path.extname(file) === '.ts' || path.extname(file) === '.tsx') {
                                    logger.warn('Excluding', file);
                                }
                            }
                        } else {
                            logger.debug('Including', file);
                            scannedFiles.push(file);
                        }
                    });

                    finder.on('end', () => {
                        super.setFiles(scannedFiles);
                        if (programOptions.coverageTest || programOptions.coverageTestPerFile) {
                            logger.info('Run documentation coverage test');
                            super.testCoverage();
                        } else {
                            super.generate();
                        }
                    });
                }
            } else if (Configuration.mainData.tsconfig && program.args.length > 0) {
                /**
                 * tsconfig file provided with source folder in arg
                 */
                let testTsConfigPath = Configuration.mainData.tsconfig.indexOf(process.cwd());
                if (testTsConfigPath !== -1) {
                    Configuration.mainData.tsconfig = Configuration.mainData.tsconfig.replace(
                        process.cwd() + path.sep,
                        ''
                    );
                }

                let sourceFolder = program.args[0];
                if (!FileEngine.existsSync(sourceFolder)) {
                    logger.error(
                        `Provided source folder ${sourceFolder} was not found in the current directory`
                    );
                    process.exit(1);
                } else {
                    logger.info('Using provided source folder');

                    if (!FileEngine.existsSync(Configuration.mainData.tsconfig)) {
                        logger.error(
                            `"${Configuration.mainData.tsconfig}" file was not found in the current directory`
                        );
                        process.exit(1);
                    } else {
                        let _file = path.join(
                            path.join(process.cwd(), path.dirname(Configuration.mainData.tsconfig)),
                            path.basename(Configuration.mainData.tsconfig)
                        );
                        // use the current directory of tsconfig.json as a working directory
                        cwd = _file.split(path.sep).slice(0, -1).join(path.sep);
                        logger.info('Using tsconfig file ', _file);

                        let tsConfigFile = readConfig(_file);
                        if (tsConfigFile.files) {
                            scannedFiles = tsConfigFile.files;
                            // Normalize path of these files
                            scannedFiles = scannedFiles.map(scannedFile => {
                                return cwd + path.sep + scannedFile;
                            });
                        }

                        // even if files are supplied with "files" attributes, enhance the array with includes
                        excludeFiles = tsConfigFile.exclude || [];
                        includeFiles = tsConfigFile.include || [];

                        if (scannedFiles.length > 0) {
                            includeFiles = [...includeFiles, ...scannedFiles];
                        }

                        let excludeParser = new ParserUtil(),
                            includeParser = new ParserUtil();

                        excludeParser.init(excludeFiles, cwd);
                        includeParser.init(includeFiles, cwd);

                        let startCwd = sourceFolder;

                        let excludeParserTestFilesWithCwdDepth =
                            excludeParser.testFilesWithCwdDepth();
                        if (!excludeParserTestFilesWithCwdDepth.status) {
                            startCwd = excludeParser.updateCwd(
                                cwd,
                                excludeParserTestFilesWithCwdDepth.level
                            );
                        }
                        let includeParserTestFilesWithCwdDepth =
                            includeParser.testFilesWithCwdDepth();
                        if (!includeParser.testFilesWithCwdDepth().status) {
                            startCwd = includeParser.updateCwd(
                                cwd,
                                includeParserTestFilesWithCwdDepth.level
                            );
                        }

                        let finder = require('findit2')(path.resolve(startCwd));

                        finder.on('directory', function (dir, stat, stop) {
                            if (ignoreDirectory(dir)) {
                                stop();
                            }
                        });

                        finder.on('file', (file, stat) => {
                            if (/(spec|\.d)\.ts/.test(file)) {
                                logger.warn('Ignoring', file);
                            } else if (excludeParser.testFile(file)) {
                                logger.warn('Excluding', file);
                            } else if (includeFiles.length > 0) {
                                /**
                                 * If include provided in tsconfig, use only this source,
                                 * and not files found with global findit scan in working directory
                                 */
                                if (path.extname(file) === '.ts' && includeParser.testFile(file)) {
                                    logger.debug('Including', file);
                                    scannedFiles.push(file);
                                } else {
                                    if (path.extname(file) === '.ts') {
                                        logger.warn('Excluding', file);
                                    }
                                }
                            } else {
                                logger.debug('Including', file);
                                scannedFiles.push(file);
                            }
                        });

                        finder.on('end', () => {
                            super.setFiles(scannedFiles);
                            if (programOptions.coverageTest || programOptions.coverageTestPerFile) {
                                logger.info('Run documentation coverage test');
                                super.testCoverage();
                            } else {
                                super.generate();
                            }
                        });
                    }
                }
            } else {
                logger.error('tsconfig.json file was not found, please use -p flag');
                outputHelp();
            }
        }
    }
}
