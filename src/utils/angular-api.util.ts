import * as _ from './collection.util';
import { IApiSourceResult } from './api-source-result.interface';
import * as path from 'path';

// Try multiple paths to find api-list.json - supports both source and bundled contexts
let apiListPath = '../src/data/api-list.json';
try {
    // First try relative path (works from source)
    require.resolve(apiListPath);
} catch (e) {
    // Fallback to absolute path from cwd (works from bundled/test contexts)
    apiListPath = path.join(process.cwd(), 'src/data/api-list.json');
}

const AngularAPIs: Array<IAngularMainApi> = require(apiListPath);

export class AngularApiUtil {
    private static instance: AngularApiUtil;
    private constructor() {}
    public static getInstance() {
        if (!AngularApiUtil.instance) {
            AngularApiUtil.instance = new AngularApiUtil();
        }
        return AngularApiUtil.instance;
    }

    public findApi(type: string): IApiSourceResult<IAngularMainApi> {
        let foundedApi;
        _.forEach(AngularAPIs, mainApi => {
            _.forEach(mainApi.items, api => {
                if (api.title === type) {
                    foundedApi = api;
                }
            });
        });
        return {
            source: 'external',
            data: foundedApi,
            score: foundedApi ? 1 : 0
        };
    }
}

export default AngularApiUtil.getInstance();

export interface IAngularMainApi {
    title: string;
    name: string;
    items: IAngularApi[];
}

export interface IAngularApi {
    title: string;
    path: string;
    docType: string;
    stability: string;
    secure: string;
    barrel: string;
}
