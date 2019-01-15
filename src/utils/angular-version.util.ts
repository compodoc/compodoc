import * as semver from 'semver';
import { IAngularApi } from './angular-api.util';

export class AngularVersionUtil {
    private static readonly CorePackage = '@angular/core';

    private static instance: AngularVersionUtil;
    private constructor() {}
    public static getInstance() {
        if (!AngularVersionUtil.instance) {
            AngularVersionUtil.instance = new AngularVersionUtil();
        }
        return AngularVersionUtil.instance;
    }

    public cleanVersion(version: string): string {
        return version
            .replace('~', '')
            .replace('^', '')
            .replace('=', '')
            .replace('<', '')
            .replace('>', '');
    }

    public getAngularVersionOfProject(packageData): string {
        let _result = '';

        if (packageData.dependencies) {
            let angularCore = packageData.dependencies[AngularVersionUtil.CorePackage];
            if (angularCore) {
                _result = this.cleanVersion(angularCore);
            }
        }

        return _result;
    }

    private isAngularVersionArchived(version: string): boolean {
        let result;

        try {
            result = semver.compare(version, '2.4.10') <= 0;
        } catch (e) {}

        return result;
    }

    public prefixOfficialDoc(version: string): string {
        return this.isAngularVersionArchived(version) ? 'v2.' : '';
    }

    public getApiLink(api: IAngularApi, angularVersion: string): string {
        let angularDocPrefix = this.prefixOfficialDoc(angularVersion);
        return `https://${angularDocPrefix}angular.io/${api.path}`;
    }
}

export default AngularVersionUtil.getInstance();
