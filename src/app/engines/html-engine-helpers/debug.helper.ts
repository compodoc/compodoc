import { IHtmlEngineHelper } from './html-engine-helper.interface';

export class DebugHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, optionalValue: any): void {
        console.log('Current Context');
        console.log('====================');
        console.log(context);

        if (optionalValue) {
            console.log('OptionalValue');
            console.log('====================');
            console.log(optionalValue);
        }
    }
}
