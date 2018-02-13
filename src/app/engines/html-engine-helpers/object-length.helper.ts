import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';

export class ObjectLengthHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, obj: Object, operator: string, length: number) {
        let len = arguments.length - 1;
        let options: IHandlebarsOptions = arguments[len];

        if( typeof obj !== 'object' ) {
            return options.inverse(context);
        }

        let size = 0,
            key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                size++;
            }
        }

        let result;
        switch (operator) {
            case '===':
                result = size === length;
                break;
            case '!==':
                result = size !== length;
                break;
            case '>':
                result = size > length;
                break;
            default: {
                throw new Error('helper {{objectLength}}: invalid operator: `' + operator + '`');
            }
        }

        if (result === false) {
            return options.inverse(context);
        }
        return options.fn(context);
    }
}