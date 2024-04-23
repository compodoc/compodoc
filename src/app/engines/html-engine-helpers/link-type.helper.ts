import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';

import DependenciesEngine from '../dependencies.engine';

import AngularVersionUtil from '../../../utils/angular-version.util';
import ExtendsMerger from '../../../utils/extends-merger.util';
import BasicTypeUtil from '../../../utils/basic-type.util';

import Configuration from '../../configuration';

export class LinkTypeHelper implements IHtmlEngineHelper {
    constructor() {}

    public helperFunc(context: any, name: string, options: IHandlebarsOptions) {
        let _result = DependenciesEngine.find(name);
        // Find in aliases ?
        if (!_result) {
            const potentialAlias = ExtendsMerger.findInAliases(name);
            if (potentialAlias) {
                _result = DependenciesEngine.find(potentialAlias);
            }
        }

        const angularDocPrefix = AngularVersionUtil.prefixOfficialDoc(
            Configuration.mainData.angularVersion
        );
        if (_result) {
            context.type = {
                raw: name
            };
            if (_result.source === 'internal') {
                if (_result.data.type === 'class') {
                    _result.data.type = 'classe';
                }
                context.type.href = '../' + _result.data.type + 's/' + _result.data.name + '.html';
                if (
                    _result.data.type === 'miscellaneous' ||
                    (_result.data.ctype && _result.data.ctype === 'miscellaneous')
                ) {
                    let mainpage = '';
                    switch (_result.data.subtype) {
                        case 'enum':
                            mainpage = 'enumerations';
                            break;
                        case 'function':
                            mainpage = 'functions';
                            break;
                        case 'typealias':
                            mainpage = 'typealiases';
                            break;
                        case 'variable':
                            mainpage = 'variables';
                    }
                    context.type.href =
                        '../' + _result.data.ctype + '/' + mainpage + '.html#' + _result.data.name;
                }
                context.type.target = '_self';
            } else {
                context.type.href = `https://${angularDocPrefix}angular.io/${_result.data.path}`;
                context.type.target = '_blank';
            }

            return options.fn(context);
        } else if (BasicTypeUtil.isKnownType(name)) {
            context.type = {
                raw: name
            };
            context.type.target = '_blank';
            context.type.href = BasicTypeUtil.getTypeUrl(name);
            return options.fn(context);
        } else {
            return options.inverse(context);
        }
    }
}
