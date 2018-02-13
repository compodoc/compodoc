import { COMPODOC_DEFAULTS } from '../utils/defaults';
import { PageInterface } from './interfaces/page.interface';
import { MainDataInterface } from './interfaces/main-data.interface';
import { ConfigurationInterface } from './interfaces/configuration.interface';
import * as _ from 'lodash';

export class Configuration implements ConfigurationInterface {
    private _pages: PageInterface[] = [];
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
        interceptors: [],
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
        disablePrivate: COMPODOC_DEFAULTS.disablePrivate,
        disableInternal: COMPODOC_DEFAULTS.disableInternal,
        disableProtected: COMPODOC_DEFAULTS.disableProtected,
        disableLifeCycleHooks: COMPODOC_DEFAULTS.disableLifeCycleHooks,
        watch: false,
        mainGraph: '',
        coverageTest: false,
        coverageTestThreshold: COMPODOC_DEFAULTS.defaultCoverageThreshold,
        coverageTestThresholdFail: COMPODOC_DEFAULTS.coverageTestThresholdFail,
        coverageTestPerFile: false,
        coverageMinimumPerFile: COMPODOC_DEFAULTS.defaultCoverageMinimumPerFile,
        routesLength: 0,
        angularVersion: '',
        exportFormat: COMPODOC_DEFAULTS.exportFormat,
        coverageData: {},
        customFavicon: ''
    };

    public addPage(page: PageInterface) {
        let indexPage = _.findIndex(this._pages, { 'name': page.name });
        if (indexPage === -1) {
            this._pages.push(page);
        }
    }

    public addAdditionalPage(page: PageInterface) {
        this._mainData.additionalPages.push(page);
    }

    public resetPages() {
        this._pages = [];
    }

    public resetAdditionalPages() {
        this._mainData.additionalPages = [];
    }

    public resetRootMarkdownPages() {
        let indexPage = _.findIndex(this._pages, { 'name': 'index' });
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, { 'name': 'changelog' });
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, { 'name': 'contributing' });
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, { 'name': 'license' });
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, { 'name': 'todo' });
        this._pages.splice(indexPage, 1);
        this._mainData.markdowns = [];
    }

    get pages(): PageInterface[] {
        return this._pages;
    }
    set pages(pages: PageInterface[]) {
        this._pages = [];
    }

    get mainData(): MainDataInterface {
        return this._mainData;
    }
    set mainData(data: MainDataInterface) {
        (Object as any).assign(this._mainData, data);
    }
}
