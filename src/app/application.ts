import * as fs from 'fs-extra';
import * as LiveServer from '@compodoc/live-server';
import * as _ from 'lodash';
import * as path from 'path';

import { SyntaxKind } from 'ts-morph';

const chokidar = require('chokidar');
const { marked } = require('marked');
const traverse = require('traverse');
const crypto = require('crypto');
const babel = require('@babel/core');

import { logger } from '../utils/logger';

import Configuration from './configuration';

import DependenciesEngine from './engines/dependencies.engine';
import ExportEngine from './engines/export.engine';
import FileEngine from './engines/file.engine';
import HtmlEngine from './engines/html.engine';
import I18nEngine from './engines/i18n.engine';
import MarkdownEngine, { markdownReadedDatas } from './engines/markdown.engine';
import NgdEngine from './engines/ngd.engine';
import SearchEngine from './engines/search.engine';

import { AngularDependencies } from './compiler/angular-dependencies';
import { AngularJSDependencies } from './compiler/angularjs-dependencies';

import AngularVersionUtil from '../utils/angular-version.util';
import { COMPODOC_CONSTANTS } from '../utils/constants';
import { COMPODOC_DEFAULTS } from '../utils/defaults';
import { promiseSequential } from '../utils/promise-sequential';
import RouterParserUtil from '../utils/router-parser.util';

import {
    cleanNameWithoutSpaceAndToLowerCase,
    cleanSourcesForWatch,
    findMainSourceFolder
} from '../utils/utils';

import { AdditionalNode } from './interfaces/additional-node.interface';
import { CoverageData } from './interfaces/coverageData.interface';
import { LiveServerConfiguration } from './interfaces/live-server-configuration.interface';

const cwd = process.cwd();
let startTime = new Date();
let generationPromiseResolve;
let generationPromiseReject;
const generationPromise = new Promise((resolve, reject) => {
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
     * Boolean for watching status
     * @type {boolean}
     */
    public isWatching: boolean = false;

    /**
     * Store package.json data
     */
    private packageJsonData = {};

    /**
     * Create a new compodoc application instance.
     *
     * @param options An object containing the options that should be used.
     */
    constructor(options?: Object) {
        for (let option in options) {
            if (typeof Configuration.mainData[option] !== 'undefined') {
                Configuration.mainData[option] = options[option];
            }
            // For documentationMainName, process it outside the loop, for handling conflict with pages name
            if (option === 'name') {
                Configuration.mainData.documentationMainName = options[option];
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

        I18nEngine.init(Configuration.mainData.language);

        if (
            Configuration.mainData.output.charAt(Configuration.mainData.output.length - 1) !== '/'
        ) {
            Configuration.mainData.output += '/';
        }

        if (Configuration.mainData.exportFormat !== COMPODOC_DEFAULTS.exportFormat) {
            this.processPackageJson();
        } else {
            HtmlEngine.init(Configuration.mainData.templates).then(() => this.processPackageJson());
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
            if (path.extname(file) === '.md' && path.dirname(file) === cwd) {
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
        FileEngine.get(cwd + path.sep + 'package.json').then(
            packageData => {
                let parsedData = JSON.parse(packageData);
                this.packageJsonData = parsedData;
                if (
                    typeof parsedData.name !== 'undefined' &&
                    Configuration.mainData.documentationMainName === COMPODOC_DEFAULTS.title
                ) {
                    Configuration.mainData.documentationMainName =
                        parsedData.name + ' documentation';
                }
                if (typeof parsedData.description !== 'undefined') {
                    Configuration.mainData.documentationMainDescription = parsedData.description;
                }
                Configuration.mainData.angularVersion =
                    AngularVersionUtil.getAngularVersionOfProject(parsedData);
                logger.info('package.json file found');

                if (!Configuration.mainData.disableDependencies) {
                    if (typeof parsedData.dependencies !== 'undefined') {
                        this.processPackageDependencies(parsedData.dependencies);
                    }
                    if (typeof parsedData.peerDependencies !== 'undefined') {
                        this.processPackagePeerDependencies(parsedData.peerDependencies);
                    }
                }

                if (!Configuration.mainData.disableProperties) {
                    const propertiesToCheck = [
                        'version',
                        'description',
                        'keywords',
                        'homepage',
                        'bugs',
                        'license',
                        'repository',
                        'author'
                    ];
                    let hasOneOfCheckedProperties = false;
                    propertiesToCheck.forEach(prop => {
                        if (prop in parsedData) {
                            hasOneOfCheckedProperties = true;
                            Configuration.mainData.packageProperties[prop] = parsedData[prop];
                        }
                    });
                    if (hasOneOfCheckedProperties) {
                        Configuration.addPage({
                            name: 'properties',
                            id: 'packageProperties',
                            context: 'package-properties',
                            depth: 0,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                        });
                    }
                }

                this.processMarkdowns().then(
                    () => {
                        this.getDependenciesData();
                    },
                    errorMessage => {
                        logger.error(errorMessage);
                        process.exit(1);
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
                        process.exit(1);
                    }
                );
            }
        );
    }

    private processPackagePeerDependencies(dependencies): void {
        logger.info('Processing package.json peerDependencies');
        Configuration.mainData.packagePeerDependencies = dependencies;
        if (!Configuration.hasPage('dependencies')) {
            Configuration.addPage({
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
        Configuration.mainData.packageDependencies = dependencies;
        Configuration.addPage({
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
                    MarkdownEngine.getTraditionalMarkdown(markdowns[i].toUpperCase()).then(
                        (readmeData: markdownReadedDatas) => {
                            Configuration.addPage({
                                name: markdowns[i] === 'readme' ? 'index' : markdowns[i],
                                context: 'getting-started',
                                id: 'getting-started',
                                markdown: readmeData.markdown,
                                data: readmeData.rawData,
                                depth: 0,
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                            });
                            if (markdowns[i] === 'readme') {
                                Configuration.mainData.readme = true;
                                Configuration.addPage({
                                    name: 'overview',
                                    id: 'overview',
                                    context: 'overview',
                                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                                });
                            } else {
                                Configuration.mainData.markdowns.push({
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
                                Configuration.addPage({
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

        Configuration.resetRootMarkdownPages();

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

        let dependenciesClass: AngularDependencies | AngularJSDependencies = AngularDependencies;
        Configuration.mainData.angularProject = true;

        if (this.detectAngularJSProjects()) {
            logger.info('AngularJS project detected');
            Configuration.mainData.angularProject = false;
            Configuration.mainData.angularJSProject = true;
            dependenciesClass = AngularJSDependencies;
        }

        let crawler = new dependenciesClass(
            this.updatedFiles,
            {
                tsconfigDirectory: path.dirname(Configuration.mainData.tsconfig)
            },
            Configuration,
            RouterParserUtil
        );

        let dependenciesData = crawler.getDependencies();

        DependenciesEngine.update(dependenciesData);

        this.prepareJustAFewThings(dependenciesData);
    }

    /**
     * Rebuild external documentation during watch process
     */
    private rebuildExternalDocumentation(): void {
        logger.info('Rebuild external documentation');

        let actions = [];

        Configuration.resetAdditionalPages();

        if (Configuration.mainData.includes !== '') {
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

    private detectAngularJSProjects() {
        let result = false;
        if (typeof this.packageJsonData.dependencies !== 'undefined') {
            if (typeof this.packageJsonData.dependencies.angular !== 'undefined') {
                result = true;
            } else {
                let countJSFiles = 0;
                this.files.forEach(file => {
                    if (path.extname(file) === '.js') {
                        countJSFiles += 1;
                    }
                });
                let percentOfJSFiles = (countJSFiles * 100) / this.files.length;
                if (percentOfJSFiles >= 75) {
                    result = true;
                }
            }
        }
        return false;
    }

    private getDependenciesData(): void {
        logger.info('Get dependencies data');

        /**
         * AngularJS detection strategy :
         * - if in package.json
         * - if 75% of scanned files are *.js files
         */
        let dependenciesClass: AngularDependencies | AngularJSDependencies = AngularDependencies;
        Configuration.mainData.angularProject = true;

        if (this.detectAngularJSProjects()) {
            logger.info('AngularJS project detected');
            Configuration.mainData.angularProject = false;
            Configuration.mainData.angularJSProject = true;
            dependenciesClass = AngularJSDependencies;
        }

        let crawler = new dependenciesClass(
            this.files,
            {
                tsconfigDirectory: path.dirname(Configuration.mainData.tsconfig)
            },
            Configuration,
            RouterParserUtil
        );

        let dependenciesData = crawler.getDependencies();

        DependenciesEngine.init(dependenciesData);

        Configuration.mainData.routesLength = RouterParserUtil.routesLength();

        this.printStatistics();

        this.prepareEverything();
    }

    private prepareJustAFewThings(diffCrawledData): void {
        let actions = [];

        Configuration.resetPages();

        if (!Configuration.mainData.disableRoutesGraph) {
            actions.push(() => this.prepareRoutes());
        }

        if (diffCrawledData.components.length > 0) {
            actions.push(() => this.prepareComponents());
        }
        if (diffCrawledData.controllers.length > 0) {
            actions.push(() => this.prepareControllers());
        }
        if (diffCrawledData.entities.length > 0) {
            actions.push(() => this.prepareEntities());
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

        if (!Configuration.mainData.disableCoverage) {
            actions.push(() => this.prepareCoverage());
        }

        promiseSequential(actions)
            .then(res => {
                if (Configuration.mainData.exportFormat !== COMPODOC_DEFAULTS.exportFormat) {
                    if (
                        COMPODOC_DEFAULTS.exportFormatsSupported.indexOf(
                            Configuration.mainData.exportFormat
                        ) > -1
                    ) {
                        logger.info(
                            `Generating documentation in export format ${Configuration.mainData.exportFormat}`
                        );
                        ExportEngine.export(
                            Configuration.mainData.output,
                            Configuration.mainData
                        ).then(() => {
                            generationPromiseResolve();
                            this.endCallback();
                            logger.info(
                                'Documentation generated in ' +
                                    Configuration.mainData.output +
                                    ' in ' +
                                    this.getElapsedTime() +
                                    ' seconds'
                            );
                            if (Configuration.mainData.serve) {
                                logger.info(
                                    `Serving documentation from ${Configuration.mainData.output} at http://${Configuration.mainData.hostname}:${Configuration.mainData.port}`
                                );
                                this.runWebServer(Configuration.mainData.output);
                            }
                        });
                    } else {
                        logger.warn(`Exported format not supported`);
                    }
                } else {
                    this.processGraphs();
                    this.clearUpdatedFiles();
                }
            })
            .catch(errorMessage => {
                logger.error(errorMessage);
            });
    }

    private printStatistics() {
        logger.info('-------------------');
        logger.info('Project statistics ');
        if (DependenciesEngine.modules.length > 0) {
            logger.info(`- files      : ${this.files.length}`);
        }
        if (DependenciesEngine.modules.length > 0) {
            logger.info(`- module     : ${DependenciesEngine.modules.length}`);
        }
        if (DependenciesEngine.components.length > 0) {
            logger.info(`- component  : ${DependenciesEngine.components.length}`);
        }
        if (DependenciesEngine.controllers.length > 0) {
            logger.info(`- controller : ${DependenciesEngine.controllers.length}`);
        }
        if (DependenciesEngine.entities.length > 0) {
            logger.info(`- entity     : ${DependenciesEngine.entities.length}`);
        }
        if (DependenciesEngine.directives.length > 0) {
            logger.info(`- directive  : ${DependenciesEngine.directives.length}`);
        }
        if (DependenciesEngine.injectables.length > 0) {
            logger.info(`- injectable : ${DependenciesEngine.injectables.length}`);
        }
        if (DependenciesEngine.interceptors.length > 0) {
            logger.info(`- injector   : ${DependenciesEngine.interceptors.length}`);
        }
        if (DependenciesEngine.guards.length > 0) {
            logger.info(`- guard      : ${DependenciesEngine.guards.length}`);
        }
        if (DependenciesEngine.pipes.length > 0) {
            logger.info(`- pipe       : ${DependenciesEngine.pipes.length}`);
        }
        if (DependenciesEngine.classes.length > 0) {
            logger.info(`- class      : ${DependenciesEngine.classes.length}`);
        }
        if (DependenciesEngine.interfaces.length > 0) {
            logger.info(`- interface  : ${DependenciesEngine.interfaces.length}`);
        }
        if (Configuration.mainData.routesLength > 0) {
            logger.info(`- route      : ${Configuration.mainData.routesLength}`);
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

        if (DependenciesEngine.directives.length > 0) {
            actions.push(() => {
                return this.prepareDirectives();
            });
        }

        if (DependenciesEngine.controllers.length > 0) {
            actions.push(() => {
                return this.prepareControllers();
            });
        }

        if (DependenciesEngine.entities.length > 0) {
            actions.push(() => {
                return this.prepareEntities();
            });
        }

        if (DependenciesEngine.injectables.length > 0) {
            actions.push(() => {
                return this.prepareInjectables();
            });
        }

        if (DependenciesEngine.interceptors.length > 0) {
            actions.push(() => {
                return this.prepareInterceptors();
            });
        }

        if (DependenciesEngine.guards.length > 0) {
            actions.push(() => {
                return this.prepareGuards();
            });
        }

        if (
            DependenciesEngine.routes &&
            DependenciesEngine.routes.children.length > 0 &&
            !Configuration.mainData.disableRoutesGraph
        ) {
            actions.push(() => {
                return this.prepareRoutes();
            });
        }

        if (DependenciesEngine.pipes.length > 0) {
            actions.push(() => {
                return this.preparePipes();
            });
        }

        if (DependenciesEngine.classes.length > 0) {
            actions.push(() => {
                return this.prepareClasses();
            });
        }

        if (DependenciesEngine.interfaces.length > 0) {
            actions.push(() => {
                return this.prepareInterfaces();
            });
        }

        if (
            DependenciesEngine.miscellaneous.variables.length > 0 ||
            DependenciesEngine.miscellaneous.functions.length > 0 ||
            DependenciesEngine.miscellaneous.typealiases.length > 0 ||
            DependenciesEngine.miscellaneous.enumerations.length > 0
        ) {
            actions.push(() => {
                return this.prepareMiscellaneous();
            });
        }

        if (!Configuration.mainData.disableCoverage) {
            actions.push(() => {
                return this.prepareCoverage();
            });
        }

        if (Configuration.mainData.unitTestCoverage !== '') {
            actions.push(() => {
                return this.prepareUnitTestCoverage();
            });
        }

        if (Configuration.mainData.includes !== '') {
            actions.push(() => {
                return this.prepareExternalIncludes();
            });
        }

        promiseSequential(actions)
            .then(res => {
                if (Configuration.mainData.exportFormat !== COMPODOC_DEFAULTS.exportFormat) {
                    if (
                        COMPODOC_DEFAULTS.exportFormatsSupported.indexOf(
                            Configuration.mainData.exportFormat
                        ) > -1
                    ) {
                        logger.info(
                            `Generating documentation in export format ${Configuration.mainData.exportFormat}`
                        );
                        ExportEngine.export(
                            Configuration.mainData.output,
                            Configuration.mainData
                        ).then(() => {
                            generationPromiseResolve();
                            this.endCallback();
                            logger.info(
                                'Documentation generated in ' +
                                    Configuration.mainData.output +
                                    ' in ' +
                                    this.getElapsedTime() +
                                    ' seconds'
                            );
                            if (Configuration.mainData.serve) {
                                logger.info(
                                    `Serving documentation from ${Configuration.mainData.output} at http://${Configuration.mainData.hostname}:${Configuration.mainData.port}`
                                );
                                this.runWebServer(Configuration.mainData.output);
                            }
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
                process.exit(1);
            });
    }

    private getIncludedPathForFile(file) {
        return path.join(Configuration.mainData.includes, file);
    }

    private prepareExternalIncludes() {
        logger.info('Adding external markdown files');
        // Scan include folder for files detailed in summary.json
        // For each file, add to Configuration.mainData.additionalPages
        // Each file will be converted to html page, inside COMPODOC_DEFAULTS.additionalEntryPath
        return new Promise((resolve, reject) => {
            FileEngine.get(this.getIncludedPathForFile('summary.json')).then(
                summaryData => {
                    logger.info('Additional documentation: summary.json file found');

                    const parsedSummaryData = JSON.parse(summaryData);

                    let that = this;
                    let lastLevelOnePage = undefined;

                    traverse(parsedSummaryData).forEach(function () {
                        // tslint:disable-next-line:no-invalid-this
                        if (this.notRoot && typeof this.node === 'object') {
                            // tslint:disable-next-line:no-invalid-this
                            let rawPath = this.path;
                            // tslint:disable-next-line:no-invalid-this
                            let additionalNode: AdditionalNode = this.node;
                            let file = additionalNode.file;
                            let title = additionalNode.title;
                            let finalPath = Configuration.mainData.includesFolder;

                            let finalDepth = rawPath.filter(el => {
                                return !isNaN(parseInt(el, 10));
                            });

                            if (typeof file !== 'undefined' && typeof title !== 'undefined') {
                                const url = cleanNameWithoutSpaceAndToLowerCase(title);

                                /**
                                 * Id created with title + file path hash, seems to be hypothetically unique here
                                 */
                                const id = crypto
                                    .createHash('sha512')
                                    .update(title + file)
                                    .digest('hex');

                                // tslint:disable-next-line:no-invalid-this
                                this.node.id = id;

                                let lastElementRootTree = undefined;
                                finalDepth.forEach(el => {
                                    let elementTree =
                                        typeof lastElementRootTree === 'undefined'
                                            ? parsedSummaryData
                                            : lastElementRootTree;
                                    if (typeof elementTree.children !== 'undefined') {
                                        elementTree = elementTree.children[el];
                                    } else {
                                        elementTree = elementTree[el];
                                    }
                                    finalPath +=
                                        '/' +
                                        cleanNameWithoutSpaceAndToLowerCase(elementTree.title);
                                    lastElementRootTree = elementTree;
                                });

                                finalPath = finalPath.replace('/' + url, '');
                                let markdownFile = MarkdownEngine.getTraditionalMarkdownSync(
                                    that.getIncludedPathForFile(file)
                                );

                                if (finalDepth.length > 5) {
                                    logger.error('Only 5 levels of depth are supported');
                                } else {
                                    let _page = {
                                        name: title,
                                        id: id,
                                        filename: url,
                                        context: 'additional-page',
                                        path: finalPath,
                                        additionalPage: markdownFile,
                                        depth: finalDepth.length,
                                        childrenLength: additionalNode.children
                                            ? additionalNode.children.length
                                            : 0,
                                        children: [],
                                        lastChild: false,
                                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                                    };
                                    if (finalDepth.length === 1) {
                                        lastLevelOnePage = _page;
                                    }
                                    if (finalDepth.length > 1) {
                                        // store all child pages of the last root level 1 page inside it
                                        lastLevelOnePage.children.push(_page);
                                    } else {
                                        Configuration.addAdditionalPage(_page);
                                    }
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
        let _modules = someModules ? someModules : DependenciesEngine.getModules();

        return new Promise((resolve, reject) => {
            Configuration.mainData.modules = _modules.map(ngModule => {
                ngModule.compodocLinks = {
                    components: [],
                    controllers: [],
                    directives: [],
                    injectables: [],
                    pipes: []
                };
                ['declarations', 'bootstrap', 'imports', 'exports', 'controllers'].forEach(
                    metadataType => {
                        ngModule[metadataType] = ngModule[metadataType].filter(metaDataItem => {
                            switch (metaDataItem.type) {
                                case 'directive':
                                    return DependenciesEngine.getDirectives().some(directive => {
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
                                    return DependenciesEngine.getComponents().some(component => {
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
                                    return DependenciesEngine.getControllers().some(controller => {
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
                                    return DependenciesEngine.getModules().some(
                                        module => (module as any).name === metaDataItem.name
                                    );

                                case 'pipe':
                                    return DependenciesEngine.getPipes().some(pipe => {
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
                    }
                );
                ngModule.providers = ngModule.providers.filter(provider => {
                    return (
                        DependenciesEngine.getInjectables().some(injectable => {
                            let selectedInjectable = (injectable as any).name === provider.name;
                            if (
                                selectedInjectable &&
                                !ngModule.compodocLinks.injectables.includes(injectable)
                            ) {
                                ngModule.compodocLinks.injectables.push(injectable);
                            }
                            return selectedInjectable;
                        }) ||
                        DependenciesEngine.getInterceptors().some(
                            interceptor => (interceptor as any).name === provider.name
                        )
                    );
                });
                // Try fixing type undefined for each providers
                _.forEach(ngModule.providers, provider => {
                    if (
                        DependenciesEngine.getInjectables().find(
                            injectable => (injectable as any).name === provider.name
                        )
                    ) {
                        provider.type = 'injectable';
                    }
                    if (
                        DependenciesEngine.getInterceptors().find(
                            interceptor => (interceptor as any).name === provider.name
                        )
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

            Configuration.addPage({
                name: 'modules',
                id: 'modules',
                context: 'modules',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });

            let len = Configuration.mainData.modules.length;
            let loop = () => {
                if (i < len) {
                    if (
                        MarkdownEngine.hasNeighbourReadmeFile(
                            Configuration.mainData.modules[i].file
                        )
                    ) {
                        logger.info(
                            ` ${Configuration.mainData.modules[i].name} has a README file, include it`
                        );
                        let readme = MarkdownEngine.readNeighbourReadmeFile(
                            Configuration.mainData.modules[i].file
                        );
                        Configuration.mainData.modules[i].readme = marked(readme);
                    }
                    Configuration.addPage({
                        path: 'modules',
                        name: Configuration.mainData.modules[i].name,
                        id: Configuration.mainData.modules[i].id,
                        navTabs: this.getNavTabs(Configuration.mainData.modules[i]),
                        context: 'module',
                        module: Configuration.mainData.modules[i],
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
        Configuration.mainData.pipes = somePipes ? somePipes : DependenciesEngine.getPipes();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = Configuration.mainData.pipes.length;
            let loop = () => {
                if (i < len) {
                    let pipe = Configuration.mainData.pipes[i];
                    if (MarkdownEngine.hasNeighbourReadmeFile(pipe.file)) {
                        logger.info(` ${pipe.name} has a README file, include it`);
                        let readme = MarkdownEngine.readNeighbourReadmeFile(pipe.file);
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
                    Configuration.addPage(page);
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
        Configuration.mainData.classes = someClasses
            ? someClasses
            : DependenciesEngine.getClasses();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = Configuration.mainData.classes.length;
            let loop = () => {
                if (i < len) {
                    let classe = Configuration.mainData.classes[i];
                    if (MarkdownEngine.hasNeighbourReadmeFile(classe.file)) {
                        logger.info(` ${classe.name} has a README file, include it`);
                        let readme = MarkdownEngine.readNeighbourReadmeFile(classe.file);
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
                    Configuration.addPage(page);
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
        Configuration.mainData.interfaces = someInterfaces
            ? someInterfaces
            : DependenciesEngine.getInterfaces();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = Configuration.mainData.interfaces.length;
            let loop = () => {
                if (i < len) {
                    let interf = Configuration.mainData.interfaces[i];
                    if (MarkdownEngine.hasNeighbourReadmeFile(interf.file)) {
                        logger.info(` ${interf.name} has a README file, include it`);
                        let readme = MarkdownEngine.readNeighbourReadmeFile(interf.file);
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
                    Configuration.addPage(page);
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
        Configuration.mainData.miscellaneous = someMisc
            ? someMisc
            : DependenciesEngine.getMiscellaneous();

        return new Promise((resolve, reject) => {
            if (Configuration.mainData.miscellaneous.functions.length > 0) {
                Configuration.addPage({
                    path: 'miscellaneous',
                    name: 'functions',
                    id: 'miscellaneous-functions',
                    context: 'miscellaneous-functions',
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            if (Configuration.mainData.miscellaneous.variables.length > 0) {
                Configuration.addPage({
                    path: 'miscellaneous',
                    name: 'variables',
                    id: 'miscellaneous-variables',
                    context: 'miscellaneous-variables',
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            if (Configuration.mainData.miscellaneous.typealiases.length > 0) {
                Configuration.addPage({
                    path: 'miscellaneous',
                    name: 'typealiases',
                    id: 'miscellaneous-typealiases',
                    context: 'miscellaneous-typealiases',
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            if (Configuration.mainData.miscellaneous.enumerations.length > 0) {
                Configuration.addPage({
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

        if (!FileEngine.existsSync(templatePath)) {
            let err = `Cannot read template for ${component.name}`;
            logger.error(err);
            return new Promise((resolve, reject) => {});
        }

        return FileEngine.get(templatePath).then(
            data => (component.templateData = data),
            err => {
                logger.error(err);
                return Promise.reject('');
            }
        );
    }

    private handleStyles(component): Promise<any> {
        let styles = component.styles;
        component.stylesData = '';
        return new Promise((resolveStyles, rejectStyles) => {
            styles.forEach(style => {
                component.stylesData = component.stylesData + style + '\n';
            });
            resolveStyles();
        });
    }

    private handleStyleurls(component): Promise<any> {
        let dirname = path.dirname(component.file);

        let styleDataPromise = component.styleUrls.map(styleUrl => {
            let stylePath = path.resolve(dirname + path.sep + styleUrl);

            if (!FileEngine.existsSync(stylePath)) {
                let err = `Cannot read style url ${stylePath} for ${component.name}`;
                logger.error(err);
                return new Promise((resolve, reject) => {});
            }

            return new Promise((resolve, reject) => {
                FileEngine.get(stylePath).then(data => {
                    resolve({
                        data,
                        styleUrl
                    });
                });
            });
        });

        return Promise.all(styleDataPromise).then(
            data => (component.styleUrlsData = data),
            err => {
                logger.error(err);
                return Promise.reject('');
            }
        );
    }

    private getNavTabs(dependency): Array<any> {
        let navTabConfig = Configuration.mainData.navTabConfig;
        const hasCustomNavTabConfig = navTabConfig.length !== 0;
        navTabConfig =
            navTabConfig.length === 0
                ? _.cloneDeep(COMPODOC_CONSTANTS.navTabDefinitions)
                : navTabConfig;
        let matchDepType = (depType: string) => {
            return depType === 'all' || depType === dependency.type;
        };

        let navTabs = [];
        _.forEach(navTabConfig, customTab => {
            let navTab = _.find(COMPODOC_CONSTANTS.navTabDefinitions, { id: customTab.id });
            if (!navTab) {
                throw new Error(`Invalid tab ID '${customTab.id}' specified in tab configuration`);
            }

            navTab.label = customTab.label;

            if (hasCustomNavTabConfig) {
                navTab.custom = true;
            }

            // is tab applicable to target dependency?
            if (-1 === _.findIndex(navTab.depTypes, matchDepType)) {
                return;
            }

            // global config
            if (customTab.id === 'tree' && Configuration.mainData.disableDomTree) {
                return;
            }
            if (customTab.id === 'source' && Configuration.mainData.disableSourceCode) {
                return;
            }
            if (customTab.id === 'templateData' && Configuration.mainData.disableTemplateTab) {
                return;
            }
            if (customTab.id === 'styleData' && Configuration.mainData.disableStyleTab) {
                return;
            }

            // per dependency config
            if (customTab.id === 'readme' && !dependency.readme) {
                return;
            }
            if (customTab.id === 'example' && !dependency.exampleUrls) {
                return;
            }
            if (
                customTab.id === 'templateData' &&
                (!dependency.templateUrl || dependency.templateUrl.length === 0)
            ) {
                return;
            }
            if (
                customTab.id === 'styleData' &&
                (!dependency.styleUrls || dependency.styleUrls.length === 0) &&
                (!dependency.styles || dependency.styles.length === 0)
            ) {
                return;
            }

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
        Configuration.mainData.controllers = someControllers
            ? someControllers
            : DependenciesEngine.getControllers();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = Configuration.mainData.controllers.length;
            let loop = () => {
                if (i < len) {
                    let controller = Configuration.mainData.controllers[i];
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
                    Configuration.addPage(page);
                    i++;
                    loop();
                } else {
                    resolve();
                }
            };
            loop();
        });
    }

    public prepareEntities(someEntities?) {
        logger.info('Prepare entities');
        Configuration.mainData.entities = someEntities
            ? someEntities
            : DependenciesEngine.getEntities();

        return new Promise((resolve, reject) => {
            let i = 0;
            const len = Configuration.mainData.entities.length;
            const loop = () => {
                if (i < len) {
                    let entity = Configuration.mainData.entities[i];
                    let page = {
                        path: 'entities',
                        name: entity.name,
                        id: entity.id,
                        navTabs: this.getNavTabs(entity),
                        context: 'entity',
                        entity: entity,
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    };
                    if (entity.isDuplicate) {
                        page.name += '-' + entity.duplicateId;
                    }
                    Configuration.addPage(page);
                    i++;
                    loop();
                } else {
                    resolve(true);
                }
            };
            loop();
        });
    }

    public prepareComponents(someComponents?) {
        logger.info('Prepare components');
        Configuration.mainData.components = someComponents
            ? someComponents
            : DependenciesEngine.getComponents();

        return new Promise((mainPrepareComponentResolve, mainPrepareComponentReject) => {
            let i = 0;
            let len = Configuration.mainData.components.length;
            let loop = () => {
                if (i <= len - 1) {
                    let component = Configuration.mainData.components[i];
                    if (MarkdownEngine.hasNeighbourReadmeFile(component.file)) {
                        logger.info(` ${component.name} has a README file, include it`);
                        let readmeFile = MarkdownEngine.readNeighbourReadmeFile(component.file);
                        component.readme = marked(readmeFile);
                    }
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
                    Configuration.addPage(page);

                    const componentTemplateUrlPromise = new Promise(
                        (componentTemplateUrlResolve, componentTemplateUrlReject) => {
                            if (component.templateUrl.length > 0) {
                                logger.info(` ${component.name} has a templateUrl, include it`);
                                this.handleTemplateurl(component).then(
                                    () => {
                                        componentTemplateUrlResolve();
                                    },
                                    e => {
                                        logger.error(e);
                                        componentTemplateUrlReject();
                                    }
                                );
                            } else {
                                componentTemplateUrlResolve();
                            }
                        }
                    );
                    const componentStyleUrlsPromise = new Promise(
                        (componentStyleUrlsResolve, componentStyleUrlsReject) => {
                            if (component.styleUrls.length > 0) {
                                logger.info(` ${component.name} has styleUrls, include them`);
                                this.handleStyleurls(component).then(
                                    () => {
                                        componentStyleUrlsResolve();
                                    },
                                    e => {
                                        logger.error(e);
                                        componentStyleUrlsReject();
                                    }
                                );
                            } else {
                                componentStyleUrlsResolve();
                            }
                        }
                    );
                    const componentStylesPromise = new Promise(
                        (componentStylesResolve, componentStylesReject) => {
                            if (component.styles.length > 0) {
                                logger.info(` ${component.name} has styles, include them`);
                                this.handleStyles(component).then(
                                    () => {
                                        componentStylesResolve();
                                    },
                                    e => {
                                        logger.error(e);
                                        componentStylesReject();
                                    }
                                );
                            } else {
                                componentStylesResolve();
                            }
                        }
                    );

                    Promise.all([
                        componentTemplateUrlPromise,
                        componentStyleUrlsPromise,
                        componentStylesPromise
                    ]).then(() => {
                        i++;
                        loop();
                    });
                } else {
                    mainPrepareComponentResolve();
                }
            };
            loop();
        });
    }

    public prepareDirectives(someDirectives?) {
        logger.info('Prepare directives');

        Configuration.mainData.directives = someDirectives
            ? someDirectives
            : DependenciesEngine.getDirectives();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = Configuration.mainData.directives.length;
            let loop = () => {
                if (i < len) {
                    let directive = Configuration.mainData.directives[i];
                    if (MarkdownEngine.hasNeighbourReadmeFile(directive.file)) {
                        logger.info(` ${directive.name} has a README file, include it`);
                        let readme = MarkdownEngine.readNeighbourReadmeFile(directive.file);
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
                    Configuration.addPage(page);
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

        Configuration.mainData.injectables = someInjectables
            ? someInjectables
            : DependenciesEngine.getInjectables();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = Configuration.mainData.injectables.length;
            let loop = () => {
                if (i < len) {
                    let injec = Configuration.mainData.injectables[i];
                    if (MarkdownEngine.hasNeighbourReadmeFile(injec.file)) {
                        logger.info(` ${injec.name} has a README file, include it`);
                        let readme = MarkdownEngine.readNeighbourReadmeFile(injec.file);
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
                    Configuration.addPage(page);
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

        Configuration.mainData.interceptors = someInterceptors
            ? someInterceptors
            : DependenciesEngine.getInterceptors();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = Configuration.mainData.interceptors.length;
            let loop = () => {
                if (i < len) {
                    let interceptor = Configuration.mainData.interceptors[i];
                    if (MarkdownEngine.hasNeighbourReadmeFile(interceptor.file)) {
                        logger.info(` ${interceptor.name} has a README file, include it`);
                        let readme = MarkdownEngine.readNeighbourReadmeFile(interceptor.file);
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
                    Configuration.addPage(page);
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

        Configuration.mainData.guards = someGuards ? someGuards : DependenciesEngine.getGuards();

        return new Promise((resolve, reject) => {
            let i = 0;
            let len = Configuration.mainData.guards.length;
            let loop = () => {
                if (i < len) {
                    let guard = Configuration.mainData.guards[i];
                    if (MarkdownEngine.hasNeighbourReadmeFile(guard.file)) {
                        logger.info(` ${guard.name} has a README file, include it`);
                        let readme = MarkdownEngine.readNeighbourReadmeFile(guard.file);
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
                    Configuration.addPage(page);
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
        Configuration.mainData.routes = DependenciesEngine.getRoutes();

        return new Promise((resolve, reject) => {
            Configuration.addPage({
                name: 'routes',
                id: 'routes',
                context: 'routes',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });

            if (Configuration.mainData.exportFormat === COMPODOC_DEFAULTS.exportFormat) {
                RouterParserUtil.generateRoutesIndex(
                    Configuration.mainData.output,
                    Configuration.mainData.routes
                ).then(
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
             * loop with components, directives, controllers, entities, classes, injectables, interfaces, pipes, guards, misc functions variables
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
            const processComponentsAndDirectivesAndControllersAndEntities = list => {
                _.forEach(list, (el: any) => {
                    const element = (Object as any).assign({}, el);
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
                        (totalStatementDocumented / totalStatements) * 100
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
                        f.coveragePercent >= Configuration.mainData.coverageMinimumPerFile;
                    if (overTest && !Configuration.mainData.coverageTestShowOnlyFailed) {
                        logger.info(
                            `${f.coveragePercent} % for file ${f.filePath} - ${f.name} - over minimum per file`
                        );
                    }
                    return overTest;
                });
                let underFiles = files.filter(f => {
                    let underTest =
                        f.coveragePercent < Configuration.mainData.coverageMinimumPerFile;
                    if (underTest) {
                        logger.error(
                            `${f.coveragePercent} % for file ${f.filePath} - ${f.name} - under minimum per file`
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
                    if (type === 'variable' || type === 'function') {
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
                        (totalStatementDocumented / totalStatements) * 100
                    );
                    cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                    cl.status = getStatus(cl.coveragePercent);
                    totalProjectStatementDocumented += cl.coveragePercent;
                    files.push(cl);
                });
            };

            let processClasses = (list, type, linktype) => {
                _.forEach(list, (cl: any) => {
                    let element = (Object as any).assign({}, cl);
                    if (!element.properties) {
                        element.properties = [];
                    }
                    if (!element.methods) {
                        element.methods = [];
                    }
                    let cla: any = {
                        filePath: element.file,
                        type: type,
                        linktype: linktype,
                        name: element.name
                    };
                    let totalStatementDocumented = 0;
                    let totalStatements = element.properties.length + element.methods.length + 1; // +1 for element itself

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

                    _.forEach(element.properties, (property: any) => {
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
                    _.forEach(element.methods, (method: any) => {
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

                    cla.coveragePercent = Math.floor(
                        (totalStatementDocumented / totalStatements) * 100
                    );
                    if (totalStatements === 0) {
                        cla.coveragePercent = 0;
                    }
                    cla.coverageCount = totalStatementDocumented + '/' + totalStatements;
                    cla.status = getStatus(cla.coveragePercent);
                    totalProjectStatementDocumented += cla.coveragePercent;
                    files.push(cla);
                });
            };

            processComponentsAndDirectivesAndControllersAndEntities(
                Configuration.mainData.components
            );
            processComponentsAndDirectivesAndControllersAndEntities(
                Configuration.mainData.directives
            );
            processComponentsAndDirectivesAndControllersAndEntities(
                Configuration.mainData.controllers
            );
            processComponentsAndDirectivesAndControllersAndEntities(
                Configuration.mainData.entities
            );

            processClasses(Configuration.mainData.classes, 'class', 'classe');
            processClasses(Configuration.mainData.injectables, 'injectable', 'injectable');
            processClasses(Configuration.mainData.interfaces, 'interface', 'interface');
            processClasses(Configuration.mainData.guards, 'guard', 'guard');
            processClasses(Configuration.mainData.interceptors, 'interceptor', 'interceptor');

            _.forEach(Configuration.mainData.pipes, (pipe: any) => {
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

            processFunctionsAndVariables(
                Configuration.mainData.miscellaneous.functions,
                'function'
            );
            processFunctionsAndVariables(
                Configuration.mainData.miscellaneous.variables,
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
            Configuration.addPage({
                name: 'coverage',
                id: 'coverage',
                context: 'coverage',
                files: files,
                data: coverageData,
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            coverageData.files = files;
            Configuration.mainData.coverageData = coverageData;
            if (Configuration.mainData.exportFormat === COMPODOC_DEFAULTS.exportFormat) {
                HtmlEngine.generateCoverageBadge(
                    Configuration.mainData.output,
                    'documentation',
                    coverageData
                );
            }
            files = _.sortBy(files, ['coveragePercent']);

            let coverageTestPerFileResults;
            if (
                Configuration.mainData.coverageTest &&
                !Configuration.mainData.coverageTestPerFile
            ) {
                // Global coverage test and not per file
                if (coverageData.count >= Configuration.mainData.coverageTestThreshold) {
                    logger.info(
                        `Documentation coverage (${coverageData.count}%) is over threshold (${Configuration.mainData.coverageTestThreshold}%)`
                    );
                    generationPromiseResolve();
                    process.exit(0);
                } else {
                    let message = `Documentation coverage (${coverageData.count}%) is not over threshold (${Configuration.mainData.coverageTestThreshold}%)`;
                    generationPromiseReject();
                    if (Configuration.mainData.coverageTestThresholdFail) {
                        logger.error(message);
                        process.exit(1);
                    } else {
                        logger.warn(message);
                        process.exit(0);
                    }
                }
            } else if (
                !Configuration.mainData.coverageTest &&
                Configuration.mainData.coverageTestPerFile
            ) {
                coverageTestPerFileResults = processCoveragePerFile();
                // Per file coverage test and not global
                if (coverageTestPerFileResults.underFiles.length > 0) {
                    let message = `Documentation coverage per file is not over threshold (${Configuration.mainData.coverageMinimumPerFile}%)`;
                    generationPromiseReject();
                    if (Configuration.mainData.coverageTestThresholdFail) {
                        logger.error(message);
                        process.exit(1);
                    } else {
                        logger.warn(message);
                        process.exit(0);
                    }
                } else {
                    logger.info(
                        `Documentation coverage per file is over threshold (${Configuration.mainData.coverageMinimumPerFile}%)`
                    );
                    generationPromiseResolve();
                    process.exit(0);
                }
            } else if (
                Configuration.mainData.coverageTest &&
                Configuration.mainData.coverageTestPerFile
            ) {
                // Per file coverage test and global
                coverageTestPerFileResults = processCoveragePerFile();
                if (
                    coverageData.count >= Configuration.mainData.coverageTestThreshold &&
                    coverageTestPerFileResults.underFiles.length === 0
                ) {
                    logger.info(
                        `Documentation coverage (${coverageData.count}%) is over threshold (${Configuration.mainData.coverageTestThreshold}%)`
                    );
                    logger.info(
                        `Documentation coverage per file is over threshold (${Configuration.mainData.coverageMinimumPerFile}%)`
                    );
                    generationPromiseResolve();
                    process.exit(0);
                } else if (
                    coverageData.count >= Configuration.mainData.coverageTestThreshold &&
                    coverageTestPerFileResults.underFiles.length > 0
                ) {
                    logger.info(
                        `Documentation coverage (${coverageData.count}%) is over threshold (${Configuration.mainData.coverageTestThreshold}%)`
                    );
                    let message = `Documentation coverage per file is not over threshold (${Configuration.mainData.coverageMinimumPerFile}%)`;
                    generationPromiseReject();
                    if (Configuration.mainData.coverageTestThresholdFail) {
                        logger.error(message);
                        process.exit(1);
                    } else {
                        logger.warn(message);
                        process.exit(0);
                    }
                } else if (
                    coverageData.count < Configuration.mainData.coverageTestThreshold &&
                    coverageTestPerFileResults.underFiles.length > 0
                ) {
                    let messageGlobal = `Documentation coverage (${coverageData.count}%) is not over threshold (${Configuration.mainData.coverageTestThreshold}%)`,
                        messagePerFile = `Documentation coverage per file is not over threshold (${Configuration.mainData.coverageMinimumPerFile}%)`;
                    generationPromiseReject();
                    if (Configuration.mainData.coverageTestThresholdFail) {
                        logger.error(messageGlobal);
                        logger.error(messagePerFile);
                        process.exit(1);
                    } else {
                        logger.warn(messageGlobal);
                        logger.warn(messagePerFile);
                        process.exit(0);
                    }
                } else {
                    let message = `Documentation coverage (${coverageData.count}%) is not over threshold (${Configuration.mainData.coverageTestThreshold}%)`,
                        messagePerFile = `Documentation coverage per file is over threshold (${Configuration.mainData.coverageMinimumPerFile}%)`;
                    generationPromiseReject();
                    if (Configuration.mainData.coverageTestThresholdFail) {
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
        return new Promise((resolve, reject) => {
            let covDat, covFileNames;

            let coverageData: CoverageData = Configuration.mainData.coverageData;

            if (!coverageData.files) {
                logger.warn('Missing documentation coverage data');
            } else {
                covDat = {};
                covFileNames = _.map(coverageData.files, el => {
                    let fileName = path.normalize(el.filePath);
                    covDat[fileName] = {
                        type: el.type,
                        linktype: el.linktype,
                        linksubtype: el.linksubtype,
                        name: el.name
                    };
                    return fileName;
                });
            }
            // read coverage summary file and data
            let unitTestSummary = {};
            let fileDat = FileEngine.getSync(Configuration.mainData.unitTestCoverage);
            if (fileDat) {
                unitTestSummary = JSON.parse(fileDat);
            } else {
                return Promise.reject('Error reading unit test coverage file');
            }
            let getCovStatus = function (percent, totalLines) {
                let status;
                if (totalLines === 0) {
                    status = 'uncovered';
                } else if (percent <= 25) {
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
            let getCoverageData = function (data, fileName) {
                let out = {};
                if (fileName !== 'total') {
                    if (covDat === undefined) {
                        // need a name to include in output but this isn't visible
                        out = { name: fileName, filePath: fileName };
                    } else {
                        const findMatch = _.filter(covFileNames, el => {
                            const normalizedFilename = path.normalize(fileName).replace(/\\/g, '/');
                            return el.includes(fileName) || normalizedFilename.includes(el);
                        });
                        if (findMatch.length > 0) {
                            out = _.clone(covDat[findMatch[0]]);
                            out['filePath'] = fileName;
                        }
                    }
                }
                let keysToGet = ['statements', 'branches', 'functions', 'lines'];
                _.forEach(keysToGet, key => {
                    if (data[key]) {
                        let t = data[key];
                        out[key] = {
                            coveragePercent: Math.round(t.pct),
                            coverageCount: '' + t.covered + '/' + t.total,
                            status: getCovStatus(t.pct, t.total)
                        };
                    }
                });
                return out;
            };

            let unitTestData = {};
            let files = [];
            for (let file in unitTestSummary) {
                let dat = getCoverageData(unitTestSummary[file], file);
                if (file === 'total') {
                    unitTestData['total'] = dat;
                } else {
                    files.push(dat);
                }
            }
            unitTestData['files'] = files;
            unitTestData['idColumn'] = covDat !== undefined; // should we include the id column
            Configuration.mainData.unitTestData = unitTestData;
            Configuration.addPage({
                name: 'unit-test',
                id: 'unit-test',
                context: 'unit-test',
                files: files,
                data: unitTestData,
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });

            if (Configuration.mainData.exportFormat === COMPODOC_DEFAULTS.exportFormat) {
                let keysToGet = ['statements', 'branches', 'functions', 'lines'];
                _.forEach(keysToGet, key => {
                    if (unitTestData['total'][key]) {
                        HtmlEngine.generateCoverageBadge(Configuration.mainData.output, key, {
                            count: unitTestData['total'][key]['coveragePercent'],
                            status: unitTestData['total'][key]['status']
                        });
                    }
                });
            }
            resolve();
        });
    }

    private processPage(page): Promise<void> {
        logger.info('Process page', page.name);

        let htmlData = HtmlEngine.render(Configuration.mainData, page);
        let finalPath = Configuration.mainData.output;

        if (Configuration.mainData.output.lastIndexOf('/') === -1) {
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

        if (!Configuration.mainData.disableSearch) {
            SearchEngine.indexPage({
                infos: page,
                rawData: htmlData,
                url: finalPath
            });
        }

        FileEngine.writeSync(finalPath, htmlData);
        return Promise.resolve();
    }

    public processPages() {
        let pages = _.sortBy(Configuration.pages, ['name']);

        logger.info('Process pages');
        Promise.all(pages.map(page => this.processPage(page)))
            .then(() => {
                let callbacksAfterGenerateSearchIndexJson = () => {
                    if (Configuration.mainData.additionalPages.length > 0) {
                        this.processAdditionalPages();
                    } else {
                        if (Configuration.mainData.assetsFolder !== '') {
                            this.processAssetsFolder();
                        }
                        this.processResources();
                    }
                };
                if (!Configuration.mainData.disableSearch) {
                    SearchEngine.generateSearchIndexJson(Configuration.mainData.output).then(
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
                return this.processMenu(Configuration.mainData);
            })
            .catch(e => {
                logger.error(e);
            });
    }

    private transpileMenuWCToES5(es6Code) {
        return babel.transformAsync(es6Code, {
            cwd: __dirname,
            filename: 'menu-wc_es5.js',
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            ie: '11'
                        }
                    }
                ]
            ],
            plugins: [
                [
                    '@babel/plugin-proposal-private-methods',
                    {
                        loose: false
                    }
                ]
            ]
        });
    }

    private processMenu(mainData): Promise<void> {
        logger.info('Process menu...');

        return new Promise((resolveProcessMenu, rejectProcessMenu) => {
            let output = mainData.output.slice();
            const outputLastCharacter = output.lastIndexOf('/');
            if (outputLastCharacter !== -1) {
                output = output.slice(0, -1);
            }
            const finalPathES6 = `${output}/js/menu-wc.js`;
            const finalPathES5 = `${output}/js/menu-wc_es5.js`;

            HtmlEngine.renderMenu(Configuration.mainData.templates, mainData)
                .then(htmlData => {
                    FileEngine.write(finalPathES6, htmlData)
                        .then(() => {
                            this.transpileMenuWCToES5(htmlData)
                                .then(es5Data => {
                                    FileEngine.write(finalPathES5, es5Data.code)
                                        .then(() => {
                                            resolveProcessMenu();
                                        })
                                        .catch(err => {
                                            logger.error(
                                                'Error during ' + finalPathES5 + ' page generation'
                                            );
                                            logger.error(err);
                                            return rejectProcessMenu('');
                                        });
                                })
                                .catch(err => {
                                    logger.error(
                                        'Error during ' + finalPathES5 + ' page generation'
                                    );
                                    logger.error(err);
                                    return rejectProcessMenu('');
                                });
                        })
                        .catch(err => {
                            logger.error('Error during ' + finalPathES6 + ' page generation');
                            logger.error(err);
                            return rejectProcessMenu('');
                        });
                })
                .catch(err => {
                    logger.error('Error during ' + finalPathES6 + ' page generation');
                    logger.error(err);
                    return rejectProcessMenu('');
                });
        });
    }

    public processAdditionalPages() {
        logger.info('Process additional pages');
        let pages = Configuration.mainData.additionalPages;
        Promise.all(
            pages.map(page => {
                if (page.children.length > 0) {
                    return Promise.all([
                        this.processPage(page),
                        ...page.children.map(childPage => this.processPage(childPage))
                    ]);
                } else {
                    return this.processPage(page);
                }
            })
        )
            .then(() => {
                SearchEngine.generateSearchIndexJson(Configuration.mainData.output).then(() => {
                    if (Configuration.mainData.assetsFolder !== '') {
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

        if (!FileEngine.existsSync(Configuration.mainData.assetsFolder)) {
            logger.error(
                `Provided assets folder ${Configuration.mainData.assetsFolder} did not exist`
            );
        } else {
            let finalOutput = Configuration.mainData.output;

            let testOutputDir = Configuration.mainData.output.match(cwd);

            if (testOutputDir && testOutputDir.length > 0) {
                finalOutput = Configuration.mainData.output.replace(cwd + path.sep, '');
            }

            const destination = path.join(
                finalOutput,
                path.basename(Configuration.mainData.assetsFolder)
            );
            fs.copy(
                path.resolve(Configuration.mainData.assetsFolder),
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
                    Configuration.mainData.output +
                    ' in ' +
                    this.getElapsedTime() +
                    ' seconds using ' +
                    Configuration.mainData.theme +
                    ' theme'
            );
            if (Configuration.mainData.serve) {
                logger.info(
                    `Serving documentation from ${Configuration.mainData.output} at http://${Configuration.mainData.hostname}:${Configuration.mainData.port}`
                );
                this.runWebServer(Configuration.mainData.output);
            } else {
                generationPromiseResolve();
                this.endCallback();
            }
        };

        let finalOutput = Configuration.mainData.output;

        let testOutputDir = Configuration.mainData.output.match(cwd);

        if (testOutputDir && testOutputDir.length > 0) {
            finalOutput = Configuration.mainData.output.replace(cwd + path.sep, '');
        }

        fs.copy(
            path.resolve(__dirname + '/../src/resources/'),
            path.resolve(finalOutput),
            errorCopy => {
                if (errorCopy) {
                    logger.error('Error during resources copy ', errorCopy);
                } else {
                    const extThemePromise = new Promise((extThemeResolve, extThemeReject) => {
                        if (Configuration.mainData.extTheme) {
                            fs.copy(
                                path.resolve(cwd + path.sep + Configuration.mainData.extTheme),
                                path.resolve(finalOutput + '/styles/'),
                                function (errorCopyTheme) {
                                    if (errorCopyTheme) {
                                        logger.error(
                                            'Error during external styling theme copy ',
                                            errorCopyTheme
                                        );
                                        extThemeReject();
                                    } else {
                                        logger.info('External styling theme copy succeeded');
                                        extThemeResolve();
                                    }
                                }
                            );
                        } else {
                            extThemeResolve();
                        }
                    });

                    const customFaviconPromise = new Promise(
                        (customFaviconResolve, customFaviconReject) => {
                            if (Configuration.mainData.customFavicon !== '') {
                                logger.info(`Custom favicon supplied`);
                                fs.copy(
                                    path.resolve(
                                        cwd + path.sep + Configuration.mainData.customFavicon
                                    ),
                                    path.resolve(finalOutput + '/images/favicon.ico'),
                                    errorCopyFavicon => {
                                        // tslint:disable-line
                                        if (errorCopyFavicon) {
                                            logger.error(
                                                'Error during resources copy of favicon',
                                                errorCopyFavicon
                                            );
                                            customFaviconReject();
                                        } else {
                                            logger.info('External custom favicon copy succeeded');
                                            customFaviconResolve();
                                        }
                                    }
                                );
                            } else {
                                customFaviconResolve();
                            }
                        }
                    );

                    const customLogoPromise = new Promise((customLogoResolve, customLogoReject) => {
                        if (Configuration.mainData.customLogo !== '') {
                            logger.info(`Custom logo supplied`);
                            fs.copy(
                                path.resolve(cwd + path.sep + Configuration.mainData.customLogo),
                                path.resolve(
                                    finalOutput +
                                        '/images/' +
                                        Configuration.mainData.customLogo.split('/').pop()
                                ),
                                errorCopyLogo => {
                                    // tslint:disable-line
                                    if (errorCopyLogo) {
                                        logger.error(
                                            'Error during resources copy of logo',
                                            errorCopyLogo
                                        );
                                        customLogoReject();
                                    } else {
                                        logger.info('External custom logo copy succeeded');
                                        customLogoResolve();
                                    }
                                }
                            );
                        } else {
                            customLogoResolve();
                        }
                    });

                    Promise.all([extThemePromise, customFaviconPromise, customLogoPromise]).then(
                        () => {
                            onComplete();
                        }
                    );
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
        if (Configuration.mainData.disableGraph) {
            logger.info('Graph generation disabled');
            this.processPages();
        } else {
            logger.info('Process main graph');
            let modules = Configuration.mainData.modules;
            let i = 0;
            let len = modules.length;
            let loop = () => {
                if (i <= len - 1) {
                    logger.info('Process module graph ', modules[i].name);
                    let finalPath = Configuration.mainData.output;
                    if (Configuration.mainData.output.lastIndexOf('/') === -1) {
                        finalPath += '/';
                    }
                    finalPath += 'modules/' + modules[i].name;
                    let _rawModule = DependenciesEngine.getRawModule(modules[i].name);
                    if (
                        _rawModule.declarations.length > 0 ||
                        _rawModule.bootstrap.length > 0 ||
                        _rawModule.imports.length > 0 ||
                        _rawModule.exports.length > 0 ||
                        _rawModule.providers.length > 0
                    ) {
                        NgdEngine.renderGraph(
                            modules[i].file,
                            finalPath,
                            'f',
                            modules[i].name
                        ).then(
                            () => {
                                NgdEngine.readGraph(
                                    path.resolve(finalPath + path.sep + 'dependencies.svg'),
                                    modules[i].name
                                ).then(
                                    data => {
                                        modules[i].graph = data;
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
            let finalMainGraphPath = Configuration.mainData.output;
            if (finalMainGraphPath.lastIndexOf('/') === -1) {
                finalMainGraphPath += '/';
            }
            finalMainGraphPath += 'graph';
            NgdEngine.init(path.resolve(finalMainGraphPath));

            NgdEngine.renderGraph(
                Configuration.mainData.tsconfig,
                path.resolve(finalMainGraphPath),
                'p'
            ).then(
                () => {
                    NgdEngine.readGraph(
                        path.resolve(finalMainGraphPath + path.sep + 'dependencies.svg'),
                        'Main graph'
                    ).then(
                        data => {
                            Configuration.mainData.mainGraph = data;
                            loop();
                        },
                        err => {
                            logger.error('Error during main graph reading : ', err);
                            Configuration.mainData.disableMainGraph = true;
                            loop();
                        }
                    );
                },
                err => {
                    logger.error(
                        'Ooops error during main graph generation, moving on next part with main graph disabled : ',
                        err
                    );
                    Configuration.mainData.disableMainGraph = true;
                    loop();
                }
            );
        }
    }

    public runWebServer(folder) {
        if (!this.isWatching) {
            let liveServerConfiguration: LiveServerConfiguration = {
                root: folder,
                open: Configuration.mainData.open,
                quiet: true,
                logLevel: 0,
                wait: 1000,
                port: Configuration.mainData.port
            };
            if (Configuration.mainData.host !== '') {
                liveServerConfiguration.host = Configuration.mainData.host;
            }
            LiveServer.start(liveServerConfiguration);
        }
        if (Configuration.mainData.watch && !this.isWatching) {
            if (typeof this.files === 'undefined') {
                logger.error('No sources files available, please use -p flag');
                generationPromiseReject();
                process.exit(1);
            } else {
                this.runWatch();
            }
        } else if (Configuration.mainData.watch && this.isWatching) {
            let srcFolder = findMainSourceFolder(this.files);
            logger.info(`Already watching sources in ${srcFolder} folder`);
        }
    }

    public runWatch() {
        let sources = [findMainSourceFolder(this.files)];
        let watcherReady = false;

        this.isWatching = true;

        logger.info(`Watching sources in ${findMainSourceFolder(this.files)} folder`);

        if (MarkdownEngine.hasRootMarkdowns()) {
            sources = sources.concat(MarkdownEngine.listRootMarkdowns());
        }

        if (Configuration.mainData.includes !== '') {
            sources = sources.concat(Configuration.mainData.includes);
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
                            this.watchChangedFiles.push(path.join(cwd + path.sep + file));
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
