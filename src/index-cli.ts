import * as fs from 'fs-extra';
import * as path from 'path';

import { ts } from 'ts-simple-ast';

import { Application } from './app/application';
import Configuration from './app/configuration';
import FileEngine from './app/engines/file.engine';
import I18nEngine from './app/engines/i18n.engine';

import { ConfigurationFileInterface } from './app/interfaces/configuration-file.interface';
import AngularVersionUtil from './utils/angular-version.util';
import { COMPODOC_DEFAULTS } from './utils/defaults';
import { logger } from './utils/logger';
import { ParserUtil } from './utils/parser.util.class';
import { handlePath, readConfig } from './utils/utils';

const cosmiconfig = require('cosmiconfig');
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
                'Language used for the generated documentation (en-US, es-ES, fr-FR, hu-HU, it-IT, ja-JP, nl-NL, pt-BR, zh-CN)',
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

        let outputHelp = () => {
            program.outputHelp();
            process.exit(1);
        };

        const configExplorer = cosmiconfig(cosmiconfigModuleName);

        let configExplorerResult;

        let configFile: ConfigurationFileInterface = {};

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
            Configuration.mainData.output = configFile.output;
        }
        if (program.output && program.output !== COMPODOC_DEFAULTS.folder) {
            Configuration.mainData.output = program.output;
        }

        if (configFile.extTheme) {
            Configuration.mainData.extTheme = configFile.extTheme;
        }
        if (program.extTheme) {
            Configuration.mainData.extTheme = program.extTheme;
        }

        if (configFile.language) {
            Configuration.mainData.language = configFile.language;
        }
        if (program.language) {
            Configuration.mainData.language = program.language;
        }

        if (configFile.theme) {
            Configuration.mainData.theme = configFile.theme;
        }
        if (program.theme) {
            Configuration.mainData.theme = program.theme;
        }

        if (configFile.name) {
            Configuration.mainData.documentationMainName = configFile.name;
        }
        if (program.name && program.name !== COMPODOC_DEFAULTS.title) {
            Configuration.mainData.documentationMainName = program.name;
        }

        if (configFile.assetsFolder) {
            Configuration.mainData.assetsFolder = configFile.assetsFolder;
        }
        if (program.assetsFolder) {
            Configuration.mainData.assetsFolder = program.assetsFolder;
        }

        if (configFile.open) {
            Configuration.mainData.open = configFile.open;
        }
        if (program.open) {
            Configuration.mainData.open = program.open;
        }

        if (configFile.toggleMenuItems) {
            Configuration.mainData.toggleMenuItems = configFile.toggleMenuItems;
        }
        if (
            program.toggleMenuItems &&
            program.toggleMenuItems !== COMPODOC_DEFAULTS.toggleMenuItems
        ) {
            Configuration.mainData.toggleMenuItems = program.toggleMenuItems;
        }

        if (configFile.templates) {
            Configuration.mainData.templates = configFile.templates;
        }
        if (program.templates) {
            Configuration.mainData.templates = program.templates;
        }

        if (configFile.navTabConfig) {
            Configuration.mainData.navTabConfig = configFile.navTabConfig;
        }
        if (
            program.navTabConfig &&
            JSON.parse(program.navTabConfig).length !== COMPODOC_DEFAULTS.navTabConfig.length
        ) {
            Configuration.mainData.navTabConfig = JSON.parse(program.navTabConfig);
        }

        if (configFile.includes) {
            Configuration.mainData.includes = configFile.includes;
        }
        if (program.includes) {
            Configuration.mainData.includes = program.includes;
        }

        if (configFile.includesName) {
            Configuration.mainData.includesName = configFile.includesName;
        }
        if (
            program.includesName &&
            program.includesName !== COMPODOC_DEFAULTS.additionalEntryName
        ) {
            Configuration.mainData.includesName = program.includesName;
        }

        if (configFile.silent) {
            logger.silent = false;
        }
        if (program.silent) {
            logger.silent = false;
        }

        if (configFile.serve) {
            Configuration.mainData.serve = configFile.serve;
        }
        if (program.serve) {
            Configuration.mainData.serve = program.serve;
        }

        if (configFile.host) {
            Configuration.mainData.host = configFile.host;
            Configuration.mainData.hostname = configFile.host;
        }
        if (program.host) {
            Configuration.mainData.host = program.host;
            Configuration.mainData.hostname = program.host;
        }

        if (configFile.port) {
            Configuration.mainData.port = configFile.port;
        }
        if (program.port && program.port !== COMPODOC_DEFAULTS.port) {
            Configuration.mainData.port = program.port;
        }

        if (configFile.watch) {
            Configuration.mainData.watch = configFile.watch;
        }
        if (program.watch) {
            Configuration.mainData.watch = program.watch;
        }

        if (configFile.exportFormat) {
            Configuration.mainData.exportFormat = configFile.exportFormat;
        }
        if (program.exportFormat && program.exportFormat !== COMPODOC_DEFAULTS.exportFormat) {
            Configuration.mainData.exportFormat = program.exportFormat;
        }

        if (configFile.hideGenerator) {
            Configuration.mainData.hideGenerator = configFile.hideGenerator;
        }
        if (program.hideGenerator) {
            Configuration.mainData.hideGenerator = program.hideGenerator;
        }

        if (configFile.coverageTest) {
            Configuration.mainData.coverageTest = true;
            Configuration.mainData.coverageTestThreshold =
                typeof configFile.coverageTest === 'string'
                    ? parseInt(configFile.coverageTest, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageThreshold;
        }
        if (program.coverageTest) {
            Configuration.mainData.coverageTest = true;
            Configuration.mainData.coverageTestThreshold =
                typeof program.coverageTest === 'string'
                    ? parseInt(program.coverageTest, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageThreshold;
        }

        if (configFile.coverageMinimumPerFile) {
            Configuration.mainData.coverageTestPerFile = true;
            Configuration.mainData.coverageMinimumPerFile =
                typeof configFile.coverageMinimumPerFile === 'string'
                    ? parseInt(configFile.coverageMinimumPerFile, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageMinimumPerFile;
        }
        if (program.coverageMinimumPerFile) {
            Configuration.mainData.coverageTestPerFile = true;
            Configuration.mainData.coverageMinimumPerFile =
                typeof program.coverageMinimumPerFile === 'string'
                    ? parseInt(program.coverageMinimumPerFile, 10)
                    : COMPODOC_DEFAULTS.defaultCoverageMinimumPerFile;
        }

        if (configFile.coverageTestThresholdFail) {
            Configuration.mainData.coverageTestThresholdFail =
                configFile.coverageTestThresholdFail === 'false' ? false : true;
        }
        if (program.coverageTestThresholdFail) {
            Configuration.mainData.coverageTestThresholdFail =
                program.coverageTestThresholdFail === 'false' ? false : true;
        }

        if (configFile.coverageTestShowOnlyFailed) {
            Configuration.mainData.coverageTestShowOnlyFailed =
                configFile.coverageTestShowOnlyFailed;
        }
        if (program.coverageTestShowOnlyFailed) {
            Configuration.mainData.coverageTestShowOnlyFailed = program.coverageTestShowOnlyFailed;
        }

        if (configFile.unitTestCoverage) {
            Configuration.mainData.unitTestCoverage = configFile.unitTestCoverage;
        }
        if (program.unitTestCoverage) {
            Configuration.mainData.unitTestCoverage = program.unitTestCoverage;
        }

        if (configFile.disableSourceCode) {
            Configuration.mainData.disableSourceCode = configFile.disableSourceCode;
        }
        if (program.disableSourceCode) {
            Configuration.mainData.disableSourceCode = program.disableSourceCode;
        }

        if (configFile.disableDomTree) {
            Configuration.mainData.disableDomTree = configFile.disableDomTree;
        }
        if (program.disableDomTree) {
            Configuration.mainData.disableDomTree = program.disableDomTree;
        }

        if (configFile.disableTemplateTab) {
            Configuration.mainData.disableTemplateTab = configFile.disableTemplateTab;
        }
        if (program.disableTemplateTab) {
            Configuration.mainData.disableTemplateTab = program.disableTemplateTab;
        }

        if (configFile.disableStyleTab) {
            Configuration.mainData.disableStyleTab = configFile.disableStyleTab;
        }
        if (program.disableStyleTab) {
            Configuration.mainData.disableStyleTab = program.disableStyleTab;
        }

        if (configFile.disableGraph) {
            Configuration.mainData.disableGraph = configFile.disableGraph;
        }
        if (program.disableGraph) {
            Configuration.mainData.disableGraph = program.disableGraph;
        }

        if (configFile.disableCoverage) {
            Configuration.mainData.disableCoverage = configFile.disableCoverage;
        }
        if (program.disableCoverage) {
            Configuration.mainData.disableCoverage = program.disableCoverage;
        }

        if (configFile.disablePrivate) {
            Configuration.mainData.disablePrivate = configFile.disablePrivate;
        }
        if (program.disablePrivate) {
            Configuration.mainData.disablePrivate = program.disablePrivate;
        }

        if (configFile.disableProtected) {
            Configuration.mainData.disableProtected = configFile.disableProtected;
        }
        if (program.disableProtected) {
            Configuration.mainData.disableProtected = program.disableProtected;
        }

        if (configFile.disableInternal) {
            Configuration.mainData.disableInternal = configFile.disableInternal;
        }
        if (program.disableInternal) {
            Configuration.mainData.disableInternal = program.disableInternal;
        }

        if (configFile.disableLifeCycleHooks) {
            Configuration.mainData.disableLifeCycleHooks = configFile.disableLifeCycleHooks;
        }
        if (program.disableLifeCycleHooks) {
            Configuration.mainData.disableLifeCycleHooks = program.disableLifeCycleHooks;
        }

        if (configFile.disableRoutesGraph) {
            Configuration.mainData.disableRoutesGraph = configFile.disableRoutesGraph;
        }
        if (program.disableRoutesGraph) {
            Configuration.mainData.disableRoutesGraph = program.disableRoutesGraph;
        }

        if (configFile.disableSearch) {
            Configuration.mainData.disableSearch = configFile.disableSearch;
        }
        if (program.disableSearch) {
            Configuration.mainData.disableSearch = program.disableSearch;
        }

        if (configFile.disableDependencies) {
            Configuration.mainData.disableDependencies = configFile.disableDependencies;
        }
        if (program.disableDependencies) {
            Configuration.mainData.disableDependencies = program.disableDependencies;
        }

        if (configFile.minimal) {
            Configuration.mainData.disableSearch = true;
            Configuration.mainData.disableRoutesGraph = true;
            Configuration.mainData.disableGraph = true;
            Configuration.mainData.disableCoverage = true;
        }
        if (program.minimal) {
            Configuration.mainData.disableSearch = true;
            Configuration.mainData.disableRoutesGraph = true;
            Configuration.mainData.disableGraph = true;
            Configuration.mainData.disableCoverage = true;
        }

        if (configFile.customFavicon) {
            Configuration.mainData.customFavicon = configFile.customFavicon;
        }
        if (program.customFavicon) {
            Configuration.mainData.customFavicon = program.customFavicon;
        }

        if (configFile.customLogo) {
            Configuration.mainData.customLogo = configFile.customLogo;
        }
        if (program.customLogo) {
            Configuration.mainData.customLogo = program.customLogo;
        }

        if (configFile.gaID) {
            Configuration.mainData.gaID = configFile.gaID;
        }
        if (program.gaID) {
            Configuration.mainData.gaID = program.gaID;
        }

        if (configFile.gaSite) {
            Configuration.mainData.gaSite = configFile.gaSite;
        }
        if (program.gaSite && program.gaSite !== COMPODOC_DEFAULTS.gaSite) {
            Configuration.mainData.gaSite = program.gaSite;
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

        if (program.language && !I18nEngine.supportLanguage(program.language)) {
            logger.warn(
                `The language ${program.language} is not available, falling back to ${I18nEngine.fallbackLanguage}`
            );
        }

        if (program.tsconfig && typeof program.tsconfig === 'boolean') {
            logger.error(`Please provide a tsconfig file.`);
            process.exit(1);
        }

        if (configFile.tsconfig) {
            Configuration.mainData.tsconfig = configFile.tsconfig;
        }
        if (program.tsconfig) {
            Configuration.mainData.tsconfig = program.tsconfig;
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

        if (program.serve && !Configuration.mainData.tsconfig && program.output) {
            // if -s & -d, serve it
            if (!FileEngine.existsSync(Configuration.mainData.output)) {
                logger.error(`${Configuration.mainData.output} folder doesn't exist`);
                process.exit(1);
            } else {
                logger.info(
                    `Serving documentation from ${Configuration.mainData.output} at http://${Configuration.mainData.hostname}:${program.port}`
                );
                super.runWebServer(Configuration.mainData.output);
            }
        } else if (program.serve && !Configuration.mainData.tsconfig && !program.output) {
            // if only -s find ./documentation, if ok serve, else error provide -d
            if (!FileEngine.existsSync(Configuration.mainData.output)) {
                logger.error('Provide output generated folder with -d flag');
                process.exit(1);
            } else {
                logger.info(
                    `Serving documentation from ${Configuration.mainData.output} at http://${Configuration.mainData.hostname}:${program.port}`
                );
                super.runWebServer(Configuration.mainData.output);
            }
        } else if (Configuration.mainData.hasFilesToCoverage) {
            if (program.coverageMinimumPerFile) {
                logger.info('Run documentation coverage test for files');
                super.testCoverage();
            } else {
                logger.error('Missing coverage configuration');
            }
        } else {
            if (program.hideGenerator) {
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
