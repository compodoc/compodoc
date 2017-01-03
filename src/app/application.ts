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
import { Configuration, IConfiguration } from './configuration';
import { DependenciesEngine } from './engines/dependencies.engine';
import { NgdEngine } from './engines/ngd.engine';
import { SearchEngine } from './engines/search.engine';
import { Dependencies } from './compiler/dependencies';

import { COMPODOC_DEFAULTS } from '../utils/defaults';

let pkg = require('../package.json'),
    cwd = process.cwd(),
    $htmlengine = new HtmlEngine(),
    $fileengine = new FileEngine(),
    $markdownengine = new MarkdownEngine(),
    $ngdengine = new NgdEngine(),
    $searchEngine = new SearchEngine(),
    $dependenciesEngine,
    startTime = new Date();

export class Application {
    options:Object;
    files: Array<string>;

    configuration:IConfiguration;

    /**
     * Create a new compodoc application instance.
     *
     * @param options An object containing the options that should be used.
     */
    constructor(options?:Object) {
        this.configuration = Configuration.getInstance();

        for (let option in options ) {
            if(typeof this.configuration.mainData[option] !== 'undefined') {
                this.configuration.mainData[option] = options[option];
            }
        }
    }

    /**
     * Start compodoc
     */
    protected generate() {
        $htmlengine.init().then(() => {
            this.processPackageJson();
        });
    }

    setFiles(files:Array<string>) {
        this.files = files;
    }

    processPackageJson() {
        logger.info('Searching package.json file');
        $fileengine.get('package.json').then((packageData) => {
            let parsedData = JSON.parse(packageData);
            if (typeof parsedData.name !== 'undefined' && this.configuration.mainData.documentationMainName === COMPODOC_DEFAULTS.title) {
                this.configuration.mainData.documentationMainName = parsedData.name + ' documentation';
            }
            if (typeof parsedData.description !== 'undefined') {
                this.configuration.mainData.documentationMainDescription = parsedData.description;
            }
            logger.info('package.json file found');
            this.processMarkdown();
        }, (errorMessage) => {
            logger.error(errorMessage);
            logger.error('Continuing without package.json file');
            this.processMarkdown();
        });
    }

    processMarkdown() {
        logger.info('Searching README.md file');
        $markdownengine.getReadmeFile().then((readmeData: string) => {
            this.configuration.addPage({
                name: 'index',
                context: 'readme'
            });
            this.configuration.addPage({
                name: 'overview',
                context: 'overview'
            });
            this.configuration.mainData.readme = readmeData;
            logger.info('README.md file found');
            this.getDependenciesData();
        }, (errorMessage) => {
            logger.error(errorMessage);
            logger.error('Continuing without README.md file');
            this.configuration.addPage({
                name: 'index',
                context: 'overview'
            });
            this.getDependenciesData();
        });
    }

    getDependenciesData() {
        logger.info('Get dependencies data');

        let crawler = new Dependencies(
          this.files, {
            tsconfigDirectory: cwd
          }
        );

        let dependenciesData = crawler.getDependencies();

        $dependenciesEngine = new DependenciesEngine(dependenciesData);

        this.prepareModules();

        this.prepareComponents().then((readmeData) => {
            if ($dependenciesEngine.directives.length > 0) {
                this.prepareDirectives();
            }
            if ($dependenciesEngine.injectables.length > 0) {
                this.prepareInjectables();
            }
            if ($dependenciesEngine.routes.length > 0) {
                this.prepareRoutes();
            }

            if ($dependenciesEngine.pipes.length > 0) {
                this.preparePipes();
            }

            if ($dependenciesEngine.classes.length > 0) {
                this.prepareClasses();
            }

            if ($dependenciesEngine.interfaces.length > 0) {
                this.prepareInterfaces();
            }

            this.processPages();
        }, (errorMessage) => {
            logger.error(errorMessage);
        });
    }

    prepareModules() {
        logger.info('Prepare modules');
        this.configuration.mainData.modules = $dependenciesEngine.getModules();
        this.configuration.addPage({
            name: 'modules',
            context: 'modules'
        });
        let i = 0,
            len = this.configuration.mainData.modules.length;

        for(i; i<len; i++) {
            this.configuration.addPage({
                path: 'modules',
                name: this.configuration.mainData.modules[i].name,
                context: 'module',
                module: this.configuration.mainData.modules[i]
            });
        }
    }

    preparePipes = () => {
        logger.info('Prepare pipes');
        this.configuration.mainData.pipes = $dependenciesEngine.getPipes();
        let i = 0,
            len = this.configuration.mainData.pipes.length;

        for(i; i<len; i++) {
            this.configuration.addPage({
                path: 'pipes',
                name: this.configuration.mainData.pipes[i].name,
                context: 'pipe',
                pipe: this.configuration.mainData.pipes[i]
            });
        }
    }

    prepareClasses = () => {
        logger.info('Prepare classes');
        this.configuration.mainData.classes = $dependenciesEngine.getClasses();
        let i = 0,
            len = this.configuration.mainData.classes.length;

        for(i; i<len; i++) {
            this.configuration.addPage({
                path: 'classes',
                name: this.configuration.mainData.classes[i].name,
                context: 'class',
                class: this.configuration.mainData.classes[i]
            });
        }
    }

    prepareInterfaces() {
        logger.info('Prepare interfaces');
        this.configuration.mainData.interfaces = $dependenciesEngine.getInterfaces();
        let i = 0,
            len = this.configuration.mainData.interfaces.length;
        for(i; i<len; i++) {
            this.configuration.addPage({
                path: 'interfaces',
                name: this.configuration.mainData.interfaces[i].name,
                context: 'interface',
                interface: this.configuration.mainData.interfaces[i]
            });
        }
    }

    prepareComponents() {
        logger.info('Prepare components');
        let that = this;
        that.configuration.mainData.components = $dependenciesEngine.getComponents();

        return new Promise(function(resolve, reject) {
            let i = 0,
                len = that.configuration.mainData.components.length,
                loop = () => {
                    if( i <= len-1) {
                        let dirname = path.dirname(that.configuration.mainData.components[i].file),
                            readmeFile = dirname + path.sep + 'README.md';
                        if (fs.existsSync(readmeFile)) {
                            logger.info('README.md exist for this component, include it');
                            fs.readFile(readmeFile, 'utf8', (err, data) => {
                                if (err) throw err;
                                that.configuration.mainData.components[i].readme = marked(data);
                                that.configuration.addPage({
                                    path: 'components',
                                    name: that.configuration.mainData.components[i].name,
                                    context: 'component',
                                    component: that.configuration.mainData.components[i]
                                });
                                i++;
                                loop();
                            });
                        } else {
                            that.configuration.addPage({
                                path: 'components',
                                name: that.configuration.mainData.components[i].name,
                                context: 'component',
                                component: that.configuration.mainData.components[i]
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

    prepareDirectives = () => {
        logger.info('Prepare directives');
        this.configuration.mainData.directives = $dependenciesEngine.getDirectives();

        let i = 0,
            len = this.configuration.mainData.directives.length;

        for(i; i<len; i++) {
            this.configuration.addPage({
                path: 'directives',
                name: this.configuration.mainData.directives[i].name,
                context: 'directive',
                directive: this.configuration.mainData.directives[i]
            });
        }
    }

    prepareInjectables() {
        logger.info('Prepare injectables');
        this.configuration.mainData.injectables = $dependenciesEngine.getInjectables();

        let i = 0,
            len = this.configuration.mainData.injectables.length;

        for(i; i<len; i++) {
            this.configuration.addPage({
                path: 'injectables',
                name: this.configuration.mainData.injectables[i].name,
                context: 'injectable',
                injectable: this.configuration.mainData.injectables[i]
            });
        }
    }

    prepareRoutes() {
        logger.info('Process routes');
        this.configuration.mainData.routes = $dependenciesEngine.getRoutes();

        this.configuration.addPage({
            name: 'routes',
            context: 'routes'
        });
    }

    processPages() {
        logger.info('Process pages');
        let pages = this.configuration.pages,
            i = 0,
            len = pages.length,
            loop = () => {
                if( i <= len-1) {
                    logger.info('Process page', pages[i].name);
                    $htmlengine.render(this.configuration.mainData, pages[i]).then((htmlData) => {
                        let finalPath = this.configuration.mainData.output;
                        if(this.configuration.mainData.output.lastIndexOf('/') === -1) {
                            finalPath += '/';
                        }
                        if (pages[i].path) {
                            finalPath += pages[i].path + '/';
                        }
                        finalPath += pages[i].name + '.html';
                        $searchEngine.indexPage({
                            infos: pages[i],
                            rawData: htmlData,
                            url: finalPath
                        });
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
                    $searchEngine.generateSearchIndexJson(this.configuration.mainData.output);
                    this.processResources();
                }
            };
        loop();
    }

    processResources() {
        logger.info('Copy main resources');
        let that = this;
        fs.copy(path.resolve(__dirname + '/../src/resources/'), path.resolve(process.cwd() + path.sep + this.configuration.mainData.output), function (err) {
            if(err) {
                logger.error('Error during resources copy ', err);
            }
            else {
                if (that.configuration.mainData.extTheme) {
                    fs.copy(path.resolve(process.cwd() + path.sep + that.configuration.mainData.extTheme), path.resolve(process.cwd() + path.sep + this.configuration.mainData.output + '/styles/'), function (err) {
                        if (err) {
                            logger.error('Error during external styling theme copy ', err);
                        } else {
                            logger.info('External styling theme copy succeeded');
                            that.processGraphs();
                        }
                    });
                }
                else {
                    that.processGraphs();
                }
            }
        });
    }

    processGraphs() {
        logger.info('Process main graph');
        let modules = this.configuration.mainData.modules,
            i = 0,
            len = modules.length,
            loop = () => {
                if( i <= len-1) {
                    logger.info('Process module graph', modules[i].name);
                    let finalPath = this.configuration.mainData.output;
                    if(this.configuration.mainData.output.lastIndexOf('/') === -1) {
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
                    logger.info('Documentation generated in ' + this.configuration.mainData.output + ' in ' + finalTime + ' seconds using ' + this.configuration.mainData.theme + ' theme');
                    if (this.configuration.mainData.serve) {
                        logger.info(`Serving documentation from ${this.configuration.mainData.output} at http://127.0.0.1:${this.configuration.mainData.port}`);
                        this.runWebServer(this.configuration.mainData.output);
                    }
                }
            };
        let finalMainGraphPath = this.configuration.mainData.output;
        if(finalMainGraphPath.lastIndexOf('/') === -1) {
            finalMainGraphPath += '/';
        }
        finalMainGraphPath += 'graph';
        $ngdengine.renderGraph(this.configuration.mainData.tsconfig, path.resolve(finalMainGraphPath), 'p').then(() => {
            loop();
        }, (err) => {
            logger.error('Error during graph generation: ', err);
        });
    }

    runWebServer(folder) {
        LiveServer.start({
            root: folder,
            open: this.configuration.mainData.open,
            quiet: true,
            logLevel: 0,
            port: this.configuration.mainData.port
        });
    }

    /**
     * Return the application / root component instance.
     */
    get application():Application {
        return this;
    }


    get isCLI():boolean {
        return false;
    }
}
