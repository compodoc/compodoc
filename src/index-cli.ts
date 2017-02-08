import * as fs from 'fs-extra';
import * as path from 'path';
import * as _ from 'lodash';

import { Application } from './app/application';

import { COMPODOC_DEFAULTS } from './utils/defaults';
import { logger } from './logger';

let pkg = require('../package.json'),
    program = require('commander'),
    files = [],
    cwd = process.cwd();

process.setMaxListeners(0);

export class CliApplication extends Application
{
    /**
     * Run compodoc from the command line.
     */
    protected generate() {

        program
            .version(pkg.version)
            .usage('<src> [options]')
            .option('-p, --tsconfig [config]', 'A tsconfig.json file')
            .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', COMPODOC_DEFAULTS.folder)
            .option('-y, --extTheme [file]', 'External styling theme file')
            .option('-n, --name [name]', 'Title documentation', COMPODOC_DEFAULTS.title)
            .option('-a, --assetsFolder [folder]', 'External assets folder to copy in generated documentation folder')
            .option('-o, --open', 'Open the generated documentation', false)
            //.option('-i, --includes [path]', 'Path of external markdown files to include')
            //.option('-j, --includesName [name]', 'Name of item menu of externals markdown file')
            .option('-t, --silent', 'In silent mode, log messages aren\'t logged in the console', false)
            .option('-s, --serve', 'Serve generated documentation (default http://localhost:8080/)', false)
            .option('-r, --port [port]', 'Change default serving port', COMPODOC_DEFAULTS.port)
            .option('--theme [theme]', 'Choose one of available themes, default is \'gitbook\' (laravel, original, postmark, readthedocs, stripe, vagrant)')
            .option('--hideGenerator', 'Do not print the Compodoc link at the bottom of the page', false)
            .option('--disableSourceCode', 'Do not add source code tab', false)
            .option('--disableGraph', 'Do not add the dependency graph', false)
            .option('--disableCoverage', 'Do not add the documentation coverage report', false)
            .option('--disablePrivateOrInternalSupport', 'Do not show private or @internal in generated documentation', false)
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

        if (program.hideGenerator) {
            this.configuration.mainData.hideGenerator = program.hideGenerator;
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
                            return path.basename(o) === file;
                        });
                        if (typeof excludeTest === 'undefined' && dir.indexOf('node_modules') < 0) {
                            file = path.join(dir, file);
                            let stat = fs.statSync(file);
                            if (stat && stat.isDirectory()) {
                                results = results.concat(walk(file, exclude));
                            }
                            else if (/(spec|\.d)\.ts/.test(file)) {
                                logger.debug('Ignoring', file);
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
                    logger.error('"tsconfig.json" file was not found in the current directory');
                    process.exit(1);
                } else {
                    let _file = path.join(
                      path.join(process.cwd(), path.dirname(this.configuration.mainData.tsconfig)),
                      path.basename(this.configuration.mainData.tsconfig)
                    );
                    logger.info('Using tsconfig', _file);

                    files = require(_file).files;

                    // use the current directory of tsconfig.json as a working directory
                    cwd = _file.split(path.sep).slice(0, -1).join(path.sep);

                    if (!files) {
                        let exclude = require(_file).exclude || [];

                        files = walk(cwd || '.', exclude);
                    }

                    super.setFiles(files);
                    super.generate();
                }
            }  else if (program.tsconfig && program.args.length > 0) {
                this.configuration.mainData.tsconfig = program.tsconfig;
                let sourceFolder = program.args[0];
                if (!fs.existsSync(sourceFolder)) {
                    logger.error(`Provided source folder ${sourceFolder} was not found in the current directory`);
                    process.exit(1);
                } else {
                    logger.info('Using provided source folder');

                    files = walk(path.resolve(sourceFolder), []);

                    super.setFiles(files);
                    super.generate();
                }
            } else {
                logger.error('tsconfig.json file was not found, please use -p flag');
                outputHelp();
            }
        }
    }
}
