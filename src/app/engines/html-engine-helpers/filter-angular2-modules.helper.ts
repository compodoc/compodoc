import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';

export class FilterAngular2ModulesHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, text: string, options: IHandlebarsOptions) {
        const NG2_MODULES: string[] = [
            'BrowserModule',
            'FormsModule',
            'HttpModule',
            'RouterModule'
        ];
        let len = NG2_MODULES.length;
        let i = 0;
        let result = false;
        for (i; i < len; i++) {
            if (text.indexOf(NG2_MODULES[i]) > -1) {
                result = true;
            }
        }
        if (result) {
            return options.fn(context);
        } else {
            return options.inverse(context);
        }
    }
}
