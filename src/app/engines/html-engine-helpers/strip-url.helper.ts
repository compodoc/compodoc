import { IHtmlEngineHelper } from './html-engine-helper.interface';

export class StripURLHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, prefix: string, url: string, options): string {
        return prefix + url.split("/").pop();
    }
}