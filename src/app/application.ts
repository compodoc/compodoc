import * as fs from 'fs-extra';
import * as path from 'path';
import * as LiveServer from 'live-server';
import * as Shelljs from 'shelljs';

import { logger } from '../logger';
import { HtmlEngine } from './engines/html.engine';
import { MarkdownEngine } from './engines/markdown.engine';
import { FileEngine } from './engines/file.engine';
import { Configuration } from './configuration';
import { ConfigurationInterface } from './interfaces/configuration.interface';
import { $dependenciesEngine } from './engines/dependencies.engine';
import { NgdEngine } from './engines/ngd.engine';
import { SearchEngine } from './engines/search.engine';
import { Dependencies } from './compiler/dependencies';
import { RouterParser } from '../utils/router.parser';

import { COMPODOC_DEFAULTS } from '../utils/defaults';

import { getAngularVersionOfProject } from '../utils/angular-version';

import { cleanNameWithoutSpaceAndToLowerCase, findMainSourceFolder } from '../utilities';

import { promiseSequential } from '../utils/promise-sequential';

const glob: any = require('glob'),
      ts = require('typescript'),
      _ = require('lodash'),
      marked = require('marked'),
      chokidar = require('chokidar');

let pkg = require('../package.json'),
    cwd = process.cwd(),
    $htmlengine = new HtmlEngine(),
    $fileengine = new FileEngine(),
    $markdownengine = new MarkdownEngine(),
    $ngdengine = new NgdEngine(),
    $searchEngine = new SearchEngine(),
    startTime = new Date()

export class Application {
    /**
     * Files processed during initial scanning
     */
    files: Array<string>;
    /**
     * Files processed during watch scanning
     */
    updatedFiles: Array<string>;
    /**
     * Files changed during watch scanning
     */
    watchChangedFiles: Array<string> = [];
    /**
     * Compodoc configuration local reference
     */
    configuration:ConfigurationInterface;
    /**
     * Boolean for watching status
     * @type {boolean}
     */
    isWatching: boolean = false;

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
            // For documentationMainName, process it outside the loop, for handling conflict with pages name
            if(option === 'name') {
                this.configuration.mainData['documentationMainName'] = options[option];
            }
            // For documentationMainName, process it outside the loop, for handling conflict with pages name
            if(option === 'silent') {
                logger.silent = false;
            }
        }
    }

    /**
     * Start compodoc process
     */
    protected generate() {
        if (this.configuration.mainData.output.charAt(this.configuration.mainData.output.length - 1) !== '/') {
            this.configuration.mainData.output += '/';
        }
        $htmlengine.init().then(() => {
            this.processPackageJson();
        });
    }

    /**
     * Start compodoc documentation coverage
     */
    protected testCoverage() {
        this.getDependenciesData();
    }

    /**
     * Store files for initial processing
     * @param  {Array<string>} files Files found during source folder and tsconfig scan
     */
    setFiles(files:Array<string>) {
        this.files = files;
    }

    /**
     * Store files for watch processing
     * @param  {Array<string>} files Files found during source folder and tsconfig scan
     */
    setUpdatedFiles(files:Array<string>) {
        this.updatedFiles = files;
    }

    /**
     * Return a boolean indicating presence of one TypeScript file in updatedFiles list
     * @return {boolean} Result of scan
     */
    hasWatchedFilesTSFiles(): boolean {
        let result = false;

        _.forEach(this.updatedFiles, (file) => {
            if (path.extname(file) === '.ts') {
                result = true;
            }
        });

        return result;
    }

    /**
     * Return a boolean indicating presence of one root markdown files in updatedFiles list
     * @return {boolean} Result of scan
     */
    hasWatchedFilesRootMarkdownFiles(): boolean {
        let result = false;

        _.forEach(this.updatedFiles, (file) => {
            if (path.extname(file) === '.md' && path.dirname(file) === process.cwd()) {
                result = true;
            }
        });

        return result;
    }

    /**
     * Clear files for watch processing
     */
    clearUpdatedFiles() {
        this.updatedFiles = [];
        this.watchChangedFiles = [];
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
            this.configuration.mainData.angularVersion = getAngularVersionOfProject(parsedData);
            logger.info('package.json file found');
            this.processMarkdowns().then(() => {
                this.getDependenciesData();
            }, (errorMessage) => {
                logger.error(errorMessage);
            });
        }, (errorMessage) => {
            logger.error(errorMessage);
            logger.error('Continuing without package.json file');
            this.processMarkdowns().then(() => {
                this.getDependenciesData();
            }, (errorMessage) => {
                logger.error(errorMessage);
            });
        });
    }

    processMarkdowns() {
        logger.info('Searching README.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE.md, TODO.md files');

        return new Promise((resolve, reject) => {
            let i = 0,
            markdowns = ['readme', 'changelog', 'contributing', 'license', 'todo'],
            numberOfMarkdowns = 5,
            loop = () => {
                if (i < numberOfMarkdowns) {
                    $markdownengine.getTraditionalMarkdown(markdowns[i].toUpperCase()).then((readmeData: string) => {
                        this.configuration.addPage({
                            name: (markdowns[i] === 'readme') ? 'index' : markdowns[i],
                            context: 'getting-started',
                            markdown: readmeData,
                            depth: 0,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                        });
                        if (markdowns[i] === 'readme') {
                            this.configuration.mainData.readme = true;
                            this.configuration.addPage({
                                name: 'overview',
                                context: 'overview',
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                            });
                        } else {
                            this.configuration.mainData.markdowns.push({
                                name: markdowns[i],
                                uppername: markdowns[i].toUpperCase(),
                                depth: 0,
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                            })
                        }
                        logger.info(`${markdowns[i].toUpperCase()}.md file found`);
                        i++;
                        loop();
                    }, (errorMessage) => {
                        logger.warn(errorMessage);
                        logger.warn(`Continuing without ${markdowns[i].toUpperCase()}.md file`);
                        if (markdowns[i] === 'readme') {
                            this.configuration.addPage({
                                name: 'index',
                                context: 'overview'
                            });
                        }
                        i++;
                        loop();
                    });
                } else {
                    resolve();
                }
            };
            loop();
        });
    }

    rebuildRootMarkdowns() {
        logger.info('Regenerating README.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE.md, TODO.md pages');

        let actions = [];

        this.configuration.resetRootMarkdownPages();

        actions.push(() => { return this.processMarkdowns(); });

        promiseSequential(actions)
            .then(res => {
                this.processPages();
                this.clearUpdatedFiles();
            })
            .catch(errorMessage => {
                logger.error(errorMessage);
            });
    }

    /**
     * Get dependency data for small group of updated files during watch process
     */
    getMicroDependenciesData() {
        logger.info('Get diff dependencies data');
        let crawler = new Dependencies(
          this.updatedFiles, {
            tsconfigDirectory: path.dirname(this.configuration.mainData.tsconfig)
          }
        );

        let dependenciesData = crawler.getDependencies();

        $dependenciesEngine.update(dependenciesData);

        this.prepareJustAFewThings(dependenciesData);
    }

    /**
     * Rebuild external documentation during watch process
     */
    rebuildExternalDocumentation() {
        logger.info('Rebuild external documentation');

        let actions = [];

        this.configuration.resetAdditionalPages();

        if (this.configuration.mainData.includes !== '') {
            actions.push(() => { return this.prepareExternalIncludes(); });
        }

        promiseSequential(actions)
            .then(res => {
                this.processPages();
                this.clearUpdatedFiles();
            })
            .catch(errorMessage => {
                logger.error(errorMessage);
            });
    }

    getDependenciesData() {
        logger.info('Get dependencies data');

        let crawler = new Dependencies(
          this.files, {
            tsconfigDirectory: path.dirname(this.configuration.mainData.tsconfig)
          }
        );

        let dependenciesData = crawler.getDependencies();

        $dependenciesEngine.init(dependenciesData);

        this.configuration.mainData.routesLength = RouterParser.routesLength();

        this.prepareEverything();
    }

    prepareJustAFewThings(diffCrawledData) {
        let actions = [];

        this.configuration.resetPages();

        actions.push(() => { return this.prepareRoutes(); });

        if (diffCrawledData.modules.length > 0) {
            actions.push(() => { return this.prepareModules(); });
        }
        if (diffCrawledData.components.length > 0) {
            actions.push(() => { return this.prepareComponents(); });
        }

        if (diffCrawledData.directives.length > 0) {
            actions.push(() => { return this.prepareDirectives(); });
        }

        if (diffCrawledData.injectables.length > 0) {
            actions.push(() => { return this.prepareInjectables(); });
        }

        if (diffCrawledData.pipes.length > 0) {
            actions.push(() => { return this.preparePipes(); });
        }

        if (diffCrawledData.classes.length > 0) {
            actions.push(() => { return this.prepareClasses(); });
        }

        if (diffCrawledData.interfaces.length > 0) {
            actions.push(() => { return this.prepareInterfaces(); });
        }

        if (diffCrawledData.miscellaneous.variables.length > 0 ||
            diffCrawledData.miscellaneous.functions.length > 0 ||
            diffCrawledData.miscellaneous.typealiases.length > 0 ||
            diffCrawledData.miscellaneous.enumerations.length > 0 ||
            diffCrawledData.miscellaneous.types.length > 0 ) {
            actions.push(() => { return this.prepareMiscellaneous(); });
        }

        if (!this.configuration.mainData.disableCoverage) {
            actions.push(() => { return this.prepareCoverage(); });
        }

        promiseSequential(actions)
            .then(res => {
                this.processGraphs();
                this.clearUpdatedFiles();
            })
            .catch(errorMessage => {
                logger.error(errorMessage);
            });
    }

    prepareEverything() {
        let actions = [];

        actions.push(() => { return this.prepareModules(); });
        actions.push(() => { return this.prepareComponents(); });

        if ($dependenciesEngine.directives.length > 0) {
            actions.push(() => { return this.prepareDirectives(); });
        }

        if ($dependenciesEngine.injectables.length > 0) {
            actions.push(() => { return this.prepareInjectables(); });
        }

        if ($dependenciesEngine.routes && $dependenciesEngine.routes.children.length > 0) {
            actions.push(() => { return this.prepareRoutes(); });
        }

        if ($dependenciesEngine.pipes.length > 0) {
            actions.push(() => { return this.preparePipes(); });
        }

        if ($dependenciesEngine.classes.length > 0) {
            actions.push(() => { return this.prepareClasses(); });
        }

        if ($dependenciesEngine.interfaces.length > 0) {
            actions.push(() => { return this.prepareInterfaces(); });
        }

        if ($dependenciesEngine.miscellaneous.variables.length > 0 ||
            $dependenciesEngine.miscellaneous.functions.length > 0 ||
            $dependenciesEngine.miscellaneous.typealiases.length > 0 ||
            $dependenciesEngine.miscellaneous.enumerations.length > 0 ||
            $dependenciesEngine.miscellaneous.types.length > 0 ) {
            actions.push(() => { return this.prepareMiscellaneous(); });
        }

        if (!this.configuration.mainData.disableCoverage) {
            actions.push(() => { return this.prepareCoverage(); });
        }

        if (this.configuration.mainData.includes !== '') {
            actions.push(() => { return this.prepareExternalIncludes(); });
        }

        promiseSequential(actions)
            .then(res => {
                this.processGraphs();
            })
            .catch(errorMessage => {
                logger.error(errorMessage);
            });
    }

    prepareExternalIncludes() {
        logger.info('Adding external markdown files');
        //Scan include folder for files detailed in summary.json
        //For each file, add to this.configuration.mainData.additionalPages
        //Each file will be converted to html page, inside COMPODOC_DEFAULTS.additionalEntryPath
        return new Promise((resolve, reject) => {
           $fileengine.get(this.configuration.mainData.includes + path.sep + 'summary.json').then((summaryData) => {
               logger.info('Additional documentation: summary.json file found');

               let parsedSummaryData = JSON.parse(summaryData),
                   i = 0,
                   len = parsedSummaryData.length,
                   loop = () => {
                      if( i <= len-1) {
                          $markdownengine.get(this.configuration.mainData.includes + path.sep + parsedSummaryData[i].file).then((markedData) => {
                              this.configuration.addAdditionalPage({
                                  name: parsedSummaryData[i].title,
                                  filename: cleanNameWithoutSpaceAndToLowerCase(parsedSummaryData[i].title),
                                  context: 'additional-page',
                                  path: this.configuration.mainData.includesFolder,
                                  additionalPage: markedData,
                                  depth: 1,
                                  pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                              });

                              if (parsedSummaryData[i].children && parsedSummaryData[i].children.length > 0) {
                                  let j = 0,
                                      leng = parsedSummaryData[i].children.length,
                                    loopChild = () => {
                                        if( j <= leng-1) {
                                            $markdownengine.get(this.configuration.mainData.includes + path.sep + parsedSummaryData[i].children[j].file).then((markedData) => {
                                                this.configuration.addAdditionalPage({
                                                    name: parsedSummaryData[i].children[j].title,
                                                    filename: cleanNameWithoutSpaceAndToLowerCase(parsedSummaryData[i].children[j].title),
                                                    context: 'additional-page',
                                                    path: this.configuration.mainData.includesFolder + '/' + cleanNameWithoutSpaceAndToLowerCase(parsedSummaryData[i].title),
                                                    additionalPage: markedData,
                                                    depth: 2,
                                                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                                                });
                                                j++;
                                                loopChild();
                                            }, (e) => {
                                                logger.error(e);
                                            });
                                        } else {
                                            i++;
                                            loop();
                                        }
                                    }
                                    loopChild();
                                } else {
                                    i++;
                                    loop();
                                }
                          }, (e) => {
                              logger.error(e);
                          });
                      } else {
                          resolve();
                      }
                  };
               loop();
           }, (errorMessage) => {
               logger.error(errorMessage);
               reject('Error during Additional documentation generation');
           });
        });
    }

    prepareModules(someModules?) {
        logger.info('Prepare modules');
        let i = 0,
            _modules = (someModules) ? someModules : $dependenciesEngine.getModules();

        return new Promise((resolve, reject) => {

            this.configuration.mainData.modules = _modules.map(ngModule => {
                ['declarations', 'bootstrap', 'imports', 'exports'].forEach(metadataType => {
                    ngModule[metadataType] = ngModule[metadataType].filter(metaDataItem => {
                        switch (metaDataItem.type) {
                            case 'directive':
                                return $dependenciesEngine.getDirectives().some(directive => directive.name === metaDataItem.name);

                            case 'component':
                                return $dependenciesEngine.getComponents().some(component => component.name === metaDataItem.name);

                            case 'module':
                                return $dependenciesEngine.getModules().some(module => module.name === metaDataItem.name);

                            case 'pipe':
                                return $dependenciesEngine.getPipes().some(pipe => pipe.name === metaDataItem.name);

                            default:
                                return true;
                        }
                    });
                });
                ngModule.providers = ngModule.providers.filter(provider => {
                    return $dependenciesEngine.getInjectables().some(injectable => injectable.name === provider.name);
                });
                return ngModule;
            });
            this.configuration.addPage({
                name: 'modules',
                context: 'modules',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });

            let len = this.configuration.mainData.modules.length,
                loop = () => {
                    if(i < len) {
                        if ($markdownengine.hasNeighbourReadmeFile(this.configuration.mainData.modules[i].file)) {
                            logger.info(` ${this.configuration.mainData.modules[i].name} has a README file, include it`);
                            let readme = $markdownengine.readNeighbourReadmeFile(this.configuration.mainData.modules[i].file);
                            this.configuration.mainData.modules[i].readme = marked(readme);
                        }
                        this.configuration.addPage({
                            path: 'modules',
                            name: this.configuration.mainData.modules[i].name,
                            context: 'module',
                            module: this.configuration.mainData.modules[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        i++;
                        loop();
                    } else {
                        resolve();
                    }
                }
            loop();
        });
    }

    preparePipes = (somePipes?) => {
        logger.info('Prepare pipes');
        this.configuration.mainData.pipes = (somePipes) ? somePipes : $dependenciesEngine.getPipes();

        return new Promise((resolve, reject) => {
            let i = 0,
                len = this.configuration.mainData.pipes.length,
                loop = () => {
                    if(i < len) {
                        if ($markdownengine.hasNeighbourReadmeFile(this.configuration.mainData.pipes[i].file)) {
                            logger.info(` ${this.configuration.mainData.pipes[i].name} has a README file, include it`);
                            let readme = $markdownengine.readNeighbourReadmeFile(this.configuration.mainData.pipes[i].file);
                            this.configuration.mainData.pipes[i].readme = marked(readme);
                        }
                        this.configuration.addPage({
                            path: 'pipes',
                            name: this.configuration.mainData.pipes[i].name,
                            context: 'pipe',
                            pipe: this.configuration.mainData.pipes[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        i++;
                        loop();
                    } else {
                        resolve();
                    }
                }
            loop();
        });
    }

    prepareClasses = (someClasses?) => {
        logger.info('Prepare classes');
        this.configuration.mainData.classes = (someClasses) ? someClasses : $dependenciesEngine.getClasses();

        return new Promise((resolve, reject) => {
            let i = 0,
                len = this.configuration.mainData.classes.length,
                loop = () => {
                    if(i < len) {
                        if ($markdownengine.hasNeighbourReadmeFile(this.configuration.mainData.classes[i].file)) {
                            logger.info(` ${this.configuration.mainData.classes[i].name} has a README file, include it`);
                            let readme = $markdownengine.readNeighbourReadmeFile(this.configuration.mainData.classes[i].file);
                            this.configuration.mainData.classes[i].readme = marked(readme);
                        }
                        this.configuration.addPage({
                            path: 'classes',
                            name: this.configuration.mainData.classes[i].name,
                            context: 'class',
                            class: this.configuration.mainData.classes[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        i++;
                        loop();
                    } else {
                        resolve();
                    }
                }
            loop();
        });
    }

    prepareInterfaces(someInterfaces?) {
        logger.info('Prepare interfaces');
        this.configuration.mainData.interfaces = (someInterfaces) ? someInterfaces : $dependenciesEngine.getInterfaces();

        return new Promise((resolve, reject) => {
            let i = 0,
                len = this.configuration.mainData.interfaces.length,
                loop = () => {
                    if(i < len) {
                        if ($markdownengine.hasNeighbourReadmeFile(this.configuration.mainData.interfaces[i].file)) {
                            logger.info(` ${this.configuration.mainData.interfaces[i].name} has a README file, include it`);
                            let readme = $markdownengine.readNeighbourReadmeFile(this.configuration.mainData.interfaces[i].file);
                            this.configuration.mainData.interfaces[i].readme = marked(readme);
                        }
                        this.configuration.addPage({
                            path: 'interfaces',
                            name: this.configuration.mainData.interfaces[i].name,
                            context: 'interface',
                            interface: this.configuration.mainData.interfaces[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        i++;
                        loop();
                    } else {
                        resolve();
                    }
                }
            loop();
        });
    }

    prepareMiscellaneous(someMisc?) {
        logger.info('Prepare miscellaneous');
        this.configuration.mainData.miscellaneous = (someMisc) ? someMisc : $dependenciesEngine.getMiscellaneous();

        return new Promise((resolve, reject) => {
            this.configuration.addPage({
                name: 'miscellaneous',
                context: 'miscellaneous',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            resolve();
        });
    }

    prepareComponents(someComponents?) {
        logger.info('Prepare components');
        this.configuration.mainData.components = (someComponents) ? someComponents : $dependenciesEngine.getComponents();

        return new Promise((mainResolve, reject) => {
            let i = 0,
                len = this.configuration.mainData.components.length,
                loop = () => {
                    if( i <= len-1) {
                        let dirname = path.dirname(this.configuration.mainData.components[i].file),
                            handleTemplateurl = () => {
                                return new Promise((resolve, reject) => {
                                    let templatePath = path.resolve(dirname + path.sep + this.configuration.mainData.components[i].templateUrl);
                                    if (fs.existsSync(templatePath)) {
                                        fs.readFile(templatePath, 'utf8', (err, data) => {
                                            if (err) {
                                                logger.error(err);
                                                reject();
                                            } else {
                                                this.configuration.mainData.components[i].templateData = data;
                                                resolve();
                                            }
                                        });
                                    } else {
                                        logger.error(`Cannot read template for ${this.configuration.mainData.components[i].name}`);
                                    }
                                });
                            };
                        if ($markdownengine.hasNeighbourReadmeFile(this.configuration.mainData.components[i].file)) {
                            logger.info(` ${this.configuration.mainData.components[i].name} has a README file, include it`);
                            let readmeFile = $markdownengine.readNeighbourReadmeFile(this.configuration.mainData.components[i].file);
                            this.configuration.mainData.components[i].readme = marked(readmeFile);
                            this.configuration.addPage({
                                path: 'components',
                                name: this.configuration.mainData.components[i].name,
                                context: 'component',
                                component: this.configuration.mainData.components[i],
                                depth: 1,
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                            });
                            if (this.configuration.mainData.components[i].templateUrl.length > 0) {
                                logger.info(` ${this.configuration.mainData.components[i].name} has a templateUrl, include it`);
                                handleTemplateurl().then(() => {
                                    i++;
                                    loop();
                                }, (e) => {
                                    logger.error(e);
                                })
                            } else {
                                i++;
                                loop();
                            }
                        } else {
                            this.configuration.addPage({
                                path: 'components',
                                name: this.configuration.mainData.components[i].name,
                                context: 'component',
                                component: this.configuration.mainData.components[i],
                                depth: 1,
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                            });
                            if (this.configuration.mainData.components[i].templateUrl.length > 0) {
                                logger.info(` ${this.configuration.mainData.components[i].name} has a templateUrl, include it`);
                                handleTemplateurl().then(() => {
                                    i++;
                                    loop();
                                }, (e) => {
                                    logger.error(e);
                                })
                            } else {
                                i++;
                                loop();
                            }
                        }
                    } else {
                        mainResolve();
                    }
                };
            loop();
        });
    }

    prepareDirectives = (someDirectives?) => {
        logger.info('Prepare directives');

        this.configuration.mainData.directives = (someDirectives) ? someDirectives : $dependenciesEngine.getDirectives();

        return new Promise((resolve, reject) => {
            let i = 0,
                len = this.configuration.mainData.directives.length,
                loop = () => {
                    if(i < len) {
                        if ($markdownengine.hasNeighbourReadmeFile(this.configuration.mainData.directives[i].file)) {
                            logger.info(` ${this.configuration.mainData.directives[i].name} has a README file, include it`);
                            let readme = $markdownengine.readNeighbourReadmeFile(this.configuration.mainData.directives[i].file);
                            this.configuration.mainData.directives[i].readme = marked(readme);
                        }
                        this.configuration.addPage({
                            path: 'directives',
                            name: this.configuration.mainData.directives[i].name,
                            context: 'directive',
                            directive: this.configuration.mainData.directives[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        i++;
                        loop();
                    } else {
                        resolve();
                    }
                }
            loop();
        });
    }

    prepareInjectables(someInjectables?) {
        logger.info('Prepare injectables');

        this.configuration.mainData.injectables = (someInjectables) ? someInjectables : $dependenciesEngine.getInjectables();

        return new Promise((resolve, reject) => {
            let i = 0,
                len = this.configuration.mainData.injectables.length,
                loop = () => {
                    if(i < len) {
                        if ($markdownengine.hasNeighbourReadmeFile(this.configuration.mainData.injectables[i].file)) {
                            logger.info(` ${this.configuration.mainData.injectables[i].name} has a README file, include it`);
                            let readme = $markdownengine.readNeighbourReadmeFile(this.configuration.mainData.injectables[i].file);
                            this.configuration.mainData.injectables[i].readme = marked(readme);
                        }
                        this.configuration.addPage({
                            path: 'injectables',
                            name: this.configuration.mainData.injectables[i].name,
                            context: 'injectable',
                            injectable: this.configuration.mainData.injectables[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        i++;
                        loop();
                    } else {
                        resolve();
                    }
                }
            loop();
        });
    }

    prepareRoutes() {
        logger.info('Process routes');
        this.configuration.mainData.routes = $dependenciesEngine.getRoutes();

        return new Promise((resolve, reject) => {

            this.configuration.addPage({
                name: 'routes',
                context: 'routes',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });

            RouterParser.generateRoutesIndex(this.configuration.mainData.output, this.configuration.mainData.routes).then(() => {
                logger.info(' Routes index generated');
                resolve();
            }, (e) => {
                logger.error(e);
                reject();
            });

        });
    }

    prepareCoverage() {
        logger.info('Process documentation coverage report');

        return new Promise((resolve, reject) => {
            /*
             * loop with components, classes, injectables, interfaces, pipes
             */
            var files = [],
                totalProjectStatementDocumented = 0,
                getStatus = function(percent) {
                    var status;
                    if (percent <= 25) {
                        status = 'low';
                    } else if (percent > 25 && percent <= 50) {
                        status = 'medium';
                    } else if (percent > 50 && percent <= 75) {
                        status = 'good';
                    } else {
                        status = 'good';
                    }
                    return status;
                };

            _.forEach(this.configuration.mainData.components, (component) => {
                if (!component.propertiesClass ||
                    !component.methodsClass ||
                    !component.inputsClass ||
                    !component.outputsClass) {
                        return;
                    }
                let cl:any = {
                        filePath: component.file,
                        type: component.type,
                        linktype: component.type,
                        name: component.name
                    },
                    totalStatementDocumented = 0,
                    totalStatements = component.propertiesClass.length + component.methodsClass.length + component.inputsClass.length + component.outputsClass.length + 1; // +1 for component decorator comment

                if (component.constructorObj) {
                    totalStatements += 1;
                    if (component.constructorObj && component.constructorObj.description && component.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (component.description && component.description !== '') {
                    totalStatementDocumented += 1;
                }

                _.forEach(component.propertiesClass, (property) => {
                    if (property.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(property.description && property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(component.methodsClass, (method) => {
                    if (method.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(method.description && method.description !== '' && method.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(component.inputsClass, (input) => {
                    if (input.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(input.description && input.description !== '' && input.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(component.outputsClass, (output) => {
                    if (output.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(output.description && output.description !== '' && output.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });

                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                if(totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            })
            _.forEach(this.configuration.mainData.classes, (classe) => {
                if (!classe.properties ||
                    !classe.methods) {
                        return;
                    }
                let cl:any = {
                        filePath: classe.file,
                        type: 'class',
                        linktype: 'classe',
                        name: classe.name
                    },
                    totalStatementDocumented = 0,
                    totalStatements = classe.properties.length + classe.methods.length + 1; // +1 for class itself

                if (classe.constructorObj) {
                    totalStatements += 1;
                    if (classe.constructorObj && classe.constructorObj.description && classe.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (classe.description && classe.description !== '') {
                    totalStatementDocumented += 1;
                }

                _.forEach(classe.properties, (property) => {
                    if (property.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(property.description && property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(classe.methods, (method) => {
                    if (method.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(method.description && method.description !== '' && method.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });

                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                if(totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            _.forEach(this.configuration.mainData.injectables, (injectable) => {
                if (!injectable.properties ||
                    !injectable.methods) {
                        return;
                    }
                let cl:any = {
                        filePath: injectable.file,
                        type: injectable.type,
                        linktype: injectable.type,
                        name: injectable.name
                    },
                    totalStatementDocumented = 0,
                    totalStatements = injectable.properties.length + injectable.methods.length + 1; // +1 for injectable itself

                if (injectable.constructorObj) {
                    totalStatements += 1;
                    if (injectable.constructorObj && injectable.constructorObj.description && injectable.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (injectable.description && injectable.description !== '') {
                    totalStatementDocumented += 1;
                }

                _.forEach(injectable.properties, (property) => {
                    if (property.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(property.description && property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(injectable.methods, (method) => {
                    if (method.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(method.description && method.description !== '' && method.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });

                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                if(totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            _.forEach(this.configuration.mainData.interfaces, (inter) => {
                if (!inter.properties ||
                    !inter.methods) {
                        return;
                    }
                let cl:any = {
                        filePath: inter.file,
                        type: inter.type,
                        linktype: inter.type,
                        name: inter.name
                    },
                    totalStatementDocumented = 0,
                    totalStatements = inter.properties.length + inter.methods.length + 1; // +1 for interface itself

                if (inter.constructorObj) {
                    totalStatements += 1;
                    if (inter.constructorObj && inter.constructorObj.description && inter.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (inter.description && inter.description !== '') {
                    totalStatementDocumented += 1;
                }

                _.forEach(inter.properties, (property) => {
                    if (property.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(property.description && property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(inter.methods, (method) => {
                    if (method.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(method.description && method.description !== '' && method.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });

                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                if(totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            _.forEach(this.configuration.mainData.pipes, (pipe) => {
                let cl:any = {
                        filePath: pipe.file,
                        type: pipe.type,
                        linktype: pipe.type,
                        name: pipe.name
                    },
                    totalStatementDocumented = 0,
                    totalStatements = 1;
                if (pipe.description && pipe.description !== '') {
                    totalStatementDocumented += 1;
                }

                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            files = _.sortBy(files, ['filePath']);
            var coverageData = {
                count: (files.length > 0) ? Math.floor(totalProjectStatementDocumented / files.length) : 0,
                status: ''
            };
            coverageData.status = getStatus(coverageData.count);
            this.configuration.addPage({
                name: 'coverage',
                context: 'coverage',
                files: files,
                data: coverageData,
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            $htmlengine.generateCoverageBadge(this.configuration.mainData.output, coverageData);
            if (this.configuration.mainData.coverageTest) {
                if (coverageData.count >= this.configuration.mainData.coverageTestThreshold) {
                    logger.info('Documentation coverage is over threshold');
                    process.exit(0);
                } else {
                    logger.error('Documentation coverage is not over threshold');
                    process.exit(1);
                }
            } else {
                resolve();
            }
        });
    }

    processPages() {
        logger.info('Process pages');
        let pages = this.configuration.pages;
        Promise.all(
            pages.map((page, i) => {
                return new Promise((resolve, reject) => {
                    logger.info('Process page', page.name);
                    let htmlData = $htmlengine.render(this.configuration.mainData, page)
                    let finalPath = this.configuration.mainData.output;
                    if(this.configuration.mainData.output.lastIndexOf('/') === -1) {
                        finalPath += '/';
                    }
                    if (page.path) {
                        finalPath += page.path + '/';
                    }
                    finalPath += page.name + '.html';
                    $searchEngine.indexPage({
                        infos: page,
                        rawData: htmlData,
                        url: finalPath
                    });
                    fs.outputFile(path.resolve(finalPath), htmlData, function (err) {
                        if (err) {
                            logger.error('Error during ' + page.name + ' page generation');
                            reject();
                        } else {
                            resolve();
                        }
                    });
                });
            })
        ).then(() => {
            $searchEngine.generateSearchIndexJson(this.configuration.mainData.output).then(() => {
                if (this.configuration.mainData.additionalPages.length > 0) {
                    this.processAdditionalPages();
                } else {
                    if (this.configuration.mainData.assetsFolder !== '') {
                        this.processAssetsFolder();
                    }
                    this.processResources();
                }
            }, (e) =>  {
                logger.error(e);
            });
        })
        .catch((e) => {
            logger.error(e);
        });
    }

    processAdditionalPages() {
        logger.info('Process additional pages');
        let pages = this.configuration.mainData.additionalPages
        Promise.all(
            pages.map((page, i) => {
                return new Promise((resolve, reject) => {
                    logger.info('Process page', pages[i].name);
                    let htmlData = $htmlengine.render(this.configuration.mainData, pages[i])
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
                            reject();
                        } else {
                            resolve();
                        }
                    });
                });
            })
        ).then(() => {
            $searchEngine.generateSearchIndexJson(this.configuration.mainData.output).then(() => {
                if (this.configuration.mainData.assetsFolder !== '') {
                    this.processAssetsFolder();
                }
                this.processResources();
            }, (e) => {
                logger.error(e);
            });
        })
        .catch((e) => {
            logger.error(e);
        });
    }

    processAssetsFolder() {
        logger.info('Copy assets folder');

        if (!fs.existsSync(this.configuration.mainData.assetsFolder)) {
            logger.error(`Provided assets folder ${this.configuration.mainData.assetsFolder} did not exist`);
        } else {
            fs.copy(path.resolve(this.configuration.mainData.assetsFolder), path.resolve(process.cwd() + path.sep + this.configuration.mainData.output + path.sep + this.configuration.mainData.assetsFolder), function (err) {
                if(err) {
                    logger.error('Error during resources copy ', err);
                }
            });
        }
    }

    processResources() {
        logger.info('Copy main resources');

        const onComplete = () => {
            let finalTime = (new Date() - startTime) / 1000;
            logger.info('Documentation generated in ' + this.configuration.mainData.output + ' in ' + finalTime + ' seconds using ' + this.configuration.mainData.theme + ' theme');
            if (this.configuration.mainData.serve) {
                logger.info(`Serving documentation from ${this.configuration.mainData.output} at http://127.0.0.1:${this.configuration.mainData.port}`);
                this.runWebServer(this.configuration.mainData.output);
            }
        };

        let finalOutput = this.configuration.mainData.output.replace(process.cwd(), '');

        fs.copy(path.resolve(__dirname + '/../src/resources/'), path.resolve(process.cwd() + path.sep + finalOutput), (err) => {
            if(err) {
                logger.error('Error during resources copy ', err);
            }
            else {
                if (this.configuration.mainData.extTheme) {
                    fs.copy(path.resolve(process.cwd() + path.sep + this.configuration.mainData.extTheme), path.resolve(process.cwd() + path.sep + finalOutput + '/styles/'), function (err) {
                        if (err) {
                            logger.error('Error during external styling theme copy ', err);
                        } else {
                            logger.info('External styling theme copy succeeded');
                            onComplete();
                        }
                    });
                }
                else {
                    onComplete();
                }
            }
        });
    }

    processGraphs() {

        if (this.configuration.mainData.disableGraph) {
            logger.info('Graph generation disabled');
            this.processPages();
        } else {
            logger.info('Process main graph');

            let finalMainGraphPath = this.configuration.mainData.output;
            if(finalMainGraphPath.lastIndexOf('/') === -1) {
                finalMainGraphPath += '/';
            }
            finalMainGraphPath += 'graph';
            $ngdengine.renderGraph(this.configuration.mainData.tsconfig, path.resolve(finalMainGraphPath), 'p').then(() => {
                $ngdengine.readGraph(path.resolve(finalMainGraphPath + path.sep + 'dependencies.svg'), 'Main graph').then((data) => {
                    this.configuration.mainData.mainGraph = <string>data;
                    generateModulesGraph();
                }, (err) => {
                    logger.error('Error during graph read: ', err);
                });
            }, (err) => {
                logger.error('Error during graph generation: ', err);
            });

            let modules = this.configuration.mainData.modules,
                generateModulesGraph = () => {
                    Promise.all(
                        modules.map((module, i) => {
                            return new Promise((resolve, reject) => {
                                logger.info('Process module graph', modules[i].name);
                                let finalPath = this.configuration.mainData.output;
                                if(this.configuration.mainData.output.lastIndexOf('/') === -1) {
                                    finalPath += '/';
                                }
                                finalPath += 'modules/' + modules[i].name;
                                $ngdengine.renderGraph(modules[i].file, finalPath, 'f', modules[i].name).then(() => {
                                    $ngdengine.readGraph(path.resolve(finalPath + path.sep + 'dependencies.svg'), modules[i].name).then((data) => {
                                        modules[i].graph = <string>data;
                                        resolve();
                                    }, (err) => {
                                        logger.error('Error during graph read: ', err);
                                    });
                                }, (errorMessage) => {
                                    logger.error(errorMessage);
                                    reject();
                                });
                            });
                        })
                    ).then(() => {
                        this.processPages();
                    })
                    .catch((e) => {
                        logger.error(e);
                    });
                }
        }
    }

    runWebServer(folder) {
        if(!this.isWatching) {
            LiveServer.start({
                root: folder,
                open: this.configuration.mainData.open,
                quiet: true,
                logLevel: 0,
                wait: 1000,
                port: this.configuration.mainData.port
            });
        }
        if (this.configuration.mainData.watch && !this.isWatching) {
            this.runWatch();
        } else if (this.configuration.mainData.watch && this.isWatching) {
            let srcFolder = findMainSourceFolder(this.files);
            logger.info(`Already watching sources in ${srcFolder} folder`);
        }
    }

    runWatch() {
        let sources = [findMainSourceFolder(this.files)],
            watcherReady = false;

        this.isWatching = true;

        logger.info(`Watching sources in ${findMainSourceFolder(this.files)} folder`);

        if ($markdownengine.hasRootMarkdowns()) {
            sources = sources.concat($markdownengine.listRootMarkdowns());
        }

        if (this.configuration.mainData.includes !== '') {
            sources = sources.concat(this.configuration.mainData.includes);
        }

        let watcher = chokidar.watch(sources, {
                awaitWriteFinish: true,
                ignoreInitial: true,
                ignored: /(spec|\.d)\.ts/
            }),
            timerAddAndRemoveRef,
            timerChangeRef,
            waiterAddAndRemove = () => {
                clearTimeout(timerAddAndRemoveRef);
                timerAddAndRemoveRef = setTimeout(runnerAddAndRemove, 1000);
            },
            runnerAddAndRemove = () => {
                startTime = new Date();
                this.generate();
            },
            waiterChange = () => {
                clearTimeout(timerChangeRef);
                timerChangeRef = setTimeout(runnerChange, 1000);
            },
            runnerChange = () => {
                startTime = new Date();
                this.setUpdatedFiles(this.watchChangedFiles);
                if (this.hasWatchedFilesTSFiles()) {
                    this.getMicroDependenciesData();
                } else if (this.hasWatchedFilesRootMarkdownFiles()) {
                    this.rebuildRootMarkdowns();
                } else {
                    this.rebuildExternalDocumentation();
                }
            };

        watcher
            .on('ready', () => {
                if (!watcherReady) {
                    watcherReady = true;
                    watcher
                        .on('add', (file) => {
                            logger.debug(`File ${file} has been added`);
                            // Test extension, if ts
                            // rescan everything
                            if (path.extname(file) === '.ts') {
                                waiterAddAndRemove();
                            }
                        })
                        .on('change', (file) => {
                            logger.debug(`File ${file} has been changed`);
                            // Test extension, if ts
                            // rescan only file
                            if (path.extname(file) === '.ts' || path.extname(file) === '.md' || path.extname(file) === '.json') {
                                this.watchChangedFiles.push(path.join(process.cwd() + path.sep + file));
                                waiterChange();
                            }
                        })
                        .on('unlink', (file) => {
                            logger.debug(`File ${file} has been removed`);
                            // Test extension, if ts
                            // rescan everything
                            if (path.extname(file) === '.ts') {
                                waiterAddAndRemove();
                            }
                        });
                }
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
