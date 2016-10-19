import * as ts from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as LiveServer from 'live-server';
import * as Shelljs from 'shelljs';

import { logger } from '../logger';
import { HtmlEngine } from './engines/html.engine';
import { MarkdownEngine } from './engines/markdown.engine';
import { FileEngine } from './engines/file.engine';
import { Configuration } from './configuration';

let pkg = require('../package.json'),
    program = require('commander'),
    $htmlengine = new HtmlEngine(),
    $fileengine = new FileEngine(),
    $configuration = new Configuration(),
    $markdownengine = new MarkdownEngine();

export namespace Application {

    program
        .version(pkg.version)
        .option('-f, --file [file]', 'Entry *.ts file')
        .option('-o, --open', 'Open the generated documentation', false)
        .option('-n, --name [name]', 'Title documentation', `Application documentation`)
        .option('-s, --serve', 'Serve generated documentation', false)
        .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', `./documentation/`)
        .parse(process.argv);

    let outputHelp = () => {
        program.outputHelp()
        process.exit(1);
    }

    $htmlengine.init();

    $configuration.mainData.documentationMainName = program.name; //default commander value

    let processPackageJson = () => {
        $fileengine.get('package.json').then((packageData) => {
            let parsedData = JSON.parse(packageData);
            if (typeof parsedData.name !== 'undefined') {
                $configuration.mainData.documentationMainName = parsedData.name;
            }
            if (typeof parsedData.description !== 'undefined') {
                $configuration.mainData.documentationMainDescription = parsedData.description;
            }
            processMarkdown();
        }, (errorMessage) => {
            logger.error(errorMessage);
            logger.error('Continuing without package.json file');
            processMarkdown();
        });
    }

    let processMarkdown = () => {
        $markdownengine.getReadmeFile().then((readmeData) => {
            $configuration.addPage({
                name: 'index',
                context: 'readme'
            });
            $configuration.addPage({
                name: 'overview',
                context: 'overview'
            });
            $configuration.mainData.readme = readmeData;
            processPages();
        }, (errorMessage) => {
            logger.error(errorMessage);
            logger.error('Continuing without README.md file');
            $configuration.addPage({
                name: 'index',
                context: 'overview'
            });
            processPages();
        });
    }

    let processPages = () => {

        let pages = $configuration.pages,
            i = 0,
            len = pages.length,
            loop = () => {
                if( i <= len-1) {
                    $htmlengine.render($configuration.mainData, pages[i]).then((htmlData) => {
                        fs.outputFile(program.output + pages[i].name + '.html', htmlData, function (err) {
                            if (err) {
                                logger.error('Error during ' + pages[i].name + ' page generation');
                            } else {
                                i++;
                                loop();
                            }
                        });
                    }, (errorMessage) => {
                        logger.error(errorMessage);
                    });
                } else {
                    processResources();

                }
            };
        loop();
    }

    let processResources = () => {
        fs.copy(path.resolve(__dirname + '/../src/resources/'), path.resolve(process.cwd() + path.sep + program.output), function (err) {
            if (err) {
                logger.error('Error during resources copy');
            } else {
                processGraph();
            }
        });
    }

    let processGraph = () => {
        Shelljs.exec('ngd -f ' + program.file + ' -d documentation/graph', {
            silent: true
        }, function(code, stdout, stderr) {
            if(code === 0) {
                logger.info('Documentation generated in ' + program.output);
            } else {
                logger.error('Error during graph generation');
            }
        });
    }

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

        if (program.serve) {
            logger.info('Serving documentation');
            LiveServer.start({
                root: program.output,
                open: false,
                quiet: true
            });
            return;
        }

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
                processPackageJson();
            }
        } else {
            logger.fatal('Entry file was not found');
            outputHelp();
        }
    }
}
