import { IHtmlEngineHelper } from './html-engine-helper.interface';

export class RelativeURLHelper implements IHtmlEngineHelper {
    public helperFunc(ctx: any, currentDepth, context) {
        let result = '';

        switch (currentDepth) {
            case 0:
                result = './';
                break;
            case 1:
                result = '../';
                break;
            case 2:
                result = '../../';
                break;
        }

        return result;
    }
}