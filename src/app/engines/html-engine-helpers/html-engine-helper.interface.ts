import { Configuration } from '../../configuration';

export interface IHtmlEngineHelper {
    helperFunc(context: any, ...args: any[]): any;
}

export interface IHandlebarsOptions {
    fn(context): string;
    inverse(context: string): string;
    hash?: any;
}
