import * as _ from 'lodash';
import { IApiSourceResult } from './api-source-result.interface';

const AngularAPIs: Array<IAngularMainApi> = require('../src/data/api-list.json');

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
            data: foundedApi
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
