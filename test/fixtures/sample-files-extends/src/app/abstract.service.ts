import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { API_ENDPOINT } from '../../../environments/environment';

@Injectable()
export abstract class AbstractService {
    protected ENDPOINT: string;
    protected WS_ENDPOINT: string;

    parentProperty: string;

    constructor() {
        this.ENDPOINT = `https://${API_ENDPOINT}`;
        this.WS_ENDPOINT = `wss://${API_ENDPOINT}front`;
    }

    protected handleError(error: Response | any): Promise<string> {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Promise.reject(errMsg);
    }
}
