import { COMPODOC_DEFAULTS } from '../utils/defaults';

import { PageInterface } from './interfaces/page.interface';

import { MainDataInterface } from './interfaces/main-data.interface';

import { ConfigurationInterface } from './interfaces/configuration.interface';

const _ = require('lodash');

export class Configuration implements ConfigurationInterface {
    private static _instance:Configuration = new Configuration();

    private _pages:PageInterface[] = [];
    private _mainData: MainDataInterface = {
        output: COMPODOC_DEFAULTS.folder,
        theme: COMPODOC_DEFAULTS.theme,
        extTheme: '',
        serve: false,
        port: COMPODOC_DEFAULTS.port,
        open: false,
        assetsFolder: '',
        documentationMainName: COMPODOC_DEFAULTS.title,
        documentationMainDescription: '',
        base: COMPODOC_DEFAULTS.base,
        hideGenerator: false,
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
        directives: [],
        injectables: [],
        miscellaneous: [],
        routes: [],
        tsconfig: '',
        toggleMenuItems: [],
        includes: '',
        includesName: COMPODOC_DEFAULTS.additionalEntryName,
        includesFolder: COMPODOC_DEFAULTS.additionalEntryPath,
        disableSourceCode: COMPODOC_DEFAULTS.disableSourceCode,
        disableGraph: COMPODOC_DEFAULTS.disableGraph,
        disableMainGraph: COMPODOC_DEFAULTS.disableMainGraph,
        disableCoverage: COMPODOC_DEFAULTS.disableCoverage,
        disablePrivateOrInternalSupport: COMPODOC_DEFAULTS.disablePrivateOrInternalSupport,
        watch: false,
        mainGraph: '',
        coverageTest: false,
        coverageTestThreshold: COMPODOC_DEFAULTS.defaultCoverageThreshold,
        routesLength: 0,
        angularVersion: ''
    };

    constructor() {
        if(Configuration._instance){
            throw new Error('Error: Instantiation failed: Use Configuration.getInstance() instead of new.');
        }
        Configuration._instance = this;
    }

    public static getInstance():Configuration
    {
        return Configuration._instance;
    }

    addPage(page: PageInterface) {
        let indexPage = _.findIndex(this._pages, {'name': page.name});
        if (indexPage === -1) {
            this._pages.push(page);
        }
    }

    addAdditionalPage(page: PageInterface) {
        this._mainData.additionalPages.push(page);
    }

    resetPages() {
        this._pages = [];
    }

    resetAdditionalPages() {
        this._mainData.additionalPages = [];
    }

    resetRootMarkdownPages() {
        let indexPage = _.findIndex(this._pages, {'name': 'index'});
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, {'name': 'changelog'});
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, {'name': 'contributing'});
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, {'name': 'license'});
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, {'name': 'todo'});
        this._pages.splice(indexPage, 1);
        this._mainData.markdowns = [];
    }

    get pages():PageInterface[] {
        return this._pages;
    }
    set pages(pages:PageInterface[]) {
        this._pages = [];
    }

    get mainData():MainDataInterface {
        return this._mainData;
    }
    set mainData(data:MainDataInterface) {
        (<any>Object).assign(this._mainData, data);
    }
};
