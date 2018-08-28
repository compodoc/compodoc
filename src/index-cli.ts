import * as fs from 'fs-extra';
import * as path from 'path';

import { Application } from './app/application';

import { COMPODOC_DEFAULTS } from './utils/defaults';
import { logger } from './logger';
import { readConfig, handlePath } from './utils/utils';

import { ts } from 'ts-simple-ast';
import { ParserUtil } from './utils/parser.util.class';

import I18nEngineInstance from './app/engines/i18n.engine';

const pkg = require('../package.json');
const program = require('commander');
const os = require('os');
const osName = require('os-name');
const cosmiconfig = require('cosmiconfig');

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
    protected generate(): any {
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
            .option('--language [language]', 'Language used for the generated documentation (en-US, fr-FR, zh-CN)', COMPODOC_DEFAULTS.language)
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
                "Close by default items in the menu values : ['all'] or one of these ['modules','components','directives','classes','injectables','interfaces','pipes','additionalPages']",
                list,
                COMPODOC_DEFAULTS.toggleMenuItems
            )
            .option(
                '--navTabConfig <tab configs>',
                `List navigation tab objects in the desired order with two string properties ("id" and "label"). \
Double-quotes must be escaped with '\\'. \
Available tab IDs are "info", "readme", "source", "templateData", "tree", and "example". \
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
                '--minimal',
                'Minimal mode with only documentation. No search, no graph, no coverage.',
                false
            )
            .option('--customFavicon [path]', 'Use a custom favicon')
            .option('--gaID [id]', 'Google Analytics tracking ID')
            .option('--gaSite [site]', 'Google Analytics site name', COMPODOC_DEFAULTS.gaSite)
            .parse(process.argv);

        let outputHelp = () => {
            program.outputHelp();
            process.exit(1);
        };

        const configExplorer = cosmiconfig(cosmiconfigModuleName);

        let configExplorerResult;

        let configFile = {};

        if (program.config) {
            let configFilePath = program.config;
            let testConfigFilePath = configFilePath.match(process.cwd());
            if (testConfigFilePath && testConfigFilePath.length > 0) {
                configFilePath = configFilePath.replace(process.cwd() + path.sep, '');
            }
            configExplorerResult = configExplorer.loadSync(path.resolve(configFilePath));
        } else {
            configExplorerResult = configExplorer.searchSync();
        }
        if (configExplorerResult) {
            if (typeof configExplorerResult.config !== 'undefined') {
                configFile = configExplorerResult.config;
            }
        }

        if (configFile.output) {
            this.configuration.mainData.output = configFile.output;
        }
        if (program.output && program.output !== COMPODOC_DEFAULTS.folder) {
            this.configuration.mainData.output = program.output;
        }

        if (configFile.extTheme) {
            this.configuration.mainData.extTheme = configFile.extTheme;
        }
        if (program.extTheme) {
            this.configuration.mainData.extTheme = program.extTheme;
        }

        if (configFile.language) {
            this.configuration.mainData.language = configFile.language;
        }
        if (program.language) {
            this.configuration.mainData.language = program.language;
        }

        if (configFile.theme) {
            this.configuration.mainData.theme = configFile.theme;
        }
        if (program.theme) {
            this.configuration.mainData.theme = program.theme;
        }

        if (configFile.name) {
            this.configuration.mainData.documentationMainName = configFile.name;
        }
        if (program.name && program.name !== COMPODOC_DEFAULTS.title) {
            this.configuration.mainData.documentationMainName = program.name;
        }

        if (configFile.assetsFolder) {
            this.configuration.mainData.assetsFolder = configFile.assetsFolder;
        }
        if (program.assetsFolder) {
            this.configuration.mainData.assetsFolder = program.assetsFolder;
        }

        if (configFile.open) {
            this.configuration.mainData.open = configFile.open;
        }
        if (program.open) {
            this.configuration.mainData.open = program.open;
        }

        if (configFile.toggleMenuItems) {
            this.configuration.mainData.toggleMenuItems = configFile.toggleMenuItems;
        }
        if (
            program.toggleMenuItems &&
            program.toggleMenuItems !== COMPODOC_DEFAULTS.toggleMenuItems
        ) {
            this.configuration.mainData.toggleMenuItems = program.toggleMenuItems;
        }

        if (configFile.templates) {
            this.configuration.mainData.templates = configFile.templates;
        }
        if (program.templates) {
            this.configuration.mainData.templates = program.templates;
        }

        if (configFile.navTabConfig) {
            this.configuration.mainData.navTabConfig = configFile.navTabConfig;
        }
        if (
            program.navTabConfig &&
            JSON.parse(program.navTabConfig).length !== COMPODOC_DEFAULTS.navTabConfig.length
        ) {
            this.configuration.mainData.navTabConfig = JSON.parse(program.navTabConfig);
        }

        if (configFile.includes) {
            this.configuration.mainData.includes = configFile.includes;
        }
        if (program.includes) {
            this.configuration.mainData.includes = program.includes;
        }

        if (configFile.includesName) {
            this.configuration.mainData.includesName = configFile.includesName;
        }
        if (
            program.includesName &&
            program.includesName !== COMPODOC_DEFAULTS.additionalEntryName
        ) {
            this.configuration.mainData.includesName = program.includesName;
        }

        if (configFile.silent) {
            logger.silent = false;
        }
        if (program.silent) {
            logger.silent = false;
        }

        if (configFile.serve) {
            this.configuration.mainData.serve = configFile.serve;
        }
        if (program.serve) {
            this.configuration.mainData.serve = program.serve;
        }

        if (configFile.port) {
            this.configuration.mainData.port = configFile.port;
        }
        if (program.port && program.port !== COMPODOC_DEFAULTS.port) {
            this.configuration.mainData.port = program.port;
        }

        if (configFile.watch) {
            this.configuration.mainData.watch = configFile.watch;
        }
        if (program.watch) {
            this.configuration.mainData.watch = program.watch;
        }

        if (configFile.exportFormat) {
            this.configuration.mainData.exportFormat = configFile.exportFormat;
        }
        if (program.exportFormat && program.exportFormat !== COMPODOC_DEFAULTS.exportFormat) {
            this.configuration.mainData.exportFormat = program.exportFormat;
        }

        if (configFile.hideGenerator) {
            this.configuration.mainData.hideGenerator = configFile.hideGenerator;
        }
        if (program.hideGenerator) {
            this.configuration.mainData.hideGenerator = program.hideGenerator;
        }

        if (configFile.coverageTest) {
            this.configuration.mainData.coverageTest = true;
            this.configuration.mainData.coverageTestThreshold =
                typeof configFile.coverageTest === 'string'
                    ? parseInt(configFile.coverageTest, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageThreshold;
        }
        if (program.coverageTest) {
            this.configuration.mainData.coverageTest = true;
            this.configuration.mainData.coverageTestThreshold =
                typeof program.coverageTest === 'string'
                    ? parseInt(program.coverageTest, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageThreshold;
        }

        if (configFile.coverageMinimumPerFile) {
            this.configuration.mainData.coverageTestPerFile = true;
            this.configuration.mainData.coverageMinimumPerFile =
                typeof configFile.coverageMinimumPerFile === 'string'
                    ? parseInt(configFile.coverageMinimumPerFile, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageMinimumPerFile;
        }
        if (program.coverageMinimumPerFile) {
            this.configuration.mainData.coverageTestPerFile = true;
            this.configuration.mainData.coverageMinimumPerFile =
                typeof program.coverageMinimumPerFile === 'string'
                    ? parseInt(program.coverageMinimumPerFile, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageMinimumPerFile;
        }

        if (configFile.coverageTestThresholdFail) {
            this.configuration.mainData.coverageTestThresholdFail =
                configFile.coverageTestThresholdFail === 'false' ? false : true;
        }
        if (program.coverageTestThresholdFail) {
            this.configuration.mainData.coverageTestThresholdFail =
                program.coverageTestThresholdFail === 'false' ? false : true;
        }

        if (configFile.coverageTestShowOnlyFailed) {
            this.configuration.mainData.coverageTestShowOnlyFailed =
                configFile.coverageTestShowOnlyFailed;
        }
        if (program.coverageTestShowOnlyFailed) {
            this.configuration.mainData.coverageTestShowOnlyFailed =
                program.coverageTestShowOnlyFailed;
        }

        if (configFile.unitTestCoverage) {
            this.configuration.mainData.unitTestCoverage = configFile.unitTestCoverage;
        }
        if (program.unitTestCoverage) {
            this.configuration.mainData.unitTestCoverage = program.unitTestCoverage;
        }

        if (configFile.disableSourceCode) {
            this.configuration.mainData.disableSourceCode = configFile.disableSourceCode;
        }
        if (program.disableSourceCode) {
            this.configuration.mainData.disableSourceCode = program.disableSourceCode;
        }

        if (configFile.disableDomTree) {
            this.configuration.mainData.disableDomTree = configFile.disableDomTree;
        }
        if (program.disableDomTree) {
            this.configuration.mainData.disableDomTree = program.disableDomTree;
        }

        if (configFile.disableTemplateTab) {
            this.configuration.mainData.disableTemplateTab = configFile.disableTemplateTab;
        }
        if (program.disableTemplateTab) {
            this.configuration.mainData.disableTemplateTab = program.disableTemplateTab;
        }

        if (configFile.disableGraph) {
            this.configuration.mainData.disableGraph = configFile.disableGraph;
        }
        if (program.disableGraph) {
            this.configuration.mainData.disableGraph = program.disableGraph;
        }

        if (configFile.disableCoverage) {
            this.configuration.mainData.disableCoverage = configFile.disableCoverage;
        }
        if (program.disableCoverage) {
            this.configuration.mainData.disableCoverage = program.disableCoverage;
        }

        if (configFile.disablePrivate) {
            this.configuration.mainData.disablePrivate = configFile.disablePrivate;
        }
        if (program.disablePrivate) {
            this.configuration.mainData.disablePrivate = program.disablePrivate;
        }

        if (configFile.disableProtected) {
            this.configuration.mainData.disableProtected = configFile.disableProtected;
        }
        if (program.disableProtected) {
            this.configuration.mainData.disableProtected = program.disableProtected;
        }

        if (configFile.disableInternal) {
            this.configuration.mainData.disableInternal = configFile.disableInternal;
        }
        if (program.disableInternal) {
            this.configuration.mainData.disableInternal = program.disableInternal;
        }

        if (configFile.disableLifeCycleHooks) {
            this.configuration.mainData.disableLifeCycleHooks = configFile.disableLifeCycleHooks;
        }
        if (program.disableLifeCycleHooks) {
            this.configuration.mainData.disableLifeCycleHooks = program.disableLifeCycleHooks;
        }

        if (configFile.disableRoutesGraph) {
            this.configuration.mainData.disableRoutesGraph = configFile.disableRoutesGraph;
        }
        if (program.disableRoutesGraph) {
            this.configuration.mainData.disableRoutesGraph = program.disableRoutesGraph;
        }

        if (configFile.disableSearch) {
            this.configuration.mainData.disableSearch = configFile.disableSearch;
        }
        if (program.disableSearch) {
            this.configuration.mainData.disableSearch = program.disableSearch;
        }

        if (configFile.minimal) {
            this.configuration.mainData.disableSearch = true;
            this.configuration.mainData.disableRoutesGraph = true;
            this.configuration.mainData.disableGraph = true;
            this.configuration.mainData.disableCoverage = true;
        }
        if (program.minimal) {
            this.configuration.mainData.disableSearch = true;
            this.configuration.mainData.disableRoutesGraph = true;
            this.configuration.mainData.disableGraph = true;
            this.configuration.mainData.disableCoverage = true;
        }

        if (configFile.customFavicon) {
            this.configuration.mainData.customFavicon = configFile.customFavicon;
        }
        if (program.customFavicon) {
            this.configuration.mainData.customFavicon = program.customFavicon;
        }

        if (configFile.gaID) {
            this.configuration.mainData.gaID = configFile.gaID;
        }
        if (program.gaID) {
            this.configuration.mainData.gaID = program.gaID;
        }

        if (configFile.gaSite) {
            this.configuration.mainData.gaSite = configFile.gaSite;
        }
        if (program.gaSite && program.gaSite !== COMPODOC_DEFAULTS.gaSite) {
            this.configuration.mainData.gaSite = program.gaSite;
        }

        if (!this.isWatching) {
            console.log(fs.readFileSync(path.join(__dirname, '../src/banner')).toString());
            console.log(pkg.version);
            console.log('');
            console.log(`Typescript version : ${ts.version}`);
            console.log('');
            console.log(`Node.js version : ${process.version}`);
            console.log('');
            console.log(`Operating system : ${osName(os.platform(), os.release())}`);
            console.log('');
        }

        if (configExplorerResult) {
            if (typeof configExplorerResult.config !== 'undefined') {
                logger.info(`Using configuration file : ${configExplorerResult.filepath}`);
            }
        }

        if (!configExplorerResult) {
            logger.warn(`No configuration file found, switching to CLI flags.`);
        }

        if (program.language && !I18nEngineInstance.supportLanguage(program.language)) {
            logger.warn(`The language ${program.language} is not available, falling back to ${I18nEngineInstance.fallbackLanguage}`);
        }

        if (program.tsconfig && typeof program.tsconfig === 'boolean') {
            logger.error(`Please provide a tsconfig file.`);
            process.exit(1);
        }

        if (configFile.tsconfig) {
            this.configuration.mainData.tsconfig = configFile.tsconfig;
        }
        if (program.tsconfig) {
            this.configuration.mainData.tsconfig = program.tsconfig;
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

        if (program.serve && !this.configuration.mainData.tsconfig && program.output) {
            // if -s & -d, serve it
            if (!this.fileEngine.existsSync(program.output)) {
                logger.error(`${program.output} folder doesn't exist`);
                process.exit(1);
            } else {
                logger.info(
                    `Serving documentation from ${program.output} at http://127.0.0.1:${
                        program.port
                    }`
                );
                super.runWebServer(program.output);
            }
        } else if (program.serve && !this.configuration.mainData.tsconfig && !program.output) {
            // if only -s find ./documentation, if ok serve, else error provide -d
            if (!this.fileEngine.existsSync(program.output)) {
                logger.error('Provide output generated folder with -d flag');
                process.exit(1);
            } else {
                logger.info(
                    `Serving documentation from ${program.output} at http://127.0.0.1:${
                        program.port
                    }`
                );
                super.runWebServer(program.output);
            }
        } else {
            if (program.hideGenerator) {
                this.configuration.mainData.hideGenerator = true;
            }

            if (this.configuration.mainData.tsconfig && program.args.length === 0) {
                /**
                 * tsconfig file provided only
                 */
                let testTsConfigPath = this.configuration.mainData.tsconfig.indexOf(process.cwd());
                if (testTsConfigPath !== -1) {
                    this.configuration.mainData.tsconfig = this.configuration.mainData.tsconfig.replace(
                        process.cwd() + path.sep,
                        ''
                    );
                }

                if (!this.fileEngine.existsSync(this.configuration.mainData.tsconfig)) {
                    logger.error(
                        `"${
                            this.configuration.mainData.tsconfig
                        }" file was not found in the current directory`
                    );
                    process.exit(1);
                } else {
                    let _file = path.join(
                        path.join(
                            process.cwd(),
                            path.dirname(this.configuration.mainData.tsconfig)
                        ),
                        path.basename(this.configuration.mainData.tsconfig)
                    );
                    // use the current directory of tsconfig.json as a working directory
                    cwd = _file
                        .split(path.sep)
                        .slice(0, -1)
                        .join(path.sep);
                    logger.info('Using tsconfig file ', _file);

                    let tsConfigFile = readConfig(_file);
                    scannedFiles = tsConfigFile.files;
                    if (scannedFiles) {
                        scannedFiles = handlePath(scannedFiles, cwd);
                    }

                    if (typeof scannedFiles === 'undefined') {
                        excludeFiles = tsConfigFile.exclude || [];
                        includeFiles = tsConfigFile.include || [];
                        scannedFiles = [];

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

                        finder.on('directory', function(dir, stat, stop) {
                            let base = path.basename(dir);
                            if (base === '.git' || base === 'node_modules') {
                                stop();
                            }
                        });

                        finder.on('file', (file, stat) => {
                            if (/(spec|\.d)\.ts/.test(file)) {
                                logger.warn('Ignoring', file);
                            } else if (
                                excludeParser.testFile(file) &&
                                path.extname(file) === '.ts'
                            ) {
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
                            if (program.coverageTest || program.coverageTestPerFile) {
                                logger.info('Run documentation coverage test');
                                super.testCoverage();
                            } else {
                                super.generate();
                            }
                        });
                    } else {
                        super.setFiles(scannedFiles);
                        if (program.coverageTest || program.coverageTestPerFile) {
                            logger.info('Run documentation coverage test');
                            super.testCoverage();
                        } else {
                            super.generate();
                        }
                    }
                }
            } else if (this.configuration.mainData.tsconfig && program.args.length > 0) {
                /**
                 * tsconfig file provided with source folder in arg
                 */
                let testTsConfigPath = this.configuration.mainData.tsconfig.indexOf(process.cwd());
                if (testTsConfigPath !== -1) {
                    this.configuration.mainData.tsconfig = this.configuration.mainData.tsconfig.replace(
                        process.cwd() + path.sep,
                        ''
                    );
                }

                let sourceFolder = program.args[0];
                if (!this.fileEngine.existsSync(sourceFolder)) {
                    logger.error(
                        `Provided source folder ${sourceFolder} was not found in the current directory`
                    );
                    process.exit(1);
                } else {
                    logger.info('Using provided source folder');

                    if (!this.fileEngine.existsSync(this.configuration.mainData.tsconfig)) {
                        logger.error(
                            `"${
                                this.configuration.mainData.tsconfig
                            }" file was not found in the current directory`
                        );
                        process.exit(1);
                    } else {
                        let _file = path.join(
                            path.join(
                                process.cwd(),
                                path.dirname(this.configuration.mainData.tsconfig)
                            ),
                            path.basename(this.configuration.mainData.tsconfig)
                        );
                        // use the current directory of tsconfig.json as a working directory
                        cwd = _file
                            .split(path.sep)
                            .slice(0, -1)
                            .join(path.sep);
                        logger.info('Using tsconfig file ', _file);

                        let tsConfigFile = readConfig(_file);
                        scannedFiles = tsConfigFile.files;
                        if (scannedFiles) {
                            scannedFiles = handlePath(scannedFiles, cwd);
                        }

                        if (typeof scannedFiles === 'undefined') {
                            excludeFiles = tsConfigFile.exclude || [];
                            includeFiles = tsConfigFile.include || [];
                            scannedFiles = [];

                            let excludeParser = new ParserUtil(),
                                includeParser = new ParserUtil();

                            excludeParser.init(excludeFiles, cwd);
                            includeParser.init(includeFiles, cwd);

                            let startCwd = sourceFolder;

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

                            let finder = require('findit2')(path.resolve(startCwd));

                            finder.on('directory', function(dir, stat, stop) {
                                let base = path.basename(dir);
                                if (base === '.git' || base === 'node_modules') {
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
                                    if (
                                        path.extname(file) === '.ts' &&
                                        includeParser.testFile(file)
                                    ) {
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
                                if (program.coverageTest || program.coverageTestPerFile) {
                                    logger.info('Run documentation coverage test');
                                    super.testCoverage();
                                } else {
                                    super.generate();
                                }
                            });
                        } else {
                            super.setFiles(scannedFiles);
                            if (program.coverageTest || program.coverageTestPerFile) {
                                logger.info('Run documentation coverage test');
                                super.testCoverage();
                            } else {
                                super.generate();
                            }
                        }
                    }
                }
            } else {
                logger.error('tsconfig.json file was not found, please use -p flag');
                outputHelp();
            }
        }
    }
}
