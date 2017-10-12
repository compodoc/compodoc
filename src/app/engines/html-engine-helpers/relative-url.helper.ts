import { IHtmlEngineHelper } from './html-engine-helper.interface';

export class RelativeURLHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, currentDepth: number, options): string {
        switch (currentDepth) {
            case 0:
                return './';
            case 1:
                return '../';
            case 2:
                return '../../';
        }

        return '';
    }
}