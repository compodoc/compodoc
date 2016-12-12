interface Page {
    name: string;
    context: string;
}

export class Configuration {
    private static _instance:Configuration = new Configuration();

    private _pages:Array<Page> = [];
    private _mainData: Object = {};

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

    get mainData():Object {
        return this._mainData;
    }
    set mainData(data:Object) {
        Object.assign(this._mainData, data);
    }
};
