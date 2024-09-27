import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';

export class IfEqualStringHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, a: any, b: any, options: IHandlebarsOptions): string {
        if (a == b) {
            return options.fn(context);
        }
        return options.inverse(context);
    }
}
