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
import { DependenciesEngine } from './engines/dependencies.engine';
import { NgdEngine } from './engines/ngd.engine';
import { Dependencies } from './crawlers/dependencies';

let pkg = require('../package.json'),
    program = require('commander'),
    $htmlengine = new HtmlEngine(),
    $fileengine = new FileEngine(),
    $configuration = new Configuration(),
    $markdownengine = new MarkdownEngine(),
    $ngdengine = new NgdEngine(),
    $dependenciesEngine;

export namespace Application {

    program
        .version(pkg.version)
        .option('-f, --file [file]', 'Entry *.ts file')
        .option('-o, --open', 'Open the generated documentation', false)
        .option('-n, --name [name]', 'Title documentation', `Application documentation`)
        .option('-s, --serve', 'Serve generated documentation', false)
        .option('-g, --hideGenerator', 'Do not print the Compodoc link at the bottom of the page.', false)
        .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', `./documentation/`)
        .parse(process.argv);

    let outputHelp = () => {
        program.outputHelp()
        process.exit(1);
    }

    $htmlengine.init();

    $configuration.mainData.documentationMainName = program.name; //default commander value

    let processPackageJson = () => {
        logger.info('Searching package.json file');
        $fileengine.get('package.json').then((packageData) => {
            let parsedData = JSON.parse(packageData);
            if (typeof parsedData.name !== 'undefined') {
                $configuration.mainData.documentationMainName = parsedData.name;
            }
            if (typeof parsedData.description !== 'undefined') {
                $configuration.mainData.documentationMainDescription = parsedData.description;
            }
            logger.info('package.json file found');
            processMarkdown();
        }, (errorMessage) => {
            logger.error(errorMessage);
            logger.error('Continuing without package.json file');
            processMarkdown();
        });
    }

    let processMarkdown = () => {
        logger.info('Searching README.md file');
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
            logger.info('README.md file found');
            getDependenciesData();
        }, (errorMessage) => {
            logger.error(errorMessage);
            logger.error('Continuing without README.md file');
            $configuration.addPage({
                name: 'index',
                context: 'overview'
            });
            getDependenciesData();
        });
    }

    let getDependenciesData = () => {
        logger.info('Get dependencies data');

        let ngd = require('angular2-dependencies-graph');

        let dependenciesData = ngd.Application.getDependencies({
            file: program.file
        });

        /*
        let crawler = new Dependencies(
          [program.file]
        );

        let dependenciesData = crawler.getDependencies();

        console.log(dependenciesData.length);*/

        $dependenciesEngine = new DependenciesEngine(dependenciesData);

        console.log(dependenciesData);

        $configuration.mainData.modules = $dependenciesEngine.getModules();
        $configuration.addPage({
            name: 'modules',
            context: 'modules'
        });
        let i = 0,
            len = $configuration.mainData.modules.length;

        for(i; i<len; i++) {
            $configuration.addPage({
                path: 'modules',
                name: $configuration.mainData.modules[i].name,
                context: 'module',
                module: $configuration.mainData.modules[i]
            });
        }

        $configuration.mainData.components = $dependenciesEngine.getComponents();
        $configuration.addPage({
            name: 'components',
            context: 'components'
        });

        i = 0;
        len = $configuration.mainData.components.length;

        for(i; i<len; i++) {
            $configuration.addPage({
                path: 'components',
                name: $configuration.mainData.components[i].name,
                context: 'component',
                module: $configuration.mainData.components[i]
            });
        }

        $configuration.mainData.directives = $dependenciesEngine.getDirectives();

        processPages();
    }

    let processPages = () => {
        logger.info('Process pages');
        let pages = $configuration.pages,
            i = 0,
            len = pages.length,
            loop = () => {
                if( i <= len-1) {
                    logger.info('Process page', pages[i].name);
                    $htmlengine.render($configuration.mainData, pages[i]).then((htmlData) => {
                        let path = program.output;
                        if (pages[i].path) {
                            path += '/' + pages[i].path + '/';
                        }
                        path += pages[i].name + '.html';
                        fs.outputFile(path, htmlData, function (err) {
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
                processGraphs();
            }
        });
    }

    let processGraphs = () => {
        logger.info('Process main graph');
        let modules = $configuration.mainData.modules,
            i = 0,
            len = modules.length,
            loop = () => {
                if( i <= len-1) {
                    logger.info('Process module graph', modules[i].name);
                    $ngdengine.renderGraph(modules[i].file, 'documentation/modules/' + modules[i].name, 'f').then(() => {
                        i++;
                        loop();
                    }, (errorMessage) => {
                        logger.error(errorMessage);
                    });
                } else {
                    logger.info('Documentation generated in ' + program.output);
                }
            };
        $ngdengine.renderGraph(program.file, 'documentation/graph', 'p').then(() => {
            loop();
        }, () => {
            logger.error('Error during graph generation');
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
            logger.info('Serving documentation at http://127.0.0.1:8080');
            LiveServer.start({
                root: program.output,
                open: false,
                quiet: true,
                logLevel: 0
            });
        }

        if (program.hideGenerator) {
            $configuration.mainData.hideGenerator = true;
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
