import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';

export class IsInitialTabHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, tabs: Array<any>, tabId: String, options: IHandlebarsOptions) {
        return tabs[0].id === tabId ? options.fn(context) : options.inverse(context);
    }
}
