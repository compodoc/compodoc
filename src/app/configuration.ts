interface Page {
    name: string;
    context: string;
}

export class Configuration {
    private _pages:Array<Page> = [];
    private _mainData: Object = {};

    constructor() {

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
