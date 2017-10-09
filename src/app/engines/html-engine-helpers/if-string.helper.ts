import { IHtmlEngineHelper } from './html-engine-helper.interface';

export class IfStringHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, a, options) {
        if (typeof a === 'string') {
            return options.fn(context);
        }
        return options.inverse(context);
    }
}