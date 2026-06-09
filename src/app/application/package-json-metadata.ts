import AngularVersionUtil from '../../utils/angular-version.util';
import Configuration from '../configuration';
import { COMPODOC_DEFAULTS } from '../../utils/defaults';

const PACKAGE_PROPERTIES_TO_DOCUMENT = [
    'version',
    'description',
    'keywords',
    'homepage',
    'bugs',
    'license',
    'repository',
    'author'
];

export function applyPackageDocumentationMetadata(parsedData: any): void {
    if (
        typeof parsedData.name !== 'undefined' &&
        Configuration.mainData.documentationMainName === COMPODOC_DEFAULTS.title
    ) {
        Configuration.mainData.documentationMainName = parsedData.name + ' documentation';
    }

    if (typeof parsedData.description !== 'undefined') {
        Configuration.mainData.documentationMainDescription = parsedData.description;
    }

    Configuration.mainData.angularVersion = AngularVersionUtil.getAngularVersionOfProject(
        parsedData
    );
}

export function copyDocumentedPackageProperties(parsedData: any): boolean {
    let hasOneOfCheckedProperties = false;

    PACKAGE_PROPERTIES_TO_DOCUMENT.forEach(prop => {
        if (prop in parsedData) {
            hasOneOfCheckedProperties = true;
            Configuration.mainData.packageProperties[prop] = parsedData[prop];
        }
    });

    return hasOneOfCheckedProperties;
}
