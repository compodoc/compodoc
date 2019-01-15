import { IHtmlEngineHelper } from './html-engine-helper.interface';

export class RelativeURLHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, currentDepth: number, options): string {
        switch (currentDepth) {
            case 0:
                return './';
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                return '../'.repeat(currentDepth);
        }

        return '';
    }
}
