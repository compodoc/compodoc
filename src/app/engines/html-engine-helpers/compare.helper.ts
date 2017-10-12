import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';

export class CompareHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, a: any, operator: string, b: any, options: IHandlebarsOptions): string {
        if (arguments.length < 4) {
            throw new Error('handlebars Helper {{compare}} expects 4 arguments');
        }

        let result;
        switch (operator) {
            case 'indexof':
                result = (b.indexOf(a) !== -1);
                break;
            case '===':
                result = a === b;
                break;
            case '!==':
                result = a !== b;
                break;
            case '>':
                result = a > b;
                break;
            default: {
                throw new Error('helper {{compare}}: invalid operator: `' + operator + '`');
            }
        }

        if (result === false) {
            return options.inverse(context);
        }
        return options.fn(context);
    }
}