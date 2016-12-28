import * as fs from 'fs-extra';
import * as path from 'path';

import { Application } from './app/application';

import { COMPODOC_DEFAULTS } from './utils/defaults';
import { logger } from './logger';

let pkg = require('../package.json'),
    program = require('commander'),
    files = [],
    cwd = process.cwd();

export class CliApplication extends Application
{
    /**
     * Run compodoc from the command line.
     */
    protected generate() {

        program
            .version(pkg.version)
            .option('-p, --tsconfig [config]', 'A tsconfig.json file')
            .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)')
            .option('-b, --base [base]', 'Base reference of html tag <base>', COMPODOC_DEFAULTS.base)
            .option('-y, --extTheme [file]', 'External styling theme file')
            .option('-h, --theme [theme]', 'Choose one of available themes, default is \'gitbook\' (laravel, original, postmark, readthedocs, stripe, vagrant)')
            .option('-n, --name [name]', 'Title documentation', COMPODOC_DEFAULTS.title)
            .option('-o, --open', 'Open the generated documentation', false)
            //.option('-i, --includes [path]', 'Path of external markdown files to include')
            //.option('-j, --includesName [name]', 'Name of item menu of externals markdown file')
            .option('-t, --silent', 'In silent mode, log messages aren\'t logged in the console', false)
            .option('-s, --serve', 'Serve generated documentation (default http://localhost:8080/)', false)
            .option('-r, --port [port]', 'Change default serving port', COMPODOC_DEFAULTS.port)
            .option('-g, --hideGenerator', 'Do not print the Compodoc link at the bottom of the page', false)
            .parse(process.argv);

        let outputHelp = () => {
            program.outputHelp()
            process.exit(1);
        }

        if (program.output) {
            this.configuration.mainData.defaultFolder = program.output;
        }

        if (program.base) {
            this.configuration.mainData.base = program.base;
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

        if (program.open) {
            this.configuration.mainData.open = program.open;
        }

        if (program.includes) {
            this.configuration.mainData.includes  = program.includes;
        }

        if (program.includesName) {
            //this.configuration.mainData.includesName  = program.includesName;
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

            if (program.tsconfig) {
                this.configuration.mainData.tsconfig = program.tsconfig;
                if (!fs.existsSync(program.tsconfig)) {
                    logger.error('"tsconfig.json" file was not found in the current directory');
                    process.exit(1);
                } else {
                    super.generate();
                }
            } else {
                logger.error('Entry file was not found');
                outputHelp();
            }
        }
    }
}
