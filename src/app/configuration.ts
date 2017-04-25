import { COMPODOC_DEFAULTS } from '../utils/defaults';

interface Page {
    name: string;
    filename?: string;
    context: string;
    path?: string;
    module?: any;
    pipe?: any;
    class?: any;
    interface?: any;
    directive?: any;
    injectable?: any;
    additionalPage?: any;
    files?: any;
    data?: any;
    depth?: number;
    pageType?: string;
    component?: any;
}

interface IMainData {
    output: string;
    theme: string;
    extTheme: string;
    serve: boolean;
    port: number;
    open: boolean;
    assetsFolder: string;
    documentationMainName: string;
    documentationMainDescription: string;
    base: string;
    hideGenerator: boolean;
    modules: any;
    readme: string;
    additionalPages: any;
    pipes: any;
    classes: any;
    interfaces: any;
    components: any;
    directives: any;
    injectables: any;
    miscellaneous: any;
    routes: any;
    tsconfig: string;
    toggleMenuItems: string[];
    includes: string;
    includesName: string;
    includesFolder: string;
    disableSourceCode: boolean;
    disableGraph: boolean;
    disableCoverage: boolean;
    disablePrivateOrInternalSupport: boolean;
    watch: boolean;
    mainGraph: string;
    coverageTest: boolean;
    coverageTestThreshold: number;
}

export interface IConfiguration {
    mainData: IMainData;
    pages:Page[];
    addPage(page: Page): void;
    addAdditionalPage(page: Page): void;
}

export class Configuration implements IConfiguration {
    private static _instance:Configuration = new Configuration();

    private _pages:Page[] = [];
    private _mainData: IMainData = {
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
        readme: '',
        additionalPages: [],
        pipes: [],
        classes: [],
        interfaces: [],
        components: [],
        directives: [],
        injectables: [],
        routes: [],
        miscellaneous: [],
        tsconfig: '',
        toggleMenuItems: [],
        includes: '',
        includesName: COMPODOC_DEFAULTS.additionalEntryName,
        includesFolder: COMPODOC_DEFAULTS.additionalEntryPath,
        disableSourceCode: COMPODOC_DEFAULTS.disableSourceCode,
        disableGraph: COMPODOC_DEFAULTS.disableGraph,
        disableCoverage: COMPODOC_DEFAULTS.disableCoverage,
        disablePrivateOrInternalSupport: COMPODOC_DEFAULTS.disablePrivateOrInternalSupport,
        watch: false,
        coverageTest: false,
        coverageTestThreshold: COMPODOC_DEFAULTS.defaultCoverageThreshold
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

    addPage(page: Page) {
        this._pages.push(page);
    }

    addAdditionalPage(page: Page) {
        this._mainData.additionalPages.push(page);
    }

    resetPages() {
        this._pages = [];
    }

    get pages():Page[] {
        return this._pages;
    }
    set pages(pages:Page[]) {
        this._pages = [];
    }

    get mainData():IMainData {
        return this._mainData;
    }
    set mainData(data:IMainData) {
        Object.assign(this._mainData, data);
    }
};
