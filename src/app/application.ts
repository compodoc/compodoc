import * as ts from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as _ from 'lodash';
import * as LiveServer from 'live-server';
import * as Shelljs from 'shelljs';
import marked from 'marked';

const glob: any = require('glob'),
      chokidar = require('chokidar');

import { logger } from '../logger';
import { HtmlEngine } from './engines/html.engine';
import { MarkdownEngine } from './engines/markdown.engine';
import { FileEngine } from './engines/file.engine';
import { Configuration, IConfiguration } from './configuration';
import { $dependenciesEngine } from './engines/dependencies.engine';
import { NgdEngine } from './engines/ngd.engine';
import { SearchEngine } from './engines/search.engine';
import { Dependencies } from './compiler/dependencies';
import { RouterParser } from '../utils/router.parser';

import { COMPODOC_DEFAULTS } from '../utils/defaults';

import { cleanNameWithoutSpaceAndToLowerCase, findMainSourceFolder } from '../utilities';

import { promiseSequential } from '../utils/promise-sequential';

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
     * Compodoc configuration local reference
     */
    configuration:IConfiguration;
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
        }
    }

    /**
     * Start compodoc process
     */
    protected generate() {
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
                context: 'readme',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            this.configuration.addPage({
                name: 'overview',
                context: 'overview',
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
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
            actions.push(() => { return this.prepareModules(diffCrawledData.modules); });
        }
        if (diffCrawledData.components.length > 0) {
            actions.push(() => { return this.prepareComponents(diffCrawledData.components); });
        }

        if (diffCrawledData.directives.length > 0) {
            actions.push(() => { return this.prepareDirectives(diffCrawledData.directives); });
        }

        if (diffCrawledData.injectables.length > 0) {
            actions.push(() => { return this.prepareInjectables(diffCrawledData.injectables); });
        }

        if (diffCrawledData.pipes.length > 0) {
            actions.push(() => { return this.preparePipes(diffCrawledData.pipes); });
        }

        if (diffCrawledData.classes.length > 0) {
            actions.push(() => { return this.prepareClasses(diffCrawledData.classes); });
        }

        if (diffCrawledData.interfaces.length > 0) {
            actions.push(() => { return this.prepareInterfaces(diffCrawledData.interfaces); });
        }

        if (diffCrawledData.miscellaneous.variables.length > 0 ||
            diffCrawledData.miscellaneous.functions.length > 0 ||
            diffCrawledData.miscellaneous.typealiases.length > 0 ||
            diffCrawledData.miscellaneous.enumerations.length > 0 ||
            diffCrawledData.miscellaneous.types.length > 0 ) {
            actions.push(() => { return this.prepareMiscellaneous(diffCrawledData.miscellaneous); });
        }

        actions.push(() => { return this.prepareCoverage(); });

        promiseSequential(actions)
            .then(res => {
                this.processGraphs();
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

            let len = this.configuration.mainData.modules.length;

            for(i; i<len; i++) {
                this.configuration.addPage({
                    path: 'modules',
                    name: this.configuration.mainData.modules[i].name,
                    context: 'module',
                    module: this.configuration.mainData.modules[i],
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }

            resolve();
        });
    }

    preparePipes = (somePipes?) => {
        logger.info('Prepare pipes');
        this.configuration.mainData.pipes = (somePipes) ? somePipes : $dependenciesEngine.getPipes();

        return new Promise((resolve, reject) => {
            let i = 0,
                len = this.configuration.mainData.pipes.length;

            for(i; i<len; i++) {
                this.configuration.addPage({
                    path: 'pipes',
                    name: this.configuration.mainData.pipes[i].name,
                    context: 'pipe',
                    pipe: this.configuration.mainData.pipes[i],
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            resolve();
        });
    }

    prepareClasses = (someClasses?) => {
        logger.info('Prepare classes');
        this.configuration.mainData.classes = (someClasses) ? someClasses : $dependenciesEngine.getClasses();

        return new Promise((resolve, reject) => {
            let i = 0,
                len = this.configuration.mainData.classes.length;

            for(i; i<len; i++) {
                this.configuration.addPage({
                    path: 'classes',
                    name: this.configuration.mainData.classes[i].name,
                    context: 'class',
                    class: this.configuration.mainData.classes[i],
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            resolve();
        });
    }

    prepareInterfaces(someInterfaces?) {
        logger.info('Prepare interfaces');
        this.configuration.mainData.interfaces = (someInterfaces) ? someInterfaces : $dependenciesEngine.getInterfaces();

        return new Promise((resolve, reject) => {
            let i = 0,
                len = this.configuration.mainData.interfaces.length;
            for(i; i<len; i++) {
                this.configuration.addPage({
                    path: 'interfaces',
                    name: this.configuration.mainData.interfaces[i].name,
                    context: 'interface',
                    interface: this.configuration.mainData.interfaces[i],
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            resolve();
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
                                    }
                                });
                            };
                        if ($markdownengine.componentHasReadmeFile(this.configuration.mainData.components[i].file)) {
                            logger.info(`${this.configuration.mainData.components[i].name} has a README file, include it`);
                            let readmeFile = $markdownengine.componentReadmeFile(this.configuration.mainData.components[i].file);
                            fs.readFile(readmeFile, 'utf8', (err, data) => {
                                if (err) throw err;
                                this.configuration.mainData.components[i].readme = marked(data);
                                this.configuration.addPage({
                                    path: 'components',
                                    name: this.configuration.mainData.components[i].name,
                                    context: 'component',
                                    component: this.configuration.mainData.components[i],
                                    depth: 1,
                                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                                });
                                if (this.configuration.mainData.components[i].templateUrl.length > 0) {
                                    logger.info(`${this.configuration.mainData.components[i].name} has a templateUrl, include it`);
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
                            });
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
                                logger.info(`${this.configuration.mainData.components[i].name} has a templateUrl, include it`);
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
                len = this.configuration.mainData.directives.length;

            for(i; i<len; i++) {
                this.configuration.addPage({
                    path: 'directives',
                    name: this.configuration.mainData.directives[i].name,
                    context: 'directive',
                    directive: this.configuration.mainData.directives[i],
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            resolve();
        });
    }

    prepareInjectables(someInjectables?) {
        logger.info('Prepare injectables');

        this.configuration.mainData.injectables = (someInjectables) ? someInjectables : $dependenciesEngine.getInjectables();

        return new Promise((resolve, reject) => {
            let i = 0,
                len = this.configuration.mainData.injectables.length;

            for(i; i<len; i++) {
                this.configuration.addPage({
                    path: 'injectables',
                    name: this.configuration.mainData.injectables[i].name,
                    context: 'injectable',
                    injectable: this.configuration.mainData.injectables[i],
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            resolve();
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
                logger.info('Routes index generated');
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
                    if (component.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (component.description !== '') {
                    totalStatementDocumented += 1;
                }

                _.forEach(component.propertiesClass, (property) => {
                    if (property.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(component.methodsClass, (method) => {
                    if (method.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(method.description !== '' && method.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(component.inputsClass, (input) => {
                    if (input.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(input.description !== '' && input.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(component.outputsClass, (output) => {
                    if (output.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(output.description !== '' && output.modifierKind !== 111) {
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
                    if (classe.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (classe.description !== '') {
                    totalStatementDocumented += 1;
                }

                _.forEach(classe.properties, (property) => {
                    if (property.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(classe.methods, (method) => {
                    if (method.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(method.description !== '' && method.modifierKind !== 111) {
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
                    if (injectable.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (injectable.description !== '') {
                    totalStatementDocumented += 1;
                }

                _.forEach(injectable.properties, (property) => {
                    if (property.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(injectable.methods, (method) => {
                    if (method.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(method.description !== '' && method.modifierKind !== 111) {
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
                    if (inter.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (inter.description !== '') {
                    totalStatementDocumented += 1;
                }

                _.forEach(inter.properties, (property) => {
                    if (property.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(inter.methods, (method) => {
                    if (method.modifierKind === 111) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if(method.description !== '' && method.modifierKind !== 111) {
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
                if (pipe.description !== '') {
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
                    $searchEngine.generateSearchIndexJson(this.configuration.mainData.output).then(() => {
                        if (this.configuration.mainData.additionalPages.length > 0) {
                            this.processAdditionalPages();
                        } else {
                            if (this.configuration.mainData.assetsFolder !== '') {
                                this.processAssetsFolder();
                            }
                            this.processResources();
                        }
                    }, (e) => {
                        logger.error(e);
                    });
                }
            };
        loop();
    }

    processAdditionalPages() {
        logger.info('Process additional pages');
        let pages = this.configuration.mainData.additionalPages,
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
                        finalPath += pages[i].filename + '.html';
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
                    $searchEngine.generateSearchIndexJson(this.configuration.mainData.output).then(() => {
                        if (this.configuration.mainData.assetsFolder !== '') {
                            this.processAssetsFolder();
                        }
                        this.processResources();
                    }, (e) => {
                        logger.error(e);
                    });
                }
            };
        loop();
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

        fs.copy(path.resolve(__dirname + '/../src/resources/'), path.resolve(process.cwd() + path.sep + this.configuration.mainData.output), (err) => {
            if(err) {
                logger.error('Error during resources copy ', err);
            }
            else {
                if (this.configuration.mainData.extTheme) {
                    fs.copy(path.resolve(process.cwd() + path.sep + this.configuration.mainData.extTheme), path.resolve(process.cwd() + path.sep + this.configuration.mainData.output + '/styles/'), function (err) {
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
                      $ngdengine.renderGraph(modules[i].file, finalPath, 'f', modules[i].name).then(() => {
                          $ngdengine.readGraph(path.resolve(finalPath + path.sep + 'dependencies.svg'), modules[i].name).then((data) => {
                              modules[i].graph = <string>data;
                              i++;
                              loop();
                          }, (err) => {
                              logger.error('Error during graph read: ', err);
                          });
                      }, (errorMessage) => {
                          logger.error(errorMessage);
                      });
                  } else {
                      this.processPages();
                  }
              };
            let finalMainGraphPath = this.configuration.mainData.output;
            if(finalMainGraphPath.lastIndexOf('/') === -1) {
                finalMainGraphPath += '/';
            }
            finalMainGraphPath += 'graph';
            $ngdengine.renderGraph(this.configuration.mainData.tsconfig, path.resolve(finalMainGraphPath), 'p').then(() => {
                $ngdengine.readGraph(path.resolve(finalMainGraphPath + path.sep + 'dependencies.svg'), 'Main graph').then((data) => {
                    this.configuration.mainData.mainGraph = <string>data;
                    loop();
                }, (err) => {
                    logger.error('Error during graph read: ', err);
                });
            }, (err) => {
                logger.error('Error during graph generation: ', err);
            });

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
        let srcFolder = findMainSourceFolder(this.files),
            watchChangedFiles = [];

        this.isWatching = true;

        logger.info(`Watching sources in ${srcFolder} folder`);
        let watcher = chokidar.watch(srcFolder, {
                awaitWriteFinish: true,
                ignored: /(spec|\.d)\.ts/
            }),
            timerAddAndRemoveRef,
            timerChangeRef,
            waiterAddAndRemove = () => {
                clearTimeout(timerAddAndRemoveRef);
                timerAddAndRemoveRef = setTimeout(runnerAddAndRemove, 1000);
            },
            runnerAddAndRemove = () => {
                this.generate();
            },
            waiterChange = () => {
                clearTimeout(timerChangeRef);
                timerChangeRef = setTimeout(runnerChange, 1000);
            },
            runnerChange = () => {
                this.setUpdatedFiles(watchChangedFiles);
                this.getMicroDependenciesData();
            };
        watcher
            .on('ready', () => {
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
                        if (path.extname(file) === '.ts') {
                            watchChangedFiles.push(path.join(process.cwd() + path.sep + file));
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
