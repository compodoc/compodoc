import { IHtmlEngineHelper } from './html-engine-helper.interface';

export class ShortURLHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, url: string, options): string {
        let newUrl = url;
        let firstIndexOfSlash = newUrl.indexOf('/');
        let lastIndexOfSlash = newUrl.lastIndexOf('/');
        if (firstIndexOfSlash !== -1 || lastIndexOfSlash !== -1) {
            newUrl =
                newUrl.substr(0, firstIndexOfSlash + 1) +
                '...' +
                newUrl.substr(lastIndexOfSlash, newUrl.length);
        }
        return newUrl;
    }
}
