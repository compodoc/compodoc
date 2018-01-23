import * as fs from 'fs-extra';
import * as path from 'path';
import * as LiveServer from 'live-server';
import * as _ from 'lodash';
import * as ts from 'typescript';

const chokidar = require('chokidar');
const marked = require('marked');

import { logger } from '../logger';
import { HtmlEngine } from './engines/html.engine';
import { MarkdownEngine } from './engines/markdown.engine';
import { FileEngine } from './engines/file.engine';
import { Configuration } from './configuration';
import { ConfigurationInterface } from './interfaces/configuration.interface';
import { NgdEngine } from './engines/ngd.engine';
import { SearchEngine } from './engines/search.engine';
import { ExportEngine } from './engines/export.engine';
import { Dependencies } from './compiler/dependencies';

import { COMPODOC_DEFAULTS } from '../utils/defaults';

import { cleanSourcesForWatch } from '../utils/utils';

import { cleanNameWithoutSpaceAndToLowerCase, findMainSourceFolder } from '../utilities';

import { promiseSequential } from '../utils/promise-sequential';
import { DependenciesEngine } from './engines/dependencies.engine';
import { AngularVersionUtil, RouterParserUtil } from '../utils';

let cwd = process.cwd();
let $markdownengine = new MarkdownEngine();
let startTime = new Date();
let generationPromiseResolve;
let generationPromiseReject;
let generationPromise = new Promise((resolve, reject) => {
    generationPromiseResolve = resolve;
    generationPromiseReject = reject;
});

export class Application {
    /**
     * Files processed during initial scanning
     */
    public files: Array<string>;
    /**
     * Files processed during watch scanning
     */
    public updatedFiles: Array<string>;
    /**
     * Files changed during watch scanning
     */
    public watchChangedFiles: Array<string> = [];
    /**
     * Compodoc configuration local reference
     */
    public configuration: ConfigurationInterface;
    /**
     * Boolean for watching status
     * @type {boolean}
     */
    public isWatching: boolean = false;

    private angularVersionUtil = new AngularVersionUtil();
    private dependenciesEngine: DependenciesEngine;
    private ngdEngine: NgdEngine;
    private htmlEngine: HtmlEngine;
    private searchEngine: SearchEngine;
    private exportEngine: ExportEngine;
    protected fileEngine: FileEngine = new FileEngine();
    private routerParser = new RouterParserUtil();

    /**
     * Create a new compodoc application instance.
     *
     * @param options An object containing the options that should be used.
     */
    constructor(options?: Object) {
        this.configuration = new Configuration();
        this.dependenciesEngine = new DependenciesEngine();
        this.ngdEngine = new NgdEngine(this.dependenciesEngine);
        this.htmlEngine = new HtmlEngine(this.configuration, this.dependenciesEngine, this.fileEngine);
        this.searchEngine = new SearchEngine(this.configuration, this.fileEngine);
        this.exportEngine = new ExportEngine(this.configuration, this.dependenciesEngine, this.fileEngine);

        for (let option in options) {
            if (typeof this.configuration.mainData[option] !== 'undefined') {
                this.configuration.mainData[option] = options[option];
            }
            // For documentationMainName, process it outside the loop, for handling conflict with pages name
            if (option === 'name') {
                this.configuration.mainData.documentationMainName = options[option];
            }
            // For documentationMainName, process it outside the loop, for handling conflict with pages name
            if (option === 'silent') {
                logger.silent = false;
            }
        }
    }

    /**
     * Start compodoc process
     */
    protected generate(): Promise<{}> {

        process.on('unhandledRejection', this.unhandledRejectionListener);
        process.on('uncaughtException', this.uncaughtExceptionListener);

        if (this.configuration.mainData.output.charAt(this.configuration.mainData.output.length - 1) !== '/') {
            this.configuration.mainData.output += '/';
        }

        if (this.configuration.mainData.exportFormat !== COMPODOC_DEFAULTS.exportFormat) {
            this.processPackageJson();
        } else {
            this.htmlEngine.init()
                .then(() => this.processPackageJson());
        }
        return generationPromise;
    }

    private endCallback() {
        process.removeListener('unhandledRejection', this.unhandledRejectionListener);
        process.removeListener('uncaughtException', this.uncaughtExceptionListener);
    }

    private unhandledRejectionListener(err, p) {
        console.log('Unhandled Rejection at:', p, 'reason:', err);
        logger.error('Sorry, but there was a problem during parsing or generation of the documentation. Please fill an issue on github. (https://github.com/compodoc/compodoc/issues/new)');// tslint:disable-line
        process.exit(1);
    }

    private uncaughtExceptionListener(err) {
        logger.error(err);
        logger.error('Sorry, but there was a problem during parsing or generation of the documentation. Please fill an issue on github. (https://github.com/compodoc/compodoc/issues/new)');// tslint:disable-line
        process.exit(1);
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
    public setFiles(files: Array<string>) {
        this.files = files;
    }

    /**
     * Store files for watch processing
     * @param  {Array<string>} files Files found during source folder and tsconfig scan
     */
    public setUpdatedFiles(files: Array<string>) {
        this.updatedFiles = files;
    }

    /**
     * Return a boolean indicating presence of one TypeScript file in updatedFiles list
     * @return {boolean} Result of scan
     */
    public hasWatchedFilesTSFiles(): boolean {
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
    public hasWatchedFilesRootMarkdownFiles(): boolean {
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
    public clearUpdatedFiles(): void {
        this.updatedFiles = [];
        this.watchChangedFiles = [];
    }

    private processPackageJson(): void {
        logger.info('Searching package.json file');
        this.fileEngine.get(process.cwd() + path.sep + 'package.json').then((packageData) => {
            let parsedData = JSON.parse(packageData);
            if (typeof parsedData.name !== 'undefined' && this.configuration.mainData.documentationMainName === COMPODOC_DEFAULTS.title) {
                this.configuration.mainData.documentationMainName = parsedData.name + ' documentation';
            }
            if (typeof parsedData.description !== 'undefined') {
                this.configuration.mainData.documentationMainDescription = parsedData.description;
            }
            this.configuration.mainData.angularVersion = this.angularVersionUtil.getAngularVersionOfProject(parsedData);
            logger.info('package.json file found');

            if (typeof parsedData.dependencies !== 'undefined') {
                this.processPackageDependencies(parsedData.dependencies);
            }

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
            }, (errorMessage1) => {
                logger.error(errorMessage1);
            });
        });
    }

    private processPackageDependencies(dependencies): void {
        logger.info('Processing package.json dependencies');
        this.configuration.mainData.packageDependencies = dependencies;
        this.configuration.addPage({
            name: 'dependencies',
            id: 'packageDependencies',
            context: 'package-dependencies',
            depth: 0,
            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
        });
    }

    private processMarkdowns(): Promise<any> {
        logger.info('Searching README.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE.md, TODO.md files');

        return new Promise((resolve, reject) => {
            let i = 0;
            let markdowns = ['readme', 'changelog', 'contributing', 'license', 'todo'];
            let numberOfMarkdowns = 5;
            let loop = () => {
                if (i < numberOfMarkdowns) {
                    $markdownengine.getTraditionalMarkdown(markdowns[i].toUpperCase()).then((readmeData: string) => {
                        this.configuration.addPage({
                            name: (markdowns[i] === 'readme') ? 'index' : markdowns[i],
                            context: 'getting-started',
                            id: 'getting-started',
                            markdown: readmeData,
                            depth: 0,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                        });
                        if (markdowns[i] === 'readme') {
                            this.configuration.mainData.readme = true;
                            this.configuration.addPage({
                                name: 'overview',
                                id: 'overview',
                                context: 'overview',
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                            });
                        } else {
                            this.configuration.mainData.markdowns.push({
                                name: markdowns[i],
                                uppername: markdowns[i].toUpperCase(),
                                depth: 0,
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                            });
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
                                id: 'index',
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

    private rebuildRootMarkdowns(): void {
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
    private getMicroDependenciesData(): void {
        logger.info('Get diff dependencies data');
        let crawler = new Dependencies(
            this.updatedFiles, {
                tsconfigDirectory: path.dirname(this.configuration.mainData.tsconfig)
            },
            this.configuration,
            this.routerParser
        );

        let dependenciesData = crawler.getDependencies();

        this.dependenciesEngine.update(dependenciesData);

        this.prepareJustAFewThings(dependenciesData);
    }

    /**
     * Rebuild external documentation during watch process
     */
    private rebuildExternalDocumentation(): void {
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

    private getDependenciesData(): void {
        logger.info('Get dependencies data');

        let crawler = new Dependencies(
            this.files, {
                tsconfigDirectory: path.dirname(this.configuration.mainData.tsconfig)
            },
            this.configuration,
            this.routerParser
        );

        let dependenciesData = crawler.getDependencies();

        this.dependenciesEngine.init(dependenciesData);

        this.configuration.mainData.routesLength = this.routerParser.routesLength();

        this.printStatistics();

        this.prepareEverything();
    }

    private prepareJustAFewThings(diffCrawledData): void {
        let actions = [];

        this.configuration.resetPages();

        actions.push(() => this.prepareRoutes());

        if (diffCrawledData.modules.length > 0) {
            actions.push(() => this.prepareModules());
        }
        if (diffCrawledData.components.length > 0) {
            actions.push(() => this.prepareComponents());
        }

        if (diffCrawledData.directives.length > 0) {
            actions.push(() => this.prepareDirectives());
        }

        if (diffCrawledData.injectables.length > 0) {
            actions.push(() => this.prepareInjectables());
        }

        if (diffCrawledData.interceptors.length > 0) {
            actions.push(() => this.prepareInterceptors());
        }

        if (diffCrawledData.pipes.length > 0) {
            actions.push(() => this.preparePipes());
        }

        if (diffCrawledData.classes.length > 0) {
            actions.push(() => this.prepareClasses());
        }

        if (diffCrawledData.interfaces.length > 0) {
            actions.push(() => this.prepareInterfaces());
        }

        if (diffCrawledData.miscellaneous.variables.length > 0 ||
            diffCrawledData.miscellaneous.functions.length > 0 ||
            diffCrawledData.miscellaneous.typealiases.length > 0 ||
            diffCrawledData.miscellaneous.enumerations.length > 0) {
            actions.push(() => this.prepareMiscellaneous());
        }

        if (!this.configuration.mainData.disableCoverage) {
            actions.push(() => this.prepareCoverage());
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

    private printStatistics() {
        logger.info('-------------------');
        logger.info('Project statistics ');
        if (this.dependenciesEngine.modules.length > 0) {
            logger.info(`- module     : ${this.dependenciesEngine.modules.length}`);
        }
        if (this.dependenciesEngine.components.length > 0) {
            logger.info(`- component  : ${this.dependenciesEngine.components.length}`);
        }
        if (this.dependenciesEngine.directives.length > 0) {
            logger.info(`- directive  : ${this.dependenciesEngine.directives.length}`);
        }
        if (this.dependenciesEngine.injectables.length > 0) {
            logger.info(`- injectable : ${this.dependenciesEngine.injectables.length}`);
        }
        if (this.dependenciesEngine.interceptors.length > 0) {
            logger.info(`- injector   : ${this.dependenciesEngine.interceptors.length}`);
        }
        if (this.dependenciesEngine.pipes.length > 0) {
            logger.info(`- pipe       : ${this.dependenciesEngine.pipes.length}`);
        }
        if (this.dependenciesEngine.classes.length > 0) {
            logger.info(`- class      : ${this.dependenciesEngine.classes.length}`);
        }
        if (this.dependenciesEngine.interfaces.length > 0) {
            logger.info(`- interface  : ${this.dependenciesEngine.interfaces.length}`);
        }
        if (this.configuration.mainData.routesLength > 0) {
            logger.info(`- route      : ${this.configuration.mainData.routesLength}`);
        }
        logger.info('-------------------');
    }

    private prepareEverything() {
        let actions = [];

        actions.push(() => { return this.prepareModules(); });
        actions.push(() => { return this.prepareComponents(); });

        if (this.dependenciesEngine.directives.length > 0) {
            actions.push(() => { return this.prepareDirectives(); });
        }

        if (this.dependenciesEngine.injectables.length > 0) {
            actions.push(() => { return this.prepareInjectables(); });
        }

        if (this.dependenciesEngine.interceptors.length > 0) {
            actions.push(() => { return this.prepareInterceptors(); });
        }

        if (this.dependenciesEngine.routes && this.dependenciesEngine.routes.children.length > 0) {
            actions.push(() => { return this.prepareRoutes(); });
        }

        if (this.dependenciesEngine.pipes.length > 0) {
            actions.push(() => { return this.preparePipes(); });
        }

        if (this.dependenciesEngine.classes.length > 0) {
            actions.push(() => { return this.prepareClasses(); });
        }

        if (this.dependenciesEngine.interfaces.length > 0) {
            actions.push(() => { return this.prepareInterfaces(); });
        }

        if (this.dependenciesEngine.miscellaneous.variables.length > 0 ||
            this.dependenciesEngine.miscellaneous.functions.length > 0 ||
            this.dependenciesEngine.miscellaneous.typealiases.length > 0 ||
            this.dependenciesEngine.miscellaneous.enumerations.length > 0) {
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
                if (this.configuration.mainData.exportFormat !== COMPODOC_DEFAULTS.exportFormat) {
                    if (COMPODOC_DEFAULTS.exportFormatsSupported.indexOf(this.configuration.mainData.exportFormat) > -1) {
                        logger.info(`Generating documentation in export format ${this.configuration.mainData.exportFormat}`);
                        this.exportEngine.export(this.configuration.mainData.output, this.configuration.mainData).then(() => {
                            generationPromiseResolve();
                            this.endCallback();
                            logger.info('Documentation generated in ' + this.configuration.mainData.output +
                                ' in ' + this.getElapsedTime() + ' seconds');
                        });
                    } else {
                        logger.warn(`Exported format not supported`);
                    }
                } else {
                    this.processGraphs();
                }
            })
            .catch(errorMessage => {
                logger.error(errorMessage);
            });
    }


    private getIncludedPathForFile(file) {
      return path.join(this.configuration.mainData.includes, file);
    }

    private prepareExternalIncludes() {
        logger.info('Adding external markdown files');
        // Scan include folder for files detailed in summary.json
        // For each file, add to this.configuration.mainData.additionalPages
        // Each file will be converted to html page, inside COMPODOC_DEFAULTS.additionalEntryPath
        return new Promise((resolve, reject) => {
            this.fileEngine.get(this.getIncludedPathForFile('summary.json'))
                .then((summaryData) => {
                    logger.info('Additional documentation: summary.json file found');

                    const parsedSummaryData = JSON.parse(summaryData);

                    // Loop for every "collection of items", children included
                    const loop = (items, depth = 1, father = '') => {
                        if (depth > 5) {
                          logger.error('Only 5 levels of depth are supported');
                          return;
                        }
                        // index will be scoped on every deepth collection
                        let i = 0;
                        const len = items.length;
                        const internalLoop = () => {
                            if (i <= len - 1) {
                                $markdownengine.getTraditionalMarkdown(this.getIncludedPathForFile(items[i].file))
                                .then((markedData) => {
                                    const url = cleanNameWithoutSpaceAndToLowerCase(items[i].title);

                                    this.configuration.addAdditionalPage({
                                        name: items[i].title,
                                        id: items[i].title,
                                        filename: url,
                                        context: 'additional-page',
                                        path: this.configuration.mainData.includesFolder + father,
                                        additionalPage: markedData,
                                        depth: depth,
                                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                                    });

                                    if (items[i].children && items[i].children.length > 0) {
                                        loop(items[i].children, depth+1, father + '/' + url);
                                    }
                                    i++;
                                    internalLoop();
                                }, (e) => {
                                    logger.error(e);
                                });
                            } else {
                              if (depth === 1) {
                                resolve();
                              }
                            }
                        };
                        internalLoop();
                    };
                    loop(parsedSummaryData);
                }, (errorMessage) => {
                    logger.error(errorMessage);
                    reject('Error during Additional documentation generation');
                });
        });
    }

    public prepareModules(someModules?): Promise<any> {
        logger.info('Prepare modules');
        let i = 0;
        let _modules = (someModules) ? someModules : this.dependenciesEngine.getModules();

        return new Promise((resolve, reject) => {

            this.configuration.mainData.modules = _modules.map(ngModule => {
                ['declarations', 'bootstrap', 'imports', 'exports'].forEach(metadataType => {
                    ngModule[metadataType] = ngModule[metadataType].filter(metaDataItem => {
                        switch (metaDataItem.type) {
                            case 'directive':
                                return this.dependenciesEngine.getDirectives().some(
                                    directive => (directive as any).name === metaDataItem.name
                                );

                            case 'component':
                                return this.dependenciesEngine.getComponents().some(
                                    component => (component as any).name === metaDataItem.name
                                );

                            case 'module':
                                return this.dependenciesEngine.getModules().some(
                                    module => (module as any).name === metaDataItem.name
                                );

                            case 'pipe':
                                return this.dependenciesEngine.getPipes().some(
                                    pipe => (pipe as any).name === metaDataItem.name
                                );

                            default:
                                return true;
                        }
                    });
                });
                ngModule.providers = ngModule.providers.filter(provider => {
                    return this.dependenciesEngine.getInjectables().some(injectable => (injectable as any).name === provider.name) ||
                           this.dependenciesEngine.getInterceptors().some(interceptor => (interceptor as any).name === provider.name);
                });
                // Try fixing type undefined for each providers
                _.forEach(ngModule.providers, (provider) => {
                    if (this.dependenciesEngine.getInjectables().find(injectable => (injectable as any).name === provider.name)) {
                        provider.type = 'injectable';
                    }
                    if (this.dependenciesEngine.getInterceptors().find(interceptor => (interceptor as any).name === provider.name)) {
                        provider.type = 'interceptor';
                    }
                });
                return ngModule;
            });
            this.configuration.addPage({
                name: 'modules',
                id: 'modules',
                context: 'modules',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });

            let len = this.configuration.mainData.modules.length;
            let loop = () => {
                if (i < len) {
                    if ($markdownengine.hasNeighbourReadmeFile(this.configuration.mainData.modules[i].file)) {
                        logger.info(` ${this.configuration.mainData.modules[i].name} has a README file, include it`);
                        let readme = $markdownengine.readNeighbourReadmeFile(this.configuration.mainData.modules[i].file);
                        this.configuration.mainData.modules[i].readme = marked(readme);
                    }
                    this.configuration.addPage({
                        path: 'modules',
                        name: this.configuration.mainData.modules[i].name,
                        id: this.configuration.mainData.modules[i].id,
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
            };
            loop();
        });
    }

    public preparePipes = (somePipes?) => {
        logger.info('Prepare pipes');
        this.configuration.mainData.pipes = (somePipes) ? somePipes : this.dependenciesEngine.getPipes();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.pipes.length;
            let loop = () => {
                if (i < len) {
                    if ($markdownengine.hasNeighbourReadmeFile(this.configuration.mainData.pipes[i].file)) {
                        logger.info(` ${this.configuration.mainData.pipes[i].name} has a README file, include it`);
                        let readme = $markdownengine.readNeighbourReadmeFile(this.configuration.mainData.pipes[i].file);
                        this.configuration.mainData.pipes[i].readme = marked(readme);
                    }
                    this.configuration.addPage({
                        path: 'pipes',
                        name: this.configuration.mainData.pipes[i].name,
                        id: this.configuration.mainData.pipes[i].id,
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
            };
            loop();
        });
    }

    public prepareClasses = (someClasses?) => {
        logger.info('Prepare classes');
        this.configuration.mainData.classes = (someClasses) ? someClasses : this.dependenciesEngine.getClasses();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.classes.length;
            let loop = () => {
                if (i < len) {
                    if ($markdownengine.hasNeighbourReadmeFile(this.configuration.mainData.classes[i].file)) {
                        logger.info(` ${this.configuration.mainData.classes[i].name} has a README file, include it`);
                        let readme = $markdownengine.readNeighbourReadmeFile(this.configuration.mainData.classes[i].file);
                        this.configuration.mainData.classes[i].readme = marked(readme);
                    }
                    this.configuration.addPage({
                        path: 'classes',
                        name: this.configuration.mainData.classes[i].name,
                        id: this.configuration.mainData.classes[i].id,
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
            };
            loop();
        });
    }

    public prepareInterfaces(someInterfaces?) {
        logger.info('Prepare interfaces');
        this.configuration.mainData.interfaces = (someInterfaces) ? someInterfaces : this.dependenciesEngine.getInterfaces();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.interfaces.length;
            let loop = () => {
                if (i < len) {
                    if ($markdownengine.hasNeighbourReadmeFile(this.configuration.mainData.interfaces[i].file)) {
                        logger.info(` ${this.configuration.mainData.interfaces[i].name} has a README file, include it`);
                        let readme = $markdownengine.readNeighbourReadmeFile(this.configuration.mainData.interfaces[i].file);
                        this.configuration.mainData.interfaces[i].readme = marked(readme);
                    }
                    this.configuration.addPage({
                        path: 'interfaces',
                        name: this.configuration.mainData.interfaces[i].name,
                        id: this.configuration.mainData.interfaces[i].id,
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
            };
            loop();
        });
    }

    public prepareMiscellaneous(someMisc?) {
        logger.info('Prepare miscellaneous');
        this.configuration.mainData.miscellaneous = (someMisc) ? someMisc : this.dependenciesEngine.getMiscellaneous();

        return new Promise((resolve, reject) => {

            if (this.configuration.mainData.miscellaneous.functions.length > 0) {
                this.configuration.addPage({
                    path: 'miscellaneous',
                    name: 'functions',
                    id: 'miscellaneous-functions',
                    context: 'miscellaneous-functions',
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            if (this.configuration.mainData.miscellaneous.variables.length > 0) {
                this.configuration.addPage({
                    path: 'miscellaneous',
                    name: 'variables',
                    id: 'miscellaneous-variables',
                    context: 'miscellaneous-variables',
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            if (this.configuration.mainData.miscellaneous.typealiases.length > 0) {
                this.configuration.addPage({
                    path: 'miscellaneous',
                    name: 'typealiases',
                    id: 'miscellaneous-typealiases',
                    context: 'miscellaneous-typealiases',
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            if (this.configuration.mainData.miscellaneous.enumerations.length > 0) {
                this.configuration.addPage({
                    path: 'miscellaneous',
                    name: 'enumerations',
                    id: 'miscellaneous-enumerations',
                    context: 'miscellaneous-enumerations',
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }

            resolve();
        });
    }

    private handleTemplateurl(component): Promise<any> {
        let dirname = path.dirname(component.file);
        let templatePath = path.resolve(dirname + path.sep + component.templateUrl);

        if (!this.fileEngine.existsSync(templatePath)) {
            let err = `Cannot read template for ${component.name}`;
            logger.error(err);
            return new Promise((resolve, reject) => { });
        }

        return this.fileEngine.get(templatePath)
            .then(data => component.templateData = data,
            err => {
                logger.error(err);
                return Promise.reject('');
            });
    }

    public prepareComponents(someComponents?) {
        logger.info('Prepare components');
        this.configuration.mainData.components = (someComponents) ? someComponents : this.dependenciesEngine.getComponents();

        return new Promise((mainResolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.components.length;
            let loop = () => {
                if (i <= len - 1) {
                    if ($markdownengine.hasNeighbourReadmeFile(this.configuration.mainData.components[i].file)) {
                        logger.info(` ${this.configuration.mainData.components[i].name} has a README file, include it`);
                        let readmeFile = $markdownengine.readNeighbourReadmeFile(this.configuration.mainData.components[i].file);
                        this.configuration.mainData.components[i].readme = marked(readmeFile);
                        this.configuration.addPage({
                            path: 'components',
                            name: this.configuration.mainData.components[i].name,
                            id: this.configuration.mainData.components[i].id,
                            context: 'component',
                            component: this.configuration.mainData.components[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        if (this.configuration.mainData.components[i].templateUrl.length > 0) {
                            logger.info(` ${this.configuration.mainData.components[i].name} has a templateUrl, include it`);
                            this.handleTemplateurl(this.configuration.mainData.components[i]).then(() => {
                                i++;
                                loop();
                            }, (e) => {
                                logger.error(e);
                            });
                        } else {
                            i++;
                            loop();
                        }
                    } else {
                        this.configuration.addPage({
                            path: 'components',
                            name: this.configuration.mainData.components[i].name,
                            id: this.configuration.mainData.components[i].id,
                            context: 'component',
                            component: this.configuration.mainData.components[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        if (this.configuration.mainData.components[i].templateUrl.length > 0) {
                            logger.info(` ${this.configuration.mainData.components[i].name} has a templateUrl, include it`);
                            this.handleTemplateurl(this.configuration.mainData.components[i]).then(() => {
                                i++;
                                loop();
                            }, (e) => {
                                logger.error(e);
                            });
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

    public prepareDirectives(someDirectives?) {
        logger.info('Prepare directives');

        this.configuration.mainData.directives = (someDirectives) ? someDirectives : this.dependenciesEngine.getDirectives();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.directives.length;
            let loop = () => {
                if (i < len) {
                    if ($markdownengine.hasNeighbourReadmeFile(this.configuration.mainData.directives[i].file)) {
                        logger.info(` ${this.configuration.mainData.directives[i].name} has a README file, include it`);
                        let readme = $markdownengine.readNeighbourReadmeFile(this.configuration.mainData.directives[i].file);
                        this.configuration.mainData.directives[i].readme = marked(readme);
                    }
                    this.configuration.addPage({
                        path: 'directives',
                        name: this.configuration.mainData.directives[i].name,
                        id: this.configuration.mainData.directives[i].id,
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
            };
            loop();
        });
    }

    public prepareInjectables(someInjectables?): Promise<void> {
        logger.info('Prepare injectables');

        this.configuration.mainData.injectables = (someInjectables) ? someInjectables : this.dependenciesEngine.getInjectables();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.injectables.length;
            let loop = () => {
                if (i < len) {
                    if ($markdownengine.hasNeighbourReadmeFile(this.configuration.mainData.injectables[i].file)) {
                        logger.info(` ${this.configuration.mainData.injectables[i].name} has a README file, include it`);
                        let readme = $markdownengine.readNeighbourReadmeFile(this.configuration.mainData.injectables[i].file);
                        this.configuration.mainData.injectables[i].readme = marked(readme);
                    }
                    this.configuration.addPage({
                        path: 'injectables',
                        name: this.configuration.mainData.injectables[i].name,
                        id: this.configuration.mainData.injectables[i].id,
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
            };
            loop();
        });
    }

    public prepareInterceptors(someInterceptors?): Promise<void> {
        logger.info('Prepare interceptors');

        this.configuration.mainData.interceptors = (someInterceptors) ? someInterceptors : this.dependenciesEngine.getInterceptors();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.interceptors.length;
            let loop = () => {
                if (i < len) {
                    if ($markdownengine.hasNeighbourReadmeFile(this.configuration.mainData.interceptors[i].file)) {
                        logger.info(` ${this.configuration.mainData.interceptors[i].name} has a README file, include it`);
                        let readme = $markdownengine.readNeighbourReadmeFile(this.configuration.mainData.interceptors[i].file);
                        this.configuration.mainData.interceptors[i].readme = marked(readme);
                    }
                    this.configuration.addPage({
                        path: 'interceptors',
                        name: this.configuration.mainData.interceptors[i].name,
                        id: this.configuration.mainData.interceptors[i].id,
                        context: 'interceptor',
                        injectable: this.configuration.mainData.interceptors[i],
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    });
                    i++;
                    loop();
                } else {
                    resolve();
                }
            };
            loop();
        });
    }

    public prepareRoutes(): Promise<void> {
        logger.info('Process routes');
        this.configuration.mainData.routes = this.dependenciesEngine.getRoutes();

        return new Promise((resolve, reject) => {

            this.configuration.addPage({
                name: 'routes',
                id: 'routes',
                context: 'routes',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });

            if (this.configuration.mainData.exportFormat === COMPODOC_DEFAULTS.exportFormat) {
                this.routerParser.generateRoutesIndex(this.configuration.mainData.output, this.configuration.mainData.routes).then(() => {
                    logger.info(' Routes index generated');
                    resolve();
                }, (e) => {
                    logger.error(e);
                    reject();
                });
            } else {
                resolve();
            }

        });
    }

    public prepareCoverage() {
        logger.info('Process documentation coverage report');

        return new Promise((resolve, reject) => {
            /*
             * loop with components, directives, classes, injectables, interfaces, pipes, misc functions variables
             */
            let files = [];
            let totalProjectStatementDocumented = 0;
            let getStatus = function (percent) {
                let status;
                if (percent <= 25) {
                    status = 'low';
                } else if (percent > 25 && percent <= 50) {
                    status = 'medium';
                } else if (percent > 50 && percent <= 75) {
                    status = 'good';
                } else {
                    status = 'very-good';
                }
                return status;
            };
            let processComponentsAndDirectives = (list) => {
                _.forEach(list, (element: any) => {
                    if (!element.propertiesClass ||
                        !element.methodsClass ||
                        !element.hostBindings ||
                        !element.hostListeners ||
                        !element.inputsClass ||
                        !element.outputsClass) {
                        return;
                    }
                    let cl: any = {
                        filePath: element.file,
                        type: element.type,
                        linktype: element.type,
                        name: element.name
                    };
                    let totalStatementDocumented = 0;
                    let totalStatements =
                        element.propertiesClass.length +
                        element.methodsClass.length +
                        element.inputsClass.length +
                        element.hostBindings.length +
                        element.hostListeners.length +
                        element.outputsClass.length + 1; // +1 for element decorator comment

                    if (element.constructorObj) {
                        totalStatements += 1;
                        if (element.constructorObj && element.constructorObj.description && element.constructorObj.description !== '') {
                            totalStatementDocumented += 1;
                        }
                    }
                    if (element.description && element.description !== '') {
                        totalStatementDocumented += 1;
                    }

                    _.forEach(element.propertiesClass, (property: any) => {
                        if (property.modifierKind === ts.SyntaxKind.PrivateKeyword) { // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (property.description && property.description !== '' && property.modifierKind !== ts.SyntaxKind.PrivateKeyword) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.methodsClass, (method: any) => {
                        if (method.modifierKind === ts.SyntaxKind.PrivateKeyword) { // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (method.description && method.description !== '' && method.modifierKind !== ts.SyntaxKind.PrivateKeyword) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.hostBindings, (property: any) => {
                        if (property.modifierKind === ts.SyntaxKind.PrivateKeyword) { // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (property.description && property.description !== '' && property.modifierKind !== ts.SyntaxKind.PrivateKeyword) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.hostListeners, (method: any) => {
                        if (method.modifierKind === ts.SyntaxKind.PrivateKeyword) { // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (method.description && method.description !== '' && method.modifierKind !== ts.SyntaxKind.PrivateKeyword) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.inputsClass, (input: any) => {
                        if (input.modifierKind === ts.SyntaxKind.PrivateKeyword) { // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (input.description && input.description !== '' && input.modifierKind !== ts.SyntaxKind.PrivateKeyword) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.outputsClass, (output: any) => {
                        if (output.modifierKind === ts.SyntaxKind.PrivateKeyword) { // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (output.description && output.description !== '' && output.modifierKind !== ts.SyntaxKind.PrivateKeyword) {
                            totalStatementDocumented += 1;
                        }
                    });

                    cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                    if (totalStatements === 0) {
                        cl.coveragePercent = 0;
                    }
                    cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                    cl.status = getStatus(cl.coveragePercent);
                    totalProjectStatementDocumented += cl.coveragePercent;
                    files.push(cl);
                });
            };
            let processCoveragePerFile = () => {
                logger.info('Process documentation coverage per file');
                logger.info('-------------------');

                let overFiles = files.filter((f) => {
                    let overTest = f.coveragePercent >= this.configuration.mainData.coverageMinimumPerFile;
                    if (overTest) {
                        logger.info(`${f.coveragePercent} % for file ${f.filePath} - over minimum per file`);
                    }
                    return overTest;
                });
                let underFiles = files.filter((f) => {
                    let underTest = f.coveragePercent < this.configuration.mainData.coverageMinimumPerFile;
                    if (underTest) {
                        logger.error(`${f.coveragePercent} % for file ${f.filePath} - under minimum per file`);
                    }
                    return underTest;
                });

                logger.info('-------------------');
                return {
                    overFiles: overFiles,
                    underFiles: underFiles
                };
            };
            let processFunctionsAndVariables = (id, type) => {
                _.forEach(id, (el: any) => {
                    let cl: any = {
                        filePath: el.file,
                        type: type,
                        linktype: el.type,
                        linksubtype: el.subtype,
                        name: el.name
                    };
                    if (type === 'variable') {
                        cl.linktype = 'miscellaneous';
                    }
                    let totalStatementDocumented = 0;
                    let totalStatements = 1;

                    if (el.modifierKind === ts.SyntaxKind.PrivateKeyword) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if (el.description && el.description !== '' && el.modifierKind !== ts.SyntaxKind.PrivateKeyword) {
                        totalStatementDocumented += 1;
                    }

                    cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                    cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                    cl.status = getStatus(cl.coveragePercent);
                    totalProjectStatementDocumented += cl.coveragePercent;
                    files.push(cl);
                });
            };

            processComponentsAndDirectives(this.configuration.mainData.components);
            processComponentsAndDirectives(this.configuration.mainData.directives);

            _.forEach(this.configuration.mainData.classes, (classe: any) => {
                if (!classe.properties ||
                    !classe.methods) {
                    return;
                }
                let cl: any = {
                    filePath: classe.file,
                    type: 'class',
                    linktype: 'classe',
                    name: classe.name
                };
                let totalStatementDocumented = 0;
                let totalStatements = classe.properties.length + classe.methods.length + 1; // +1 for class itself

                if (classe.constructorObj) {
                    totalStatements += 1;
                    if (classe.constructorObj && classe.constructorObj.description && classe.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (classe.description && classe.description !== '') {
                    totalStatementDocumented += 1;
                }

                _.forEach(classe.properties, (property: any) => {
                    if (property.modifierKind === ts.SyntaxKind.PrivateKeyword) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if (property.description && property.description !== '' && property.modifierKind !== ts.SyntaxKind.PrivateKeyword) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(classe.methods, (method: any) => {
                    if (method.modifierKind === ts.SyntaxKind.PrivateKeyword) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if (method.description && method.description !== '' && method.modifierKind !== ts.SyntaxKind.PrivateKeyword) {
                        totalStatementDocumented += 1;
                    }
                });

                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                if (totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            _.forEach(this.configuration.mainData.injectables, (injectable: any) => {
                if (!injectable.properties ||
                    !injectable.methods) {
                    return;
                }
                let cl: any = {
                    filePath: injectable.file,
                    type: injectable.type,
                    linktype: injectable.type,
                    name: injectable.name
                };
                let totalStatementDocumented = 0;
                let totalStatements = injectable.properties.length + injectable.methods.length + 1; // +1 for injectable itself

                if (injectable.constructorObj) {
                    totalStatements += 1;
                    if (injectable.constructorObj &&
                        injectable.constructorObj.description &&
                        injectable.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (injectable.description && injectable.description !== '') {
                    totalStatementDocumented += 1;
                }

                _.forEach(injectable.properties, (property: any) => {
                    if (property.modifierKind === ts.SyntaxKind.PrivateKeyword) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if (property.description && property.description !== '' && property.modifierKind !== ts.SyntaxKind.PrivateKeyword) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(injectable.methods, (method: any) => {
                    if (method.modifierKind === ts.SyntaxKind.PrivateKeyword) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if (method.description && method.description !== '' && method.modifierKind !== ts.SyntaxKind.PrivateKeyword) {
                        totalStatementDocumented += 1;
                    }
                });

                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                if (totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            _.forEach(this.configuration.mainData.interfaces, (inter: any) => {
                if (!inter.properties ||
                    !inter.methods) {
                    return;
                }
                let cl: any = {
                    filePath: inter.file,
                    type: inter.type,
                    linktype: inter.type,
                    name: inter.name
                };
                let totalStatementDocumented = 0;
                let totalStatements = inter.properties.length + inter.methods.length + 1; // +1 for interface itself

                if (inter.constructorObj) {
                    totalStatements += 1;
                    if (inter.constructorObj && inter.constructorObj.description && inter.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (inter.description && inter.description !== '') {
                    totalStatementDocumented += 1;
                }

                _.forEach(inter.properties, (property: any) => {
                    if (property.modifierKind === ts.SyntaxKind.PrivateKeyword) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if (property.description && property.description !== '' && property.modifierKind !== ts.SyntaxKind.PrivateKeyword) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(inter.methods, (method: any) => {
                    if (method.modifierKind === ts.SyntaxKind.PrivateKeyword) { // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if (method.description && method.description !== '' && method.modifierKind !== ts.SyntaxKind.PrivateKeyword) {
                        totalStatementDocumented += 1;
                    }
                });

                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                if (totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            _.forEach(this.configuration.mainData.pipes, (pipe: any) => {
                let cl: any = {
                    filePath: pipe.file,
                    type: pipe.type,
                    linktype: pipe.type,
                    name: pipe.name
                };
                let totalStatementDocumented = 0;
                let totalStatements = 1;
                if (pipe.description && pipe.description !== '') {
                    totalStatementDocumented += 1;
                }

                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });

            processFunctionsAndVariables(this.configuration.mainData.miscellaneous.functions, 'function');
            processFunctionsAndVariables(this.configuration.mainData.miscellaneous.variables, 'variable');

            files = _.sortBy(files, ['filePath']);
            let coverageData = {
                count: (files.length > 0) ? Math.floor(totalProjectStatementDocumented / files.length) : 0,
                status: '',
                files
            };
            coverageData.status = getStatus(coverageData.count);
            this.configuration.addPage({
                name: 'coverage',
                id: 'coverage',
                context: 'coverage',
                files: files,
                data: coverageData,
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            coverageData.files = files;
            this.configuration.mainData.coverageData = coverageData;
            if (this.configuration.mainData.exportFormat === COMPODOC_DEFAULTS.exportFormat) {
                this.htmlEngine.generateCoverageBadge(this.configuration.mainData.output, coverageData);
            }
            files = _.sortBy(files, ['coveragePercent']);

            let coverageTestPerFileResults;
            if (this.configuration.mainData.coverageTest && !this.configuration.mainData.coverageTestPerFile) {
                // Global coverage test and not per file
                if (coverageData.count >= this.configuration.mainData.coverageTestThreshold) {
                    logger.info(`Documentation coverage (${coverageData.count}%) is over threshold (${this.configuration.mainData.coverageTestThreshold}%)`);
                    generationPromiseResolve();
                    process.exit(0);
                } else {
                    let message = `Documentation coverage (${coverageData.count}%) is not over threshold (${this.configuration.mainData.coverageTestThreshold}%)`;
                    generationPromiseReject();
                    if (this.configuration.mainData.coverageTestThresholdFail) {
                        logger.error(message);
                        process.exit(1);
                    } else {
                        logger.warn(message);
                        process.exit(0);
                    }
                }
            } else if (!this.configuration.mainData.coverageTest && this.configuration.mainData.coverageTestPerFile) {
                coverageTestPerFileResults = processCoveragePerFile();
                // Per file coverage test and not global
                if (coverageTestPerFileResults.underFiles.length > 0) {
                    let message = `Documentation coverage per file is not over threshold (${this.configuration.mainData.coverageMinimumPerFile}%)`;
                    generationPromiseReject();
                    if (this.configuration.mainData.coverageTestThresholdFail) {
                        logger.error(message);
                        process.exit(1);
                    } else {
                        logger.warn(message);
                        process.exit(0);
                    }
                } else {
                    logger.info(`Documentation coverage per file is over threshold (${this.configuration.mainData.coverageMinimumPerFile}%)`);
                    generationPromiseResolve();
                    process.exit(0);
                }
            } else if (this.configuration.mainData.coverageTest && this.configuration.mainData.coverageTestPerFile) {
                // Per file coverage test and global
                coverageTestPerFileResults = processCoveragePerFile();
                if (coverageData.count >= this.configuration.mainData.coverageTestThreshold &&
                    coverageTestPerFileResults.underFiles.length === 0) {
                    logger.info(`Documentation coverage (${coverageData.count}%) is over threshold (${this.configuration.mainData.coverageTestThreshold}%)`);
                    logger.info(`Documentation coverage per file is over threshold (${this.configuration.mainData.coverageMinimumPerFile}%)`);
                    generationPromiseResolve();
                    process.exit(0);
                } else if (coverageData.count >= this.configuration.mainData.coverageTestThreshold &&
                    coverageTestPerFileResults.underFiles.length > 0) {
                    logger.info(`Documentation coverage (${coverageData.count}%) is over threshold (${this.configuration.mainData.coverageTestThreshold}%)`);
                    let message = `Documentation coverage per file is not over threshold (${this.configuration.mainData.coverageMinimumPerFile}%)`;
                    generationPromiseReject();
                    if (this.configuration.mainData.coverageTestThresholdFail) {
                        logger.error(message);
                        process.exit(1);
                    } else {
                        logger.warn(message);
                        process.exit(0);
                    }
                } else if (coverageData.count < this.configuration.mainData.coverageTestThreshold &&
                    coverageTestPerFileResults.underFiles.length > 0) {
                    let messageGlobal = `Documentation coverage (${coverageData.count}%) is not over threshold (${this.configuration.mainData.coverageTestThreshold}%)`,
                        messagePerFile = `Documentation coverage per file is not over threshold (${this.configuration.mainData.coverageMinimumPerFile}%)`;
                    generationPromiseReject();
                    if (this.configuration.mainData.coverageTestThresholdFail) {
                        logger.error(messageGlobal);
                        logger.error(messagePerFile);
                        process.exit(1);
                    } else {
                        logger.warn(messageGlobal);
                        logger.error(messagePerFile);
                        process.exit(0);
                    }
                } else {
                    let message = `Documentation coverage (${coverageData.count}%) is not over threshold (${this.configuration.mainData.coverageTestThreshold}%)`;
                    generationPromiseReject();
                    if (this.configuration.mainData.coverageTestThresholdFail) {
                        logger.error(message);
                        logger.info(`Documentation coverage per file is over threshold (${this.configuration.mainData.coverageMinimumPerFile}%)`);
                        process.exit(1);
                    } else {
                        logger.warn(message);
                        logger.info(`Documentation coverage per file is over threshold (${this.configuration.mainData.coverageMinimumPerFile}%)`);
                        process.exit(0);
                    }
                }
            } else {
                resolve();
            }
        });
    }

    private processPage(page): Promise<void> {
        logger.info('Process page', page.name);

        let htmlData = this.htmlEngine.render(this.configuration.mainData, page);
        let finalPath = this.configuration.mainData.output;

        if (this.configuration.mainData.output.lastIndexOf('/') === -1) {
            finalPath += '/';
        }
        if (page.path) {
            finalPath += page.path + '/';
        }

        if (page.filename) {
            finalPath += page.filename + '.html';
        } else {
            finalPath += page.name + '.html';
        }

        this.searchEngine.indexPage({
            infos: page,
            rawData: htmlData,
            url: finalPath
        });

        return this.fileEngine.write(finalPath, htmlData).catch(err => {
            logger.error('Error during ' + page.name + ' page generation');
            return Promise.reject('');
        });
    }

    public processPages() {
        logger.info('Process pages');
        let pages = this.configuration.pages;
        Promise.all(pages.map((page) => this.processPage(page)))
            .then(() => {
                this.searchEngine.generateSearchIndexJson(this.configuration.mainData.output).then(() => {
                    if (this.configuration.mainData.additionalPages.length > 0) {
                        this.processAdditionalPages();
                    } else {
                        if (this.configuration.mainData.assetsFolder !== '') {
                            this.processAssetsFolder();
                        }
                        this.processResources();
                    }
                }, (e) => {
                    logger.error(e);
                });
            })
            .catch((e) => {
                logger.error(e);
            });
    }

    public processAdditionalPages() {
        logger.info('Process additional pages');
        let pages = this.configuration.mainData.additionalPages;
        Promise.all(pages.map((page, i) => this.processPage(page)))
            .then(() => {
                this.searchEngine.generateSearchIndexJson(this.configuration.mainData.output).then(() => {
                    if (this.configuration.mainData.assetsFolder !== '') {
                        this.processAssetsFolder();
                    }
                    this.processResources();
                });
            })
            .catch((e) => {
                logger.error(e);
                return Promise.reject(e);
            });
    }

    public processAssetsFolder(): void {
        logger.info('Copy assets folder');

        if (!this.fileEngine.existsSync(this.configuration.mainData.assetsFolder)) {
            logger.error(`Provided assets folder ${this.configuration.mainData.assetsFolder} did not exist`);
        } else {
            const destination = path.join(
                                    this.configuration.mainData.output,
                                    path.basename(this.configuration.mainData.assetsFolder));
            fs.copy(
                path.resolve(this.configuration.mainData.assetsFolder),
                path.resolve(destination), (err) => {
                    if (err) {
                        logger.error('Error during resources copy ', err);
                    }
                });
        }
    }

    public processResources() {
        logger.info('Copy main resources');

        const onComplete = () => {
            logger.info('Documentation generated in ' + this.configuration.mainData.output +
                ' in ' + this.getElapsedTime() +
                ' seconds using ' + this.configuration.mainData.theme + ' theme');
            if (this.configuration.mainData.serve) {
                logger.info(`Serving documentation from ${this.configuration.mainData.output} at http://127.0.0.1:${this.configuration.mainData.port}`);
                this.runWebServer(this.configuration.mainData.output);
            } else {
                generationPromiseResolve();
                this.endCallback();
            }
        };

        let finalOutput = this.configuration.mainData.output;

        let testOutputDir = this.configuration.mainData.output.match(process.cwd());
        if (!testOutputDir) {
            finalOutput = this.configuration.mainData.output.replace(process.cwd(), '');
        }

        fs.copy(path.resolve(__dirname + '/../src/resources/'), path.resolve(finalOutput), (errorCopy) => {
            if (errorCopy) {
                logger.error('Error during resources copy ', errorCopy);
            } else {
                if (this.configuration.mainData.extTheme) {
                    fs.copy(path.resolve(process.cwd() + path.sep + this.configuration.mainData.extTheme),
                        path.resolve(finalOutput + '/styles/'), function (errorCopyTheme) {
                            if (errorCopyTheme) {
                                logger.error('Error during external styling theme copy ', errorCopyTheme);
                            } else {
                                logger.info('External styling theme copy succeeded');
                                onComplete();
                            }
                        });
                } else {
                    if (this.configuration.mainData.customFavicon !== '') {
                        logger.info(`Custom favicon supplied`);
                        fs.copy(path.resolve(process.cwd() + path.sep + this.configuration.mainData.customFavicon), path.resolve(finalOutput + '/images/favicon.ico'), (errorCopyFavicon) => {// tslint:disable-line
                            if (errorCopyFavicon) {
                                logger.error('Error during resources copy ', errorCopyFavicon);
                            } else {
                                onComplete();
                            }
                        });
                    } else {
                        onComplete();
                    }
                }
            }
        });
    }

    /**
     * Calculates the elapsed time since the program was started.
     *
     * @returns {number}
     */
    private getElapsedTime() {
        return (new Date().valueOf() - startTime.valueOf()) / 1000;
    }

    public processGraphs() {

        if (this.configuration.mainData.disableGraph) {
            logger.info('Graph generation disabled');
            this.processPages();
        } else {
            logger.info('Process main graph');
            let modules = this.configuration.mainData.modules;
            let i = 0;
            let len = modules.length;
            let loop = () => {
                if (i <= len - 1) {
                    logger.info('Process module graph', modules[i].name);
                    let finalPath = this.configuration.mainData.output;
                    if (this.configuration.mainData.output.lastIndexOf('/') === -1) {
                        finalPath += '/';
                    }
                    finalPath += 'modules/' + modules[i].name;
                    let _rawModule = this.dependenciesEngine.getRawModule(modules[i].name);
                    if (_rawModule.declarations.length > 0 ||
                        _rawModule.bootstrap.length > 0 ||
                        _rawModule.imports.length > 0 ||
                        _rawModule.exports.length > 0 ||
                        _rawModule.providers.length > 0) {
                        this.ngdEngine.renderGraph(modules[i].file, finalPath, 'f', modules[i].name).then(() => {
                            this.ngdEngine.readGraph(path.resolve(finalPath + path.sep + 'dependencies.svg'), modules[i].name)
                                .then((data) => {
                                    modules[i].graph = data as string;
                                    i++;
                                    loop();
                                }, (err) => {
                                    logger.error('Error during graph read: ', err);
                                });
                        }, (errorMessage) => {
                            logger.error(errorMessage);
                        });
                    } else {
                        i++;
                        loop();
                    }
                } else {
                    this.processPages();
                }
            };
            let finalMainGraphPath = this.configuration.mainData.output;
            if (finalMainGraphPath.lastIndexOf('/') === -1) {
                finalMainGraphPath += '/';
            }
            finalMainGraphPath += 'graph';
            this.ngdEngine.init(path.resolve(finalMainGraphPath));

            this.ngdEngine.renderGraph(this.configuration.mainData.tsconfig, path.resolve(finalMainGraphPath), 'p').then(() => {
                this.ngdEngine.readGraph(path.resolve(finalMainGraphPath + path.sep + 'dependencies.svg'), 'Main graph').then((data) => {
                    this.configuration.mainData.mainGraph = data as string;
                    loop();
                }, (err) => {
                    logger.error('Error during main graph reading : ', err);
                    this.configuration.mainData.disableMainGraph = true;
                    loop();
                });
            }, (err) => {
                logger.error('Ooops error during main graph generation, moving on next part with main graph disabled : ', err);
                this.configuration.mainData.disableMainGraph = true;
                loop();
            });
        }
    }

    public runWebServer(folder) {
        if (!this.isWatching) {
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
            if (typeof this.files === 'undefined') {
                logger.error('No sources files available, please use -p flag');
                generationPromiseReject();
                process.exit(1);
            } else {
                this.runWatch();
            }
        } else if (this.configuration.mainData.watch && this.isWatching) {
            let srcFolder = findMainSourceFolder(this.files);
            logger.info(`Already watching sources in ${srcFolder} folder`);
        }
    }

    public runWatch() {
        let sources = [findMainSourceFolder(this.files)];
        let watcherReady = false;

        this.isWatching = true;

        logger.info(`Watching sources in ${findMainSourceFolder(this.files)} folder`);

        if ($markdownengine.hasRootMarkdowns()) {
            sources = sources.concat($markdownengine.listRootMarkdowns());
        }

        if (this.configuration.mainData.includes !== '') {
            sources = sources.concat(this.configuration.mainData.includes);
        }

        // Check all elements of sources list exist
        sources = cleanSourcesForWatch(sources);

        let watcher = chokidar.watch(sources, {
            awaitWriteFinish: true,
            ignoreInitial: true,
            ignored: /(spec|\.d)\.ts/
        });
        let timerAddAndRemoveRef;
        let timerChangeRef;
        let runnerAddAndRemove = () => {
            startTime = new Date();
            this.generate();
        };
        let waiterAddAndRemove = () => {
            clearTimeout(timerAddAndRemoveRef);
            timerAddAndRemoveRef = setTimeout(runnerAddAndRemove, 1000);
        };
        let runnerChange = () => {
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
        let waiterChange = () => {
            clearTimeout(timerChangeRef);
            timerChangeRef = setTimeout(runnerChange, 1000);
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
    get application(): Application {
        return this;
    }


    get isCLI(): boolean {
        return false;
    }
}
