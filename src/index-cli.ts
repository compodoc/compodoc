import * as fs from 'fs-extra';
import * as path from 'path';

import { Application } from './app/application';

import { COMPODOC_DEFAULTS } from './utils/defaults';
import { logger } from './logger';
import { readConfig, handlePath } from './utils/utils';

let pkg = require('../package.json'),
    program = require('commander'),
    _ = require('lodash'),
    glob = require('glob'),
    os = require('os'),
    osName = require('os-name'),
    files = [],
    cwd = process.cwd();

process.setMaxListeners(0);

process.on('unhandledRejection', (err) => {
    logger.error(err);
    logger.error('Sorry, but there was a problem during parsing or generation of the documentation. Please fill an issue on github. (https://github.com/compodoc/compodoc/issues/new)');
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    logger.error(err);
    logger.error('Sorry, but there was a problem during parsing or generation of the documentation. Please fill an issue on github. (https://github.com/compodoc/compodoc/issues/new)');
    process.exit(1);
});

export class CliApplication extends Application
{
    /**
     * Run compodoc from the command line.
     */
    protected generate() {

        function list(val) {
            return val.split(',');
        }

        program
            .version(pkg.version)
            .usage('<src> [options]')
            .option('-p, --tsconfig [config]', 'A tsconfig.json file')
            .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', COMPODOC_DEFAULTS.folder)
            .option('-y, --extTheme [file]', 'External styling theme file')
            .option('-n, --name [name]', 'Title documentation', COMPODOC_DEFAULTS.title)
            .option('-a, --assetsFolder [folder]', 'External assets folder to copy in generated documentation folder')
            .option('-o, --open', 'Open the generated documentation', false)
            .option('-t, --silent', 'In silent mode, log messages aren\'t logged in the console', false)
            .option('-s, --serve', 'Serve generated documentation (default http://localhost:8080/)', false)
            .option('-r, --port [port]', 'Change default serving port', COMPODOC_DEFAULTS.port)
            .option('-w, --watch', 'Watch source files after serve and force documentation rebuild', false)
            .option('--theme [theme]', 'Choose one of available themes, default is \'gitbook\' (laravel, original, postmark, readthedocs, stripe, vagrant)')
            .option('--hideGenerator', 'Do not print the Compodoc link at the bottom of the page', false)
            .option('--toggleMenuItems <items>', 'Close by default items in the menu (default [\'all\']) values : [\'all\'] or one of these [\'modules\',\'components\',\'directives\',\'classes\',\'injectables\',\'interfaces\',\'pipes\',\'additionalPages\']', list, COMPODOC_DEFAULTS.toggleMenuItems)
            .option('--includes [path]', 'Path of external markdown files to include')
            .option('--includesName [name]', 'Name of item menu of externals markdown files (default "Additional documentation")', COMPODOC_DEFAULTS.additionalEntryName)
            .option('--coverageTest [threshold]', 'Test command of documentation coverage with a threshold (default 70)')
            .option('--disableSourceCode', 'Do not add source code tab and links to source code', false)
            .option('--disableGraph', 'Do not add the dependency graph', false)
            .option('--disableCoverage', 'Do not add the documentation coverage report', false)
            .option('--disablePrivateOrInternalSupport', 'Do not show private, @internal or Angular lifecycle hooks in generated documentation', false)
            .parse(process.argv);

        let outputHelp = () => {
            program.outputHelp()
            process.exit(1);
        }

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
            this.configuration.mainData.includes  = program.includes;
        }

        if (program.includesName) {
            this.configuration.mainData.includesName  = program.includesName;
        }

        if (program.silent) {
            logger.silent = false;
        }

        if (program.serve) {
            this.configuration.mainData.serve  = program.serve;
        }

        if (program.port) {
            this.configuration.mainData.port = program.port;
        }

        if (program.watch) {
            this.configuration.mainData.watch = program.watch;
        }

        if (program.hideGenerator) {
            this.configuration.mainData.hideGenerator = program.hideGenerator;
        }

        if (program.includes) {
            this.configuration.mainData.includes = program.includes;
        }

        if (program.includesName) {
            this.configuration.mainData.includesName = program.includesName;
        }

        if (program.coverageTest) {
            this.configuration.mainData.coverageTest = true;
            this.configuration.mainData.coverageTestThreshold = (typeof program.coverageTest === 'string') ? parseInt(program.coverageTest) : COMPODOC_DEFAULTS.defaultCoverageThreshold;
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

        if (program.disablePrivateOrInternalSupport) {
            this.configuration.mainData.disablePrivateOrInternalSupport = program.disablePrivateOrInternalSupport;
        }

        if (!this.isWatching) {
            console.log(fs.readFileSync(path.join(__dirname, '../src/resources/images/banner')).toString());
            console.log(pkg.version);
            console.log('');
            console.log(`Node.js version : ${process.version}`);
            console.log('');
            console.log(`Operating system : ${osName(os.platform(), os.release())}`);
            console.log('');
        }

        if (program.serve && !program.tsconfig && program.output) {
            // if -s & -d, serve it
            if (!fs.existsSync(program.output)) {
                logger.error(`${program.output} folder doesn't exist`);
                process.exit(1);
            } else {
                logger.info(`Serving documentation from ${program.output} at http://127.0.0.1:${program.port}`);
                super.runWebServer(program.output);
            }
        } else if (program.serve && !program.tsconfig && !program.output) {
            // if only -s find ./documentation, if ok serve, else error provide -d
            if (!fs.existsSync(program.output)) {
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

            let defaultWalkFOlder = cwd || '.',
                walk = (dir, exclude) => {
                    let results = [];
                    let list = fs.readdirSync(dir);
                    list.forEach((file) => {
                        var excludeTest = _.find(exclude, function(o) {
                            let globFiles = glob.sync(o, {
                                cwd: cwd
                            });
                            if (globFiles.length > 0) {
                                let fileNameForGlobSearch = path.join(dir, file).replace(cwd + path.sep, ''),
                                    resultGlobSearch = globFiles.findIndex((element) => {
                                        return element === fileNameForGlobSearch;
                                    }),
                                    test = resultGlobSearch !== -1;
                                if (test) {
                                    logger.warn('Excluding', path.join(dir, file));
                                }
                                return test;
                            } else {
                                let test = path.basename(o) === file;
                                if (test) {
                                    logger.warn('Excluding', path.join(dir, file));
                                }
                                return test;
                            }
                        });
                        if (typeof excludeTest === 'undefined' && dir.indexOf('node_modules') < 0) {
                            file = path.join(dir, file);
                            let stat = fs.statSync(file);
                            if (stat && stat.isDirectory()) {
                                results = results.concat(walk(file, exclude));
                            }
                            else if (/(spec|\.d)\.ts/.test(file)) {
                                logger.warn('Ignoring', file);
                            }
                            else if (path.extname(file) === '.ts') {
                                logger.debug('Including', file);
                                results.push(file);
                            }
                        }
                    });
                    return results;
                };

            if (program.tsconfig && program.args.length === 0) {
                this.configuration.mainData.tsconfig = program.tsconfig;
                if (!fs.existsSync(program.tsconfig)) {
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

                    if (!files) {
                        let exclude = tsConfigFile.exclude || [];
                        files = walk(cwd || '.', exclude);
                    }

                    super.setFiles(files);
                    super.generate();
                }
            }  else if (program.tsconfig && program.args.length > 0 && program.coverageTest) {
                logger.info('Run documentation coverage test');
                this.configuration.mainData.tsconfig = program.tsconfig;
                if (!fs.existsSync(program.tsconfig)) {
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

                    if (!files) {
                        let exclude = tsConfigFile.exclude || [];

                        files = walk(cwd || '.', exclude);
                    }

                    super.setFiles(files);
                    super.testCoverage();
                }
            } else if (program.tsconfig && program.args.length > 0) {
                this.configuration.mainData.tsconfig = program.tsconfig;
                let sourceFolder = program.args[0];
                if (!fs.existsSync(sourceFolder)) {
                    logger.error(`Provided source folder ${sourceFolder} was not found in the current directory`);
                    process.exit(1);
                } else {
                    logger.info('Using provided source folder');

                    if (!fs.existsSync(program.tsconfig)) {
                        logger.error(`"${program.tsconfig}" file was not found in the current directory`);
                        process.exit(1);
                    } else {
                        let tsConfigFile = readConfig(program.tsconfig);
                        let exclude = tsConfigFile.exclude || [];

                        files = walk(path.resolve(sourceFolder), exclude);

                        super.setFiles(files);
                        super.generate();
                    }
                }
            } else {
                logger.error('tsconfig.json file was not found, please use -p flag');
                outputHelp();
            }
        }
    }
}
