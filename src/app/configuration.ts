interface Page {
    name: string;
    context: string;
}

export class Configuration {
    private _pages: object[] = [];
    private _mainData: object = {};

    constructor() {

    }

    addPage(page: Page) {
        this._pages.push(page);
    }

    get pages():[] {
        return this._pages;
    }
    set pages(pages:[]) {
        this._pages = [];
    }

    get mainData():[] {
        return this._mainData;
    }
    set mainData(data:object) {
        Object.assign(this._mainData, data);
    }
};
