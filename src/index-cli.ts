import * as fs from 'fs-extra';
import * as path from 'path';
import * as _ from 'lodash';

import { Application } from './app/application';

import { COMPODOC_DEFAULTS } from './utils/defaults';
import { logger } from './logger';
import { readConfig, handlePath } from './utils/utils';
import { FileEngine } from './app/engines/file.engine';
import { ExcludeParserUtil } from './utils/exclude-parser.util';
import { IncludeParserUtil } from './utils/include-parser.util';

const pkg = require('../package.json');
const program = require('commander');
const os = require('os');
const osName = require('os-name');

let files = [];
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
            .option('-p, --tsconfig [config]', 'A tsconfig.json file')
            .option('-d, --output [folder]', 'Where to store the generated documentation', COMPODOC_DEFAULTS.folder)
            .option('-y, --extTheme [file]', 'External styling theme file')
            .option('-n, --name [name]', 'Title documentation', COMPODOC_DEFAULTS.title)
            .option('-a, --assetsFolder [folder]', 'External assets folder to copy in generated documentation folder')
            .option('-o, --open', 'Open the generated documentation', false)
            .option('-t, --silent', 'In silent mode, log messages aren\'t logged in the console', false)
            .option('-s, --serve', 'Serve generated documentation (default http://localhost:8080/)', false)
            .option('-r, --port [port]', 'Change default serving port', COMPODOC_DEFAULTS.port)
            .option('-w, --watch', 'Watch source files after serve and force documentation rebuild', false)
            .option('-e, --exportFormat [format]', 'Export in specified format (json, html)', COMPODOC_DEFAULTS.exportFormat)
            .option('--theme [theme]', 'Choose one of available themes, default is \'gitbook\' (laravel, original, material, postmark, readthedocs, stripe, vagrant)')
            .option('--hideGenerator', 'Do not print the Compodoc link at the bottom of the page', false)
            .option('--toggleMenuItems <items>', 'Close by default items in the menu values : [\'all\'] or one of these [\'modules\',\'components\',\'directives\',\'classes\',\'injectables\',\'interfaces\',\'pipes\',\'additionalPages\']', list, COMPODOC_DEFAULTS.toggleMenuItems)
            .option('--includes [path]', 'Path of external markdown files to include')
            .option('--includesName [name]', 'Name of item menu of externals markdown files', COMPODOC_DEFAULTS.additionalEntryName)
            .option('--coverageTest [threshold]', 'Test command of documentation coverage with a threshold (default 70)')
            .option('--coverageMinimumPerFile [minimum]', 'Test command of documentation coverage per file with a minimum (default 0)')
            .option('--coverageTestThresholdFail [true|false]', 'Test command of documentation coverage (global or per file) will fail with error or just warn user (true: error, false: warn)', COMPODOC_DEFAULTS.coverageTestThresholdFail)
            .option('--disableSourceCode', 'Do not add source code tab and links to source code', false)
            .option('--disableGraph', 'Do not add the dependency graph', false)
            .option('--disableCoverage', 'Do not add the documentation coverage report', false)
            .option('--disablePrivate', 'Do not show private in generated documentation', false)
            .option('--disableProtected', 'Do not show protected in generated documentation', false)
            .option('--disableInternal', 'Do not show @internal in generated documentation', false)
            .option('--disableLifeCycleHooks', 'Do not show Angular lifecycle hooks in generated documentation', false)
            .option('--customFavicon [path]', 'Use a custom favicon')
            .option('--gaID [id]', 'Google Analytics tracking ID')
            .option('--gaSite [site]', 'Google Analytics site name', COMPODOC_DEFAULTS.gaSite)
            .parse(process.argv);

        let outputHelp = () => {
            program.outputHelp();
            process.exit(1);
        };

        if (program.output) {
            this.configuration.mainData.output = program.output;
        }

        if (program.extTheme) {
            this.configuration.mainData.extTheme = program.extTheme;
        }

        if (program.theme) {
            this.configuration.mainData.theme = program.theme;
        }

        if (program.name) {
            this.configuration.mainData.documentationMainName = program.name;
        }

        if (program.assetsFolder) {
            this.configuration.mainData.assetsFolder = program.assetsFolder;
        }

        if (program.open) {
            this.configuration.mainData.open = program.open;
        }

        if (program.toggleMenuItems) {
            this.configuration.mainData.toggleMenuItems = program.toggleMenuItems;
        }

        if (program.includes) {
            this.configuration.mainData.includes = program.includes;
        }

        if (program.includesName) {
            this.configuration.mainData.includesName = program.includesName;
        }

        if (program.silent) {
            logger.silent = false;
        }

        if (program.serve) {
            this.configuration.mainData.serve = program.serve;
        }

        if (program.port) {
            this.configuration.mainData.port = program.port;
        }

        if (program.watch) {
            this.configuration.mainData.watch = program.watch;
        }

        if (program.exportFormat) {
            this.configuration.mainData.exportFormat = program.exportFormat;
        }

        if (program.hideGenerator) {
            this.configuration.mainData.hideGenerator = program.hideGenerator;
        }

        if (program.coverageTest) {
            this.configuration.mainData.coverageTest = true;
            this.configuration.mainData.coverageTestThreshold = (typeof program.coverageTest === 'string') ? parseInt(program.coverageTest) : COMPODOC_DEFAULTS.defaultCoverageThreshold;
        }

        if (program.coverageMinimumPerFile) {
            this.configuration.mainData.coverageTestPerFile = true;
            this.configuration.mainData.coverageMinimumPerFile = (typeof program.coverageMinimumPerFile === 'string') ? parseInt(program.coverageMinimumPerFile) : COMPODOC_DEFAULTS.defaultCoverageMinimumPerFile;
        }

        if (program.coverageTestThresholdFail) {
            this.configuration.mainData.coverageTestThresholdFail = (program.coverageTestThresholdFail === 'false') ? false : true;
        }

        if (program.disableSourceCode) {
            this.configuration.mainData.disableSourceCode = program.disableSourceCode;
        }

        if (program.disableGraph) {
            this.configuration.mainData.disableGraph = program.disableGraph;
        }

        if (program.disableCoverage) {
            this.configuration.mainData.disableCoverage = program.disableCoverage;
        }

        if (program.disablePrivate) {
            this.configuration.mainData.disablePrivate = program.disablePrivate;
        }

        if (program.disableProtected) {
            this.configuration.mainData.disableProtected = program.disableProtected;
        }

        if (program.disableInternal) {
            this.configuration.mainData.disableInternal = program.disableInternal;
        }

        if (program.disableLifeCycleHooks) {
            this.configuration.mainData.disableLifeCycleHooks = program.disableLifeCycleHooks;
        }

        if (program.customFavicon) {
            this.configuration.mainData.customFavicon = program.customFavicon;
        }

        if (program.gaID) {
            this.configuration.mainData.gaID = program.gaID;
        }

        if (program.gaSite) {
            this.configuration.mainData.gaSite = program.gaSite;
        }

        if (!this.isWatching) {
            console.log(fs.readFileSync(path.join(__dirname, '../src/banner')).toString());
            console.log(pkg.version);
            console.log('');
            console.log(`Node.js version : ${process.version}`);
            console.log('');
            console.log(`Operating system : ${osName(os.platform(), os.release())}`);
            console.log('');
        }

        if (program.tsconfig && typeof program.tsconfig === 'boolean') {
            logger.error(`Please provide a tsconfig file.`);
            process.exit(1);
        }

        if (program.serve && !program.tsconfig && program.output) {
            // if -s & -d, serve it
            if (!this.fileEngine.existsSync(program.output)) {
                logger.error(`${program.output} folder doesn't exist`);
                process.exit(1);
            } else {
                logger.info(`Serving documentation from ${program.output} at http://127.0.0.1:${program.port}`);
                super.runWebServer(program.output);
            }
        } else if (program.serve && !program.tsconfig && !program.output) {
            // if only -s find ./documentation, if ok serve, else error provide -d
            if (!this.fileEngine.existsSync(program.output)) {
                logger.error('Provide output generated folder with -d flag');
                process.exit(1);
            } else {
                logger.info(`Serving documentation from ${program.output} at http://127.0.0.1:${program.port}`);
                super.runWebServer(program.output);
            }
        } else {
            if (program.hideGenerator) {
                this.configuration.mainData.hideGenerator = true;
            }

            if (program.tsconfig && program.args.length === 0) {
                /**
                 * tsconfig file provided only
                 */
                this.configuration.mainData.tsconfig = program.tsconfig;
                if (!this.fileEngine.existsSync(program.tsconfig)) {
                    logger.error(`"${program.tsconfig}" file was not found in the current directory`);
                    process.exit(1);
                } else {
                    let _file = path.join(
                        path.join(process.cwd(), path.dirname(this.configuration.mainData.tsconfig)),
                        path.basename(this.configuration.mainData.tsconfig)
                    );
                    // use the current directory of tsconfig.json as a working directory
                    cwd = _file.split(path.sep).slice(0, -1).join(path.sep);
                    logger.info('Using tsconfig', _file);

                    let tsConfigFile = readConfig(_file);
                    files = tsConfigFile.files;
                    if (files) {
                        files = handlePath(files, cwd);
                    }

                    if (typeof files === 'undefined') {
                        let exclude = tsConfigFile.exclude || [],
                            include = tsConfigFile.include || [];
                        files = [];

                        let excludeParser = new ExcludeParserUtil(),
                            includeParser = new IncludeParserUtil();

                        excludeParser.init(exclude, cwd);
                        includeParser.init(include, cwd);

                        let finder = require('findit2')(cwd || '.');

                        finder.on('directory', function (dir, stat, stop) {
                            let base = path.basename(dir);
                            if (base === '.git' || base === 'node_modules') {
                                stop();
                            }
                        });

                        finder.on('file', (file, stat) => {
                            if (/(spec|\.d)\.ts/.test(file)) {
                                logger.warn('Ignoring', file);
                            } else if (excludeParser.testFile(file) && path.extname(file) === '.ts') {
                                logger.warn('Excluding', file);
                            } else if (include.length > 0) {
                                /**
                                 * If include provided in tsconfig, use only this source,
                                 * and not files found with global findit scan in working directory
                                 */
                                if (path.extname(file) === '.ts' && includeParser.testFile(file)) {
                                    logger.debug('Including', file);
                                    files.push(file);
                                } else {
                                    if (path.extname(file) === '.ts') {
                                        logger.warn('Excluding', file);
                                    }
                                }
                            } else {
                                logger.debug('Including', file);
                                files.push(file);
                            }
                        });

                        finder.on('end', () => {
                            super.setFiles(files);
                            if (program.coverageTest || program.coverageTestPerFile) {
                                logger.info('Run documentation coverage test');
                                super.testCoverage();
                            } else {
                                super.generate();
                            }
                        });
                    } else {
                        super.setFiles(files);
                        if (program.coverageTest || program.coverageTestPerFile) {
                            logger.info('Run documentation coverage test');
                            super.testCoverage();
                        } else {
                            super.generate();
                        }
                    }
                }
            } else if (program.tsconfig && program.args.length > 0) {
                /**
                 * tsconfig file provided with source folder in arg
                 */
                this.configuration.mainData.tsconfig = program.tsconfig;
                let sourceFolder = program.args[0];
                if (!this.fileEngine.existsSync(sourceFolder)) {
                    logger.error(`Provided source folder ${sourceFolder} was not found in the current directory`);
                    process.exit(1);
                } else {
                    logger.info('Using provided source folder');

                    if (!this.fileEngine.existsSync(program.tsconfig)) {
                        logger.error(`"${program.tsconfig}" file was not found in the current directory`);
                        process.exit(1);
                    } else {
                        let _file = path.join(
                            path.join(process.cwd(), path.dirname(this.configuration.mainData.tsconfig)),
                            path.basename(this.configuration.mainData.tsconfig)
                        );
                        // use the current directory of tsconfig.json as a working directory
                        cwd = _file.split(path.sep).slice(0, -1).join(path.sep);
                        logger.info('Using tsconfig', _file);

                        let tsConfigFile = readConfig(_file);
                        files = tsConfigFile.files;
                        if (files) {
                            files = handlePath(files, cwd);
                        }

                        if (typeof files === 'undefined') {
                            let exclude = tsConfigFile.exclude || [],
                                include = tsConfigFile.include || [];
                            files = [];

                            let excludeParser = new ExcludeParserUtil(),
                                includeParser = new IncludeParserUtil();

                            excludeParser.init(exclude, cwd);
                            includeParser.init(include, cwd);

                            let finder = require('findit2')(path.resolve(sourceFolder));

                            finder.on('directory', function (dir, stat, stop) {
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
                                } else if (include.length > 0) {
                                    /**
                                     * If include provided in tsconfig, use only this source,
                                     * and not files found with global findit scan in working directory
                                     */
                                    if (path.extname(file) === '.ts' && includeParser.testFile(file)) {
                                        logger.debug('Including', file);
                                        files.push(file);
                                    } else {
                                        if (path.extname(file) === '.ts') {
                                            logger.warn('Excluding', file);
                                        }
                                    }
                                } else {
                                    logger.debug('Including', file);
                                    files.push(file);
                                }
                            });

                            finder.on('end', () => {
                                super.setFiles(files);
                                if (program.coverageTest || program.coverageTestPerFile) {
                                    logger.info('Run documentation coverage test');
                                    super.testCoverage();
                                } else {
                                    super.generate();
                                }
                            });
                        } else {
                            super.setFiles(files);
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
