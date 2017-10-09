import { IHtmlEngineHelper } from './html-engine-helper.interface';
import { DependenciesEngine } from '../dependencies.engine';
import { prefixOfficialDoc } from '../../../utils/angular-version';
import { finderInBasicTypes, finderInTypeScriptBasicTypes } from '../../../utils/basic-types';
import { ConfigurationInterface } from '../../interfaces/configuration.interface';

export class LinkTypeHelper implements IHtmlEngineHelper {
    constructor(
        private configuration: ConfigurationInterface,
        private dependenciesEngine: DependenciesEngine) {

    }

    public helperFunc(context: any, name, options) {
        let _result = this.dependenciesEngine.find(name);
        let angularDocPrefix = prefixOfficialDoc(this.configuration.mainData.angularVersion);
        if (_result) {
            context.type = {
                raw: name
            };
            if (_result.source === 'internal') {
                if (_result.data.type === 'class') {
                    _result.data.type = 'classe';
                }
                context.type.href = '../' + _result.data.type + 's/' + _result.data.name + '.html';
                if (_result.data.type === 'miscellaneous') {
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
                    context.type.href = '../' + _result.data.type + '/' + mainpage + '.html#' + _result.data.name;
                }
                context.type.target = '_self';
            } else {
                context.type.href = `https://${angularDocPrefix}angular.io/docs/ts/latest/api/${_result.data.path}`;
                context.type.target = '_blank';
            }

            return options.fn(context);
        } else if (finderInBasicTypes(name)) {
            context.type = {
                raw: name
            };
            context.type.target = '_blank';
            context.type.href = `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${name}`;
            return options.fn(context);
        } else if (finderInTypeScriptBasicTypes(name)) {
            context.type = {
                raw: name
            };
            context.type.target = '_blank';
            context.type.href = 'https://www.typescriptlang.org/docs/handbook/basic-types.html';
            return options.fn(context);
        } else {
            return options.inverse(context);
        }
    }
}