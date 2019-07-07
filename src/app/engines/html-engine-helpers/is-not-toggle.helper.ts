import { IHtmlEngineHelper } from './html-engine-helper.interface';
import Configuration from '../../configuration';

export class IsNotToggleHelper implements IHtmlEngineHelper {
    constructor() {}

    public helperFunc(context: any, type, options) {
        let result = Configuration.mainData.toggleMenuItems.indexOf(type);

        if (Configuration.mainData.toggleMenuItems.indexOf('all') !== -1) {
            return options.inverse(context);
        } else if (result !== -1) {
            return options.fn(context);
        } else {
            return options.inverse(context);
        }
    }
}
