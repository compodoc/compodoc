import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

import { logger } from '../logger';
import { HtmlEngine } from './engines/html.engine';

let pkg = require('../package.json');
let program = require('commander');

export namespace Application {

    program
        .version(pkg.version)
        .option('-f, --file [file]', 'Entry *.ts file')
        .option('-o, --open', 'Open the generated documentation', false)
        .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', `./documentation/`)
        .parse(process.argv);

    let outputHelp = () => {
        program.outputHelp()
        process.exit(1);
    }

    let $htmlengine = new HtmlEngine();

    export let run = () => {

        let files = [];

        if (program.file) {
            logger.info('Using entry', program.file);
            if (
                !fs.existsSync(program.file) ||
                !fs.existsSync(path.join(process.cwd(), program.file))
            ) {
                logger.fatal(`"${program.file}" file was not found`);
                process.exit(1);
            }
            else {
                files = [program.file];
            }
        } else {
            outputHelp();
        }

        console.log($htmlengine)

        logger.info('Ready, steady, go !!!');

        $htmlengine.render();

    }
}
