import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';
import * as _ from 'lodash';

export class IsTabEnabledHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, tabs: Array<any>, tabId: String, options: IHandlebarsOptions) {
        let isTabEnabled = -1 !== _.findIndex(tabs, { id: tabId });
        return isTabEnabled ? options.fn(context) : options.inverse(context);
    }
}
