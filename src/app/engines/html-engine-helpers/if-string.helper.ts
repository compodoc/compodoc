import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';

export class IfStringHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, a: any, options: IHandlebarsOptions): string {
        if (typeof a === 'string') {
            return options.fn(context);
        }
        return options.inverse(context);
    }
}
