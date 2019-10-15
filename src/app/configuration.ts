import * as _ from 'lodash';

import { COMPODOC_DEFAULTS } from '../utils/defaults';

import { ConfigurationInterface } from './interfaces/configuration.interface';
import { CoverageData } from './interfaces/coverageData.interface';
import { MainDataInterface } from './interfaces/main-data.interface';
import { PageInterface } from './interfaces/page.interface';

export class Configuration implements ConfigurationInterface {
    private _pages: PageInterface[] = [];
    private _mainData: MainDataInterface = {
        output: COMPODOC_DEFAULTS.folder,
        theme: COMPODOC_DEFAULTS.theme,
        extTheme: '',
        serve: false,
        hostname: COMPODOC_DEFAULTS.hostname,
        host: '',
        port: COMPODOC_DEFAULTS.port,
        open: false,
        assetsFolder: '',
        documentationMainName: COMPODOC_DEFAULTS.title,
        documentationMainDescription: '',
        base: COMPODOC_DEFAULTS.base,
        hideGenerator: false,
        hasFilesToCoverage: false,
        modules: [],
        readme: false,
        changelog: '',
        contributing: '',
        license: '',
        todo: '',
        markdowns: [],
        additionalPages: [],
        pipes: [],
        classes: [],
        interfaces: [],
        components: [],
        controllers: [],
        directives: [],
        injectables: [],
        interceptors: [],
        guards: [],
        miscellaneous: [],
        routes: [],
        tsconfig: '',
        toggleMenuItems: COMPODOC_DEFAULTS.toggleMenuItems,
        navTabConfig: [],
        templates: '',
        includes: '',
        includesName: COMPODOC_DEFAULTS.additionalEntryName,
        includesFolder: COMPODOC_DEFAULTS.additionalEntryPath,
        disableSourceCode: COMPODOC_DEFAULTS.disableSourceCode,
        disableDomTree: COMPODOC_DEFAULTS.disableDomTree,
        disableTemplateTab: COMPODOC_DEFAULTS.disableTemplateTab,
        disableStyleTab: COMPODOC_DEFAULTS.disableStyleTab,
        disableGraph: COMPODOC_DEFAULTS.disableGraph,
        disableMainGraph: COMPODOC_DEFAULTS.disableMainGraph,
        disableCoverage: COMPODOC_DEFAULTS.disableCoverage,
        disablePrivate: COMPODOC_DEFAULTS.disablePrivate,
        disableInternal: COMPODOC_DEFAULTS.disableInternal,
        disableProtected: COMPODOC_DEFAULTS.disableProtected,
        disableLifeCycleHooks: COMPODOC_DEFAULTS.disableLifeCycleHooks,
        disableRoutesGraph: COMPODOC_DEFAULTS.disableRoutesGraph,
        disableSearch: false,
        disableDependencies: COMPODOC_DEFAULTS.disableDependencies,
        watch: false,
        mainGraph: '',
        coverageTest: false,
        coverageTestThreshold: COMPODOC_DEFAULTS.defaultCoverageThreshold,
        coverageTestThresholdFail: COMPODOC_DEFAULTS.coverageTestThresholdFail,
        coverageTestPerFile: false,
        coverageMinimumPerFile: COMPODOC_DEFAULTS.defaultCoverageMinimumPerFile,
        unitTestCoverage: '',
        unitTestData: undefined,
        coverageTestShowOnlyFailed: COMPODOC_DEFAULTS.coverageTestShowOnlyFailed,
        routesLength: 0,
        angularVersion: '',
        exportFormat: COMPODOC_DEFAULTS.exportFormat,
        coverageData: {} as CoverageData,
        customFavicon: '',
        customLogo: '',
        packageDependencies: [],
        packagePeerDependencies: [],
        gaID: '',
        gaSite: '',
        angularProject: false,
        angularJSProject: false,
        language: COMPODOC_DEFAULTS.language,
        maxSearchResults: 15
    };

    private static instance: Configuration;
    private constructor() {}
    public static getInstance() {
        if (!Configuration.instance) {
            Configuration.instance = new Configuration();
        }
        return Configuration.instance;
    }

    public addPage(page: PageInterface) {
        let indexPage = _.findIndex(this._pages, { name: page.name });
        if (indexPage === -1) {
            this._pages.push(page);
        }
    }

    public hasPage(name: string): boolean {
        let indexPage = _.findIndex(this._pages, { name: name });
        return indexPage !== -1;
    }

    public addAdditionalPage(page: PageInterface) {
        this._mainData.additionalPages.push(page);
    }

    public getAdditionalPageById(id): PageInterface {
        return this._mainData.additionalPages.find(page => page.id === id);
    }

    public resetPages() {
        this._pages = [];
    }

    public resetAdditionalPages() {
        this._mainData.additionalPages = [];
    }

    public resetRootMarkdownPages() {
        let indexPage = _.findIndex(this._pages, { name: 'index' });
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, { name: 'changelog' });
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, { name: 'contributing' });
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, { name: 'license' });
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, { name: 'todo' });
        this._pages.splice(indexPage, 1);
        this._mainData.markdowns = [];
    }

    get pages(): PageInterface[] {
        return this._pages;
    }
    set pages(pages: PageInterface[]) {
        this._pages = [];
    }

    get markDownPages() {
        return this._pages.filter(page => page.markdown);
    }

    get mainData(): MainDataInterface {
        return this._mainData;
    }
    set mainData(data: MainDataInterface) {
        (Object as any).assign(this._mainData, data);
    }
}

export default Configuration.getInstance();
