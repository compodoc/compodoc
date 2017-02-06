import { COMPODOC_DEFAULTS } from '../utils/defaults';

interface Page {
    name: string;
    context: string;
    path?: string;
    module?: any;
    pipe?: any;
    class?: any;
    interface?: any;
    directive?: any;
    injectable?: any;
    files?: any;
    data?: any;
    depth?: number;
    pageType?: string;
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
    additionalpages: Object;
    pipes: any;
    classes: any;
    interfaces: any;
    components: any;
    directives: any;
    injectables: any;
    miscellaneous: any;
    routes: any;
    tsconfig: string;
    includes: boolean;
    includesName: string;
    disableSourceCode: boolean;
    disableGraph: boolean;
    disableCoverage: boolean;
    disablePrivateOrInternalSupport: boolean;
}

export interface IConfiguration {
    mainData: IMainData;
    pages:Array<Page>;
    addPage(page: Page): void;
}

export class Configuration implements IConfiguration {
    private static _instance:Configuration = new Configuration();

    private _pages:Array<Page> = [];
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
        additionalpages: {},
        pipes: [],
        classes: [],
        interfaces: [],
        components: [],
        directives: [],
        injectables: [],
        routes: [],
        miscellaneous: [],
        tsconfig: '',
        includes: false,
        disableSourceCode: COMPODOC_DEFAULTS.disableSourceCode,
        disableGraph: COMPODOC_DEFAULTS.disableGraph,
        disableCoverage: COMPODOC_DEFAULTS.disableCoverage,
        disablePrivateOrInternalSupport: COMPODOC_DEFAULTS.disablePrivateOrInternalSupport
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

    get pages():Array<Page> {
        return this._pages;
    }
    set pages(pages:Array<Page>) {
        this._pages = [];
    }

    get mainData():IMainData {
        return this._mainData;
    }
    set mainData(data:IMainData) {
        Object.assign(this._mainData, data);
    }
};
