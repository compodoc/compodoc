import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';

export class OrLengthHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, /* any, any, ..., options */) {
        let len = arguments.length - 1;
        let options: IHandlebarsOptions = arguments[len];

        // We start at 1 because of options
        for (let i = 1; i < len; i++) {
            if (typeof arguments[i] !== 'undefined') {
                if (arguments[i].length > 0) {
                    return options.fn(context);
                }
            }
        }

        return options.inverse(context);
    }
}