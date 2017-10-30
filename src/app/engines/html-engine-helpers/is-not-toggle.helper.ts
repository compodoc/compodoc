import { IHtmlEngineHelper } from './html-engine-helper.interface';
import { ConfigurationInterface } from '../../interfaces/configuration.interface';

export class IsNotToggleHelper implements IHtmlEngineHelper {
    constructor(private configuration: ConfigurationInterface) {

    }

    public helperFunc(context: any, type, options) {
        let result = this.configuration.mainData.toggleMenuItems.indexOf(type);

        if (this.configuration.mainData.toggleMenuItems.indexOf('all') !== -1) {
            return options.inverse(context);
        } else if (result === -1) {
            return options.fn(context);
        } else {
            return options.inverse(context);
        }
    }
}