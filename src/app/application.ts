import * as fs from 'fs-extra';
import * as path from 'path';
import * as LiveServer from 'live-server';
import * as _ from 'lodash';

import { SyntaxKind } from 'ts-simple-ast';

const chokidar = require('chokidar');
const marked = require('marked');
const traverse = require('traverse');

import { logger } from '../logger';
import { HtmlEngine } from './engines/html.engine';
import { MarkdownEngine } from './engines/markdown.engine';
import { FileEngine } from './engines/file.engine';
import { Configuration } from './configuration';
import { ConfigurationInterface } from './interfaces/configuration.interface';
import { NgdEngine } from './engines/ngd.engine';
import { SearchEngine } from './engines/search.engine';
import { ExportEngine } from './engines/export.engine';
import I18nEngineInstance from './engines/i18n.engine';

import { AngularDependencies } from './compiler/angular-dependencies';
import { AngularJSDependencies } from './compiler/angularjs-dependencies';

import { COMPODOC_DEFAULTS } from '../utils/defaults';
import { COMPODOC_CONSTANTS } from '../utils/constants';

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

    /**
     * Store package.json data
     */
    private packageJsonData = {};

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
        this.htmlEngine = new HtmlEngine(
            this.configuration,
            this.dependenciesEngine,
            this.fileEngine
        );
        this.searchEngine = new SearchEngine(this.configuration, this.fileEngine);
        this.exportEngine = new ExportEngine(
            this.configuration,
            this.dependenciesEngine,
            this.fileEngine
        );

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

        I18nEngineInstance.init(this.configuration.mainData.language);

        if (
            this.configuration.mainData.output.charAt(
                this.configuration.mainData.output.length - 1
            ) !== '/'
        ) {
            this.configuration.mainData.output += '/';
        }

        if (this.configuration.mainData.exportFormat !== COMPODOC_DEFAULTS.exportFormat) {
            this.processPackageJson();
        } else {
            this.htmlEngine.init(this.configuration.mainData.templates).then(() => this.processPackageJson());
        }
        return generationPromise;
    }

    private endCallback() {
        process.removeListener('unhandledRejection', this.unhandledRejectionListener);
        process.removeListener('uncaughtException', this.uncaughtExceptionListener);
    }

    private unhandledRejectionListener(err, p) {
        console.log('Unhandled Rejection at:', p, 'reason:', err);
        logger.error(
            'Sorry, but there was a problem during parsing or generation of the documentation. Please fill an issue on github. (https://github.com/compodoc/compodoc/issues/new)'
        ); // tslint:disable-line
        process.exit(1);
    }

    private uncaughtExceptionListener(err) {
        logger.error(err);
        logger.error(
            'Sorry, but there was a problem during parsing or generation of the documentation. Please fill an issue on github. (https://github.com/compodoc/compodoc/issues/new)'
        ); // tslint:disable-line
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

        _.forEach(this.updatedFiles, file => {
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

        _.forEach(this.updatedFiles, file => {
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
        this.fileEngine.get(process.cwd() + path.sep + 'package.json').then(
            packageData => {
                let parsedData = JSON.parse(packageData);
                this.packageJsonData = parsedData;
                if (
                    typeof parsedData.name !== 'undefined' &&
                    this.configuration.mainData.documentationMainName === COMPODOC_DEFAULTS.title
                ) {
                    this.configuration.mainData.documentationMainName =
                        parsedData.name + ' documentation';
                }
                if (typeof parsedData.description !== 'undefined') {
                    this.configuration.mainData.documentationMainDescription =
                        parsedData.description;
                }
                this.configuration.mainData.angularVersion = this.angularVersionUtil.getAngularVersionOfProject(
                    parsedData
                );
                logger.info('package.json file found');

                if (typeof parsedData.dependencies !== 'undefined') {
                    this.processPackageDependencies(parsedData.dependencies);
                }
                if (typeof parsedData.peerDependencies !== 'undefined') {
                    this.processPackagePeerDependencies(parsedData.peerDependencies);
                }

                this.processMarkdowns().then(
                    () => {
                        this.getDependenciesData();
                    },
                    errorMessage => {
                        logger.error(errorMessage);
                    }
                );
            },
            errorMessage => {
                logger.error(errorMessage);
                logger.error('Continuing without package.json file');
                this.processMarkdowns().then(
                    () => {
                        this.getDependenciesData();
                    },
                    errorMessage1 => {
                        logger.error(errorMessage1);
                    }
                );
            }
        );
    }

    private processPackagePeerDependencies(dependencies): void {
        logger.info('Processing package.json peerDependencies');
        this.configuration.mainData.packagePeerDependencies = dependencies;
        if (!this.configuration.hasPage('dependencies')) {
            this.configuration.addPage({
                name: 'dependencies',
                id: 'packageDependencies',
                context: 'package-dependencies',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
        }
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
        logger.info(
            'Searching README.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE.md, TODO.md files'
        );

        return new Promise((resolve, reject) => {
            let i = 0;
            let markdowns = ['readme', 'changelog', 'contributing', 'license', 'todo'];
            let numberOfMarkdowns = 5;
            let loop = () => {
                if (i < numberOfMarkdowns) {
                    $markdownengine.getTraditionalMarkdown(markdowns[i].toUpperCase()).then(
                        (readmeData: string) => {
                            this.configuration.addPage({
                                name: markdowns[i] === 'readme' ? 'index' : markdowns[i],
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
                        },
                        errorMessage => {
                            logger.warn(errorMessage);
                            logger.warn(`Continuing without ${markdowns[i].toUpperCase()}.md file`);
                            if (markdowns[i] === 'readme') {
                                this.configuration.addPage({
                                    name: 'index',
                                    id: 'index',
                                    context: 'overview',
                                    depth: 0,
                                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                                });
                            }
                            i++;
                            loop();
                        }
                    );
                } else {
                    resolve();
                }
            };
            loop();
        });
    }

    private rebuildRootMarkdowns(): void {
        logger.info(
            'Regenerating README.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE.md, TODO.md pages'
        );

        let actions = [];

        this.configuration.resetRootMarkdownPages();

        actions.push(() => {
            return this.processMarkdowns();
        });

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
            this.updatedFiles,
            {
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
            actions.push(() => {
                return this.prepareExternalIncludes();
            });
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

        /**
         * AngularJS detection strategy :
         * - if in package.json
         * - if 75% of scanned files are *.js files
         */
        let dependenciesClass: AngularDependencies | AngularJSDependencies = AngularDependencies;
        this.configuration.mainData.angularProject = true;

        if (typeof this.packageJsonData.dependencies !== 'undefined') {
            if (typeof this.packageJsonData.dependencies.angular !== 'undefined') {
                logger.info('AngularJS project detected');
                this.configuration.mainData.angularProject = false;
                this.configuration.mainData.angularJSProject = true;
                dependenciesClass = AngularJSDependencies;
            } else {
                let countJSFiles = 0;
                this.files.forEach((file) => {
                    if (path.extname(file) === '.js') {
                        countJSFiles += 1;
                    }
                });
                let percentOfJSFiles = (countJSFiles * 100) / this.files.length;
                if (percentOfJSFiles >= 75) {
                    logger.info('AngularJS project detected');
                    this.configuration.mainData.angularProject = false;
                    this.configuration.mainData.angularJSProject = true;
                    dependenciesClass = AngularJSDependencies;
                }
            }
        }

        let crawler = new dependenciesClass(
            this.files,
            {
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

        if (!this.configuration.mainData.disableRoutesGraph) {
            actions.push(() => this.prepareRoutes());
        }

        if (diffCrawledData.components.length > 0) {
            actions.push(() => this.prepareComponents());
        }
        if (diffCrawledData.controllers.length > 0) {
            actions.push(() => this.prepareControllers());
        }
        if (diffCrawledData.modules.length > 0) {
            actions.push(() => this.prepareModules());
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

        if (diffCrawledData.guards.length > 0) {
            actions.push(() => this.prepareGuards());
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

        if (
            diffCrawledData.miscellaneous.variables.length > 0 ||
            diffCrawledData.miscellaneous.functions.length > 0 ||
            diffCrawledData.miscellaneous.typealiases.length > 0 ||
            diffCrawledData.miscellaneous.enumerations.length > 0
        ) {
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
            logger.info(`- files      : ${this.files.length}`);
        }
        if (this.dependenciesEngine.modules.length > 0) {
            logger.info(`- module     : ${this.dependenciesEngine.modules.length}`);
        }
        if (this.dependenciesEngine.components.length > 0) {
            logger.info(`- component  : ${this.dependenciesEngine.components.length}`);
        }
        if (this.dependenciesEngine.controllers.length > 0) {
            logger.info(`- controller : ${this.dependenciesEngine.controllers.length}`);
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
        if (this.dependenciesEngine.guards.length > 0) {
            logger.info(`- guard      : ${this.dependenciesEngine.guards.length}`);
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

        actions.push(() => {
            return this.prepareComponents();
        });
        actions.push(() => {
            return this.prepareModules();
        });

        if (this.dependenciesEngine.directives.length > 0) {
            actions.push(() => {
                return this.prepareDirectives();
            });
        }

        if (this.dependenciesEngine.controllers.length > 0) {
            actions.push(() => {
                return this.prepareControllers();
            });
        }

        if (this.dependenciesEngine.injectables.length > 0) {
            actions.push(() => {
                return this.prepareInjectables();
            });
        }

        if (this.dependenciesEngine.interceptors.length > 0) {
            actions.push(() => {
                return this.prepareInterceptors();
            });
        }

        if (this.dependenciesEngine.guards.length > 0) {
            actions.push(() => {
                return this.prepareGuards();
            });
        }

        if (
            this.dependenciesEngine.routes &&
            this.dependenciesEngine.routes.children.length > 0 &&
            !this.configuration.mainData.disableRoutesGraph
        ) {
            actions.push(() => {
                return this.prepareRoutes();
            });
        }

        if (this.dependenciesEngine.pipes.length > 0) {
            actions.push(() => {
                return this.preparePipes();
            });
        }

        if (this.dependenciesEngine.classes.length > 0) {
            actions.push(() => {
                return this.prepareClasses();
            });
        }

        if (this.dependenciesEngine.interfaces.length > 0) {
            actions.push(() => {
                return this.prepareInterfaces();
            });
        }

        if (
            this.dependenciesEngine.miscellaneous.variables.length > 0 ||
            this.dependenciesEngine.miscellaneous.functions.length > 0 ||
            this.dependenciesEngine.miscellaneous.typealiases.length > 0 ||
            this.dependenciesEngine.miscellaneous.enumerations.length > 0
        ) {
            actions.push(() => {
                return this.prepareMiscellaneous();
            });
        }

        if (!this.configuration.mainData.disableCoverage) {
            actions.push(() => {
                return this.prepareCoverage();
            });
        }

				if (this.configuration.mainData.unitTestCoverage !== ''){
					actions.push(()=>{
						return this.prepareUnitTestCoverage();
					});
				}

        if (this.configuration.mainData.includes !== '') {
            actions.push(() => {
                return this.prepareExternalIncludes();
            });
        }

        promiseSequential(actions)
            .then(res => {
                if (this.configuration.mainData.exportFormat !== COMPODOC_DEFAULTS.exportFormat) {
                    if (
                        COMPODOC_DEFAULTS.exportFormatsSupported.indexOf(
                            this.configuration.mainData.exportFormat
                        ) > -1
                    ) {
                        logger.info(
                            `Generating documentation in export format ${
                                this.configuration.mainData.exportFormat
                            }`
                        );
                        this.exportEngine
                            .export(this.configuration.mainData.output, this.configuration.mainData)
                            .then(() => {
                                generationPromiseResolve();
                                this.endCallback();
                                logger.info(
                                    'Documentation generated in ' +
                                        this.configuration.mainData.output +
                                        ' in ' +
                                        this.getElapsedTime() +
                                        ' seconds'
                                );
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
            this.fileEngine.get(this.getIncludedPathForFile('summary.json')).then(
                summaryData => {
                    logger.info('Additional documentation: summary.json file found');

                    const parsedSummaryData = JSON.parse(summaryData);

                    let that = this,
                        level = 0;

                    traverse(parsedSummaryData).forEach(function() {
                        if (this.notRoot && typeof this.node === 'object') {
                            let rawPath = this.path;
                            let file = this.node['file'];
                            let title = this.node['title'];
                            let finalPath = that.configuration.mainData.includesFolder;

                            let finalDepth = rawPath.filter(el => {
                                return !isNaN(parseInt(el));
                            });

                            if (typeof file !== 'undefined' && typeof title !== 'undefined') {
                                const url = cleanNameWithoutSpaceAndToLowerCase(title);

                                let lastElementRootTree = null;
                                finalDepth.forEach(el => {
                                    let elementTree =
                                        lastElementRootTree === null
                                            ? parsedSummaryData
                                            : lastElementRootTree;
                                    if (typeof elementTree.children !== 'undefined') {
                                        elementTree = elementTree['children'][el];
                                    } else {
                                        elementTree = elementTree[el];
                                    }
                                    finalPath +=
                                        '/' +
                                        cleanNameWithoutSpaceAndToLowerCase(elementTree.title);
                                    lastElementRootTree = elementTree;
                                });

                                finalPath = finalPath.replace('/' + url, '');
                                let markdownFile = $markdownengine.getTraditionalMarkdownSync(
                                    that.getIncludedPathForFile(file)
                                );

                                if (finalDepth.length > 5) {
                                    logger.error('Only 5 levels of depth are supported');
                                } else {
                                    that.configuration.addAdditionalPage({
                                        name: title,
                                        id: title,
                                        filename: url,
                                        context: 'additional-page',
                                        path: finalPath,
                                        additionalPage: markdownFile,
                                        depth: finalDepth.length,
                                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                                    });
                                }
                            }
                        }
                    });

                    resolve();
                },
                errorMessage => {
                    logger.error(errorMessage);
                    reject('Error during Additional documentation generation');
                }
            );
        });
    }

    public prepareModules(someModules?): Promise<any> {
        logger.info('Prepare modules');
        let i = 0;
        let _modules = someModules ? someModules : this.dependenciesEngine.getModules();

        return new Promise((resolve, reject) => {
            this.configuration.mainData.modules = _modules.map(ngModule => {
                ngModule.compodocLinks = {
                    components: [],
                    controllers: [],
                    directives: [],
                    injectables: [],
                    pipes: []
                };
                ['declarations', 'bootstrap', 'imports', 'exports', 'controllers'].forEach(metadataType => {
                    ngModule[metadataType] = ngModule[metadataType].filter(metaDataItem => {
                        switch (metaDataItem.type) {
                            case 'directive':
                                return this.dependenciesEngine.getDirectives().some(directive => {
                                    let selectedDirective;
                                    if (typeof metaDataItem.id !== 'undefined') {
                                        selectedDirective =
                                            (directive as any).id === metaDataItem.id;
                                    } else {
                                        selectedDirective =
                                            (directive as any).name === metaDataItem.name;
                                    }
                                    if (
                                        selectedDirective &&
                                        !ngModule.compodocLinks.directives.includes(directive)
                                    ) {
                                        ngModule.compodocLinks.directives.push(directive);
                                    }
                                    return selectedDirective;
                                });

                            case 'component':
                                return this.dependenciesEngine.getComponents().some(component => {
                                    let selectedComponent;
                                    if (typeof metaDataItem.id !== 'undefined') {
                                        selectedComponent =
                                            (component as any).id === metaDataItem.id;
                                    } else {
                                        selectedComponent =
                                            (component as any).name === metaDataItem.name;
                                    }
                                    if (
                                        selectedComponent &&
                                        !ngModule.compodocLinks.components.includes(component)
                                    ) {
                                        ngModule.compodocLinks.components.push(component);
                                    }
                                    return selectedComponent;
                                });

                            case 'controller':
                                return this.dependenciesEngine.getControllers().some(controller => {
                                    let selectedController;
                                    if (typeof metaDataItem.id !== 'undefined') {
                                        selectedController =
                                            (controller as any).id === metaDataItem.id;
                                    } else {
                                        selectedController =
                                            (controller as any).name === metaDataItem.name;
                                    }
                                    if (
                                        selectedController &&
                                        !ngModule.compodocLinks.controllers.includes(controller)
                                    ) {
                                        ngModule.compodocLinks.controllers.push(controller);
                                    }
                                    return selectedController;
                                });

                            case 'module':
                                return this.dependenciesEngine
                                    .getModules()
                                    .some(module => (module as any).name === metaDataItem.name);

                            case 'pipe':
                                return this.dependenciesEngine.getPipes().some(pipe => {
                                    let selectedPipe;
                                    if (typeof metaDataItem.id !== 'undefined') {
                                        selectedPipe = (pipe as any).id === metaDataItem.id;
                                    } else {
                                        selectedPipe = (pipe as any).name === metaDataItem.name;
                                    }
                                    if (
                                        selectedPipe &&
                                        !ngModule.compodocLinks.pipes.includes(pipe)
                                    ) {
                                        ngModule.compodocLinks.pipes.push(pipe);
                                    }
                                    return selectedPipe;
                                });

                            default:
                                return true;
                        }
                    });
                });
                ngModule.providers = ngModule.providers.filter(provider => {
                    return (
                        this.dependenciesEngine.getInjectables().some(injectable => {
                            let selectedInjectable = (injectable as any).name === provider.name;
                            if (
                                selectedInjectable &&
                                !ngModule.compodocLinks.injectables.includes(injectable)
                            ) {
                                ngModule.compodocLinks.injectables.push(injectable);
                            }
                            return selectedInjectable;
                        }) ||
                        this.dependenciesEngine
                            .getInterceptors()
                            .some(interceptor => (interceptor as any).name === provider.name)
                    );
                });
                // Try fixing type undefined for each providers
                _.forEach(ngModule.providers, provider => {
                    if (
                        this.dependenciesEngine
                            .getInjectables()
                            .find(injectable => (injectable as any).name === provider.name)
                    ) {
                        provider.type = 'injectable';
                    }
                    if (
                        this.dependenciesEngine
                            .getInterceptors()
                            .find(interceptor => (interceptor as any).name === provider.name)
                    ) {
                        provider.type = 'interceptor';
                    }
                });
                // Order things
                ngModule.compodocLinks.components = _.sortBy(ngModule.compodocLinks.components, [
                    'name'
                ]);
                ngModule.compodocLinks.controllers = _.sortBy(ngModule.compodocLinks.controllers, [
                    'name'
                ]);
                ngModule.compodocLinks.directives = _.sortBy(ngModule.compodocLinks.directives, [
                    'name'
                ]);
                ngModule.compodocLinks.injectables = _.sortBy(ngModule.compodocLinks.injectables, [
                    'name'
                ]);
                ngModule.compodocLinks.pipes = _.sortBy(ngModule.compodocLinks.pipes, ['name']);

                ngModule.declarations = _.sortBy(ngModule.declarations, ['name']);
                ngModule.entryComponents = _.sortBy(ngModule.entryComponents, ['name']);
                ngModule.providers = _.sortBy(ngModule.providers, ['name']);
                ngModule.imports = _.sortBy(ngModule.imports, ['name']);
                ngModule.exports = _.sortBy(ngModule.exports, ['name']);

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
                    if (
                        $markdownengine.hasNeighbourReadmeFile(
                            this.configuration.mainData.modules[i].file
                        )
                    ) {
                        logger.info(
                            ` ${
                                this.configuration.mainData.modules[i].name
                            } has a README file, include it`
                        );
                        let readme = $markdownengine.readNeighbourReadmeFile(
                            this.configuration.mainData.modules[i].file
                        );
                        this.configuration.mainData.modules[i].readme = marked(readme);
                    }
                    this.configuration.addPage({
                        path: 'modules',
                        name: this.configuration.mainData.modules[i].name,
                        id: this.configuration.mainData.modules[i].id,
                        navTabs: this.getNavTabs(this.configuration.mainData.modules[i]),
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
        this.configuration.mainData.pipes = somePipes
            ? somePipes
            : this.dependenciesEngine.getPipes();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.pipes.length;
            let loop = () => {
                if (i < len) {
                    let pipe = this.configuration.mainData.pipes[i];
                    if ($markdownengine.hasNeighbourReadmeFile(pipe.file)) {
                        logger.info(` ${pipe.name} has a README file, include it`);
                        let readme = $markdownengine.readNeighbourReadmeFile(pipe.file);
                        pipe.readme = marked(readme);
                    }
                    let page = {
                        path: 'pipes',
                        name: pipe.name,
                        id: pipe.id,
                        navTabs: this.getNavTabs(pipe),
                        context: 'pipe',
                        pipe: pipe,
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    };
                    if (pipe.isDuplicate) {
                        page.name += '-' + pipe.duplicateId;
                    }
                    this.configuration.addPage(page);
                    i++;
                    loop();
                } else {
                    resolve();
                }
            };
            loop();
        });
    };

    public prepareClasses = (someClasses?) => {
        logger.info('Prepare classes');
        this.configuration.mainData.classes = someClasses
            ? someClasses
            : this.dependenciesEngine.getClasses();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.classes.length;
            let loop = () => {
                if (i < len) {
                    let classe = this.configuration.mainData.classes[i];
                    if ($markdownengine.hasNeighbourReadmeFile(classe.file)) {
                        logger.info(` ${classe.name} has a README file, include it`);
                        let readme = $markdownengine.readNeighbourReadmeFile(classe.file);
                        classe.readme = marked(readme);
                    }
                    let page = {
                        path: 'classes',
                        name: classe.name,
                        id: classe.id,
                        navTabs: this.getNavTabs(classe),
                        context: 'class',
                        class: classe,
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    };
                    if (classe.isDuplicate) {
                        page.name += '-' + classe.duplicateId;
                    }
                    this.configuration.addPage(page);
                    i++;
                    loop();
                } else {
                    resolve();
                }
            };
            loop();
        });
    };

    public prepareInterfaces(someInterfaces?) {
        logger.info('Prepare interfaces');
        this.configuration.mainData.interfaces = someInterfaces
            ? someInterfaces
            : this.dependenciesEngine.getInterfaces();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.interfaces.length;
            let loop = () => {
                if (i < len) {
                    let interf = this.configuration.mainData.interfaces[i];
                    if ($markdownengine.hasNeighbourReadmeFile(interf.file)) {
                        logger.info(` ${interf.name} has a README file, include it`);
                        let readme = $markdownengine.readNeighbourReadmeFile(interf.file);
                        interf.readme = marked(readme);
                    }
                    let page = {
                        path: 'interfaces',
                        name: interf.name,
                        id: interf.id,
                        navTabs: this.getNavTabs(interf),
                        context: 'interface',
                        interface: interf,
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    };
                    if (interf.isDuplicate) {
                        page.name += '-' + interf.duplicateId;
                    }
                    this.configuration.addPage(page);
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
        this.configuration.mainData.miscellaneous = someMisc
            ? someMisc
            : this.dependenciesEngine.getMiscellaneous();

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
            return new Promise((resolve, reject) => {});
        }

        return this.fileEngine.get(templatePath).then(
            data => (component.templateData = data),
            err => {
                logger.error(err);
                return Promise.reject('');
            }
        );
    }

    private getNavTabs(dependency): Array<any> {
        let navTabConfig = this.configuration.mainData.navTabConfig;
        navTabConfig = navTabConfig.length === 0 ? _.cloneDeep(COMPODOC_CONSTANTS.navTabDefinitions) : navTabConfig;
        let matchDepType = (depType: string) => {
            return depType === 'all' || depType === dependency.type;
        };

        let navTabs = [];
        _.forEach(navTabConfig, (customTab) => {
            let navTab = _.find(COMPODOC_CONSTANTS.navTabDefinitions, { 'id': customTab.id });
            if (!navTab) {
                throw new Error(`Invalid tab ID '${customTab.id}' specified in tab configuration`);
            }

            navTab.label = customTab.label;

            // is tab applicable to target dependency?
            if (-1 === _.findIndex(navTab.depTypes, matchDepType)) { return; }

            // global config
            if (customTab.id === 'tree' && this.configuration.mainData.disableDomTree) { return; }
            if (customTab.id === 'source' && this.configuration.mainData.disableSourceCode) { return; }
            if (customTab.id === 'templateData' && this.configuration.mainData.disableTemplateTab) { return; }

            // per dependency config
            if (customTab.id === 'readme' && !dependency.readme) { return; }
            if (customTab.id === 'example' && !dependency.exampleUrls) { return; }
            if (customTab.id === 'templateData' && (!dependency.templateUrl || dependency.templateUrl.length === 0)) { return; }

            navTabs.push(navTab);
        });

        if (navTabs.length === 0) {
            throw new Error(`No valid navigation tabs have been defined for dependency type '${dependency.type}'. Specify \
at least one config for the 'info' or 'source' tab in --navTabConfig.`);
        }

        return navTabs;
    }

    public prepareControllers(someControllers?) {
        logger.info('Prepare controllers');
        this.configuration.mainData.controllers = someControllers
            ? someControllers
            : this.dependenciesEngine.getControllers();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.controllers.length;
            let loop = () => {
                if (i < len) {
                    let controller = this.configuration.mainData.controllers[i];
                    let page = {
                        path: 'controllers',
                        name: controller.name,
                        id: controller.id,
                        navTabs: this.getNavTabs(controller),
                        context: 'controller',
                        controller: controller,
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    };
                    if (controller.isDuplicate) {
                        page.name += '-' + controller.duplicateId;
                    }
                    this.configuration.addPage(page);
                    i++;
                    loop();
                } else {
                    resolve();
                }
            };
            loop();
        });
    }

    public prepareComponents(someComponents?) {
        logger.info('Prepare components');
        this.configuration.mainData.components = someComponents
            ? someComponents
            : this.dependenciesEngine.getComponents();

        return new Promise((mainResolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.components.length;
            let loop = () => {
                if (i <= len - 1) {
                    let component = this.configuration.mainData.components[i];
                    if ($markdownengine.hasNeighbourReadmeFile(component.file)) {
                        logger.info(` ${component.name} has a README file, include it`);
                        let readmeFile = $markdownengine.readNeighbourReadmeFile(component.file);
                        component.readme = marked(readmeFile);
                        let page = {
                            path: 'components',
                            name: component.name,
                            id: component.id,
                            navTabs: this.getNavTabs(component),
                            context: 'component',
                            component: component,
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        };
                        if (component.isDuplicate) {
                            page.name += '-' + component.duplicateId;
                        }
                        this.configuration.addPage(page);
                        if (component.templateUrl.length > 0) {
                            logger.info(` ${component.name} has a templateUrl, include it`);
                            this.handleTemplateurl(component).then(
                                () => {
                                    i++;
                                    loop();
                                },
                                e => {
                                    logger.error(e);
                                }
                            );
                        } else {
                            i++;
                            loop();
                        }
                    } else {
                        let page = {
                            path: 'components',
                            name: component.name,
                            id: component.id,
                            navTabs: this.getNavTabs(component),
                            context: 'component',
                            component: component,
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        };
                        if (component.isDuplicate) {
                            page.name += '-' + component.duplicateId;
                        }
                        this.configuration.addPage(page);
                        if (component.templateUrl.length > 0) {
                            logger.info(` ${component.name} has a templateUrl, include it`);
                            this.handleTemplateurl(component).then(
                                () => {
                                    i++;
                                    loop();
                                },
                                e => {
                                    logger.error(e);
                                }
                            );
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

        this.configuration.mainData.directives = someDirectives
            ? someDirectives
            : this.dependenciesEngine.getDirectives();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.directives.length;
            let loop = () => {
                if (i < len) {
                    let directive = this.configuration.mainData.directives[i];
                    if ($markdownengine.hasNeighbourReadmeFile(directive.file)) {
                        logger.info(` ${directive.name} has a README file, include it`);
                        let readme = $markdownengine.readNeighbourReadmeFile(directive.file);
                        directive.readme = marked(readme);
                    }
                    let page = {
                        path: 'directives',
                        name: directive.name,
                        id: directive.id,
                        navTabs: this.getNavTabs(directive),
                        context: 'directive',
                        directive: directive,
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    };
                    if (directive.isDuplicate) {
                        page.name += '-' + directive.duplicateId;
                    }
                    this.configuration.addPage(page);
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

        this.configuration.mainData.injectables = someInjectables
            ? someInjectables
            : this.dependenciesEngine.getInjectables();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.injectables.length;
            let loop = () => {
                if (i < len) {
                    let injec = this.configuration.mainData.injectables[i];
                    if ($markdownengine.hasNeighbourReadmeFile(injec.file)) {
                        logger.info(` ${injec.name} has a README file, include it`);
                        let readme = $markdownengine.readNeighbourReadmeFile(injec.file);
                        injec.readme = marked(readme);
                    }
                    let page = {
                        path: 'injectables',
                        name: injec.name,
                        id: injec.id,
                        navTabs: this.getNavTabs(injec),
                        context: 'injectable',
                        injectable: injec,
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    };
                    if (injec.isDuplicate) {
                        page.name += '-' + injec.duplicateId;
                    }
                    this.configuration.addPage(page);
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

        this.configuration.mainData.interceptors = someInterceptors
            ? someInterceptors
            : this.dependenciesEngine.getInterceptors();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.interceptors.length;
            let loop = () => {
                if (i < len) {
                    let interceptor = this.configuration.mainData.interceptors[i];
                    if ($markdownengine.hasNeighbourReadmeFile(interceptor.file)) {
                        logger.info(` ${interceptor.name} has a README file, include it`);
                        let readme = $markdownengine.readNeighbourReadmeFile(interceptor.file);
                        interceptor.readme = marked(readme);
                    }
                    let page = {
                        path: 'interceptors',
                        name: interceptor.name,
                        id: interceptor.id,
                        navTabs: this.getNavTabs(interceptor),
                        context: 'interceptor',
                        injectable: interceptor,
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    };
                    if (interceptor.isDuplicate) {
                        page.name += '-' + interceptor.duplicateId;
                    }
                    this.configuration.addPage(page);
                    i++;
                    loop();
                } else {
                    resolve();
                }
            };
            loop();
        });
    }

    public prepareGuards(someGuards?): Promise<void> {
        logger.info('Prepare guards');

        this.configuration.mainData.guards = someGuards
            ? someGuards
            : this.dependenciesEngine.getGuards();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = this.configuration.mainData.guards.length;
            let loop = () => {
                if (i < len) {
                    let guard = this.configuration.mainData.guards[i];
                    if ($markdownengine.hasNeighbourReadmeFile(guard.file)) {
                        logger.info(` ${guard.name} has a README file, include it`);
                        let readme = $markdownengine.readNeighbourReadmeFile(guard.file);
                        guard.readme = marked(readme);
                    }
                    let page = {
                        path: 'guards',
                        name: guard.name,
                        id: guard.id,
                        navTabs: this.getNavTabs(guard),
                        context: 'guard',
                        injectable: guard,
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    };
                    if (guard.isDuplicate) {
                        page.name += '-' + guard.duplicateId;
                    }
                    this.configuration.addPage(page);
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
                this.routerParser
                    .generateRoutesIndex(
                        this.configuration.mainData.output,
                        this.configuration.mainData.routes
                    )
                    .then(
                        () => {
                            logger.info(' Routes index generated');
                            resolve();
                        },
                        e => {
                            logger.error(e);
                            reject();
                        }
                    );
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
            let getStatus = function(percent) {
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
            let processComponentsAndDirectives = list => {
                _.forEach(list, (el: any) => {
                    let element = (Object as any).assign({}, el);
                    if (!element.propertiesClass) {
                        element.propertiesClass = [];
                    }
                    if (!element.methodsClass) {
                        element.methodsClass = [];
                    }
                    if (!element.hostBindings) {
                        element.hostBindings = [];
                    }
                    if (!element.hostListeners) {
                        element.hostListeners = [];
                    }
                    if (!element.inputsClass) {
                        element.inputsClass = [];
                    }
                    if (!element.outputsClass) {
                        element.outputsClass = [];
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
                        element.outputsClass.length +
                        1; // +1 for element decorator comment

                    if (element.constructorObj) {
                        totalStatements += 1;
                        if (
                            element.constructorObj &&
                            element.constructorObj.description &&
                            element.constructorObj.description !== ''
                        ) {
                            totalStatementDocumented += 1;
                        }
                    }
                    if (element.description && element.description !== '') {
                        totalStatementDocumented += 1;
                    }

                    _.forEach(element.propertiesClass, (property: any) => {
                        if (property.modifierKind === SyntaxKind.PrivateKeyword) {
                            // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (
                            property.description &&
                            property.description !== '' &&
                            property.modifierKind !== SyntaxKind.PrivateKeyword
                        ) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.methodsClass, (method: any) => {
                        if (method.modifierKind === SyntaxKind.PrivateKeyword) {
                            // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (
                            method.description &&
                            method.description !== '' &&
                            method.modifierKind !== SyntaxKind.PrivateKeyword
                        ) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.hostBindings, (property: any) => {
                        if (property.modifierKind === SyntaxKind.PrivateKeyword) {
                            // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (
                            property.description &&
                            property.description !== '' &&
                            property.modifierKind !== SyntaxKind.PrivateKeyword
                        ) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.hostListeners, (method: any) => {
                        if (method.modifierKind === SyntaxKind.PrivateKeyword) {
                            // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (
                            method.description &&
                            method.description !== '' &&
                            method.modifierKind !== SyntaxKind.PrivateKeyword
                        ) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.inputsClass, (input: any) => {
                        if (input.modifierKind === SyntaxKind.PrivateKeyword) {
                            // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (
                            input.description &&
                            input.description !== '' &&
                            input.modifierKind !== SyntaxKind.PrivateKeyword
                        ) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.outputsClass, (output: any) => {
                        if (output.modifierKind === SyntaxKind.PrivateKeyword) {
                            // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (
                            output.description &&
                            output.description !== '' &&
                            output.modifierKind !== SyntaxKind.PrivateKeyword
                        ) {
                            totalStatementDocumented += 1;
                        }
                    });

                    cl.coveragePercent = Math.floor(
                        totalStatementDocumented / totalStatements * 100
                    );
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

                let overFiles = files.filter(f => {
                    let overTest =
                        f.coveragePercent >= this.configuration.mainData.coverageMinimumPerFile;
                    if (overTest && !this.configuration.mainData.coverageTestShowOnlyFailed) {
                        logger.info(
                            `${f.coveragePercent} % for file ${f.filePath} - over minimum per file`
                        );
                    }
                    return overTest;
                });
                let underFiles = files.filter(f => {
                    let underTest =
                        f.coveragePercent < this.configuration.mainData.coverageMinimumPerFile;
                    if (underTest) {
                        logger.error(
                            `${f.coveragePercent} % for file ${f.filePath} - under minimum per file`
                        );
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

                    if (el.modifierKind === SyntaxKind.PrivateKeyword) {
                        // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if (
                        el.description &&
                        el.description !== '' &&
                        el.modifierKind !== SyntaxKind.PrivateKeyword
                    ) {
                        totalStatementDocumented += 1;
                    }

                    cl.coveragePercent = Math.floor(
                        totalStatementDocumented / totalStatements * 100
                    );
                    cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                    cl.status = getStatus(cl.coveragePercent);
                    totalProjectStatementDocumented += cl.coveragePercent;
                    files.push(cl);
                });
            };

            processComponentsAndDirectives(this.configuration.mainData.components);
            processComponentsAndDirectives(this.configuration.mainData.directives);

            _.forEach(this.configuration.mainData.classes, (cl: any) => {
                let classe = (Object as any).assign({}, cl);
                if (!classe.properties) {
                    classe.properties = [];
                }
                if (!classe.methods) {
                    classe.methods = [];
                }
                let cla: any = {
                    filePath: classe.file,
                    type: 'class',
                    linktype: 'classe',
                    name: classe.name
                };
                let totalStatementDocumented = 0;
                let totalStatements = classe.properties.length + classe.methods.length + 1; // +1 for class itself

                if (classe.constructorObj) {
                    totalStatements += 1;
                    if (
                        classe.constructorObj &&
                        classe.constructorObj.description &&
                        classe.constructorObj.description !== ''
                    ) {
                        totalStatementDocumented += 1;
                    }
                }
                if (classe.description && classe.description !== '') {
                    totalStatementDocumented += 1;
                }

                _.forEach(classe.properties, (property: any) => {
                    if (property.modifierKind === SyntaxKind.PrivateKeyword) {
                        // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if (
                        property.description &&
                        property.description !== '' &&
                        property.modifierKind !== SyntaxKind.PrivateKeyword
                    ) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(classe.methods, (method: any) => {
                    if (method.modifierKind === SyntaxKind.PrivateKeyword) {
                        // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if (
                        method.description &&
                        method.description !== '' &&
                        method.modifierKind !== SyntaxKind.PrivateKeyword
                    ) {
                        totalStatementDocumented += 1;
                    }
                });

                cla.coveragePercent = Math.floor(totalStatementDocumented / totalStatements * 100);
                if (totalStatements === 0) {
                    cla.coveragePercent = 0;
                }
                cla.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cla.status = getStatus(cla.coveragePercent);
                totalProjectStatementDocumented += cla.coveragePercent;
                files.push(cla);
            });
            _.forEach(this.configuration.mainData.injectables, (inj: any) => {
                let injectable = (Object as any).assign({}, inj);
                if (!injectable.properties) {
                    injectable.properties = [];
                }
                if (!injectable.methods) {
                    injectable.methods = [];
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
                    if (
                        injectable.constructorObj &&
                        injectable.constructorObj.description &&
                        injectable.constructorObj.description !== ''
                    ) {
                        totalStatementDocumented += 1;
                    }
                }
                if (injectable.description && injectable.description !== '') {
                    totalStatementDocumented += 1;
                }

                _.forEach(injectable.properties, (property: any) => {
                    if (property.modifierKind === SyntaxKind.PrivateKeyword) {
                        // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if (
                        property.description &&
                        property.description !== '' &&
                        property.modifierKind !== SyntaxKind.PrivateKeyword
                    ) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(injectable.methods, (method: any) => {
                    if (method.modifierKind === SyntaxKind.PrivateKeyword) {
                        // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if (
                        method.description &&
                        method.description !== '' &&
                        method.modifierKind !== SyntaxKind.PrivateKeyword
                    ) {
                        totalStatementDocumented += 1;
                    }
                });

                cl.coveragePercent = Math.floor(totalStatementDocumented / totalStatements * 100);
                if (totalStatements === 0) {
                    cl.coveragePercent = 0;
                }
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });
            _.forEach(this.configuration.mainData.interfaces, (inte: any) => {
                let inter = (Object as any).assign({}, inte);
                if (!inter.properties) {
                    inter.properties = [];
                }
                if (!inter.methods) {
                    inter.methods = [];
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
                    if (
                        inter.constructorObj &&
                        inter.constructorObj.description &&
                        inter.constructorObj.description !== ''
                    ) {
                        totalStatementDocumented += 1;
                    }
                }
                if (inter.description && inter.description !== '') {
                    totalStatementDocumented += 1;
                }

                _.forEach(inter.properties, (property: any) => {
                    if (property.modifierKind === SyntaxKind.PrivateKeyword) {
                        // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if (
                        property.description &&
                        property.description !== '' &&
                        property.modifierKind !== SyntaxKind.PrivateKeyword
                    ) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(inter.methods, (method: any) => {
                    if (method.modifierKind === SyntaxKind.PrivateKeyword) {
                        // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if (
                        method.description &&
                        method.description !== '' &&
                        method.modifierKind !== SyntaxKind.PrivateKeyword
                    ) {
                        totalStatementDocumented += 1;
                    }
                });

                cl.coveragePercent = Math.floor(totalStatementDocumented / totalStatements * 100);
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

                cl.coveragePercent = Math.floor(totalStatementDocumented / totalStatements * 100);
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });

            processFunctionsAndVariables(
                this.configuration.mainData.miscellaneous.functions,
                'function'
            );
            processFunctionsAndVariables(
                this.configuration.mainData.miscellaneous.variables,
                'variable'
            );

            files = _.sortBy(files, ['filePath']);
            let coverageData = {
                count:
                    files.length > 0
                        ? Math.floor(totalProjectStatementDocumented / files.length)
                        : 0,
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
                this.htmlEngine.generateCoverageBadge(
                    this.configuration.mainData.output,
										'documentation',
                    coverageData
                );
            }
            files = _.sortBy(files, ['coveragePercent']);

            let coverageTestPerFileResults;
            if (
                this.configuration.mainData.coverageTest &&
                !this.configuration.mainData.coverageTestPerFile
            ) {
                // Global coverage test and not per file
                if (coverageData.count >= this.configuration.mainData.coverageTestThreshold) {
                    logger.info(
                        `Documentation coverage (${coverageData.count}%) is over threshold (${
                            this.configuration.mainData.coverageTestThreshold
                        }%)`
                    );
                    generationPromiseResolve();
                    process.exit(0);
                } else {
                    let message = `Documentation coverage (${
                        coverageData.count
                    }%) is not over threshold (${
                        this.configuration.mainData.coverageTestThreshold
                    }%)`;
                    generationPromiseReject();
                    if (this.configuration.mainData.coverageTestThresholdFail) {
                        logger.error(message);
                        process.exit(1);
                    } else {
                        logger.warn(message);
                        process.exit(0);
                    }
                }
            } else if (
                !this.configuration.mainData.coverageTest &&
                this.configuration.mainData.coverageTestPerFile
            ) {
                coverageTestPerFileResults = processCoveragePerFile();
                // Per file coverage test and not global
                if (coverageTestPerFileResults.underFiles.length > 0) {
                    let message = `Documentation coverage per file is not over threshold (${
                        this.configuration.mainData.coverageMinimumPerFile
                    }%)`;
                    generationPromiseReject();
                    if (this.configuration.mainData.coverageTestThresholdFail) {
                        logger.error(message);
                        process.exit(1);
                    } else {
                        logger.warn(message);
                        process.exit(0);
                    }
                } else {
                    logger.info(
                        `Documentation coverage per file is over threshold (${
                            this.configuration.mainData.coverageMinimumPerFile
                        }%)`
                    );
                    generationPromiseResolve();
                    process.exit(0);
                }
            } else if (
                this.configuration.mainData.coverageTest &&
                this.configuration.mainData.coverageTestPerFile
            ) {
                // Per file coverage test and global
                coverageTestPerFileResults = processCoveragePerFile();
                if (
                    coverageData.count >= this.configuration.mainData.coverageTestThreshold &&
                    coverageTestPerFileResults.underFiles.length === 0
                ) {
                    logger.info(
                        `Documentation coverage (${coverageData.count}%) is over threshold (${
                            this.configuration.mainData.coverageTestThreshold
                        }%)`
                    );
                    logger.info(
                        `Documentation coverage per file is over threshold (${
                            this.configuration.mainData.coverageMinimumPerFile
                        }%)`
                    );
                    generationPromiseResolve();
                    process.exit(0);
                } else if (
                    coverageData.count >= this.configuration.mainData.coverageTestThreshold &&
                    coverageTestPerFileResults.underFiles.length > 0
                ) {
                    logger.info(
                        `Documentation coverage (${coverageData.count}%) is over threshold (${
                            this.configuration.mainData.coverageTestThreshold
                        }%)`
                    );
                    let message = `Documentation coverage per file is not over threshold (${
                        this.configuration.mainData.coverageMinimumPerFile
                    }%)`;
                    generationPromiseReject();
                    if (this.configuration.mainData.coverageTestThresholdFail) {
                        logger.error(message);
                        process.exit(1);
                    } else {
                        logger.warn(message);
                        process.exit(0);
                    }
                } else if (
                    coverageData.count < this.configuration.mainData.coverageTestThreshold &&
                    coverageTestPerFileResults.underFiles.length > 0
                ) {
                    let messageGlobal = `Documentation coverage (${
                            coverageData.count
                        }%) is not over threshold (${
                            this.configuration.mainData.coverageTestThreshold
                        }%)`,
                        messagePerFile = `Documentation coverage per file is not over threshold (${
                            this.configuration.mainData.coverageMinimumPerFile
                        }%)`;
                    generationPromiseReject();
                    if (this.configuration.mainData.coverageTestThresholdFail) {
                        logger.error(messageGlobal);
                        logger.error(messagePerFile);
                        process.exit(1);
                    } else {
                        logger.warn(messageGlobal);
                        logger.warn(messagePerFile);
                        process.exit(0);
                    }
                } else {
                    let message = `Documentation coverage (${
                        coverageData.count
                    }%) is not over threshold (${
                        this.configuration.mainData.coverageTestThreshold
                    }%)`,
                    messagePerFile = `Documentation coverage per file is over threshold (${
                        this.configuration.mainData.coverageMinimumPerFile
                    }%)`;
                    generationPromiseReject();
                    if (this.configuration.mainData.coverageTestThresholdFail) {
                        logger.error(message);
                        logger.info(messagePerFile);
                        process.exit(1);
                    } else {
                        logger.warn(message);
                        logger.info(messagePerFile);
                        process.exit(0);
                    }
                }
            } else {
                resolve();
            }
        });
    }
		public prepareUnitTestCoverage() {
			logger.info('Process unit test coverage report');
			return new Promise((resolve, reject)=>{
				let covDat, covFileNames;

				if (!this.configuration.mainData.coverageData['files']){
					logger.warn('Missing documentation coverage data');
				} else {
						covDat = {};
						covFileNames = _.map(this.configuration.mainData.coverageData['files'], (el) => {
							let fileName = el.filePath;
							covDat[fileName] = {type: el.type, linktype: el.linktype, linksubtype: el.linksubtype, name: el.name};
              return fileName;
						});
				}
				// read coverage summary file and data
				let unitTestSummary = {};
				let fileDat = this.fileEngine.getSync(this.configuration.mainData.unitTestCoverage);
				if(fileDat){
					unitTestSummary = JSON.parse(fileDat);
				} else {
					return Promise.reject('Error reading unit test coverage file');
				}
				let getCovStatus = function(percent, totalLines){
					let status;
					if(totalLines === 0){
						status = 'uncovered'
					} else if (percent <= 25){
						status = 'low';
					} else if (percent > 25 && percent <= 50){
						status = 'medium';
					} else if (percent > 50 && percent <= 75){
						status = 'good'
					} else {
						status = 'very-good';
					}
					return status;
				}
				let getCoverageData = function(data, fileName) {
					let out = {};
					if (fileName !== 'total'){
						if(covDat === undefined){
							// need a name to include in output but this isn't visible
							out = {name: fileName, filePath: fileName};
						} else { //if (covDat[fileName]){
              let findMatch = _.filter(covFileNames, (el)=>{
                return (el.includes(fileName) || fileName.includes(el))
              });
              if(findMatch.length > 0){
							   out = _.clone(covDat[findMatch[0]]);
                out['filePath'] = fileName;
              } //else {
                //out = {name: fileName, filePath: fileName};
              //}
						}
					}
					let keysToGet = ['statements', 'branches', 'functions', 'lines'];
					_.forEach(keysToGet, (key)=>{
						if(data[key]){
							let t = data[key];
							out[key] = {coveragePercent: Math.round(t.pct),
								coverageCount: '' + t.covered + '/' + t.total,
								status: getCovStatus(t.pct, t.total)};
						}
					});
					return out;
				}

				let unitTestData = {};
				let files = [];
				for(let file in unitTestSummary){
					let dat = getCoverageData(unitTestSummary[file], file);
					if (file === 'total'){
						unitTestData['total'] = dat;
					} else {
						files.push(dat);
					}
				}
				unitTestData['files'] = files;
				unitTestData['idColumn'] = (covDat !== undefined); // should we include the id column
				this.configuration.mainData.unitTestData = unitTestData;
				this.configuration.addPage({
					name: 'unit-test',
          id: 'unit-test',
          context: 'unit-test',
          files: files,
          data: unitTestData,
          depth: 0,
          pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
				});

				if(this.configuration.mainData.exportFormat === COMPODOC_DEFAULTS.exportFormat){
					let keysToGet = ['statements', 'branches', 'functions', 'lines'];
					_.forEach(keysToGet, (key)=>{
						if(unitTestData['total'][key]){
							this.htmlEngine.generateCoverageBadge(
								this.configuration.mainData.output,
								key,
								{count: unitTestData['total'][key]['coveragePercent'],
									status: unitTestData['total'][key]['status']}
							)
						}
					});
				}
				resolve();
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

        if (!this.configuration.mainData.disableSearch) {
            this.searchEngine.indexPage({
                infos: page,
                rawData: htmlData,
                url: finalPath
            });
        }

        return this.fileEngine.write(finalPath, htmlData).catch(err => {
            logger.error('Error during ' + page.name + ' page generation');
            return Promise.reject('');
        });
    }

    public processPages() {
        let pages = _.sortBy(this.configuration.pages, ['name']);

        logger.info('Process pages');
        Promise.all(pages.map(page => this.processPage(page)))
            .then(() => {
                let callbacksAfterGenerateSearchIndexJson = () => {
                    if (this.configuration.mainData.additionalPages.length > 0) {
                        this.processAdditionalPages();
                    } else {
                        if (this.configuration.mainData.assetsFolder !== '') {
                            this.processAssetsFolder();
                        }
                        this.processResources();
                    }
                };
                if (!this.configuration.mainData.disableSearch) {
                    this.searchEngine.generateSearchIndexJson(this.configuration.mainData.output).then(
                        () => {
                            callbacksAfterGenerateSearchIndexJson();
                        },
                        e => {
                            logger.error(e);
                        }
                    );
                } else {
                    callbacksAfterGenerateSearchIndexJson();
                }
            })
            .then(() => {
                return this.processMenu(this.configuration.mainData);
            })
            .catch(e => {
                logger.error(e);
            });
    }

    private processMenu(mainData): Promise<void> {
        logger.info('Process menu...');

        return this.htmlEngine.renderMenu(this.configuration.mainData.templates, mainData).then(htmlData => {
            let finalPath = `${mainData.output}/js/menu-wc.js`;
            return this.fileEngine.write(finalPath, htmlData).catch(err => {
                logger.error('Error during ' + finalPath + ' page generation');
                return Promise.reject('');
            });
        });
    }

    public processAdditionalPages() {
        logger.info('Process additional pages');
        let pages = this.configuration.mainData.additionalPages;
        Promise.all(pages.map((page, i) => this.processPage(page)))
            .then(() => {
                this.searchEngine
                    .generateSearchIndexJson(this.configuration.mainData.output)
                    .then(() => {
                        if (this.configuration.mainData.assetsFolder !== '') {
                            this.processAssetsFolder();
                        }
                        this.processResources();
                    });
            })
            .catch(e => {
                logger.error(e);
                return Promise.reject(e);
            });
    }

    public processAssetsFolder(): void {
        logger.info('Copy assets folder');

        if (!this.fileEngine.existsSync(this.configuration.mainData.assetsFolder)) {
            logger.error(
                `Provided assets folder ${this.configuration.mainData.assetsFolder} did not exist`
            );
        } else {
            let finalOutput = this.configuration.mainData.output;

            let testOutputDir = this.configuration.mainData.output.match(process.cwd());

            if (testOutputDir && testOutputDir.length > 0) {
                finalOutput = this.configuration.mainData.output.replace(
                    process.cwd() + path.sep,
                    ''
                );
            }

            const destination = path.join(
                finalOutput,
                path.basename(this.configuration.mainData.assetsFolder)
            );
            fs.copy(
                path.resolve(this.configuration.mainData.assetsFolder),
                path.resolve(destination),
                err => {
                    if (err) {
                        logger.error('Error during resources copy ', err);
                    }
                }
            );
        }
    }

    public processResources() {
        logger.info('Copy main resources');

        const onComplete = () => {
            logger.info(
                'Documentation generated in ' +
                    this.configuration.mainData.output +
                    ' in ' +
                    this.getElapsedTime() +
                    ' seconds using ' +
                    this.configuration.mainData.theme +
                    ' theme'
            );
            if (this.configuration.mainData.serve) {
                logger.info(
                    `Serving documentation from ${
                        this.configuration.mainData.output
                    } at http://127.0.0.1:${this.configuration.mainData.port}`
                );
                this.runWebServer(this.configuration.mainData.output);
            } else {
                generationPromiseResolve();
                this.endCallback();
            }
        };

        let finalOutput = this.configuration.mainData.output;

        let testOutputDir = this.configuration.mainData.output.match(process.cwd());

        if (testOutputDir && testOutputDir.length > 0) {
            finalOutput = this.configuration.mainData.output.replace(process.cwd() + path.sep, '');
        }

        fs.copy(
            path.resolve(__dirname + '/../src/resources/'),
            path.resolve(finalOutput),
            errorCopy => {
                if (errorCopy) {
                    logger.error('Error during resources copy ', errorCopy);
                } else {
                    if (this.configuration.mainData.extTheme) {
                        fs.copy(
                            path.resolve(
                                process.cwd() + path.sep + this.configuration.mainData.extTheme
                            ),
                            path.resolve(finalOutput + '/styles/'),
                            function(errorCopyTheme) {
                                if (errorCopyTheme) {
                                    logger.error(
                                        'Error during external styling theme copy ',
                                        errorCopyTheme
                                    );
                                } else {
                                    logger.info('External styling theme copy succeeded');
                                    onComplete();
                                }
                            }
                        );
                    } else {
                        if (this.configuration.mainData.customFavicon !== '') {
                            logger.info(`Custom favicon supplied`);
                            fs.copy(
                                path.resolve(
                                    process.cwd() +
                                        path.sep +
                                        this.configuration.mainData.customFavicon
                                ),
                                path.resolve(finalOutput + '/images/favicon.ico'),
                                errorCopyFavicon => {
                                    // tslint:disable-line
                                    if (errorCopyFavicon) {
                                        logger.error(
                                            'Error during resources copy ',
                                            errorCopyFavicon
                                        );
                                    } else {
                                        onComplete();
                                    }
                                }
                            );
                        } else {
                            onComplete();
                        }
                    }
                }
            }
        );
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
                    if (
                        _rawModule.declarations.length > 0 ||
                        _rawModule.bootstrap.length > 0 ||
                        _rawModule.imports.length > 0 ||
                        _rawModule.exports.length > 0 ||
                        _rawModule.providers.length > 0
                    ) {
                        this.ngdEngine
                            .renderGraph(modules[i].file, finalPath, 'f', modules[i].name)
                            .then(
                                () => {
                                    this.ngdEngine
                                        .readGraph(
                                            path.resolve(finalPath + path.sep + 'dependencies.svg'),
                                            modules[i].name
                                        )
                                        .then(
                                            data => {
                                                modules[i].graph = data as string;
                                                i++;
                                                loop();
                                            },
                                            err => {
                                                logger.error('Error during graph read: ', err);
                                            }
                                        );
                                },
                                errorMessage => {
                                    logger.error(errorMessage);
                                }
                            );
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

            this.ngdEngine
                .renderGraph(
                    this.configuration.mainData.tsconfig,
                    path.resolve(finalMainGraphPath),
                    'p'
                )
                .then(
                    () => {
                        this.ngdEngine
                            .readGraph(
                                path.resolve(finalMainGraphPath + path.sep + 'dependencies.svg'),
                                'Main graph'
                            )
                            .then(
                                data => {
                                    this.configuration.mainData.mainGraph = data as string;
                                    loop();
                                },
                                err => {
                                    logger.error('Error during main graph reading : ', err);
                                    this.configuration.mainData.disableMainGraph = true;
                                    loop();
                                }
                            );
                    },
                    err => {
                        logger.error(
                            'Ooops error during main graph generation, moving on next part with main graph disabled : ',
                            err
                        );
                        this.configuration.mainData.disableMainGraph = true;
                        loop();
                    }
                );
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

        watcher.on('ready', () => {
            if (!watcherReady) {
                watcherReady = true;
                watcher
                    .on('add', file => {
                        logger.debug(`File ${file} has been added`);
                        // Test extension, if ts
                        // rescan everything
                        if (path.extname(file) === '.ts') {
                            waiterAddAndRemove();
                        }
                    })
                    .on('change', file => {
                        logger.debug(`File ${file} has been changed`);
                        // Test extension, if ts
                        // rescan only file
                        if (
                            path.extname(file) === '.ts' ||
                            path.extname(file) === '.md' ||
                            path.extname(file) === '.json'
                        ) {
                            this.watchChangedFiles.push(path.join(process.cwd() + path.sep + file));
                            waiterChange();
                        }
                    })
                    .on('unlink', file => {
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
