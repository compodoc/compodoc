import * as ts from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';

import { logger } from '../logger';
import { HtmlEngine } from './engines/html.engine';
import { MarkdownEngine } from './engines/markdown.engine';

let pkg = require('../package.json');
let program = require('commander');

export namespace Application {

    program
        .version(pkg.version)
        .option('-f, --file [file]', 'Entry *.ts file')
        .option('-o, --open', 'Open the generated documentation', false)
        .option('-n, --name [name]', 'Title documentation', `Application documentation`)
        .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', `./documentation/`)
        .parse(process.argv);

    let outputHelp = () => {
        program.outputHelp()
        process.exit(1);
    }

    let $htmlengine = new HtmlEngine(),
        $markdownengine = new MarkdownEngine();

    /*
     * 1. scan ts files for list of modules
     * 2. scan ts files for list of components
     * 3. export one page for each modules using module.hbs template
     * 4. export one page for each components using components.hbs template
     * 5. render README.md in index.html
     * 6. render menu with lists of components and modules
     */

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

        logger.info('Ready, steady, go !!!');

        $markdownengine.getReadmeFile().then((readmeData) => {

            $htmlengine.render({
                documentationMainName: program.name,
                readme: readmeData
            }).then((htmlData) => {

                fs.outputFile('documentation/index.html', htmlData, function (err) {

                });

            });
        });





    }
}
