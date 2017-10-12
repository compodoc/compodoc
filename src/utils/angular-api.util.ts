import * as _ from 'lodash';
import { IApiSourceResult } from './api-source-result.interface';

const AngularAPIs: Array<IAngularApi> = require('../src/data/api-list.json');

export class AngularApiUtil {
    public findApi(type: string): IApiSourceResult<IAngularApi> {
        return  {
            source: 'external',
            data: _.find(AngularAPIs, x => x.title === type)
        };
    }
}


export interface IAngularApi {
    title: string;
    path: string;
    docType: string;
    stability: string;
    secure: string;
    barrel: string;
}
