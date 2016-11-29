import * as ts from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as LiveServer from 'live-server';
import * as Shelljs from 'shelljs';
import marked from 'marked';

const glob: any = require('glob');

import { logger } from '../logger';
import { HtmlEngine } from './engines/html.engine';
import { MarkdownEngine } from './engines/markdown.engine';
import { FileEngine } from './engines/file.engine';
import { Configuration } from './configuration';
import { DependenciesEngine } from './engines/dependencies.engine';
import { NgdEngine } from './engines/ngd.engine';
import { Dependencies } from './compiler/dependencies';

let pkg = require('../package.json'),
    program = require('commander'),
    files = [],
    cwd = process.cwd(),
    $htmlengine = new HtmlEngine(),
    $fileengine = new FileEngine(),
    $configuration = new Configuration(),
    $markdownengine = new MarkdownEngine(),
    $ngdengine = new NgdEngine(),
    $dependenciesEngine,
    startTime = new Date();

export namespace Application {

    let defaultTitle = `Application documentation`,
        defaultAdditionalEntryName = 'Additional documentation',
        defaultAdditionalEntryPath = 'additional-documentation',
        defaultFolder = `./documentation/`;

    program
        .version(pkg.version)
        .option('-p, --tsconfig [config]', 'A tsconfig.json file')
        .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)')
        .option('-b, --base [base]', 'Base reference of html tag <base>', '/')
        .option('-y, --extTheme [file]', 'External styling theme file')
        .option('-n, --name [name]', 'Title documentation', defaultTitle)
        .option('-o, --open', 'Open the generated documentation', false)
        //.option('-i, --includes [path]', 'Path of external markdown files to include')
        //.option('-j, --includesName [name]', 'Name of item menu of externals markdown file')
        .option('-t, --silent', 'In silent mode, log messages aren\'t logged in the console', false)
        .option('-s, --serve', 'Serve generated documentation (default http://localhost:8080/)', false)
        .option('-g, --hideGenerator', 'Do not print the Compodoc link at the bottom of the page', false)
        .parse(process.argv);

    let outputHelp = () => {
        program.outputHelp()
        process.exit(1);
    }

    if (program.silent) {
        logger.silent = false;
    }

    if (program.output) {
        defaultFolder = program.output;
    }

    if (program.includesName) {
        defaultAdditionalEntryName = program.includesName;
    }

    $configuration.mainData.documentationMainName = program.name; //default commander value

    $configuration.mainData.base = program.base;

    let processPackageJson = () => {
        logger.info('Searching package.json file');
        $fileengine.get('package.json').then((packageData) => {
            let parsedData = JSON.parse(packageData);
            if (typeof parsedData.name !== 'undefined' && program.name === defaultTitle) {
                $configuration.mainData.documentationMainName = parsedData.name + ' documentation';
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

        let crawler = new Dependencies(
          files, {
            tsconfigDirectory: cwd
          }
        );

        let dependenciesData = crawler.getDependencies();

        $dependenciesEngine = new DependenciesEngine(dependenciesData);

        prepareModules();

        prepareComponents().then((readmeData) => {
            if ($dependenciesEngine.directives.length > 0) {
                prepareDirectives();
            }
            if ($dependenciesEngine.injectables.length > 0) {
                prepareInjectables();
            }
            if ($dependenciesEngine.routes.length > 0) {
                prepareRoutes();
            }

            if ($dependenciesEngine.pipes.length > 0) {
                preparePipes();
            }

            if ($dependenciesEngine.classes.length > 0) {
                prepareClasses();
            }

            if (program.includes) {
                processAddtionalDocumentation().then(() => {
                    processPages();
                }, (err) => {
                    logger.error('Error during additional documentation generation: ', err);
                });
            } else {
                processPages();
            }
        }, (errorMessage) => {
            logger.error(errorMessage);
        });
    }

    let processAddtionalDocumentation = () => {
        logger.info('Process additional documentation: ', program.includes, path.resolve(process.cwd() + path.sep + program.includes + '/**/*'));
        $configuration.mainData.additionalpages = {
            entryName: defaultAdditionalEntryName,
            pages: []
        };
        return new Promise(function(resolve, reject) {
            glob( process.cwd() + path.sep + program.includes + '/**/*', {
                dot: false,
                cwd: __dirname
            }, function(err, files) {
                let i = 0,
                    f,
                    basename,
                    len = files.length;
                let loop = function() {
                    if (i < len) {
                        f = files[i];
                        basename = path.basename(f);
                        if( i === 0) {
                            $configuration.mainData.additionalpages.pages.push({
                                name: 'Index'
                            });
                            $configuration.addPage({
                                path: defaultAdditionalEntryPath,
                                name: 'index',
                                context: 'additionalpages',
                                page: 'toto'
                            });
                        } else {
                            $configuration.mainData.additionalpages.pages.push({
                                name: basename
                            });
                            $configuration.addPage({
                                path: defaultAdditionalEntryPath,
                                name: basename,
                                context: 'additionalpage',
                                page: 'toto'
                            });
                        }
                        i++
                        loop();
                    } else {
                        resolve();
                    }
                };
                loop();
            });
        });
    }

    let prepareModules = () => {
        logger.info('Prepare modules');
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
    }

    let preparePipes = () => {
        logger.info('Prepare pipes');
        $configuration.mainData.pipes = $dependenciesEngine.getPipes();
        $configuration.addPage({
            name: 'pipes',
            context: 'pipes'
        });
        let i = 0,
            len = $configuration.mainData.pipes.length;

        for(i; i<len; i++) {
            $configuration.addPage({
                path: 'pipes',
                name: $configuration.mainData.pipes[i].name,
                context: 'pipe',
                pipe: $configuration.mainData.pipes[i]
            });
        }
    }

    let prepareClasses = () => {
        logger.info('Prepare classes');
        $configuration.mainData.classes = $dependenciesEngine.getClasses();
        $configuration.addPage({
            name: 'classes',
            context: 'classes'
        });
        let i = 0,
            len = $configuration.mainData.classes.length;

        for(i; i<len; i++) {
            $configuration.addPage({
                path: 'classes',
                name: $configuration.mainData.classes[i].name,
                context: 'class',
                class: $configuration.mainData.classes[i]
            });
        }
    }

    let prepareComponents = () => {
        logger.info('Prepare components');
        $configuration.mainData.components = $dependenciesEngine.getComponents();
        $configuration.addPage({
            name: 'components',
            context: 'components'
        });

        return new Promise(function(resolve, reject) {
            let i = 0,
                len = $configuration.mainData.components.length,
                loop = () => {
                    if( i <= len-1) {
                        let dirname = path.dirname($configuration.mainData.components[i].file),
                            readmeFile = dirname + path.sep + 'README.md';
                        if (fs.existsSync(readmeFile)) {
                            logger.info('README.md exist for this component, include it');
                            fs.readFile(readmeFile, 'utf8', (err, data) => {
                                if (err) throw err;
                                $configuration.mainData.components[i].readme = marked(data);
                                $configuration.addPage({
                                    path: 'components',
                                    name: $configuration.mainData.components[i].name,
                                    context: 'component',
                                    component: $configuration.mainData.components[i]
                                });
                                i++;
                                loop();
                            });
                        } else {
                            $configuration.addPage({
                                path: 'components',
                                name: $configuration.mainData.components[i].name,
                                context: 'component',
                                component: $configuration.mainData.components[i]
                            });
                            i++;
                            loop();
                        }
                    } else {
                        resolve();
                    }
                };
            loop();
        });
    }

    let prepareDirectives = () => {
        logger.info('Prepare directives');
        $configuration.mainData.directives = $dependenciesEngine.getDirectives();

        $configuration.addPage({
            name: 'directives',
            context: 'directives'
        });

        let i = 0,
            len = $configuration.mainData.directives.length;

        for(i; i<len; i++) {
            $configuration.addPage({
                path: 'directives',
                name: $configuration.mainData.directives[i].name,
                context: 'directive',
                directive: $configuration.mainData.directives[i]
            });
        }
    }

    let prepareInjectables = () => {
        logger.info('Prepare injectables');
        $configuration.mainData.injectables = $dependenciesEngine.getInjectables();

        $configuration.addPage({
            name: 'injectables',
            context: 'injectables'
        });

        let i = 0,
            len = $configuration.mainData.injectables.length;

        for(i; i<len; i++) {
            $configuration.addPage({
                path: 'injectables',
                name: $configuration.mainData.injectables[i].name,
                context: 'injectable',
                injectable: $configuration.mainData.injectables[i]
            });
        }
    }

    let prepareRoutes = () => {
        logger.info('Process routes');
        $configuration.mainData.routes = $dependenciesEngine.getRoutes();

        $configuration.addPage({
            name: 'routes',
            context: 'routes'
        });
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
                        let finalPath = defaultFolder;
                        if(defaultFolder.lastIndexOf('/') === -1) {
                            finalPath += '/';
                        }
                        if (pages[i].path) {
                            finalPath += pages[i].path + '/';
                        }
                        finalPath += pages[i].name + '.html';
                        fs.outputFile(path.resolve(finalPath), htmlData, function (err) {
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
        logger.info('Copy main resources');
        fs.copy(path.resolve(__dirname + '/../src/resources/'), path.resolve(process.cwd() + path.sep + defaultFolder), function (err) {
            if(err) {
                logger.error('Error during resources copy ', err);
            }
            else {
                if (program.extTheme) {
                    fs.copy(path.resolve(process.cwd() + path.sep + program.extTheme), path.resolve(process.cwd() + path.sep + defaultFolder + '/styles/'), function (err) {
                        if (err) {
                            logger.error('Error during external styling theme copy ', err);
                        } else {
                            logger.info('External styling theme copy succeeded');
                            processGraphs();
                        }
                    });
                }
                else {
                    processGraphs();
                }
            }
        });
    };

    let processGraphs = () => {
        logger.info('Process main graph');
        let modules = $configuration.mainData.modules,
            i = 0,
            len = modules.length,
            loop = () => {
                if( i <= len-1) {
                    logger.info('Process module graph', modules[i].name);
                    let finalPath = defaultFolder;
                    if(defaultFolder.lastIndexOf('/') === -1) {
                        finalPath += '/';
                    }
                    finalPath += 'modules/' + modules[i].name;
                    $ngdengine.renderGraph(modules[i].file, finalPath, 'f').then(() => {
                        i++;
                        loop();
                    }, (errorMessage) => {
                        logger.error(errorMessage);
                    });
                } else {
                    let finalTime = (new Date() - startTime) / 1000;
                    logger.info('Documentation generated in ' + defaultFolder + ' in ' + finalTime + ' seconds');
                    if (program.serve) {
                        logger.info(`Serving documentation from ${defaultFolder} at http://127.0.0.1:8080`);
                        runWebServer(defaultFolder);
                    }
                }
            };
        let finalMainGraphPath = defaultFolder;
        if(defaultFolder.lastIndexOf('/') === -1) {
            finalMainGraphPath += '/';
        }
        finalMainGraphPath += 'graph';
        $ngdengine.renderGraph(program.tsconfig, finalMainGraphPath, 'p').then(() => {
            loop();
        }, (err) => {
            logger.error('Error during graph generation: ', err);
        });
    }

    let runWebServer = (folder) => {
        LiveServer.start({
            root: folder,
            open: false,
            quiet: true,
            logLevel: 0
        });
    }

    export let run = () => {

        let _file;

        if (program.serve && !program.tsconfig && program.output) {
            // if -s & -d, serve it
            if (!fs.existsSync(program.output)) {
                logger.fatal(`${program.output} folder doesn't exist`);
                process.exit(1);
            } else {
                logger.info(`Serving documentation from ${program.output} at http://127.0.0.1:8080`);
                runWebServer(program.output);
            }
        } else if (program.serve && !program.tsconfig && !program.output) {
            // if only -s find ./documentation, if ok serve, else error provide -d
            if (!fs.existsSync(defaultFolder)) {
                logger.fatal('Provide output generated folder with -d flag');
                process.exit(1);
            } else {
                logger.info(`Serving documentation from ${defaultFolder} at http://127.0.0.1:8080`);
                runWebServer(defaultFolder);
            }
        } else {
            if (program.hideGenerator) {
                $configuration.mainData.hideGenerator = true;
            }

            if (program.tsconfig) {
                if (!fs.existsSync(program.tsconfig)) {
                    logger.fatal('"tsconfig.json" file was not found in the current directory');
                    process.exit(1);
                } else {
                    _file = path.join(
                      path.join(process.cwd(), path.dirname(program.tsconfig)),
                      path.basename(program.tsconfig)
                    );
                    logger.info('Using tsconfig', _file);

                    files = require(_file).files;

                    // use the current directory of tsconfig.json as a working directory
                    cwd = _file.split(path.sep).slice(0, -1).join(path.sep);

                    if (!files) {
                        let exclude = require(_file).exclude || [];

                        var walk = (dir) => {
                            let results = [];
                            let list = fs.readdirSync(dir);
                            list.forEach((file) => {
                                if (exclude.indexOf(file) < 0 && dir.indexOf('node_modules') < 0) {
                                    file = path.join(dir, file);
                                    let stat = fs.statSync(file);
                                    if (stat && stat.isDirectory()) {
                                        results = results.concat(walk(file));
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

                        files = walk(cwd || '.');
                    }

                    $htmlengine.init().then(() => {
                        processPackageJson();
                    });
                }
            } else {
                logger.fatal('Entry file was not found');
                outputHelp();
            }
        }
    }
}
