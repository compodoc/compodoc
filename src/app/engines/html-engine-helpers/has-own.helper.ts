import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';

export class HasOwnHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, entity, key: any, options: IHandlebarsOptions): string {
        if (Object.hasOwnProperty.call(entity, key)) {
            return options.fn(context);
        } else {
            return options.inverse(context);
        }
    }
}